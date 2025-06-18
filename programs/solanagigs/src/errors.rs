```rust
use anchor_lang::prelude::*;

#[error_code]
pub enum SolanaGigsError {
    #[msg("Unauthorized access")]
    Unauthorized,
    
    #[msg("Invalid gig status")]
    InvalidGigStatus,
    
    #[msg("Insufficient funds")]
    InsufficientFunds,
    
    #[msg("Gig not found")]
    GigNotFound,
    
    #[msg("Order not found")]
    OrderNotFound,
    
    #[msg("Invalid order status")]
    InvalidOrderStatus,
    
    #[msg("Cannot cancel completed order")]
    CannotCancelCompletedOrder,
    
    #[msg("Cannot complete order without payment")]
    CannotCompleteOrderWithoutPayment,
    
    #[msg("Escrow already released")]
    EscrowAlreadyReleased,
    
    #[msg("Escrow not found")]
    EscrowNotFound,
    
    #[msg("Invalid escrow state")]
    InvalidEscrowState,
    
    #[msg("Dispute already exists")]
    DisputeAlreadyExists,
    
    #[msg("No dispute found")]
    NoDisputeFound,
    
    #[msg("Cannot dispute completed order")]
    CannotDisputeCompletedOrder,
    
    #[msg("Invalid dispute resolution")]
    InvalidDisputeResolution,
    
    #[msg("Profile not found")]
    ProfileNotFound,
    
    #[msg("Profile already exists")]
    ProfileAlreadyExists,
    
    #[msg("Invalid rating value")]
    InvalidRatingValue,
    
    #[msg("Cannot rate own service")]
    CannotRateOwnService,
    
    #[msg("Rating already exists")]
    RatingAlreadyExists,
    
    #[msg("Invalid gig price")]
    InvalidGigPrice,
    
    #[msg("Gig price too low")]
    GigPriceTooLow,
    
    #[msg("Gig price too high")]
    GigPriceTooHigh,
    
    #[msg("Invalid delivery time")]
    InvalidDeliveryTime,
    
    #[msg("Delivery time too short")]
    DeliveryTimeTooShort,
    
    #[msg("Delivery time too long")]
    DeliveryTimeTooLong,
    
    #[msg("Invalid category")]
    InvalidCategory,
    
    #[msg("Gig title too long")]
    GigTitleTooLong,
    
    #[msg("Gig description too long")]
    GigDescriptionTooLong,
    
    #[msg("Invalid milestone count")]
    InvalidMilestoneCount,
    
    #[msg("Milestone not found")]
    MilestoneNotFound,
    
    #[msg("Milestone already completed")]
    MilestoneAlreadyCompleted,
    
    #[msg("Cannot complete milestone out of order")]
    CannotCompleteMilestoneOutOfOrder,
    
    #[msg("All milestones must be completed")]
    AllMilestonesMustBeCompleted,
    
    #[msg("Invalid withdrawal amount")]
    InvalidWithdrawalAmount,
    
    #[msg("Withdrawal not allowed")]
    WithdrawalNotAllowed,
    
    #[msg("Platform fee calculation error")]
    PlatformFeeCalculationError,
    
    #[msg("Invalid platform fee")]
    InvalidPlatformFee,
    
    #[msg("Seller cannot buy own gig")]
    SellerCannotBuyOwnGig,
    
    #[msg("Buyer cannot sell to themselves")]
    BuyerCannotSellToThemselves,
    
    #[msg("Order deadline exceeded")]
    OrderDeadlineExceeded,
    
    #[msg("Cannot modify active order")]
    CannotModifyActiveOrder,
    
    #[msg("Invalid order modification")]
    InvalidOrderModification,
    
    #[msg("Revision limit exceeded")]
    RevisionLimitExceeded,
    
    #[msg("No revisions remaining")]
    NoRevisionsRemaining,
    
    #[msg("Cannot request revision on completed order")]
    CannotRequestRevisionOnCompletedOrder,
    
    #[msg("Invalid message content")]
    InvalidMessageContent,
    
    #[msg("Message too long")]
    MessageTooLong,
    
    #[msg("Cannot message before order")]
    CannotMessageBeforeOrder,
    
    #[msg("Conversation not found")]
    ConversationNotFound,
    
    #[msg("Invalid verification status")]
    InvalidVerificationStatus,
    
    #[msg("Verification already completed")]
    VerificationAlreadyCompleted,
    
    #[msg("Verification failed")]
    VerificationFailed,
    
    #[msg("Account not verified")]
    AccountNotVerified,
    
    #[msg("Invalid portfolio item")]
    InvalidPortfolioItem,
    
    #[msg("Portfolio limit exceeded")]
    PortfolioLimitExceeded,
    
    #[msg("Skill not found")]
    SkillNotFound,
    
    #[msg("Skill already exists")]
    SkillAlreadyExists,
    
    #[msg("Too many skills")]
    TooManySkills,
    
    #[msg("Invalid skill level")]
    InvalidSkillLevel,
    
    #[msg("Gig limit exceeded")]
    GigLimitExceeded,
    
    #[msg("Cannot delete gig with active orders")]
    CannotDeleteGigWithActiveOrders,
    
    #[msg("Gig is paused")]
    GigIsPaused,
    
    #[msg("Gig is not active")]
    GigIsNotActive,
    
    #[msg("Invalid search parameters")]
    InvalidSearchParameters,
    
    #[msg("Search results limit exceeded")]
    SearchResultsLimitExceeded,
    
    #[msg("Invalid sort criteria")]
    InvalidSortCriteria,
    
    #[msg("Invalid filter parameters")]
    InvalidFilterParameters,
    
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    
    #[msg("Arithmetic underflow")]
    ArithmeticUnderflow,
    
    #[msg("Division by zero")]
    DivisionByZero,
    
    #[msg("Invalid timestamp")]
    InvalidTimestamp,
    
    #[msg("Timestamp in the past")]
    TimestampInThePast,
    
    #[msg("Timestamp too far in future")]
    TimestampTooFarInFuture,
    
    #[msg("Invalid account data")]
    InvalidAccountData,
    
    #[msg("Account data too large")]
    AccountDataTooLarge,
    
    #[msg("Invalid program state")]
    InvalidProgramState,
    
    #[msg("Program is paused")]
    ProgramIsPaused,
    
    #[msg("Emergency stop activated")]
    EmergencyStopActivated,
    
    #[msg("Invalid admin operation")]
    InvalidAdminOperation,
    
    #[msg("Admin privileges required")]
    AdminPrivilegesRequired,
    
    #[msg("Invalid fee structure")]
    InvalidFeeStructure,
    
    #[msg("Fee update not allowed")]
    FeeUpdateNotAllowed,
    
    #[msg("Invalid treasury operation")]
    InvalidTreasuryOperation,
    
    #[msg("Treasury insufficient funds")]
    TreasuryInsufficientFunds,
    
    #[msg("Invalid token mint")]
    InvalidTokenMint,
    
    #[msg("Token account not found")]
    TokenAccountNotFound,
    
    #[msg("Invalid token amount")]
    InvalidTokenAmount,
    
    #[msg("Token transfer failed")]
    TokenTransferFailed,
    
    #[msg("Unsupported token")]
    UnsupportedToken,
    
    #[msg("Invalid reputation score")]
    InvalidReputationScore,
    
    #[msg("Reputation update failed")]
    ReputationUpdateFailed,
    
    #[msg("Insufficient reputation")]
    InsufficientReputation,
    
    #[msg("Badge not found")]
    BadgeNotFound,
    
    #[msg("Badge already earned")]
    BadgeAlreadyEarned,
    
    #[msg("Badge requirements not met")]
    BadgeRequirementsNotMet,
    
    #[msg("Invalid achievement")]
    InvalidAchievement,
    
    #[msg("Achievement already unlocked")]
    AchievementAlreadyUnlocked,
    
    #[msg("Level requirements not met")]
    LevelRequirementsNotMet,
    
    #[msg("Invalid experience points")]
    InvalidExperiencePoints,
    
    #[msg("Cannot downgrade level")]
    CannotDowngradeLevel,
    
    #[msg("Invalid referral code")]
    InvalidReferralCode,
    
    #[msg("Referral code already used")]
    ReferralCodeAlreadyUsed,
    
    #[msg("Cannot refer yourself")]
    CannotReferYourself,
    
    #[msg("Referral bonus already claimed")]
    ReferralBonusAlreadyClaimed,
    
    #[msg("Invalid bonus amount")]
    InvalidBonusAmount,
    
    #[msg("Bonus claim failed")]
    BonusClaimFailed,
    
    #[msg("Promotion not found")]
    PromotionNotFound,
    
    #[msg("Promotion expired")]
    PromotionExpired,
    
    #[msg("Promotion not active")]
    PromotionNotActive,
    
    #[msg("Promotion already used")]
    PromotionAlreadyUsed,
    
    #[msg("Invalid promotion code")]
    InvalidPromotionCode,
    
    #[msg("Discount calculation error")]
    DiscountCalculationError,
    
    #[msg("Invalid discount amount")]
    InvalidDiscountAmount,
    
    #[msg("Maximum discount exceeded")]
    MaximumDiscountExceeded,
}
```