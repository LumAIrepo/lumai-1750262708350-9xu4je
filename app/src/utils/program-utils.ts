```typescript
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, AccountInfo, Commitment } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN, IdlAccounts } from '@coral-xyz/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';

// Program ID for SolanaGigs marketplace
export const PROGRAM_ID = new PublicKey('SoLanaGigsMarketplace11111111111111111111111');

// PDA seeds
export const MARKETPLACE_SEED = 'marketplace';
export const GIG_SEED = 'gig';
export const ORDER_SEED = 'order';
export const ESCROW_SEED = 'escrow';
export const PROFILE_SEED = 'profile';
export const REVIEW_SEED = 'review';

// Account types
export interface MarketplaceAccount {
  authority: PublicKey;
  feePercentage: number;
  totalGigs: BN;
  totalOrders: BN;
  totalVolume: BN;
  bump: number;
}

export interface GigAccount {
  seller: PublicKey;
  title: string;
  description: string;
  category: string;
  price: BN;
  deliveryTime: number;
  isActive: boolean;
  totalOrders: BN;
  rating: number;
  reviewCount: number;
  createdAt: BN;
  updatedAt: BN;
  tags: string[];
  images: string[];
  bump: number;
}

export interface OrderAccount {
  buyer: PublicKey;
  seller: PublicKey;
  gig: PublicKey;
  escrow: PublicKey;
  amount: BN;
  status: OrderStatus;
  requirements: string;
  deliverables: string;
  createdAt: BN;
  deliveryDeadline: BN;
  completedAt: BN | null;
  bump: number;
}

export interface EscrowAccount {
  order: PublicKey;
  buyer: PublicKey;
  seller: PublicKey;
  amount: BN;
  isReleased: boolean;
  createdAt: BN;
  bump: number;
}

export interface ProfileAccount {
  owner: PublicKey;
  username: string;
  bio: string;
  avatar: string;
  skills: string[];
  totalEarnings: BN;
  totalSpent: BN;
  completedOrders: BN;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  createdAt: BN;
  bump: number;
}

export interface ReviewAccount {
  order: PublicKey;
  reviewer: PublicKey;
  reviewee: PublicKey;
  rating: number;
  comment: string;
  createdAt: BN;
  bump: number;
}

export enum OrderStatus {
  Pending = 0,
  InProgress = 1,
  Delivered = 2,
  Completed = 3,
  Disputed = 4,
  Cancelled = 5,
}

export enum GigCategory {
  Development = 'development',
  Design = 'design',
  Marketing = 'marketing',
  Writing = 'writing',
  Consulting = 'consulting',
  Other = 'other',
}

// Utility functions
export const findMarketplacePDA = (): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(MARKETPLACE_SEED)],
    PROGRAM_ID
  );
};

export const findGigPDA = (seller: PublicKey, gigId: string): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(GIG_SEED),
      seller.toBuffer(),
      Buffer.from(gigId),
    ],
    PROGRAM_ID
  );
};

export const findOrderPDA = (buyer: PublicKey, gig: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(ORDER_SEED),
      buyer.toBuffer(),
      gig.toBuffer(),
    ],
    PROGRAM_ID
  );
};

export const findEscrowPDA = (order: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(ESCROW_SEED),
      order.toBuffer(),
    ],
    PROGRAM_ID
  );
};

export const findProfilePDA = (owner: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(PROFILE_SEED),
      owner.toBuffer(),
    ],
    PROGRAM_ID
  );
};

export const findReviewPDA = (order: PublicKey, reviewer: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(REVIEW_SEED),
      order.toBuffer(),
      reviewer.toBuffer(),
    ],
    PROGRAM_ID
  );
};

// Account fetching utilities
export const fetchMarketplaceAccount = async (
  connection: Connection,
  commitment: Commitment = 'confirmed'
): Promise<MarketplaceAccount | null> => {
  try {
    const [marketplacePDA] = findMarketplacePDA();
    const accountInfo = await connection.getAccountInfo(marketplacePDA, commitment);
    
    if (!accountInfo) return null;
    
    // Deserialize account data based on your program's account structure
    // This is a simplified version - you'll need to implement proper deserialization
    return deserializeMarketplaceAccount(accountInfo.data);
  } catch (error) {
    console.error('Error fetching marketplace account:', error);
    return null;
  }
};

export const fetchGigAccount = async (
  connection: Connection,
  gigPDA: PublicKey,
  commitment: Commitment = 'confirmed'
): Promise<GigAccount | null> => {
  try {
    const accountInfo = await connection.getAccountInfo(gigPDA, commitment);
    
    if (!accountInfo) return null;
    
    return deserializeGigAccount(accountInfo.data);
  } catch (error) {
    console.error('Error fetching gig account:', error);
    return null;
  }
};

export const fetchOrderAccount = async (
  connection: Connection,
  orderPDA: PublicKey,
  commitment: Commitment = 'confirmed'
): Promise<OrderAccount | null> => {
  try {
    const accountInfo = await connection.getAccountInfo(orderPDA, commitment);
    
    if (!accountInfo) return null;
    
    return deserializeOrderAccount(accountInfo.data);
  } catch (error) {
    console.error('Error fetching order account:', error);
    return null;
  }
};

export const fetchProfileAccount = async (
  connection: Connection,
  profilePDA: PublicKey,
  commitment: Commitment = 'confirmed'
): Promise<ProfileAccount | null> => {
  try {
    const accountInfo = await connection.getAccountInfo(profilePDA, commitment);
    
    if (!accountInfo) return null;
    
    return deserializeProfileAccount(accountInfo.data);
  } catch (error) {
    console.error('Error fetching profile account:', error);
    return null;
  }
};

export const fetchUserGigs = async (
  connection: Connection,
  seller: PublicKey,
  commitment: Commitment = 'confirmed'
): Promise<GigAccount[]> => {
  try {
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      commitment,
      filters: [
        {
          memcmp: {
            offset: 8, // Skip discriminator
            bytes: seller.toBase58(),
          },
        },
      ],
    });

    return accounts
      .map(account => deserializeGigAccount(account.account.data))
      .filter(Boolean) as GigAccount[];
  } catch (error) {
    console.error('Error fetching user gigs:', error);
    return [];
  }
};

export const fetchUserOrders = async (
  connection: Connection,
  user: PublicKey,
  commitment: Commitment = 'confirmed'
): Promise<OrderAccount[]> => {
  try {
    const buyerOrders = await connection.getProgramAccounts(PROGRAM_ID, {
      commitment,
      filters: [
        {
          memcmp: {
            offset: 8, // Skip discriminator
            bytes: user.toBase58(),
          },
        },
      ],
    });

    const sellerOrders = await connection.getProgramAccounts(PROGRAM_ID, {
      commitment,
      filters: [
        {
          memcmp: {
            offset: 40, // Skip discriminator + buyer pubkey
            bytes: user.toBase58(),
          },
        },
      ],
    });

    const allOrders = [...buyerOrders, ...sellerOrders];
    return allOrders
      .map(account => deserializeOrderAccount(account.account.data))
      .filter(Boolean) as OrderAccount[];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
};

// Transaction building utilities
export const buildCreateGigTransaction = async (
  connection: Connection,
  wallet: WalletContextState,
  gigData: {
    title: string;
    description: string;
    category: string;
    price: number;
    deliveryTime: number;
    tags: string[];
    images: string[];
  }
): Promise<Transaction | null> => {
  if (!wallet.publicKey) return null;

  try {
    const gigId = Date.now().toString();
    const [gigPDA, gigBump] = findGigPDA(wallet.publicKey, gigId);
    const [profilePDA] = findProfilePDA(wallet.publicKey);

    const transaction = new Transaction();
    
    // Add create gig instruction
    // This would be replaced with actual program instruction
    const instruction = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: gigPDA,
      lamports: await connection.getMinimumBalanceForRentExemption(1000),
      space: 1000,
      programId: PROGRAM_ID,
    });

    transaction.add(instruction);
    
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    return transaction;
  } catch (error) {
    console.error('Error building create gig transaction:', error);
    return null;
  }
};

export const buildCreateOrderTransaction = async (
  connection: Connection,
  wallet: WalletContextState,
  gigPDA: PublicKey,
  requirements: string
): Promise<Transaction | null> => {
  if (!wallet.publicKey) return null;

  try {
    const [orderPDA, orderBump] = findOrderPDA(wallet.publicKey, gigPDA);
    const [escrowPDA, escrowBump] = findEscrowPDA(orderPDA);

    const transaction = new Transaction();
    
    // Add create order instruction
    const instruction = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: orderPDA,
      lamports: await connection.getMinimumBalanceForRentExemption(500),
      space: 500,
      programId: PROGRAM_ID,
    });

    transaction.add(instruction);
    
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    return transaction;
  } catch (error) {
    console.error('Error building create order transaction:', error);
    return null;
  }
};

// Validation utilities
export const validateGigData = (gigData: any): string[] => {
  const errors: string[] = [];

  if (!gigData.title || gigData.title.trim().length < 5) {
    errors.push('Title must be at least 5 characters long');
  }

  if (!gigData.description || gigData.description.trim().length < 20) {
    errors.push('Description must be at least 20 characters long');
  }

  if (!gigData.category || !Object.values(GigCategory).includes(gigData.category)) {
    errors.push('Please select a valid category');
  }

  if (!gigData.price || gigData.price <= 0) {
    errors.push('Price must be greater than 0');
  }

  if (!gigData.deliveryTime || gigData.deliveryTime <= 0) {
    errors.push('Delivery time must be greater than 0');
  }

  if (gigData.tags && gigData.tags.length > 10) {
    errors.push('Maximum 10 tags allowed');
  }

  return errors;
};

export const validateOrderData = (orderData: any): string[] => {
  const errors: string[] = [];

  if (!orderData.requirements || orderData.requirements.trim().length < 10) {
    errors.push('Requirements must be at least 10 characters long');
  }

  return errors;
};

// Formatting utilities
export const formatSOL = (lamports: number | BN): string => {
  const sol = typeof lamports === 'number' ? lamports / LAMPORTS_PER_SOL : lamports.toNumber() / LAMPORTS_PER_SOL;
  return sol.toFixed(4);
};

export const formatOrderStatus = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.Pending:
      return 'Pending';
    case OrderStatus.InProgress:
      return 'In Progress';
    case OrderStatus.Delivered:
      return 'Delivered';
    case OrderStatus.Completed:
      return 'Completed';
    case OrderStatus.Disputed:
      return 'Disputed';
    case OrderStatus.Cancelled:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

export const getOrderStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.Pending:
      return 'text-orange-400';
    case OrderStatus.InProgress:
      return 'text-blue-500';
    case OrderStatus.Delivered:
      return 'text-purple-600';
    case OrderStatus.Completed:
      return 'text-green-500';
    case OrderStatus.Disputed:
      return 'text-red-500';
    case OrderStatus.Cancelled:
      return 'text-gray-500';
    default:
      return 'text-slate-900';
  }
};

export const calculateDeliveryDeadline = (createdAt: BN, deliveryTime: number): Date => {
  const createdDate = new Date(createdAt.toNumber() * 1000);
  return new Date(createdDate.getTime() + deliveryTime * 24 * 60 * 60 * 1000);
};

export const isDeliveryOverdue = (deliveryDeadline: BN): boolean => {
  const deadline = new Date(deliveryDeadline.toNumber() * 1000);
  return new Date() > deadline;
};

// Error handling utilities
export const handleProgramError = (error: any): string => {
  if (error?.code) {
    switch (error.code) {
      case 6000: