```typescript
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export interface EscrowDetails {
  escrowAccount: PublicKey;
  buyer: PublicKey;
  seller: PublicKey;
  amount: number;
  serviceFee: number;
  platformFee: number;
  totalAmount: number;
  status: EscrowStatus;
  createdAt: Date;
  expiresAt: Date;
  gigId: string;
  milestones?: EscrowMilestone[];
}

export interface EscrowMilestone {
  id: string;
  description: string;
  amount: number;
  status: MilestoneStatus;
  dueDate: Date;
  completedAt?: Date;
}

export enum EscrowStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  DISPUTED = 'disputed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DISPUTED = 'disputed'
}

export interface EscrowCalculation {
  baseAmount: number;
  serviceFee: number;
  platformFee: number;
  totalAmount: number;
  sellerReceives: number;
  feeBreakdown: {
    platformFeePercentage: number;
    serviceFeeFlat: number;
  };
}

export interface DisputeDetails {
  disputeId: string;
  escrowAccount: PublicKey;
  initiator: PublicKey;
  reason: string;
  evidence: string[];
  status: DisputeStatus;
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  arbitrator?: PublicKey;
}

export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated'
}

// Platform configuration
export const ESCROW_CONFIG = {
  PLATFORM_FEE_PERCENTAGE: 0.025, // 2.5%
  SERVICE_FEE_FLAT: 0.001 * LAMPORTS_PER_SOL, // 0.001 SOL
  MIN_ESCROW_AMOUNT: 0.01 * LAMPORTS_PER_SOL, // 0.01 SOL
  MAX_ESCROW_AMOUNT: 1000 * LAMPORTS_PER_SOL, // 1000 SOL
  ESCROW_DURATION_DAYS: 30,
  DISPUTE_WINDOW_DAYS: 7,
  AUTO_RELEASE_DAYS: 3
};

/**
 * Calculate escrow amounts including fees
 */
export function calculateEscrowAmounts(baseAmount: number): EscrowCalculation {
  if (baseAmount < ESCROW_CONFIG.MIN_ESCROW_AMOUNT) {
    throw new Error(`Minimum escrow amount is ${ESCROW_CONFIG.MIN_ESCROW_AMOUNT / LAMPORTS_PER_SOL} SOL`);
  }

  if (baseAmount > ESCROW_CONFIG.MAX_ESCROW_AMOUNT) {
    throw new Error(`Maximum escrow amount is ${ESCROW_CONFIG.MAX_ESCROW_AMOUNT / LAMPORTS_PER_SOL} SOL`);
  }

  const platformFee = Math.floor(baseAmount * ESCROW_CONFIG.PLATFORM_FEE_PERCENTAGE);
  const serviceFee = ESCROW_CONFIG.SERVICE_FEE_FLAT;
  const totalAmount = baseAmount + platformFee + serviceFee;
  const sellerReceives = baseAmount;

  return {
    baseAmount,
    serviceFee,
    platformFee,
    totalAmount,
    sellerReceives,
    feeBreakdown: {
      platformFeePercentage: ESCROW_CONFIG.PLATFORM_FEE_PERCENTAGE * 100,
      serviceFeeFlat: serviceFee / LAMPORTS_PER_SOL
    }
  };
}

/**
 * Calculate milestone amounts for multi-milestone escrows
 */
export function calculateMilestoneAmounts(
  totalAmount: number,
  milestonePercentages: number[]
): number[] {
  if (milestonePercentages.reduce((sum, pct) => sum + pct, 0) !== 100) {
    throw new Error('Milestone percentages must sum to 100%');
  }

  return milestonePercentages.map(percentage => 
    Math.floor((totalAmount * percentage) / 100)
  );
}

/**
 * Generate escrow account address
 */
export function generateEscrowAddress(
  buyer: PublicKey,
  seller: PublicKey,
  gigId: string,
  programId: PublicKey
): PublicKey {
  const seeds = [
    Buffer.from('escrow'),
    buyer.toBuffer(),
    seller.toBuffer(),
    Buffer.from(gigId)
  ];

  const [escrowAddress] = PublicKey.findProgramAddressSync(seeds, programId);
  return escrowAddress;
}

/**
 * Validate escrow parameters
 */
export function validateEscrowParams(params: {
  amount: number;
  buyer: PublicKey;
  seller: PublicKey;
  gigId: string;
  duration?: number;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (params.amount < ESCROW_CONFIG.MIN_ESCROW_AMOUNT) {
    errors.push(`Amount must be at least ${ESCROW_CONFIG.MIN_ESCROW_AMOUNT / LAMPORTS_PER_SOL} SOL`);
  }

  if (params.amount > ESCROW_CONFIG.MAX_ESCROW_AMOUNT) {
    errors.push(`Amount cannot exceed ${ESCROW_CONFIG.MAX_ESCROW_AMOUNT / LAMPORTS_PER_SOL} SOL`);
  }

  if (params.buyer.equals(params.seller)) {
    errors.push('Buyer and seller cannot be the same address');
  }

  if (!params.gigId || params.gigId.trim().length === 0) {
    errors.push('Gig ID is required');
  }

  if (params.duration && params.duration < 1) {
    errors.push('Duration must be at least 1 day');
  }

  if (params.duration && params.duration > 365) {
    errors.push('Duration cannot exceed 365 days');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate escrow expiration date
 */
export function calculateExpirationDate(durationDays?: number): Date {
  const duration = durationDays || ESCROW_CONFIG.ESCROW_DURATION_DAYS;
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + duration);
  return expirationDate;
}

/**
 * Check if escrow is expired
 */
export function isEscrowExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Check if escrow can be disputed
 */
export function canDispute(escrow: EscrowDetails): boolean {
  if (escrow.status !== EscrowStatus.ACTIVE) {
    return false;
  }

  const disputeDeadline = new Date(escrow.expiresAt);
  disputeDeadline.setDate(disputeDeadline.getDate() + ESCROW_CONFIG.DISPUTE_WINDOW_DAYS);
  
  return new Date() <= disputeDeadline;
}

/**
 * Check if escrow can be auto-released
 */
export function canAutoRelease(escrow: EscrowDetails): boolean {
  if (escrow.status !== EscrowStatus.COMPLETED) {
    return false;
  }

  const autoReleaseDate = new Date(escrow.expiresAt);
  autoReleaseDate.setDate(autoReleaseDate.getDate() + ESCROW_CONFIG.AUTO_RELEASE_DAYS);
  
  return new Date() >= autoReleaseDate;
}

/**
 * Format escrow amount for display
 */
export function formatEscrowAmount(lamports: number, decimals: number = 4): string {
  const sol = lamports / LAMPORTS_PER_SOL;
  return `${sol.toFixed(decimals)} SOL`;
}

/**
 * Parse SOL amount to lamports
 */
export function parseSOLAmount(solAmount: string): number {
  const amount = parseFloat(solAmount);
  if (isNaN(amount) || amount < 0) {
    throw new Error('Invalid SOL amount');
  }
  return Math.floor(amount * LAMPORTS_PER_SOL);
}

/**
 * Calculate dispute resolution amounts
 */
export function calculateDisputeResolution(
  escrowAmount: number,
  buyerPercentage: number
): { buyerAmount: number; sellerAmount: number } {
  if (buyerPercentage < 0 || buyerPercentage > 100) {
    throw new Error('Buyer percentage must be between 0 and 100');
  }

  const buyerAmount = Math.floor((escrowAmount * buyerPercentage) / 100);
  const sellerAmount = escrowAmount - buyerAmount;

  return { buyerAmount, sellerAmount };
}

/**
 * Generate escrow reference ID
 */
export function generateEscrowReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ESC-${timestamp}-${random}`.toUpperCase();
}

