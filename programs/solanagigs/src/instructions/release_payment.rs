```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct ReleasePayment<'info> {
    #[account(
        mut,
        seeds = [b"gig", gig.creator.as_ref(), &gig.id.to_le_bytes()],
        bump = gig.bump,
        has_one = creator,
        constraint = gig.status == GigStatus::InProgress @ SolanaGigsError::InvalidGigStatus,
    )]
    pub gig: Account<'info, Gig>,

    #[account(
        mut,
        seeds = [b"order", gig.key().as_ref(), order.buyer.as_ref()],
        bump = order.bump,
        has_one = gig,
        has_one = buyer,
        constraint = order.status == OrderStatus::InProgress @ SolanaGigsError::InvalidOrderStatus,
    )]
    pub order: Account<'info, Order>,

    #[account(
        mut,
        seeds = [b"escrow", order.key().as_ref()],
        bump = escrow.bump,
        has_one = order,
        constraint = escrow.amount > 0 @ SolanaGigsError::NoFundsInEscrow,
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(
        mut,
        constraint = escrow_token_account.mint == gig.payment_mint,
        constraint = escrow_token_account.owner == escrow.key(),
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = creator_token_account.mint == gig.payment_mint,
        constraint = creator_token_account.owner == creator.key(),
    )]
    pub creator_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = platform_fee_account.mint == gig.payment_mint,
    )]
    pub platform_fee_account: Account<'info, TokenAccount>,

    /// CHECK: This is the gig creator who will receive payment
    #[account(mut)]
    pub creator: AccountInfo<'info>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> ReleasePayment<'info> {
    pub fn release_payment(&mut self) -> Result<()> {
        let order = &mut self.order;
        let escrow = &mut self.escrow;
        let gig = &mut self.gig;

        // Verify that the buyer is releasing the payment
        require!(
            order.buyer == self.buyer.key(),
            SolanaGigsError::UnauthorizedPaymentRelease
        );

        // Calculate platform fee (2.5%)
        let platform_fee = (escrow.amount * 25) / 1000;
        let creator_payment = escrow.amount - platform_fee;

        // Transfer platform fee
        if platform_fee > 0 {
            let transfer_fee_ctx = CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.escrow_token_account.to_account_info(),
                    to: self.platform_fee_account.to_account_info(),
                    authority: escrow.to_account_info(),
                },
                &[&[
                    b"escrow",
                    order.key().as_ref(),
                    &[escrow.bump],
                ]],
            );

            token::transfer(transfer_fee_ctx, platform_fee)?;
        }

        // Transfer payment to creator
        let transfer_payment_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            Transfer {
                from: self.escrow_token_account.to_account_info(),
                to: self.creator_token_account.to_account_info(),
                authority: escrow.to_account_info(),
            },
            &[&[
                b"escrow",
                order.key().as_ref(),
                &[escrow.bump],
            ]],
        );

        token::transfer(transfer_payment_ctx, creator_payment)?;

        // Update order status
        order.status = OrderStatus::Completed;
        order.completed_at = Some(Clock::get()?.unix_timestamp);

        // Update gig statistics
        gig.completed_orders += 1;
        gig.total_earnings += creator_payment;

        // Clear escrow
        escrow.amount = 0;
        escrow.released_at = Some(Clock::get()?.unix_timestamp);

        // Emit event
        emit!(PaymentReleasedEvent {
            order: order.key(),
            gig: gig.key(),
            buyer: order.buyer,
            creator: gig.creator,
            amount: creator_payment,
            platform_fee,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

#[event]
pub struct PaymentReleasedEvent {
    pub order: Pubkey,
    pub gig: Pubkey,
    pub buyer: Pubkey,
    pub creator: Pubkey,
    pub amount: u64,
    pub platform_fee: u64,
    pub timestamp: i64,
}
```