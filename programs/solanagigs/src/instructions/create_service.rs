```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(service_id: String)]
pub struct CreateService<'info> {
    #[account(
        init,
        payer = provider,
        space = Service::LEN,
        seeds = [b"service", provider.key().as_ref(), service_id.as_bytes()],
        bump
    )]
    pub service: Account<'info, Service>,
    
    #[account(
        init,
        payer = provider,
        space = ServiceStats::LEN,
        seeds = [b"service_stats", service.key().as_ref()],
        bump
    )]
    pub service_stats: Account<'info, ServiceStats>,
    
    #[account(
        mut,
        seeds = [b"provider", provider.key().as_ref()],
        bump = provider_account.bump
    )]
    pub provider_account: Account<'info, Provider>,
    
    #[account(
        mut,
        seeds = [b"platform_config"],
        bump = platform_config.bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(
        init_if_needed,
        payer = provider,
        associated_token::mint = platform_config.platform_token_mint,
        associated_token::authority = provider
    )]
    pub provider_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = platform_config.platform_token_mint,
        associated_token::authority = platform_config
    )]
    pub platform_treasury: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub provider: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn create_service(
    ctx: Context<CreateService>,
    service_id: String,
    title: String,
    description: String,
    category: ServiceCategory,
    subcategory: String,
    price: u64,
    delivery_time: u32,
    requirements: Vec<String>,
    tags: Vec<String>,
    service_type: ServiceType,
    revisions_included: u8,
    metadata_uri: String,
) -> Result<()> {
    // Validate input parameters
    require!(service_id.len() <= 32, SolanaGigsError::ServiceIdTooLong);
    require!(title.len() <= 100, SolanaGigsError::TitleTooLong);
    require!(description.len() <= 2000, SolanaGigsError::DescriptionTooLong);
    require!(subcategory.len() <= 50, SolanaGigsError::SubcategoryTooLong);
    require!(price > 0, SolanaGigsError::InvalidPrice);
    require!(delivery_time > 0 && delivery_time <= 365, SolanaGigsError::InvalidDeliveryTime);
    require!(requirements.len() <= 10, SolanaGigsError::TooManyRequirements);
    require!(tags.len() <= 10, SolanaGigsError::TooManyTags);
    require!(revisions_included <= 10, SolanaGigsError::TooManyRevisions);
    require!(metadata_uri.len() <= 200, SolanaGigsError::MetadataUriTooLong);

    // Validate provider is verified if required for category
    let provider_account = &ctx.accounts.provider_account;
    if category.requires_verification() {
        require!(provider_account.is_verified, SolanaGigsError::ProviderNotVerified);
    }

    // Check provider service limit
    require!(
        provider_account.active_services < ctx.accounts.platform_config.max_services_per_provider,
        SolanaGigsError::ServiceLimitExceeded
    );

    // Calculate and collect service creation fee
    let creation_fee = ctx.accounts.platform_config.service_creation_fee;
    if creation_fee > 0 {
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.provider_token_account.to_account_info(),
                to: ctx.accounts.platform_treasury.to_account_info(),
                authority: ctx.accounts.provider.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, creation_fee)?;
    }

    // Initialize service account
    let service = &mut ctx.accounts.service;
    service.provider = ctx.accounts.provider.key();
    service.service_id = service_id;
    service.title = title;
    service.description = description;
    service.category = category;
    service.subcategory = subcategory;
    service.price = price;
    service.delivery_time = delivery_time;
    service.requirements = requirements;
    service.tags = tags;
    service.service_type = service_type;
    service.revisions_included = revisions_included;
    service.metadata_uri = metadata_uri;
    service.is_active = true;
    service.is_featured = false;
    service.created_at = Clock::get()?.unix_timestamp;
    service.updated_at = Clock::get()?.unix_timestamp;
    service.bump = ctx.bumps.service;

    // Initialize service stats
    let service_stats = &mut ctx.accounts.service_stats;
    service_stats.service = service.key();
    service_stats.total_orders = 0;
    service_stats.completed_orders = 0;
    service_stats.cancelled_orders = 0;
    service_stats.total_revenue = 0;
    service_stats.average_rating = 0;
    service_stats.total_reviews = 0;
    service_stats.views = 0;
    service_stats.favorites = 0;
    service_stats.bump = ctx.bumps.service_stats;

    // Update provider stats
    let provider_account = &mut ctx.accounts.provider_account;
    provider_account.active_services += 1;
    provider_account.total_services_created += 1;

    // Update platform stats
    let platform_config = &mut ctx.accounts.platform_config;
    platform_config.total_services += 1;

    // Emit service created event
    emit!(ServiceCreated {
        service: service.key(),
        provider: ctx.accounts.provider.key(),
        service_id: service.service_id.clone(),
        title: service.title.clone(),
        category: service.category,
        price: service.price,
        created_at: service.created_at,
    });

    Ok(())
}

#[event]
pub struct ServiceCreated {
    pub service: Pubkey,
    pub provider: Pubkey,
    pub service_id: String,
    pub title: String,
    pub category: ServiceCategory,
    pub price: u64,
    pub created_at: i64,
}
```