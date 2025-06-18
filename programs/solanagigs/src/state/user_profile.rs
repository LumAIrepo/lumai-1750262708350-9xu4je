```rust
use anchor_lang::prelude::*;

#[account]
pub struct UserProfile {
    pub authority: Pubkey,
    pub username: String,
    pub bio: String,
    pub profile_image_url: String,
    pub skills: Vec<String>,
    pub hourly_rate: u64,
    pub total_earnings: u64,
    pub total_gigs_completed: u32,
    pub total_gigs_created: u32,
    pub reputation_score: u32,
    pub is_verified: bool,
    pub verification_level: VerificationLevel,
    pub languages: Vec<String>,
    pub location: String,
    pub joined_at: i64,
    pub last_active: i64,
    pub portfolio_items: Vec<PortfolioItem>,
    pub reviews_received: Vec<Review>,
    pub average_rating: u32, // out of 500 (5.00 stars * 100)
    pub total_reviews: u32,
    pub response_time_hours: u32,
    pub completion_rate: u32, // percentage * 100
    pub badges: Vec<Badge>,
    pub social_links: Vec<SocialLink>,
    pub preferred_categories: Vec<String>,
    pub availability_status: AvailabilityStatus,
    pub timezone: String,
    pub bump: u8,
}

impl UserProfile {
    pub const MAX_USERNAME_LENGTH: usize = 32;
    pub const MAX_BIO_LENGTH: usize = 500;
    pub const MAX_URL_LENGTH: usize = 200;
    pub const MAX_SKILLS: usize = 20;
    pub const MAX_SKILL_LENGTH: usize = 30;
    pub const MAX_LANGUAGES: usize = 10;
    pub const MAX_LANGUAGE_LENGTH: usize = 20;
    pub const MAX_LOCATION_LENGTH: usize = 50;
    pub const MAX_PORTFOLIO_ITEMS: usize = 10;
    pub const MAX_REVIEWS: usize = 100;
    pub const MAX_BADGES: usize = 20;
    pub const MAX_SOCIAL_LINKS: usize = 10;
    pub const MAX_CATEGORIES: usize = 15;
    pub const MAX_CATEGORY_LENGTH: usize = 30;
    pub const MAX_TIMEZONE_LENGTH: usize = 50;

    pub const SPACE: usize = 8 + // discriminator
        32 + // authority
        4 + Self::MAX_USERNAME_LENGTH + // username
        4 + Self::MAX_BIO_LENGTH + // bio
        4 + Self::MAX_URL_LENGTH + // profile_image_url
        4 + (Self::MAX_SKILLS * (4 + Self::MAX_SKILL_LENGTH)) + // skills
        8 + // hourly_rate
        8 + // total_earnings
        4 + // total_gigs_completed
        4 + // total_gigs_created
        4 + // reputation_score
        1 + // is_verified
        1 + // verification_level
        4 + (Self::MAX_LANGUAGES * (4 + Self::MAX_LANGUAGE_LENGTH)) + // languages
        4 + Self::MAX_LOCATION_LENGTH + // location
        8 + // joined_at
        8 + // last_active
        4 + (Self::MAX_PORTFOLIO_ITEMS * PortfolioItem::SPACE) + // portfolio_items
        4 + (Self::MAX_REVIEWS * Review::SPACE) + // reviews_received
        4 + // average_rating
        4 + // total_reviews
        4 + // response_time_hours
        4 + // completion_rate
        4 + (Self::MAX_BADGES * Badge::SPACE) + // badges
        4 + (Self::MAX_SOCIAL_LINKS * SocialLink::SPACE) + // social_links
        4 + (Self::MAX_CATEGORIES * (4 + Self::MAX_CATEGORY_LENGTH)) + // preferred_categories
        1 + // availability_status
        4 + Self::MAX_TIMEZONE_LENGTH + // timezone
        1; // bump

    pub fn update_reputation(&mut self, new_rating: u32) -> Result<()> {
        let total_score = (self.average_rating as u64) * (self.total_reviews as u64);
        let new_total_score = total_score + (new_rating as u64);
        self.total_reviews += 1;
        self.average_rating = (new_total_score / (self.total_reviews as u64)) as u32;
        Ok(())
    }

    pub fn add_earnings(&mut self, amount: u64) -> Result<()> {
        self.total_earnings = self.total_earnings.checked_add(amount)
            .ok_or(ErrorCode::ArithmeticOverflow)?;
        Ok(())
    }

    pub fn increment_gigs_completed(&mut self) -> Result<()> {
        self.total_gigs_completed = self.total_gigs_completed.checked_add(1)
            .ok_or(ErrorCode::ArithmeticOverflow)?;
        Ok(())
    }

    pub fn increment_gigs_created(&mut self) -> Result<()> {
        self.total_gigs_created = self.total_gigs_created.checked_add(1)
            .ok_or(ErrorCode::ArithmeticOverflow)?;
        Ok(())
    }

    pub fn update_completion_rate(&mut self, completed: u32, total: u32) -> Result<()> {
        if total == 0 {
            self.completion_rate = 0;
        } else {
            self.completion_rate = (completed * 10000) / total; // percentage * 100
        }
        Ok(())
    }

    pub fn add_badge(&mut self, badge: Badge) -> Result<()> {
        require!(self.badges.len() < Self::MAX_BADGES, ErrorCode::TooManyBadges);
        self.badges.push(badge);
        Ok(())
    }

    pub fn update_last_active(&mut self) -> Result<()> {
        self.last_active = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum VerificationLevel {
    None,
    Email,
    Phone,
    Identity,
    Business,
    Premium,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AvailabilityStatus {
    Available,
    Busy,
    Away,
    Offline,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct PortfolioItem {
    pub title: String,
    pub description: String,
    pub image_url: String,
    pub project_url: String,
    pub tags: Vec<String>,
    pub created_at: i64,
}

impl PortfolioItem {
    pub const MAX_TITLE_LENGTH: usize = 100;
    pub const MAX_DESCRIPTION_LENGTH: usize = 300;
    pub const MAX_URL_LENGTH: usize = 200;
    pub const MAX_TAGS: usize = 10;
    pub const MAX_TAG_LENGTH: usize = 20;

    pub const SPACE: usize = 
        4 + Self::MAX_TITLE_LENGTH + // title
        4 + Self::MAX_DESCRIPTION_LENGTH + // description
        4 + Self::MAX_URL_LENGTH + // image_url
        4 + Self::MAX_URL_LENGTH + // project_url
        4 + (Self::MAX_TAGS * (4 + Self::MAX_TAG_LENGTH)) + // tags
        8; // created_at
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Review {
    pub reviewer: Pubkey,
    pub reviewer_username: String,
    pub rating: u32, // out of 500 (5.00 stars * 100)
    pub comment: String,
    pub gig_id: Pubkey,
    pub created_at: i64,
    pub is_verified_purchase: bool,
}

impl Review {
    pub const MAX_USERNAME_LENGTH: usize = 32;
    pub const MAX_COMMENT_LENGTH: usize = 500;

    pub const SPACE: usize = 
        32 + // reviewer
        4 + Self::MAX_USERNAME_LENGTH + // reviewer_username
        4 + // rating
        4 + Self::MAX_COMMENT_LENGTH + // comment
        32 + // gig_id
        8 + // created_at
        1; // is_verified_purchase
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Badge {
    pub badge_type: BadgeType,
    pub title: String,
    pub description: String,
    pub icon_url: String,
    pub earned_at: i64,
    pub level: u32,
}

impl Badge {
    pub const MAX_TITLE_LENGTH: usize = 50;
    pub const MAX_DESCRIPTION_LENGTH: usize = 200;
    pub const MAX_URL_LENGTH: usize = 200;

    pub const SPACE: usize = 
        1 + // badge_type
        4 + Self::MAX_TITLE_LENGTH + // title
        4 + Self::MAX_DESCRIPTION_LENGTH + // description
        4 + Self::MAX_URL_LENGTH + // icon_url
        8 + // earned_at
        4; // level
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum BadgeType {
    TopRated,
    FastDelivery,
    HighVolume,
    LongTerm,
    Specialist,
    Mentor,
    Innovation,
    Community,
    Verified,
    Premium,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct SocialLink {
    pub platform: SocialPlatform,
    pub url: String,
    pub username: String,
    pub is_verified: bool,
}

impl SocialLink {
    pub const MAX_URL_LENGTH: usize = 200;
    pub const MAX_USERNAME_LENGTH: usize = 50;

    pub const SPACE: usize = 
        1 + // platform
        4 + Self::MAX_URL_LENGTH + // url
        4 + Self::MAX_USERNAME_LENGTH + // username
        1; // is_verified
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum SocialPlatform {
    Twitter,
    LinkedIn,
    GitHub,
    Discord,
    Telegram,
    Website,
    Portfolio,
    Other,
}

#[account]
pub struct UserStats {
    pub user: Pubkey,
    pub total_spent: u64,
    pub total_orders: u32,
    pub favorite_sellers: Vec<Pubkey>,
    pub recent_searches: Vec<String>,
    pub preferred_payment_method: PaymentMethod,
    pub dispute_count: u32,
    pub successful_disputes: u32,
    pub account_created: i64,
    pub last_purchase: i64,
    pub loyalty_points: u64,
    pub referral_count: u32,
    pub bump: u8,
}

impl UserStats {
    pub const MAX_FAVORITE_SELLERS: usize = 50;
    pub const MAX_RECENT_SEARCHES: usize = 20;
    pub const MAX_SEARCH_LENGTH: usize = 100;

    pub const SPACE: usize = 8 + // discriminator
        32 + // user
        8 + // total_spent
        4 + // total_orders
        4 + (Self::MAX_FAVORITE_SELLERS * 32) + // favorite_sellers
        4 + (Self::MAX_RECENT_SEARCHES * (4 + Self::MAX_SEARCH_LENGTH)) + // recent_searches
        1 + // preferred_payment_method
        4 + // dispute_count
        4 + // successful_disputes
        8 + // account_created
        8 + // last_purchase
        8 + // loyalty_points
        4 + // referral_count
        1; // bump

    pub fn add_favorite_seller(&mut self, seller: Pubkey) -> Result<()> {
        require!(self.favorite_sellers.len() < Self::MAX_FAVORITE_SELLERS, ErrorCode::TooManyFavorites);
        if !self.favorite_sellers.contains(&seller) {
            self.favorite_sellers.push(seller);
        }
        Ok(())
    }

    pub fn remove_favorite_seller(&mut self, seller: Pubkey) -> Result<()> {
        self.favorite_sellers.retain(|&x| x != seller);
        Ok(())
    }

    pub fn add_recent_search(&mut self, search_term: String) -> Result<()> {
        require!(search_term.len() <= Self::MAX_SEARCH_LENGTH, ErrorCode::SearchTermTooLong);
        
        // Remove if already exists
        self.recent_searches.retain(|x| x != &search_term);
        
        // Add to front
        self.recent_searches.insert(0, search_term);
        
        // Keep only the most recent searches
        if self.recent_searches.len() > Self::MAX_RECENT_SEARCHES {
            self.recent_searches.truncate(Self::MAX_RECENT_SEARCHES);
        }
        
        Ok(())
    }

    pub fn add_purchase(&mut self, amount: u64) -> Result<()> {
        self.total_spent = self.total_spent.checked_add(amount)
            .ok_or(ErrorCode::ArithmeticOverflow)?;
        self.total_orders = self.total_orders.checked_add(1)
            .ok_or(ErrorCode::ArithmeticOverflow)?;
        self.last_purchase = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn add_loyalty_points(&mut self, points: u64) -> Result<()> {
        self.loyalty_points = self.loyalty_points.checked_add(points)
            .ok_or(ErrorCode::ArithmeticOverflow)?;
        Ok(())
    }

    pub fn spend_loyalty_points(&mut self, points: u64) -> Result<()> {
        require!(self.loyalty_points >= points, ErrorCode::InsufficientLoyaltyPoints);
        self.loyalty_points = self.loyalty_points.checked_sub(points)
            .ok_or(ErrorCode::ArithmeticUnderflow)?;
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum PaymentMethod {
    Sol,
    Usdc,
    Any,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("Arithmetic underflow")]
    ArithmeticUnderflow,
    #[msg("Too many badges")]
    TooManyBadges,
    #[msg("Too many favorites")]
    TooManyFavorites,
    #[msg("Search term too long")]
    SearchTermTooLong,
    #[msg("Insufficient loyalty points")]
    InsufficientLoyaltyPoints,
}
```