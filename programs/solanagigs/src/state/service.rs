```rust
use anchor_lang::prelude::*;

#[account]
pub struct Service {
    pub id: u64,
    pub provider: Pubkey,
    pub title: String,
    pub description: String,
    pub category: ServiceCategory,
    pub price: u64,
    pub delivery_time: u32,
    pub is_active: bool,
    pub created_at: i64,
    pub updated_at: i64,
    pub rating: f64,
    pub total_orders: u64,
    pub tags: Vec<String>,
    pub requirements: Vec<String>,
    pub portfolio_items: Vec<String>,
    pub revision_count: u8,
    pub bump: u8,
}

impl Service {
    pub const MAX_TITLE_LENGTH: usize = 100;
    pub const MAX_DESCRIPTION_LENGTH: usize = 2000;
    pub const MAX_TAGS: usize = 10;
    pub const MAX_TAG_LENGTH: usize = 30;
    pub const MAX_REQUIREMENTS: usize = 20;
    pub const MAX_REQUIREMENT_LENGTH: usize = 200;
    pub const MAX_PORTFOLIO_ITEMS: usize = 10;
    pub const MAX_PORTFOLIO_ITEM_LENGTH: usize = 200;
    pub const MIN_PRICE: u64 = 1_000_000; // 0.001 SOL in lamports
    pub const MAX_PRICE: u64 = 1_000_000_000_000; // 1000 SOL in lamports
    pub const MIN_DELIVERY_TIME: u32 = 1; // 1 day
    pub const MAX_DELIVERY_TIME: u32 = 365; // 365 days
    pub const MAX_REVISION_COUNT: u8 = 10;

    pub fn space() -> usize {
        8 + // discriminator
        8 + // id
        32 + // provider
        4 + Self::MAX_TITLE_LENGTH + // title
        4 + Self::MAX_DESCRIPTION_LENGTH + // description
        1 + // category
        8 + // price
        4 + // delivery_time
        1 + // is_active
        8 + // created_at
        8 + // updated_at
        8 + // rating
        8 + // total_orders
        4 + (Self::MAX_TAGS * (4 + Self::MAX_TAG_LENGTH)) + // tags
        4 + (Self::MAX_REQUIREMENTS * (4 + Self::MAX_REQUIREMENT_LENGTH)) + // requirements
        4 + (Self::MAX_PORTFOLIO_ITEMS * (4 + Self::MAX_PORTFOLIO_ITEM_LENGTH)) + // portfolio_items
        1 + // revision_count
        1 // bump
    }

    pub fn initialize(
        &mut self,
        id: u64,
        provider: Pubkey,
        title: String,
        description: String,
        category: ServiceCategory,
        price: u64,
        delivery_time: u32,
        tags: Vec<String>,
        requirements: Vec<String>,
        portfolio_items: Vec<String>,
        revision_count: u8,
        bump: u8,
    ) -> Result<()> {
        require!(title.len() <= Self::MAX_TITLE_LENGTH, ServiceError::TitleTooLong);
        require!(description.len() <= Self::MAX_DESCRIPTION_LENGTH, ServiceError::DescriptionTooLong);
        require!(price >= Self::MIN_PRICE && price <= Self::MAX_PRICE, ServiceError::InvalidPrice);
        require!(delivery_time >= Self::MIN_DELIVERY_TIME && delivery_time <= Self::MAX_DELIVERY_TIME, ServiceError::InvalidDeliveryTime);
        require!(tags.len() <= Self::MAX_TAGS, ServiceError::TooManyTags);
        require!(requirements.len() <= Self::MAX_REQUIREMENTS, ServiceError::TooManyRequirements);
        require!(portfolio_items.len() <= Self::MAX_PORTFOLIO_ITEMS, ServiceError::TooManyPortfolioItems);
        require!(revision_count <= Self::MAX_REVISION_COUNT, ServiceError::InvalidRevisionCount);

        for tag in &tags {
            require!(tag.len() <= Self::MAX_TAG_LENGTH, ServiceError::TagTooLong);
        }

        for requirement in &requirements {
            require!(requirement.len() <= Self::MAX_REQUIREMENT_LENGTH, ServiceError::RequirementTooLong);
        }

        for item in &portfolio_items {
            require!(item.len() <= Self::MAX_PORTFOLIO_ITEM_LENGTH, ServiceError::PortfolioItemTooLong);
        }

        let clock = Clock::get()?;

        self.id = id;
        self.provider = provider;
        self.title = title;
        self.description = description;
        self.category = category;
        self.price = price;
        self.delivery_time = delivery_time;
        self.is_active = true;
        self.created_at = clock.unix_timestamp;
        self.updated_at = clock.unix_timestamp;
        self.rating = 0.0;
        self.total_orders = 0;
        self.tags = tags;
        self.requirements = requirements;
        self.portfolio_items = portfolio_items;
        self.revision_count = revision_count;
        self.bump = bump;

        Ok(())
    }

    pub fn update(
        &mut self,
        title: Option<String>,
        description: Option<String>,
        category: Option<ServiceCategory>,
        price: Option<u64>,
        delivery_time: Option<u32>,
        tags: Option<Vec<String>>,
        requirements: Option<Vec<String>>,
        portfolio_items: Option<Vec<String>>,
        revision_count: Option<u8>,
    ) -> Result<()> {
        let clock = Clock::get()?;

        if let Some(title) = title {
            require!(title.len() <= Self::MAX_TITLE_LENGTH, ServiceError::TitleTooLong);
            self.title = title;
        }

        if let Some(description) = description {
            require!(description.len() <= Self::MAX_DESCRIPTION_LENGTH, ServiceError::DescriptionTooLong);
            self.description = description;
        }

        if let Some(category) = category {
            self.category = category;
        }

        if let Some(price) = price {
            require!(price >= Self::MIN_PRICE && price <= Self::MAX_PRICE, ServiceError::InvalidPrice);
            self.price = price;
        }

        if let Some(delivery_time) = delivery_time {
            require!(delivery_time >= Self::MIN_DELIVERY_TIME && delivery_time <= Self::MAX_DELIVERY_TIME, ServiceError::InvalidDeliveryTime);
            self.delivery_time = delivery_time;
        }

        if let Some(tags) = tags {
            require!(tags.len() <= Self::MAX_TAGS, ServiceError::TooManyTags);
            for tag in &tags {
                require!(tag.len() <= Self::MAX_TAG_LENGTH, ServiceError::TagTooLong);
            }
            self.tags = tags;
        }

        if let Some(requirements) = requirements {
            require!(requirements.len() <= Self::MAX_REQUIREMENTS, ServiceError::TooManyRequirements);
            for requirement in &requirements {
                require!(requirement.len() <= Self::MAX_REQUIREMENT_LENGTH, ServiceError::RequirementTooLong);
            }
            self.requirements = requirements;
        }

        if let Some(portfolio_items) = portfolio_items {
            require!(portfolio_items.len() <= Self::MAX_PORTFOLIO_ITEMS, ServiceError::TooManyPortfolioItems);
            for item in &portfolio_items {
                require!(item.len() <= Self::MAX_PORTFOLIO_ITEM_LENGTH, ServiceError::PortfolioItemTooLong);
            }
            self.portfolio_items = portfolio_items;
        }

        if let Some(revision_count) = revision_count {
            require!(revision_count <= Self::MAX_REVISION_COUNT, ServiceError::InvalidRevisionCount);
            self.revision_count = revision_count;
        }

        self.updated_at = clock.unix_timestamp;

        Ok(())
    }

    pub fn toggle_active(&mut self) -> Result<()> {
        self.is_active = !self.is_active;
        self.updated_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn update_rating(&mut self, new_rating: f64, total_orders: u64) -> Result<()> {
        require!(new_rating >= 0.0 && new_rating <= 5.0, ServiceError::InvalidRating);
        self.rating = new_rating;
        self.total_orders = total_orders;
        self.updated_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn increment_orders(&mut self) -> Result<()> {
        self.total_orders = self.total_orders.checked_add(1).ok_or(ServiceError::Overflow)?;
        self.updated_at = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ServiceCategory {
    GraphicsDesign,
    DigitalMarketing,
    WritingTranslation,
    VideoAnimation,
    MusicAudio,
    Programming,
    Business,
    Lifestyle,
    DataAnalysis,
    Photography,
    AIServices,
    Consulting,
    Education,
    Gaming,
    Legal,
    Other,
}

impl Default for ServiceCategory {
    fn default() -> Self {
        ServiceCategory::Other
    }
}

#[error_code]
pub enum ServiceError {
    #[msg("Title is too long")]
    TitleTooLong,
    #[msg("Description is too long")]
    DescriptionTooLong,
    #[msg("Invalid price range")]
    InvalidPrice,
    #[msg("Invalid delivery time")]
    InvalidDeliveryTime,
    #[msg("Too many tags")]
    TooManyTags,
    #[msg("Tag is too long")]
    TagTooLong,
    #[msg("Too many requirements")]
    TooManyRequirements,
    #[msg("Requirement is too long")]
    RequirementTooLong,
    #[msg("Too many portfolio items")]
    TooManyPortfolioItems,
    #[msg("Portfolio item is too long")]
    PortfolioItemTooLong,
    #[msg("Invalid revision count")]
    InvalidRevisionCount,
    #[msg("Invalid rating")]
    InvalidRating,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Service is not active")]
    ServiceNotActive,
    #[msg("Unauthorized access")]
    Unauthorized,
}
```