```typescript
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, Idl, setProvider } from '@coral-xyz/anchor';
import { PublicKey, Connection } from '@solana/web3.js';
import { useMemo } from 'react';

// SolanaGigs Program IDL
const SOLANA_GIGS_IDL: Idl = {
  version: "0.1.0",
  name: "solana_gigs",
  instructions: [
    {
      name: "createGig",
      accounts: [
        { name: "gig", isMut: true, isSigner: false },
        { name: "seller", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "title", type: "string" },
        { name: "description", type: "string" },
        { name: "price", type: "u64" },
        { name: "category", type: "string" },
        { name: "deliveryTime", type: "u32" },
        { name: "tags", type: { vec: "string" } }
      ]
    },
    {
      name: "updateGig",
      accounts: [
        { name: "gig", isMut: true, isSigner: false },
        { name: "seller", isMut: false, isSigner: true }
      ],
      args: [
        { name: "title", type: { option: "string" } },
        { name: "description", type: { option: "string" } },
        { name: "price", type: { option: "u64" } },
        { name: "deliveryTime", type: { option: "u32" } },
        { name: "isActive", type: { option: "bool" } }
      ]
    },
    {
      name: "createOrder",
      accounts: [
        { name: "order", isMut: true, isSigner: false },
        { name: "gig", isMut: true, isSigner: false },
        { name: "buyer", isMut: true, isSigner: true },
        { name: "seller", isMut: true, isSigner: false },
        { name: "escrow", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "requirements", type: "string" },
        { name: "deadline", type: "i64" }
      ]
    },
    {
      name: "submitWork",
      accounts: [
        { name: "order", isMut: true, isSigner: false },
        { name: "seller", isMut: false, isSigner: true }
      ],
      args: [
        { name: "deliveryUrl", type: "string" },
        { name: "deliveryNotes", type: "string" }
      ]
    },
    {
      name: "approveWork",
      accounts: [
        { name: "order", isMut: true, isSigner: false },
        { name: "buyer", isMut: true, isSigner: true },
        { name: "seller", isMut: true, isSigner: false },
        { name: "escrow", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "rating", type: "u8" },
        { name: "review", type: "string" }
      ]
    },
    {
      name: "requestRevision",
      accounts: [
        { name: "order", isMut: true, isSigner: false },
        { name: "buyer", isMut: false, isSigner: true }
      ],
      args: [
        { name: "revisionNotes", type: "string" }
      ]
    },
    {
      name: "disputeOrder",
      accounts: [
        { name: "order", isMut: true, isSigner: false },
        { name: "disputer", isMut: false, isSigner: true }
      ],
      args: [
        { name: "reason", type: "string" }
      ]
    },
    {
      name: "resolveDispute",
      accounts: [
        { name: "order", isMut: true, isSigner: false },
        { name: "buyer", isMut: true, isSigner: false },
        { name: "seller", isMut: true, isSigner: false },
        { name: "escrow", isMut: true, isSigner: false },
        { name: "authority", isMut: false, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "buyerRefundPercent", type: "u8" },
        { name: "resolution", type: "string" }
      ]
    },
    {
      name: "createProfile",
      accounts: [
        { name: "profile", isMut: true, isSigner: false },
        { name: "user", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "username", type: "string" },
        { name: "bio", type: "string" },
        { name: "skills", type: { vec: "string" } },
        { name: "profileImageUrl", type: "string" }
      ]
    },
    {
      name: "updateProfile",
      accounts: [
        { name: "profile", isMut: true, isSigner: false },
        { name: "user", isMut: false, isSigner: true }
      ],
      args: [
        { name: "bio", type: { option: "string" } },
        { name: "skills", type: { option: { vec: "string" } } },
        { name: "profileImageUrl", type: { option: "string" } },
        { name: "isVerified", type: { option: "bool" } }
      ]
    }
  ],
  accounts: [
    {
      name: "Gig",
      type: {
        kind: "struct",
        fields: [
          { name: "seller", type: "publicKey" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "price", type: "u64" },
          { name: "category", type: "string" },
          { name: "deliveryTime", type: "u32" },
          { name: "tags", type: { vec: "string" } },
          { name: "isActive", type: "bool" },
          { name: "ordersCompleted", type: "u32" },
          { name: "averageRating", type: "f32" },
          { name: "createdAt", type: "i64" },
          { name: "updatedAt", type: "i64" },
          { name: "bump", type: "u8" }
        ]
      }
    },
    {
      name: "Order",
      type: {
        kind: "struct",
        fields: [
          { name: "gig", type: "publicKey" },
          { name: "buyer", type: "publicKey" },
          { name: "seller", type: "publicKey" },
          { name: "price", type: "u64" },
          { name: "requirements", type: "string" },
          { name: "deliveryUrl", type: { option: "string" } },
          { name: "deliveryNotes", type: { option: "string" } },
          { name: "status", type: { defined: "OrderStatus" } },
          { name: "deadline", type: "i64" },
          { name: "createdAt", type: "i64" },
          { name: "completedAt", type: { option: "i64" } },
          { name: "rating", type: { option: "u8" } },
          { name: "review", type: { option: "string" } },
          { name: "revisionCount", type: "u8" },
          { name: "disputeReason", type: { option: "string" } },
          { name: "bump", type: "u8" }
        ]
      }
    },
    {
      name: "Profile",
      type: {
        kind: "struct",
        fields: [
          { name: "user", type: "publicKey" },
          { name: "username", type: "string" },
          { name: "bio", type: "string" },
          { name: "skills", type: { vec: "string" } },
          { name: "profileImageUrl", type: "string" },
          { name: "isVerified", type: "bool" },
          { name: "totalEarnings", type: "u64" },
          { name: "totalSpent", type: "u64" },
          { name: "gigsCreated", type: "u32" },
          { name: "ordersCompleted", type: "u32" },
          { name: "averageRating", type: "f32" },
          { name: "createdAt", type: "i64" },
          { name: "bump", type: "u8" }
        ]
      }
    }
  ],
  types: [
    {
      name: "OrderStatus",
      type: {
        kind: "enum",
        variants: [
          { name: "Pending" },
          { name: "InProgress" },
          { name: "Delivered" },
          { name: "Completed" },
          { name: "Cancelled" },
          { name: "Disputed" },
          { name: "RevisionRequested" }
        ]
      }
    }
  ],
  errors: [
    {
      code: 6000,
      name: "Unauthorized",
      msg: "You are not authorized to perform this action"
    },
    {
      code: 6001,
      name: "InvalidGigStatus",
      msg: "Gig is not active"
    },
    {
      code: 6002,
      name: "InvalidOrderStatus",
      msg: "Invalid order status for this operation"
    },
    {
      code: 6003,
      name: "InsufficientFunds",
      msg: "Insufficient funds for this transaction"
    },
    {
      code: 6004,
      name: "DeadlineExceeded",
      msg: "Order deadline has been exceeded"
    },
    {
      code: 6005,
      name: "InvalidRating",
      msg: "Rating must be between 1 and 5"
    },
    {
      code: 6006,
      name: "MaxRevisionsExceeded",
      msg: "Maximum number of revisions exceeded"
    },
    {
      code: 6007,
      name: "ProfileAlreadyExists",
      msg: "Profile already exists for this user"
    },
    {
      code: 6008,
      name: "ProfileNotFound",
      msg: "Profile not found"
    },
    {
      code: 6009,
      name: "InvalidDispute",
      msg: "Cannot dispute this order"
    }
  ]
};

// Program ID - Replace with your deployed program ID
const PROGRAM_ID = new PublicKey("SoLGiGs1111111111111111111111111111111111111");

export interface SolanaGigsProgram extends Program {
  programId: PublicKey;
}

export const useProgram = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (!wallet.publicKey) {
      return null;
    }

    try {
      const provider = new AnchorProvider(
        connection,
        wallet as any,
        {
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
        }
      );

      setProvider(provider);

      const program = new Program(
        SOLANA_GIGS_IDL,
        PROGRAM_ID,
        provider
      ) as SolanaGigsProgram;

      return program;
    } catch (error) {
      console.error('Error creating program instance:', error);
      return null;
    }
  }, [connection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);

  const isReady = useMemo(() => {
    return !!(program && wallet.connected && wallet.publicKey);
  }, [program, wallet.connected, wallet.publicKey]);

  // Helper function to get PDA for gig
  const getGigPDA = (seller: PublicKey, gigId: string) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("gig"),
        seller.toBuffer(),
        Buffer.from(gigId)
      ],
      PROGRAM_ID
    );
  };

  // Helper function to get PDA for order
  const getOrderPDA = (gig: PublicKey, buyer: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("order"),
        gig.toBuffer(),
        buyer.toBuffer()
      ],
      PROGRAM_ID
    );
  };

  // Helper function to get PDA for profile
  const getProfilePDA = (user: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("profile"),
        user.toBuffer()
      ],
      PROGRAM_ID
    );
  };

  // Helper function to get PDA for escrow
  const getEscrowPDA = (order: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        order.toBuffer()
      ],
      PROGRAM_ID
    );
  };

  return {
    program,
    programId: PROGRAM_ID,
    isReady,
    connection,
    wallet,
    getGigPDA,
    getOrderPDA,
    getProfilePDA,
    getEscrowPDA,
  };
};

export default useProgram;
```