/**
 * Validate milestone structure
 */
export function validateMilestones(milestones: Partial<EscrowMilestone>[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (milestones.length === 0) {
    errors.push('At least one milestone is required');
  }

  if (milestones.length > 10) {
    errors.push('Maximum 10 milestones allowed');
  }

  milestones.forEach((milestone, index) => {
    if (!milestone.description || milestone.description.trim().length === 0) {
      errors.push(`Milestone ${index + 1}: Description is required`);
    }

    if (!milestone.amount || milestone.amount <= 0) {
      errors.push(`Milestone ${index + 1}: Amount must be greater than 0`);
    }

    if (!milestone.dueDate || milestone.dueDate <= new Date()) {
      errors.push(`Milestone ${index + 1}: Due date must be in the future`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate time remaining for escrow
 */
export function getTimeRemaining(expiresAt: Date): {
  days: number;
  hours: number;
  minutes: number;
  isExpired: boolean;
} {
  const now = new Date();
  const timeDiff = expiresAt.getTime() - now.getTime();

  if (timeDiff <= 0) {
    return { days: 0, hours: 0, minutes: 0, isExpired: true };
  }

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, isExpired: false };
}

/**
 * Get escrow status color for UI
 */
export function getEscrowStatusColor(status: EscrowStatus): string {
  switch (status) {
    case EscrowStatus.PENDING:
      return 'text-orange-400 bg-orange-400/10';
    case EscrowStatus.ACTIVE:
      return 'text-green-500 bg-green-500/10';
    case EscrowStatus.DISPUTED:
      return 'text-red-500 bg-red-500/10';
    case EscrowStatus.COMPLETED:
      return 'text-purple-600 bg-purple-600/10';
    case EscrowStatus.CANCELLED:
      return 'text-slate-500 bg-slate-500/10';
    case EscrowStatus.EXPIRED:
      return 'text-slate-400 bg-slate-400/10';
    default:
      return 'text-slate-600 bg-slate-600/10';
  }
}

/**
 * Get milestone status color for UI
 */
export function getMilestoneStatusColor(status: MilestoneStatus): string {
  switch (status) {
    case MilestoneStatus.PENDING:
      return 'text-slate-500 bg-slate-500/10';
    case MilestoneStatus.IN_PROGRESS:
      return 'text-orange-400 bg-orange-400/10';
    case MilestoneStatus.COMPLETED:
      return 'text-green-500 bg-green-500/10';
    case MilestoneStatus.DISPUTED:
      return 'text-red-500 bg-red-500/10';
    default:
      return 'text-slate-600 bg-slate-600/10';
  }
}
```