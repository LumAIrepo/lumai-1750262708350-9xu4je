```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(service_id: u64, amount: u64)]
pub struct PurchaseService<'info> {
    #[account(
        init,
        payer = buyer,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow", service.key().as_ref(), buyer.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(
        seeds = [b"service", service_id.to_le_bytes().as_ref()],
        bump,
        constraint = service.is_active @ SolanaGigsError::ServiceNotActive,
        constraint = service.price == amount @ SolanaGigsError::IncorrectAmount
    )]
    pub service: Account<'info, Service>,

    #[account(
        seeds = [b"provider", service.provider.as_ref()],
        bump
    )]
    pub provider: Account<'info, Provider>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        constraint = buyer_token_account.owner == buyer.key(),
        constraint = buyer_token_account.mint == service.payment_mint
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = service.payment_mint,
        associated_token::authority = escrow
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = service.payment_mint,
        associated_token::authority = provider.authority
    )]
    pub provider_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn purchase_service(
    ctx: Context<PurchaseService>,
    service_id: u64,
    amount: u64,
    delivery_time: i64,
    requirements: String,
) -> Result<()> {
    let service = &ctx.accounts.service;
    let provider = &ctx.accounts.provider;
    let buyer = &ctx.accounts.buyer;
    let escrow = &mut ctx.accounts.escrow;

    // Validate delivery time
    let current_time = Clock::get()?.unix_timestamp;
    require!(
        delivery_time > current_time,
        SolanaGigsError::InvalidDeliveryTime
    );

    // Validate requirements length
    require!(
        requirements.len() <= 1000,
        SolanaGigsError::RequirementsTooLong
    );

    // Initialize escrow account
    escrow.service = service.key();
    escrow.buyer = buyer.key();
    escrow.provider = provider.authority;
    escrow.amount = amount;
    escrow.status = EscrowStatus::Active;
    escrow.created_at = current_time;
    escrow.delivery_deadline = delivery_time;
    escrow.requirements = requirements;
    escrow.dispute_deadline = delivery_time + (7 * 24 * 60 * 60); // 7 days after delivery
    escrow.bump = ctx.bumps.escrow;

    // Transfer tokens from buyer to escrow
    let transfer_instruction = Transfer {
        from: ctx.accounts.buyer_token_account.to_account_info(),
        to: ctx.accounts.escrow_token_account.to_account_info(),
        authority: buyer.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
    );

    token::transfer(cpi_ctx, amount)?;

    // Emit purchase event
    emit!(ServicePurchased {
        escrow: escrow.key(),
        service: service.key(),
        buyer: buyer.key(),
        provider: provider.authority,
        amount,
        delivery_deadline: delivery_time,
        timestamp: current_time,
    });

    // Update service statistics
    let service_account = &mut ctx.accounts.service;
    service_account.total_orders = service_account.total_orders.checked_add(1)
        .ok_or(SolanaGigsError::MathOverflow)?;

    // Update provider statistics
    let provider_account = &mut ctx.accounts.provider;
    provider_account.active_orders = provider_account.active_orders.checked_add(1)
        .ok_or(SolanaGigsError::MathOverflow)?;
    provider_account.total_earnings = provider_account.total_earnings.checked_add(amount)
        .ok_or(SolanaGigsError::MathOverflow)?;

    Ok(())
}

#[event]
pub struct ServicePurchased {
    pub escrow: Pubkey,
    pub service: Pubkey,
    pub buyer: Pubkey,
    pub provider: Pubkey,
    pub amount: u64,
    pub delivery_deadline: i64,
    pub timestamp: i64,
}
```