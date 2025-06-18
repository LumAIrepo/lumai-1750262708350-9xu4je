```typescript
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

// Gig Status Enum
export enum GigStatus {
  Active = 'Active',
  Paused = 'Paused',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

// Order Status Enum
export enum OrderStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  InReview = 'InReview',
  Completed = 'Completed',
  Disputed = 'Disputed',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded'
}

// Dispute Status Enum
export enum DisputeStatus {
  Open = 'Open',
  UnderReview = 'UnderReview',
  Resolved = 'Resolved',
  Closed = 'Closed'
}

// User Profile Account
export interface UserProfile {
  authority: PublicKey;
  username: string;
  displayName: string;
  bio: string;
  profileImageUrl: string;
  skills: string[];
  languages: string[];
  location: string;
  joinedAt: BN;
  totalEarnings: BN;
  totalSpent: BN;
  completedOrders: number;
  averageRating: number;
  totalRatings: number;
  isVerified: boolean;
  verificationBadges: string[];
  socialLinks: SocialLinks;
  preferences: UserPreferences;
  bump: number;
}

// Social Links
export interface SocialLinks {
  website: string;
  twitter: string;
  discord: string;
  github: string;
  linkedin: string;
}

// User Preferences
export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  publicProfile: boolean;
  showEarnings: boolean;
}

// Gig Account
export interface Gig {
  id: BN;
  seller: PublicKey;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  images: string[];
  packages: GigPackage[];
  requirements: string[];
  faq: FAQ[];
  status: GigStatus;
  createdAt: BN;
  updatedAt: BN;
  totalOrders: number;
  averageRating: number;
  totalRatings: number;
  isPromoted: boolean;
  promotionExpiresAt: BN;
  metadata: GigMetadata;
  bump: number;
}

// Gig Package
export interface GigPackage {
  name: string;
  description: string;
  price: BN;
  deliveryTime: number;
  revisions: number;
  features: string[];
  isActive: boolean;
}

// FAQ
export interface FAQ {
  question: string;
  answer: string;
}

// Gig Metadata
export interface GigMetadata {
  difficulty: string;
  estimatedHours: number;
  toolsRequired: string[];
  deliverables: string[];
}

// Order Account
export interface Order {
  id: BN;
  gig: PublicKey;
  buyer: PublicKey;
  seller: PublicKey;
  packageIndex: number;
  customRequirements: string;
  price: BN;
  platformFee: BN;
  sellerAmount: BN;
  status: OrderStatus;
  createdAt: BN;
  acceptedAt: BN;
  deliveredAt: BN;
  completedAt: BN;
  cancelledAt: BN;
  deliveryTime: number;
  revisionsUsed: number;
  maxRevisions: number;
  escrowAccount: PublicKey;
  deliverables: Deliverable[];
  messages: Message[];
  milestones: Milestone[];
  bump: number;
}

// Deliverable
export interface Deliverable {
  id: string;
  title: string;
  description: string;
  fileUrls: string[];
  submittedAt: BN;
  isApproved: boolean;
  feedback: string;
}

// Message
export interface Message {
  id: string;
  sender: PublicKey;
  content: string;
  attachments: string[];
  timestamp: BN;
  isRead: boolean;
}

// Milestone
export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: BN;
  dueDate: BN;
  isCompleted: boolean;
  completedAt: BN;
}

// Review Account
export interface Review {
  id: BN;
  order: PublicKey;
  gig: PublicKey;
  reviewer: PublicKey;
  reviewee: PublicKey;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  isPublic: boolean;
  createdAt: BN;
  helpfulVotes: number;
  response: ReviewResponse;
  bump: number;
}

// Review Response
export interface ReviewResponse {
  content: string;
  createdAt: BN;
}

// Dispute Account
export interface Dispute {
  id: BN;
  order: PublicKey;
  initiator: PublicKey;
  respondent: PublicKey;
  reason: string;
  description: string;
  evidence: Evidence[];
  status: DisputeStatus;
  createdAt: BN;
  resolvedAt: BN;
  resolution: DisputeResolution;
  arbitrator: PublicKey;
  bump: number;
}

// Evidence
export interface Evidence {
  id: string;
  submitter: PublicKey;
  title: string;
  description: string;
  fileUrls: string[];
  submittedAt: BN;
}

// Dispute Resolution
export interface DisputeResolution {
  decision: string;
  reasoning: string;
  buyerRefund: BN;
  sellerPayout: BN;
  platformFee: BN;
  resolvedAt: BN;
}

// Escrow Account
export interface Escrow {
  order: PublicKey;
  buyer: PublicKey;
  seller: PublicKey;
  amount: BN;
  platformFee: BN;
  isReleased: boolean;
  releasedAt: BN;
  bump: number;
}

// Category Account
export interface Category {
  id: BN;
  name: string;
  description: string;
  icon: string;
  subcategories: Subcategory[];
  isActive: boolean;
  gigCount: number;
  bump: number;
}

// Subcategory
export interface Subcategory {
  id: string;
  name: string;
  description: string;
  gigCount: number;
  isActive: boolean;
}

// Platform Stats Account
export interface PlatformStats {
  totalUsers: BN;
  totalGigs: BN;
  totalOrders: BN;
  totalVolume: BN;
  totalFees: BN;
  activeOrders: BN;
  completedOrders: BN;
  disputedOrders: BN;
  averageOrderValue: BN;
  topCategories: CategoryStats[];
  monthlyStats: MonthlyStats[];
  bump: number;
}

// Category Stats
export interface CategoryStats {
  categoryId: BN;
  name: string;
  orderCount: BN;
  volume: BN;
}

// Monthly Stats
export interface MonthlyStats {
  month: number;
  year: number;
  orders: BN;
  volume: BN;
  newUsers: BN;
  newGigs: BN;
}

// Notification Account
export interface Notification {
  id: BN;
  recipient: PublicKey;
  type: string;
  title: string;
  message: string;
  data: NotificationData;
  isRead: boolean;
  createdAt: BN;
  expiresAt: BN;
  bump: number;
}

// Notification Data
export interface NotificationData {
  orderId?: BN;
  gigId?: BN;
  disputeId?: BN;
  reviewId?: BN;
  amount?: BN;
  actionUrl?: string;
}

// Promotion Account
export interface Promotion {
  id: BN;
  gig: PublicKey;
  seller: PublicKey;
  type: string;
  duration: BN;
  cost: BN;
  startDate: BN;
  endDate: BN;
  isActive: boolean;
  impressions: BN;
  clicks: BN;
  conversions: BN;
  bump: number;
}

// Withdrawal Request Account
export interface WithdrawalRequest {
  id: BN;
  user: PublicKey;
  amount: BN;
  fee: BN;
  netAmount: BN;
  destination: PublicKey;
  status: string;
  requestedAt: BN;
  processedAt: BN;
  txSignature: string;
  bump: number;
}

// Platform Config Account
export interface PlatformConfig {
  authority: PublicKey;
  feePercentage: number;
  minOrderAmount: BN;
  maxOrderAmount: BN;
  disputeTimeLimit: BN;
  autoCompleteTime: BN;
  withdrawalFee: BN;
  minWithdrawalAmount: BN;
  maxPromotionDuration: BN;
  isMaintenanceMode: boolean;
  supportedTokens: PublicKey[];
  bump: number;
}

// Program Instruction Data Types
export interface CreateUserProfileData {
  username: string;
  displayName: string;
  bio: string;
  profileImageUrl: string;
  skills: string[];
  languages: string[];
  location: string;
  socialLinks: SocialLinks;
  preferences: UserPreferences;
}

export interface CreateGigData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  images: string[];
  packages: GigPackage[];
  requirements: string[];
  faq: FAQ[];
  metadata: GigMetadata;
}

export interface CreateOrderData {
  gigId: BN;
  packageIndex: number;
  customRequirements: string;
}

export interface SubmitDeliverableData {
  orderId: BN;
  deliverable: Deliverable;
}

export interface CreateReviewData {
  orderId: BN;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  isPublic: boolean;
}

export interface CreateDisputeData {
  orderId: BN;
  reason: string;
  description: string;
  evidence: Evidence[];
}

export interface ProcessWithdrawalData {
  amount: BN;
  destination: PublicKey;
}

// Event Types
export interface OrderCreatedEvent {
  orderId: BN;
  gigId: BN;
  buyer: PublicKey;
  seller: PublicKey;
  amount: BN;
  timestamp: BN;
}

export interface OrderCompletedEvent {
  orderId: BN;
  buyer: PublicKey;
  seller: PublicKey;
  amount: BN;
  timestamp: BN;
}

export interface DisputeCreatedEvent {
  disputeId: BN;
  orderId: BN;
  initiator: PublicKey;
  respondent: PublicKey;
  timestamp: BN;
}

export interface ReviewSubmittedEvent {
  reviewId: BN;
  orderId: BN;
  reviewer: PublicKey;
  rating: number;
  timestamp: BN;
}

// Error Types
export interface ProgramError {
  code: number;
  name: string;
  msg: string;
}

// Account Discriminators
export const ACCOUNT_DISCRIMINATORS = {
  USER_PROFILE: 'user_profile',
  GIG: 'gig',
  ORDER: 'order',
  REVIEW: 'review',
  DISPUTE: 'dispute',
  ESCROW: 'escrow',
  CATEGORY: 'category',
  PLATFORM_STATS: 'platform_stats',
  NOTIFICATION: 'notification',
  PROMOTION: 'promotion',
  WITHDRAWAL_REQUEST: 'withdrawal_request',
  PLATFORM_CONFIG: 'platform_config'
} as const;

// Instruction Discriminators
export const INSTRUCTION_DISCRIMINATORS = {
  CREATE_USER_PROFILE: 'create_user_profile',
  UPDATE_USER_PROFILE: 'update_user_profile',
  CREATE_GIG: 'create_gig',
  UPDATE_GIG: 'update_gig',
  DELETE_GIG: 'delete_gig',
  CREATE_ORDER: 'create_order',
  ACCEPT_ORDER: 'accept_order',
  SUBMIT_DELIVERABLE: 'submit_deliverable',
  REQUEST_REVISION: 'request_revision',
  APPROVE_DELIVERABLE: 'approve_deliverable',
  COMPLETE_ORDER: 'complete_order',
  CANCEL_ORDER: 'cancel_order',
  CREATE_REVIEW: 'create_review',
  CREATE_DISPUTE: 'create_dispute',
  RESOLVE_DISPUTE: 'resolve_dispute',
  RELEASE_ESCROW: 'release_escrow',
  PROCESS_WITHDRAWAL: 'process_withdrawal',
  PROMOTE_GIG: 'promote_gig',
  UPDATE_PLATFORM_CONFIG: 'update_platform_config'
} as const;
```