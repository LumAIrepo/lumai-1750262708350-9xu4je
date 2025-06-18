```typescript
import { useState, useEffect, useCallback } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor'
import { toast } from 'sonner'

export interface Order {
  id: string
  gigId: string
  buyerId: string
  sellerId: string
  title: string
  description: string
  price: number
  status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'disputed' | 'cancelled'
  escrowAccount: string
  createdAt: Date
  updatedAt: Date
  deliveryDate?: Date
  requirements?: string
  deliverables?: string[]
  messages?: OrderMessage[]
  milestones?: OrderMilestone[]
}

export interface OrderMessage {
  id: string
  orderId: string
  senderId: string
  message: string
  attachments?: string[]
  timestamp: Date
}

export interface OrderMilestone {
  id: string
  orderId: string
  title: string
  description: string
  amount: number
  status: 'pending' | 'completed' | 'disputed'
  dueDate: Date
  completedAt?: Date
}

export interface CreateOrderParams {
  gigId: string
  sellerId: string
  requirements: string
  customOffer?: {
    price: number
    deliveryDays: number
    description: string
  }
}

export interface OrderFilters {
  status?: Order['status']
  role?: 'buyer' | 'seller'
  dateRange?: {
    from: Date
    to: Date
  }
}

export interface OrderStats {
  totalOrders: number
  activeOrders: number
  completedOrders: number
  totalEarnings: number
  totalSpent: number
  averageRating: number
  completionRate: number
}

export const useOrders = () => {
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<OrderStats | null>(null)

  // Fetch orders for the current user
  const fetchOrders = useCallback(async (filters?: OrderFilters) => {
    if (!publicKey) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPublicKey: publicKey.toString(),
          filters,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.orders || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [publicKey])

  // Create a new order
  const createOrder = useCallback(async (params: CreateOrderParams): Promise<Order | null> => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your wallet')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      // First, create the order record
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          buyerId: publicKey.toString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const orderData = await response.json()
      const order = orderData.order

      // Create escrow account on Solana
      const escrowKeypair = web3.Keypair.generate()
      const escrowAmount = order.price * LAMPORTS_PER_SOL

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: escrowKeypair.publicKey,
          lamports: escrowAmount + await connection.getMinimumBalanceForRentExemption(0),
          space: 0,
          programId: SystemProgram.programId,
        })
      )

      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      const signedTransaction = await signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())
      await connection.confirmTransaction(signature)

      // Update order with escrow account
      const updateResponse = await fetch('/api/orders/update-escrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          escrowAccount: escrowKeypair.publicKey.toString(),
          transactionSignature: signature,
        }),
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update order with escrow account')
      }

      const updatedOrder = await updateResponse.json()
      
      setOrders(prev => [updatedOrder.order, ...prev])
      toast.success('Order created successfully!')
      
      return updatedOrder.order
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [publicKey, signTransaction, connection])

  // Accept an order (seller)
  const acceptOrder = useCallback(async (orderId: string): Promise<boolean> => {
    if (!publicKey) {
      toast.error('Please connect your wallet')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/orders/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          sellerId: publicKey.toString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to accept order')
      }

      const data = await response.json()
      
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: 'in_progress', updatedAt: new Date() }
            : order
        )
      )

      toast.success('Order accepted successfully!')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept order'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [publicKey])

  // Deliver order (seller)
  const deliverOrder = useCallback(async (orderId: string, deliverables: string[]): Promise<boolean> => {
    if (!publicKey) {
      toast.error('Please connect your wallet')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/orders/deliver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          sellerId: publicKey.toString(),
          deliverables,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to deliver order')
      }

      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status: 'delivered', 
                deliverables,
                deliveryDate: new Date(),
                updatedAt: new Date() 
              }
            : order
        )
      )

      toast.success('Order delivered successfully!')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deliver order'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [publicKey])

  // Complete order and release escrow (buyer)
  const completeOrder = useCallback(async (orderId: string, rating?: number, review?: string): Promise<boolean> => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your wallet')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const order = orders.find(o => o.id === orderId)
      if (!order) {
        throw new Error('Order not found')
      }

      // Release escrow funds
      const escrowPubkey = new PublicKey(order.escrowAccount)
      const sellerPubkey = new PublicKey(order.sellerId)
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: escrowPubkey,
          toPubkey: sellerPubkey,
          lamports: order.price * LAMPORTS_PER_SOL,
        })
      )

      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      const signedTransaction = await signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())
      await connection.confirmTransaction(signature)

      // Update order status
      const response = await fetch('/api/orders/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          buyerId: publicKey.toString(),
          rating,
          review,
          transactionSignature: signature,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to complete order')
      }

      setOrders(prev => 
        prev.map(o => 
          o.id === orderId 
            ? { ...o, status: 'completed', updatedAt: new Date() }
            : o
        )
      )

      toast.success('Order completed successfully!')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete order'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [publicKey, signTransaction, connection, orders])

  // Cancel order
  const cancelOrder = useCallback(async (orderId: string, reason: string): Promise<boolean> => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your wallet')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const order = orders.find(o => o.id === orderId)
      if (!order) {
        throw new Error('Order not found')
      }

      // Refund escrow if order is not yet in progress
      if (order.status === 'pending' && order.escrowAccount) {
        const escrowPubkey = new PublicKey(order.escrowAccount)
        
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: escrowPubkey,
            toPubkey: publicKey,
            lamports: order.price * LAMPORTS_PER_SOL,
          })
        )

        const { blockhash } = await connection.getLatestBlockhash()
        transaction.recentBlockhash = blockhash
        transaction.feePayer = publicKey

        const signedTransaction = await signTransaction(transaction)
        const signature = await connection.sendRawTransaction(signedTransaction.serialize())
        await connection.confirmTransaction(signature)
      }

      const response = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          userId: publicKey.toString(),
          reason,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel order')
      }

      setOrders(prev => 
        prev.map(o => 
          o.id === orderId 
            ? { ...o, status: 'cancelled', updatedAt: new Date() }
            : o
        )
      )

      toast.success('Order cancelled successfully!')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [publicKey, signTransaction, connection, orders])

  // Send message in order
  const sendMessage = useCallback(async (orderId: string, message: string, attachments?: string[]): Promise<boolean> => {
    if (!publicKey) {
      toast.error('Please connect your wallet')
      return false
    }

    try {
      const response = await fetch('/api/orders/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          senderId: publicKey.toString(),
          message,
          attachments,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                messages: [...(order.messages || []), data.message],
                updatedAt: new Date()
              }
            : order
        )
      )

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      toast.error(errorMessage)
      return false
    }
  }, [publicKey])

  // Fetch order statistics
  const fetchStats = useCallback(async () => {
    if (!publicKey) return

    try {
      const response = await fetch('/api/orders/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPublicKey: publicKey.toString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      setStats(data.stats)
    } catch (err) {
      console.error('Failed to fetch order stats:', err)
    }
  }, [publicKey])

  // Get order by ID
  const getOrder = useCallback((orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId)
  }, [orders])

  // Get orders by status
  const getOrdersByStatus = useCallback((status