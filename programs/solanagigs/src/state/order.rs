```rust
use anchor_lang::prelude::*;

#[account]
pub struct Order {
    pub order_id: u64,
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub gig: Pubkey,
    pub amount: u64,
    pub escrow_amount: u64,
    pub status: OrderStatus,
    pub created_at: i64,
    pub deadline: i64,
    pub completed_at: Option<i64>,
    pub cancelled_at: Option<i64>,
    pub dispute_raised_at: Option<i64>,
    pub requirements: String,
    pub delivery_notes: Option<String>,
    pub revision_count: u8,
    pub max_revisions: u8,
    pub dispute_reason: Option<String>,
    pub arbiter: Option<Pubkey>,
    pub buyer_rating: Option<u8>,
    pub seller_rating: Option<u8>,
    pub buyer_review: Option<String>,
    pub seller_review: Option<String>,
    pub milestone_count: u8,
    pub completed_milestones: u8,
    pub bump: u8,
}

impl Order {
    pub const LEN: usize = 8 + // discriminator
        8 + // order_id
        32 + // buyer
        32 + // seller
        32 + // gig
        8 + // amount
        8 + // escrow_amount
        1 + // status
        8 + // created_at
        8 + // deadline
        9 + // completed_at (Option<i64>)
        9 + // cancelled_at (Option<i64>)
        9 + // dispute_raised_at (Option<i64>)
        4 + 500 + // requirements (String with max 500 chars)
        4 + 1000 + // delivery_notes (Option<String> with max 1000 chars)
        1 + // revision_count
        1 + // max_revisions
        4 + 200 + // dispute_reason (Option<String> with max 200 chars)
        33 + // arbiter (Option<Pubkey>)
        2 + // buyer_rating (Option<u8>)
        2 + // seller_rating (Option<u8>)
        4 + 500 + // buyer_review (Option<String> with max 500 chars)
        4 + 500 + // seller_review (Option<String> with max 500 chars)
        1 + // milestone_count
        1 + // completed_milestones
        1; // bump

    pub fn is_active(&self) -> bool {
        matches!(self.status, OrderStatus::Active | OrderStatus::InProgress | OrderStatus::InReview)
    }

    pub fn can_be_cancelled(&self) -> bool {
        matches!(self.status, OrderStatus::Active | OrderStatus::InProgress)
    }

    pub fn can_be_completed(&self) -> bool {
        matches!(self.status, OrderStatus::InReview)
    }

    pub fn can_request_revision(&self) -> bool {
        matches!(self.status, OrderStatus::InReview) && self.revision_count < self.max_revisions
    }

    pub fn can_raise_dispute(&self) -> bool {
        matches!(self.status, OrderStatus::Active | OrderStatus::InProgress | OrderStatus::InReview)
    }

    pub fn is_overdue(&self, current_time: i64) -> bool {
        self.is_active() && current_time > self.deadline
    }

    pub fn progress_percentage(&self) -> u8 {
        if self.milestone_count == 0 {
            match self.status {
                OrderStatus::Completed => 100,
                OrderStatus::InProgress | OrderStatus::InReview => 50,
                _ => 0,
            }
        } else {
            ((self.completed_milestones as u16 * 100) / self.milestone_count as u16) as u8
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum OrderStatus {
    Active,
    InProgress,
    InReview,
    Completed,
    Cancelled,
    Disputed,
    Resolved,
    Refunded,
}

#[account]
pub struct Escrow {
    pub order: Pubkey,
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub amount: u64,
    pub platform_fee: u64,
    pub seller_fee: u64,
    pub created_at: i64,
    pub released_at: Option<i64>,
    pub refunded_at: Option<i64>,
    pub dispute_deadline: i64,
    pub auto_release_enabled: bool,
    pub partial_release_amount: u64,
    pub bump: u8,
}

impl Escrow {
    pub const LEN: usize = 8 + // discriminator
        32 + // order
        32 + // buyer
        32 + // seller
        8 + // amount
        8 + // platform_fee
        8 + // seller_fee
        8 + // created_at
        9 + // released_at (Option<i64>)
        9 + // refunded_at (Option<i64>)
        8 + // dispute_deadline
        1 + // auto_release_enabled
        8 + // partial_release_amount
        1; // bump

    pub fn total_amount(&self) -> u64 {
        self.amount + self.platform_fee + self.seller_fee
    }

    pub fn seller_payout(&self) -> u64 {
        self.amount.saturating_sub(self.seller_fee)
    }

    pub fn is_released(&self) -> bool {
        self.released_at.is_some()
    }

    pub fn is_refunded(&self) -> bool {
        self.refunded_at.is_some()
    }

    pub fn can_auto_release(&self, current_time: i64) -> bool {
        self.auto_release_enabled && 
        current_time > self.dispute_deadline && 
        !self.is_released() && 
        !self.is_refunded()
    }

    pub fn remaining_dispute_time(&self, current_time: i64) -> i64 {
        (self.dispute_deadline - current_time).max(0)
    }
}

#[account]
pub struct OrderMilestone {
    pub order: Pubkey,
    pub milestone_id: u8,
    pub title: String,
    pub description: String,
    pub amount: u64,
    pub status: MilestoneStatus,
    pub due_date: i64,
    pub completed_at: Option<i64>,
    pub approved_at: Option<i64>,
    pub rejected_at: Option<i64>,
    pub rejection_reason: Option<String>,
    pub deliverable_url: Option<String>,
    pub bump: u8,
}

impl OrderMilestone {
    pub const LEN: usize = 8 + // discriminator
        32 + // order
        1 + // milestone_id
        4 + 100 + // title (String with max 100 chars)
        4 + 500 + // description (String with max 500 chars)
        8 + // amount
        1 + // status
        8 + // due_date
        9 + // completed_at (Option<i64>)
        9 + // approved_at (Option<i64>)
        9 + // rejected_at (Option<i64>)
        4 + 200 + // rejection_reason (Option<String> with max 200 chars)
        4 + 200 + // deliverable_url (Option<String> with max 200 chars)
        1; // bump

    pub fn is_overdue(&self, current_time: i64) -> bool {
        matches!(self.status, MilestoneStatus::Pending | MilestoneStatus::InProgress) && 
        current_time > self.due_date
    }

    pub fn can_be_completed(&self) -> bool {
        matches!(self.status, MilestoneStatus::InProgress)
    }

    pub fn can_be_approved(&self) -> bool {
        matches!(self.status, MilestoneStatus::Submitted)
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum MilestoneStatus {
    Pending,
    InProgress,
    Submitted,
    Approved,
    Rejected,
}

#[account]
pub struct Dispute {
    pub order: Pubkey,
    pub raised_by: Pubkey,
    pub reason: String,
    pub description: String,
    pub evidence_urls: Vec<String>,
    pub status: DisputeStatus,
    pub created_at: i64,
    pub resolved_at: Option<i64>,
    pub arbiter: Option<Pubkey>,
    pub resolution: Option<String>,
    pub buyer_refund_amount: u64,
    pub seller_payout_amount: u64,
    pub platform_fee_refund: u64,
    pub bump: u8,
}

impl Dispute {
    pub const LEN: usize = 8 + // discriminator
        32 + // order
        32 + // raised_by
        4 + 100 + // reason (String with max 100 chars)
        4 + 1000 + // description (String with max 1000 chars)
        4 + (4 + 200) * 5 + // evidence_urls (Vec<String> with max 5 URLs, 200 chars each)
        1 + // status
        8 + // created_at
        9 + // resolved_at (Option<i64>)
        33 + // arbiter (Option<Pubkey>)
        4 + 500 + // resolution (Option<String> with max 500 chars)
        8 + // buyer_refund_amount
        8 + // seller_payout_amount
        8 + // platform_fee_refund
        1; // bump

    pub fn is_active(&self) -> bool {
        matches!(self.status, DisputeStatus::Open | DisputeStatus::UnderReview)
    }

    pub fn is_resolved(&self) -> bool {
        matches!(self.status, DisputeStatus::Resolved)
    }

    pub fn total_disputed_amount(&self) -> u64 {
        self.buyer_refund_amount + self.seller_payout_amount
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum DisputeStatus {
    Open,
    UnderReview,
    Resolved,
    Dismissed,
}

#[account]
pub struct OrderRevision {
    pub order: Pubkey,
    pub revision_number: u8,
    pub requested_by: Pubkey,
    pub reason: String,
    pub description: String,
    pub requested_at: i64,
    pub completed_at: Option<i64>,
    pub status: RevisionStatus,
    pub deliverable_url: Option<String>,
    pub feedback: Option<String>,
    pub bump: u8,
}

impl OrderRevision {
    pub const LEN: usize = 8 + // discriminator
        32 + // order
        1 + // revision_number
        32 + // requested_by
        4 + 100 + // reason (String with max 100 chars)
        4 + 500 + // description (String with max 500 chars)
        8 + // requested_at
        9 + // completed_at (Option<i64>)
        1 + // status
        4 + 200 + // deliverable_url (Option<String> with max 200 chars)
        4 + 300 + // feedback (Option<String> with max 300 chars)
        1; // bump

    pub fn is_pending(&self) -> bool {
        matches!(self.status, RevisionStatus::Requested)
    }

    pub fn is_completed(&self) -> bool {
        matches!(self.status, RevisionStatus::Completed)
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum RevisionStatus {
    Requested,
    InProgress,
    Completed,
    Rejected,
}
```