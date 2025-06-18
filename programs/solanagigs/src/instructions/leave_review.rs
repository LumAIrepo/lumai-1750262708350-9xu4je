```rust
use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(gig_id: u64)]
pub struct LeaveReview<'info> {
    #[account(
        mut,
        seeds = [b"gig", gig_id.to_le_bytes().as_ref()],
        bump,
        constraint = gig.status == GigStatus::Completed @ SolanaGigsError::GigNotCompleted,
        constraint = gig.buyer == reviewer.key() @ SolanaGigsError::UnauthorizedReviewer
    )]
    pub gig: Account<'info, Gig>,

    #[account(
        init,
        payer = reviewer,
        space = Review::LEN,
        seeds = [b"review", gig.key().as_ref(), reviewer.key().as_ref()],
        bump
    )]
    pub review: Account<'info, Review>,

    #[account(
        mut,
        seeds = [b"user", gig.seller.as_ref()],
        bump
    )]
    pub seller_profile: Account<'info, UserProfile>,

    #[account(mut)]
    pub reviewer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn leave_review(
    ctx: Context<LeaveReview>,
    gig_id: u64,
    rating: u8,
    comment: String,
) -> Result<()> {
    require!(rating >= 1 && rating <= 5, SolanaGigsError::InvalidRating);
    require!(comment.len() <= 500, SolanaGigsError::CommentTooLong);
    require!(!comment.is_empty(), SolanaGigsError::EmptyComment);

    let gig = &mut ctx.accounts.gig;
    let review = &mut ctx.accounts.review;
    let seller_profile = &mut ctx.accounts.seller_profile;
    let reviewer = &ctx.accounts.reviewer;

    // Check if review already exists
    require!(!gig.review_left, SolanaGigsError::ReviewAlreadyExists);

    // Initialize review
    review.gig = gig.key();
    review.reviewer = reviewer.key();
    review.seller = gig.seller;
    review.rating = rating;
    review.comment = comment;
    review.created_at = Clock::get()?.unix_timestamp;
    review.bump = ctx.bumps.review;

    // Update gig status
    gig.review_left = true;
    gig.final_rating = Some(rating);

    // Update seller reputation
    let total_reviews = seller_profile.total_reviews;
    let current_rating = seller_profile.average_rating;
    
    // Calculate new average rating
    let new_total_reviews = total_reviews + 1;
    let new_average_rating = if total_reviews == 0 {
        rating as f64
    } else {
        ((current_rating * total_reviews as f64) + rating as f64) / new_total_reviews as f64
    };

    seller_profile.total_reviews = new_total_reviews;
    seller_profile.average_rating = new_average_rating;
    seller_profile.updated_at = Clock::get()?.unix_timestamp;

    // Update reputation level based on reviews and rating
    update_reputation_level(seller_profile)?;

    // Emit event
    emit!(ReviewLeftEvent {
        gig_id,
        reviewer: reviewer.key(),
        seller: gig.seller,
        rating,
        comment: review.comment.clone(),
        timestamp: review.created_at,
    });

    Ok(())
}

fn update_reputation_level(seller_profile: &mut Account<UserProfile>) -> Result<()> {
    let total_reviews = seller_profile.total_reviews;
    let average_rating = seller_profile.average_rating;

    seller_profile.reputation_level = match (total_reviews, average_rating) {
        (0..=4, _) => ReputationLevel::Newcomer,
        (5..=19, rating) if rating >= 4.5 => ReputationLevel::Rising,
        (5..=19, rating) if rating >= 3.5 => ReputationLevel::Established,
        (5..=19, _) => ReputationLevel::Newcomer,
        (20..=49, rating) if rating >= 4.8 => ReputationLevel::TopRated,
        (20..=49, rating) if rating >= 4.5 => ReputationLevel::Rising,
        (20..=49, rating) if rating >= 3.5 => ReputationLevel::Established,
        (20..=49, _) => ReputationLevel::Newcomer,
        (50.., rating) if rating >= 4.9 => ReputationLevel::Elite,
        (50.., rating) if rating >= 4.8 => ReputationLevel::TopRated,
        (50.., rating) if rating >= 4.5 => ReputationLevel::Rising,
        (50.., rating) if rating >= 3.5 => ReputationLevel::Established,
        (50.., _) => ReputationLevel::Newcomer,
    };

    Ok(())
}

#[event]
pub struct ReviewLeftEvent {
    pub gig_id: u64,
    pub reviewer: Pubkey,
    pub seller: Pubkey,
    pub rating: u8,
    pub comment: String,
    pub timestamp: i64,
}
```