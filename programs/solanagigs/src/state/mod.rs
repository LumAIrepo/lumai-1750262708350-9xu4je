```rust
use anchor_lang::prelude::*;

#[account]
pub struct Marketplace {
    pub authority: Pubkey,
    pub fee_percentage: u16, // Basis points (100 = 1%)
    pub total_gigs: u64,
    pub total_orders: u64,
    pub total_volume: u64,
    pub is_paused: bool,
    pub bump: u8,
}

impl Marketplace {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        2 + // fee_percentage
        8 + // total_gigs
        8 + // total_orders
        8 + // total_volume
        1 + // is_paused
        1; // bump
}

#[account]
pub struct UserProfile {
    pub owner: Pubkey,
    pub username: String,
    pub bio: String,
    pub profile_image_url: String,
    pub skills: Vec<String>,
    pub rating: u32, // Rating * 100 (e.g., 450 = 4.5 stars)
    pub total_reviews: u32,
    pub total_earnings: u64,
    pub total_orders_completed: u32,
    pub is_verified: bool,
    pub verification_level: u8, // 0 = none, 1 = email, 2 = kyc, 3 = premium
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

impl UserProfile {
    pub const MAX_USERNAME_LEN: usize = 32;
    pub const MAX_BIO_LEN: usize = 500;
    pub const MAX_IMAGE_URL_LEN: usize = 200;
    pub const MAX_SKILLS: usize = 10;
    pub const MAX_SKILL_LEN: usize = 30;

    pub const LEN: usize = 8 + // discriminator
        32 + // owner
        4 + Self::MAX_USERNAME_LEN + // username
        4 + Self::MAX_BIO_LEN + // bio
        4 + Self::MAX_IMAGE_URL_LEN + // profile_image_url
        4 + (Self::MAX_SKILLS * (4 + Self::MAX_SKILL_LEN)) + // skills
        4 + // rating
        4 + // total_reviews
        8 + // total_earnings
        4 + // total_orders_completed
        1 + // is_verified
        1 + // verification_level
        8 + // created_at
        8 + // updated_at
        1; // bump
}

#[account]
pub struct Gig {
    pub id: u64,
    pub seller: Pubkey,
    pub title: String,
    pub description: String,
    pub category: String,
    pub subcategory: String,
    pub tags: Vec<String>,
    pub images: Vec<String>,
    pub packages: Vec<GigPackage>,
    pub requirements: String,
    pub delivery_time: u32, // in days
    pub revisions: u32,
    pub is_active: bool,
    pub total_orders: u32,
    pub rating: u32, // Rating * 100
    pub total_reviews: u32,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

impl Gig {
    pub const MAX_TITLE_LEN: usize = 100;
    pub const MAX_DESCRIPTION_LEN: usize = 2000;
    pub const MAX_CATEGORY_LEN: usize = 50;
    pub const MAX_SUBCATEGORY_LEN: usize = 50;
    pub const MAX_TAGS: usize = 5;
    pub const MAX_TAG_LEN: usize = 20;
    pub const MAX_IMAGES: usize = 5;
    pub const MAX_IMAGE_URL_LEN: usize = 200;
    pub const MAX_PACKAGES: usize = 3;
    pub const MAX_REQUIREMENTS_LEN: usize = 1000;

    pub const LEN: usize = 8 + // discriminator
        8 + // id
        32 + // seller
        4 + Self::MAX_TITLE_LEN + // title
        4 + Self::MAX_DESCRIPTION_LEN + // description
        4 + Self::MAX_CATEGORY_LEN + // category
        4 + Self::MAX_SUBCATEGORY_LEN + // subcategory
        4 + (Self::MAX_TAGS * (4 + Self::MAX_TAG_LEN)) + // tags
        4 + (Self::MAX_IMAGES * (4 + Self::MAX_IMAGE_URL_LEN)) + // images
        4 + (Self::MAX_PACKAGES * GigPackage::LEN) + // packages
        4 + Self::MAX_REQUIREMENTS_LEN + // requirements
        4 + // delivery_time
        4 + // revisions
        1 + // is_active
        4 + // total_orders
        4 + // rating
        4 + // total_reviews
        8 + // created_at
        8 + // updated_at
        1; // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct GigPackage {
    pub name: String,
    pub description: String,
    pub price: u64, // in lamports
    pub delivery_time: u32, // in days
    pub revisions: u32,
    pub features: Vec<String>,
}

impl GigPackage {
    pub const MAX_NAME_LEN: usize = 50;
    pub const MAX_DESCRIPTION_LEN: usize = 300;
    pub const MAX_FEATURES: usize = 10;
    pub const MAX_FEATURE_LEN: usize = 100;

    pub const LEN: usize = 4 + Self::MAX_NAME_LEN + // name
        4 + Self::MAX_DESCRIPTION_LEN + // description
        8 + // price
        4 + // delivery_time
        4 + // revisions
        4 + (Self::MAX_FEATURES * (4 + Self::MAX_FEATURE_LEN)); // features
}

#[account]
pub struct Order {
    pub id: u64,
    pub gig: Pubkey,
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub package_index: u8,
    pub custom_requirements: String,
    pub price: u64,
    pub status: OrderStatus,
    pub delivery_time: u32,
    pub revisions_remaining: u32,
    pub deliverables: Vec<String>,
    pub messages: Vec<OrderMessage>,
    pub dispute_reason: String,
    pub escrow_account: Pubkey,
    pub created_at: i64,
    pub accepted_at: Option<i64>,
    pub delivered_at: Option<i64>,
    pub completed_at: Option<i64>,
    pub cancelled_at: Option<i64>,
    pub bump: u8,
}

impl Order {
    pub const MAX_CUSTOM_REQUIREMENTS_LEN: usize = 1000;
    pub const MAX_DELIVERABLES: usize = 10;
    pub const MAX_DELIVERABLE_URL_LEN: usize = 200;
    pub const MAX_MESSAGES: usize = 50;
    pub const MAX_DISPUTE_REASON_LEN: usize = 500;

    pub const LEN: usize = 8 + // discriminator
        8 + // id
        32 + // gig
        32 + // buyer
        32 + // seller
        1 + // package_index
        4 + Self::MAX_CUSTOM_REQUIREMENTS_LEN + // custom_requirements
        8 + // price
        1 + // status
        4 + // delivery_time
        4 + // revisions_remaining
        4 + (Self::MAX_DELIVERABLES * (4 + Self::MAX_DELIVERABLE_URL_LEN)) + // deliverables
        4 + (Self::MAX_MESSAGES * OrderMessage::LEN) + // messages
        4 + Self::MAX_DISPUTE_REASON_LEN + // dispute_reason
        32 + // escrow_account
        8 + // created_at
        9 + // accepted_at (Option<i64>)
        9 + // delivered_at
        9 + // completed_at
        9 + // cancelled_at
        1; // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum OrderStatus {
    Pending,
    Active,
    InRevision,
    Delivered,
    Completed,
    Cancelled,
    Disputed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct OrderMessage {
    pub sender: Pubkey,
    pub content: String,
    pub attachment_url: Option<String>,
    pub timestamp: i64,
    pub is_system_message: bool,
}

impl OrderMessage {
    pub const MAX_CONTENT_LEN: usize = 1000;
    pub const MAX_ATTACHMENT_URL_LEN: usize = 200;

    pub const LEN: usize = 32 + // sender
        4 + Self::MAX_CONTENT_LEN + // content
        1 + 4 + Self::MAX_ATTACHMENT_URL_LEN + // attachment_url (Option)
        8 + // timestamp
        1; // is_system_message
}

#[account]
pub struct Review {
    pub id: u64,
    pub order: Pubkey,
    pub reviewer: Pubkey,
    pub reviewee: Pubkey,
    pub rating: u8, // 1-5 stars
    pub comment: String,
    pub is_public: bool,
    pub created_at: i64,
    pub bump: u8,
}

impl Review {
    pub const MAX_COMMENT_LEN: usize = 500;

    pub const LEN: usize = 8 + // discriminator
        8 + // id
        32 + // order
        32 + // reviewer
        32 + // reviewee
        1 + // rating
        4 + Self::MAX_COMMENT_LEN + // comment
        1 + // is_public
        8 + // created_at
        1; // bump
}

#[account]
pub struct Escrow {
    pub order: Pubkey,
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub amount: u64,
    pub marketplace_fee: u64,
    pub is_released: bool,
    pub release_time: Option<i64>,
    pub dispute_deadline: i64,
    pub bump: u8,
}

impl Escrow {
    pub const LEN: usize = 8 + // discriminator
        32 + // order
        32 + // buyer
        32 + // seller
        8 + // amount
        8 + // marketplace_fee
        1 + // is_released
        9 + // release_time (Option<i64>)
        8 + // dispute_deadline
        1; // bump
}

#[account]
pub struct Dispute {
    pub id: u64,
    pub order: Pubkey,
    pub initiator: Pubkey,
    pub reason: String,
    pub evidence: Vec<String>,
    pub status: DisputeStatus,
    pub resolution: String,
    pub resolved_by: Option<Pubkey>,
    pub created_at: i64,
    pub resolved_at: Option<i64>,
    pub bump: u8,
}

impl Dispute {
    pub const MAX_REASON_LEN: usize = 1000;
    pub const MAX_EVIDENCE: usize = 10;
    pub const MAX_EVIDENCE_URL_LEN: usize = 200;
    pub const MAX_RESOLUTION_LEN: usize = 1000;

    pub const LEN: usize = 8 + // discriminator
        8 + // id
        32 + // order
        32 + // initiator
        4 + Self::MAX_REASON_LEN + // reason
        4 + (Self::MAX_EVIDENCE * (4 + Self::MAX_EVIDENCE_URL_LEN)) + // evidence
        1 + // status
        4 + Self::MAX_RESOLUTION_LEN + // resolution
        33 + // resolved_by (Option<Pubkey>)
        8 + // created_at
        9 + // resolved_at (Option<i64>)
        1; // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum DisputeStatus {
    Open,
    UnderReview,
    Resolved,
    Closed,
}

#[account]
pub struct Category {
    pub name: String,
    pub description: String,
    pub subcategories: Vec<String>,
    pub is_active: bool,
    pub gig_count: u32,
    pub created_at: i64,
    pub bump: u8,
}

impl Category {
    pub const MAX_NAME_LEN: usize = 50;
    pub const MAX_DESCRIPTION_LEN: usize = 200;
    pub const MAX_SUBCATEGORIES: usize = 20;
    pub const MAX_SUBCATEGORY_LEN: usize = 50;

    pub const LEN: usize = 8 + // discriminator
        4 + Self::MAX_NAME_LEN + // name
        4 + Self::MAX_DESCRIPTION_LEN + // description
        4 + (Self::MAX_SUBCATEGORIES * (4 + Self::MAX_SUBCATEGORY_LEN)) + // subcategories
        1 + // is_active
        4 + // gig_count
        8 + // created_at
        1; // bump
}

#[account]
pub struct WithdrawalRequest {
    pub id: u64,
    pub user: Pubkey,
    pub amount: u64,
    pub destination: Pubkey,
    pub status: WithdrawalStatus,
    pub processed_by: Option<Pubkey>,
    pub created_at: i64,
    pub processed_at: Option<i64>,
    pub bump: u8,
}

impl WithdrawalRequest {
    pub const LEN: usize = 8 + // discriminator
        8 + // id
        32 + // user
        8 + // amount
        32 + // destination
        1 + // status
        33 + // processed_by (Option<Pubkey>)
        8 + // created_at
        9 + // processed_at (Option<i64>)
        1; // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum WithdrawalStatus {
    Pending,
    Approved,
    Rejected,
    Processed,
}

#[account]
pub struct UserEarnings {
    pub user: Pubkey,
    pub available_balance: u64,
    pub pending_balance: u64,
    pub total_earned: u64,
    pub total_withdrawn: u64,
    pub last_updated: i64,
    pub bump: u8,
}

impl UserEarnings {
    pub const LEN: usize = 8 + // discriminator
        32 + // user
        8 + // available_balance
        8 + // pending_balance
        8 + // total_earned
        8 + // total_withdrawn
        8 + // last_updated
        1; // bump
}
```