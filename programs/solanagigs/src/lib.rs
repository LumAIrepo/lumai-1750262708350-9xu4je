```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("GigsProgram11111111111111111111111111111111");

#[program]
pub mod solanagigs {
    use super::*;

    pub fn initialize_marketplace(
        ctx: Context<InitializeMarketplace>,
        fee_percentage: u16,
    ) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.authority = ctx.accounts.authority.key();
        marketplace.fee_percentage = fee_percentage;
        marketplace.total_gigs = 0;
        marketplace.total_orders = 0;
        marketplace.total_volume = 0;
        marketplace.bump = ctx.bumps.marketplace;
        Ok(())
    }

    pub fn create_gig(
        ctx: Context<CreateGig>,
        title: String,
        description: String,
        price: u64,
        delivery_time: u32,
        category: String,
        tags: Vec<String>,
    ) -> Result<()> {
        require!(title.len() <= 100, ErrorCode::TitleTooLong);
        require!(description.len() <= 1000, ErrorCode::DescriptionTooLong);
        require!(price > 0, ErrorCode::InvalidPrice);
        require!(delivery_time > 0, ErrorCode::InvalidDeliveryTime);
        require!(tags.len() <= 10, ErrorCode::TooManyTags);

        let gig = &mut ctx.accounts.gig;
        let marketplace = &mut ctx.accounts.marketplace;

        gig.seller = ctx.accounts.seller.key();
        gig.title = title;
        gig.description = description;
        gig.price = price;
        gig.delivery_time = delivery_time;
        gig.category = category;
        gig.tags = tags;
        gig.is_active = true;
        gig.total_orders = 0;
        gig.rating = 0;
        gig.rating_count = 0;
        gig.created_at = Clock::get()?.unix_timestamp;
        gig.bump = ctx.bumps.gig;

        marketplace.total_gigs += 1;

        emit!(GigCreated {
            gig: gig.key(),
            seller: gig.seller,
            title: gig.title.clone(),
            price: gig.price,
        });

        Ok(())
    }

    pub fn update_gig(
        ctx: Context<UpdateGig>,
        title: Option<String>,
        description: Option<String>,
        price: Option<u64>,
        delivery_time: Option<u32>,
        is_active: Option<bool>,
    ) -> Result<()> {
        let gig = &mut ctx.accounts.gig;

        if let Some(new_title) = title {
            require!(new_title.len() <= 100, ErrorCode::TitleTooLong);
            gig.title = new_title;
        }

        if let Some(new_description) = description {
            require!(new_description.len() <= 1000, ErrorCode::DescriptionTooLong);
            gig.description = new_description;
        }

        if let Some(new_price) = price {
            require!(new_price > 0, ErrorCode::InvalidPrice);
            gig.price = new_price;
        }

        if let Some(new_delivery_time) = delivery_time {
            require!(new_delivery_time > 0, ErrorCode::InvalidDeliveryTime);
            gig.delivery_time = new_delivery_time;
        }

        if let Some(active) = is_active {
            gig.is_active = active;
        }

        Ok(())
    }

    pub fn create_order(
        ctx: Context<CreateOrder>,
        requirements: String,
    ) -> Result<()> {
        require!(requirements.len() <= 500, ErrorCode::RequirementsTooLong);

        let order = &mut ctx.accounts.order;
        let gig = &mut ctx.accounts.gig;
        let marketplace = &mut ctx.accounts.marketplace;

        require!(gig.is_active, ErrorCode::GigNotActive);

        order.buyer = ctx.accounts.buyer.key();
        order.seller = gig.seller;
        order.gig = gig.key();
        order.amount = gig.price;
        order.requirements = requirements;
        order.status = OrderStatus::Pending;
        order.created_at = Clock::get()?.unix_timestamp;
        order.delivery_deadline = Clock::get()?.unix_timestamp + (gig.delivery_time as i64 * 86400);
        order.bump = ctx.bumps.order;

        // Transfer payment to escrow
        let cpi_accounts = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, order.amount)?;

        gig.total_orders += 1;
        marketplace.total_orders += 1;
        marketplace.total_volume += order.amount;

        emit!(OrderCreated {
            order: order.key(),
            buyer: order.buyer,
            seller: order.seller,
            gig: order.gig,
            amount: order.amount,
        });

        Ok(())
    }

    pub fn accept_order(ctx: Context<AcceptOrder>) -> Result<()> {
        let order = &mut ctx.accounts.order;
        
        require!(order.status == OrderStatus::Pending, ErrorCode::InvalidOrderStatus);
        
        order.status = OrderStatus::InProgress;
        order.accepted_at = Some(Clock::get()?.unix_timestamp);

        emit!(OrderAccepted {
            order: order.key(),
            seller: order.seller,
        });

        Ok(())
    }

    pub fn submit_delivery(
        ctx: Context<SubmitDelivery>,
        delivery_message: String,
        delivery_files: Vec<String>,
    ) -> Result<()> {
        require!(delivery_message.len() <= 1000, ErrorCode::DeliveryMessageTooLong);
        require!(delivery_files.len() <= 10, ErrorCode::TooManyFiles);

        let order = &mut ctx.accounts.order;
        
        require!(order.status == OrderStatus::InProgress, ErrorCode::InvalidOrderStatus);
        
        order.status = OrderStatus::Delivered;
        order.delivery_message = Some(delivery_message);
        order.delivery_files = delivery_files;
        order.delivered_at = Some(Clock::get()?.unix_timestamp);

        emit!(OrderDelivered {
            order: order.key(),
            seller: order.seller,
        });

        Ok(())
    }

    pub fn complete_order(
        ctx: Context<CompleteOrder>,
        rating: u8,
        review: String,
    ) -> Result<()> {
        require!(rating >= 1 && rating <= 5, ErrorCode::InvalidRating);
        require!(review.len() <= 500, ErrorCode::ReviewTooLong);

        let order = &mut ctx.accounts.order;
        let gig = &mut ctx.accounts.gig;
        let marketplace = &ctx.accounts.marketplace;

        require!(order.status == OrderStatus::Delivered, ErrorCode::InvalidOrderStatus);

        order.status = OrderStatus::Completed;
        order.rating = Some(rating);
        order.review = Some(review);
        order.completed_at = Some(Clock::get()?.unix_timestamp);

        // Update gig rating
        let total_rating = (gig.rating as u64 * gig.rating_count as u64) + rating as u64;
        gig.rating_count += 1;
        gig.rating = (total_rating / gig.rating_count as u64) as u8;

        // Calculate fees
        let marketplace_fee = (order.amount * marketplace.fee_percentage as u64) / 10000;
        let seller_amount = order.amount - marketplace_fee;

        // Transfer payment to seller
        let seeds = &[
            b"escrow",
            order.key().as_ref(),
            &[ctx.bumps.escrow_token_account],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.seller_token_account.to_account_info(),
            authority: ctx.accounts.escrow_token_account.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, seller_amount)?;

        // Transfer fee to marketplace
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.marketplace_token_account.to_account_info(),
            authority: ctx.accounts.escrow_token_account.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, marketplace_fee)?;

        emit!(OrderCompleted {
            order: order.key(),
            buyer: order.buyer,
            seller: order.seller,
            rating: rating,
        });

        Ok(())
    }

    pub fn cancel_order(ctx: Context<CancelOrder>) -> Result<()> {
        let order = &mut ctx.accounts.order;
        
        require!(
            order.status == OrderStatus::Pending || order.status == OrderStatus::InProgress,
            ErrorCode::CannotCancelOrder
        );

        let current_time = Clock::get()?.unix_timestamp;
        
        // Only allow cancellation if order is pending or past deadline
        if order.status == OrderStatus::InProgress {
            require!(current_time > order.delivery_deadline, ErrorCode::CannotCancelOrder);
        }

        order.status = OrderStatus::Cancelled;
        order.cancelled_at = Some(current_time);

        // Refund buyer
        let seeds = &[
            b"escrow",
            order.key().as_ref(),
            &[ctx.bumps.escrow_token_account],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.escrow_token_account.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, order.amount)?;

        emit!(OrderCancelled {
            order: order.key(),
            buyer: order.buyer,
        });

        Ok(())
    }

    pub fn dispute_order(
        ctx: Context<DisputeOrder>,
        reason: String,
    ) -> Result<()> {
        require!(reason.len() <= 500, ErrorCode::ReasonTooLong);

        let order = &mut ctx.accounts.order;
        
        require!(
            order.status == OrderStatus::Delivered || order.status == OrderStatus::InProgress,
            ErrorCode::InvalidOrderStatus
        );

        order.status = OrderStatus::Disputed;
        order.dispute_reason = Some(reason);
        order.disputed_at = Some(Clock::get()?.unix_timestamp);

        emit!(OrderDisputed {
            order: order.key(),
            buyer: order.buyer,
            seller: order.seller,
        });

        Ok(())
    }

    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        resolution: DisputeResolution,
        refund_percentage: u8,
    ) -> Result<()> {
        require!(refund_percentage <= 100, ErrorCode::InvalidRefundPercentage);

        let order = &mut ctx.accounts.order;
        let marketplace = &ctx.accounts.marketplace;
        
        require!(order.status == OrderStatus::Disputed, ErrorCode::InvalidOrderStatus);

        order.status = OrderStatus::Resolved;
        order.resolution = Some(resolution);
        order.resolved_at = Some(Clock::get()?.unix_timestamp);

        let refund_amount = (order.amount * refund_percentage as u64) / 100;
        let seller_amount = order.amount - refund_amount;

        let seeds = &[
            b"escrow",
            order.key().as_ref(),
            &[ctx.bumps.escrow_token_account],
        ];
        let signer = &[&seeds[..]];

        // Refund buyer if applicable
        if refund_amount > 0 {
            let cpi_accounts = Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.buyer_token_account.to_account_info(),
                authority: ctx.accounts.escrow_token_account.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
            token::transfer(cpi_ctx, refund_amount)?;
        }

        // Pay seller if applicable
        if seller_amount > 0 {
            let marketplace_fee = (seller_amount * marketplace.fee_percentage as u64) / 10000;
            let final_seller_amount = seller_amount - marketplace_fee;

            let cpi_accounts = Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.seller_token_account.to_account_info(),
                authority: ctx.accounts.escrow_token_account.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
            token::transfer(cpi_ctx, final_seller_amount)?;

            // Transfer fee to marketplace
            let cpi_accounts = Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.marketplace_token_account.to_account_info(),
                authority: ctx.accounts.escrow_token_account.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
            token::transfer(cpi_ctx, marketplace_fee)?;
        }

        emit!(DisputeResolved {
            order: order.key(),
            resolution: resolution,
            refund_percentage: refund_percentage,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeMarketplace<'info>