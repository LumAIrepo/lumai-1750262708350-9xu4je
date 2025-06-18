```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct DisputeOrder<'info> {
    #[account(
        mut,
        seeds = [b"order", order.client.as_ref(), order.freelancer.as_ref(), &order.order_id.to_le_bytes()],
        bump = order.bump,
        constraint = order.status == OrderStatus::InProgress @ SolanaGigsError::InvalidOrderStatus,
        constraint = order.client == client.key() || order.freelancer == freelancer.key() @ SolanaGigsError::UnauthorizedDispute
    )]
    pub order: Account<'info, Order>,

    #[account(
        init,
        payer = dispute_initiator,
        space = 8 + Dispute::INIT_SPACE,
        seeds = [b"dispute", order.key().as_ref()],
        bump
    )]
    pub dispute: Account<'info, Dispute>,

    #[account(
        mut,
        seeds = [b"escrow", order.key().as_ref()],
        bump = order.escrow_bump,
        token::mint = order.payment_mint,
        token::authority = escrow_authority
    )]
    pub escrow_account: Account<'info, TokenAccount>,

    /// CHECK: This is the escrow authority PDA
    #[account(
        seeds = [b"escrow_authority"],
        bump
    )]
    pub escrow_authority: UncheckedAccount<'info>,

    #[account(mut)]
    pub client: Signer<'info>,

    #[account(mut)]
    pub freelancer: Signer<'info>,

    #[account(
        mut,
        constraint = dispute_initiator.key() == client.key() || dispute_initiator.key() == freelancer.key() @ SolanaGigsError::UnauthorizedDispute
    )]
    pub dispute_initiator: Signer<'info>,

    #[account(
        mut,
        seeds = [b"platform_config"],
        bump = platform_config.bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn dispute_order(
    ctx: Context<DisputeOrder>,
    reason: String,
    evidence_hash: Option<String>,
    requested_resolution: DisputeResolution,
) -> Result<()> {
    let order = &mut ctx.accounts.order;
    let dispute = &mut ctx.accounts.dispute;
    let platform_config = &ctx.accounts.platform_config;
    let dispute_initiator = &ctx.accounts.dispute_initiator;
    let client = &ctx.accounts.client;
    let freelancer = &ctx.accounts.freelancer;

    // Validate dispute reason length
    require!(
        reason.len() >= 10 && reason.len() <= 500,
        SolanaGigsError::InvalidDisputeReason
    );

    // Validate evidence hash if provided
    if let Some(ref hash) = evidence_hash {
        require!(
            hash.len() == 64, // SHA-256 hash length
            SolanaGigsError::InvalidEvidenceHash
        );
    }

    // Check if dispute period is still valid
    let current_time = Clock::get()?.unix_timestamp;
    let dispute_deadline = order.delivery_date + platform_config.dispute_period;
    require!(
        current_time <= dispute_deadline,
        SolanaGigsError::DisputePeriodExpired
    );

    // Determine dispute initiator type
    let initiator_type = if dispute_initiator.key() == client.key() {
        DisputeInitiator::Client
    } else {
        DisputeInitiator::Freelancer
    };

    // Initialize dispute
    dispute.order = order.key();
    dispute.initiator = dispute_initiator.key();
    dispute.initiator_type = initiator_type;
    dispute.reason = reason;
    dispute.evidence_hash = evidence_hash;
    dispute.requested_resolution = requested_resolution;
    dispute.status = DisputeStatus::Open;
    dispute.created_at = current_time;
    dispute.updated_at = current_time;
    dispute.arbitrator = None;
    dispute.resolution = None;
    dispute.resolution_reason = None;
    dispute.client_response = None;
    dispute.freelancer_response = None;
    dispute.bump = ctx.bumps.dispute;

    // Update order status
    order.status = OrderStatus::Disputed;
    order.updated_at = current_time;

    // Lock escrow funds during dispute
    order.escrow_locked = true;

    // Emit dispute created event
    emit!(DisputeCreatedEvent {
        dispute: dispute.key(),
        order: order.key(),
        initiator: dispute_initiator.key(),
        initiator_type,
        reason: dispute.reason.clone(),
        requested_resolution,
        timestamp: current_time,
    });

    // Update platform statistics
    platform_config.total_disputes += 1;
    platform_config.active_disputes += 1;

    msg!(
        "Dispute created for order {} by {}",
        order.key(),
        dispute_initiator.key()
    );

    Ok(())
}

#[event]
pub struct DisputeCreatedEvent {
    pub dispute: Pubkey,
    pub order: Pubkey,
    pub initiator: Pubkey,
    pub initiator_type: DisputeInitiator,
    pub reason: String,
    pub requested_resolution: DisputeResolution,
    pub timestamp: i64,
}
```