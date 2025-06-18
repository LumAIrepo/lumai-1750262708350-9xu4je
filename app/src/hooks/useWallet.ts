```typescript
import { useWallet as useSolanaWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'

export interface WalletState {
  connected: boolean
  connecting: boolean
  disconnecting: boolean
  publicKey: PublicKey | null
  balance: number | null
  loading: boolean
}

export interface TransactionOptions {
  skipPreflight?: boolean
  preflightCommitment?: 'processed' | 'confirmed' | 'finalized'
  maxRetries?: number
}

export const useWallet = () => {
  const { 
    wallet, 
    publicKey, 
    connected, 
    connecting, 
    disconnecting, 
    connect, 
    disconnect, 
    sendTransaction,
    signTransaction,
    signAllTransactions,
    signMessage
  } = useSolanaWallet()
  
  const { connection } = useConnection()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const walletState: WalletState = useMemo(() => ({
    connected,
    connecting,
    disconnecting,
    publicKey,
    balance,
    loading
  }), [connected, connecting, disconnecting, publicKey, balance, loading])

  const getBalance = useCallback(async () => {
    if (!publicKey) return null
    
    try {
      const balance = await connection.getBalance(publicKey)
      const solBalance = balance / LAMPORTS_PER_SOL
      setBalance(solBalance)
      return solBalance
    } catch (error) {
      console.error('Error fetching balance:', error)
      toast.error('Failed to fetch wallet balance')
      return null
    }
  }, [publicKey, connection])

  const connectWallet = useCallback(async () => {
    try {
      setLoading(true)
      await connect()
      toast.success('Wallet connected successfully')
      // Fetch balance after connection
      setTimeout(() => {
        getBalance()
      }, 1000)
    } catch (error) {
      console.error('Error connecting wallet:', error)
      toast.error('Failed to connect wallet')
    } finally {
      setLoading(false)
    }
  }, [connect, getBalance])

  const disconnectWallet = useCallback(async () => {
    try {
      setLoading(true)
      await disconnect()
      setBalance(null)
      toast.success('Wallet disconnected')
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
      toast.error('Failed to disconnect wallet')
    } finally {
      setLoading(false)
    }
  }, [disconnect])

  const sendSol = useCallback(async (
    to: string | PublicKey, 
    amount: number,
    options?: TransactionOptions
  ) => {
    if (!publicKey || !connected) {
      toast.error('Wallet not connected')
      return null
    }

    try {
      setLoading(true)
      const toPublicKey = typeof to === 'string' ? new PublicKey(to) : to
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL)

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: toPublicKey,
          lamports,
        })
      )

      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: options?.skipPreflight || false,
        preflightCommitment: options?.preflightCommitment || 'confirmed',
        maxRetries: options?.maxRetries || 3
      })

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed')
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed')
      }

      toast.success(`Successfully sent ${amount} SOL`)
      
      // Refresh balance
      setTimeout(() => {
        getBalance()
      }, 2000)

      return signature
    } catch (error) {
      console.error('Error sending SOL:', error)
      toast.error('Failed to send SOL')
      return null
    } finally {
      setLoading(false)
    }
  }, [publicKey, connected, sendTransaction, connection, getBalance])

  const executeTransaction = useCallback(async (
    transaction: Transaction,
    options?: TransactionOptions
  ) => {
    if (!publicKey || !connected) {
      toast.error('Wallet not connected')
      return null
    }

    try {
      setLoading(true)
      
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: options?.skipPreflight || false,
        preflightCommitment: options?.preflightCommitment || 'confirmed',
        maxRetries: options?.maxRetries || 3
      })

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed')
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed')
      }

      toast.success('Transaction executed successfully')
      
      // Refresh balance
      setTimeout(() => {
        getBalance()
      }, 2000)

      return signature
    } catch (error) {
      console.error('Error executing transaction:', error)
      toast.error('Transaction failed')
      return null
    } finally {
      setLoading(false)
    }
  }, [publicKey, connected, sendTransaction, connection, getBalance])

  const signTransactionSafe = useCallback(async (transaction: Transaction) => {
    if (!signTransaction) {
      toast.error('Wallet does not support transaction signing')
      return null
    }

    try {
      setLoading(true)
      const signedTransaction = await signTransaction(transaction)
      return signedTransaction
    } catch (error) {
      console.error('Error signing transaction:', error)
      toast.error('Failed to sign transaction')
      return null
    } finally {
      setLoading(false)
    }
  }, [signTransaction])

  const signAllTransactionsSafe = useCallback(async (transactions: Transaction[]) => {
    if (!signAllTransactions) {
      toast.error('Wallet does not support batch transaction signing')
      return null
    }

    try {
      setLoading(true)
      const signedTransactions = await signAllTransactions(transactions)
      return signedTransactions
    } catch (error) {
      console.error('Error signing transactions:', error)
      toast.error('Failed to sign transactions')
      return null
    } finally {
      setLoading(false)
    }
  }, [signAllTransactions])

  const signMessageSafe = useCallback(async (message: Uint8Array) => {
    if (!signMessage) {
      toast.error('Wallet does not support message signing')
      return null
    }

    try {
      setLoading(true)
      const signature = await signMessage(message)
      return signature
    } catch (error) {
      console.error('Error signing message:', error)
      toast.error('Failed to sign message')
      return null
    } finally {
      setLoading(false)
    }
  }, [signMessage])

  const formatAddress = useCallback((address: string | PublicKey | null, length = 4) => {
    if (!address) return ''
    const addressString = typeof address === 'string' ? address : address.toString()
    return `${addressString.slice(0, length)}...${addressString.slice(-length)}`
  }, [])

  const copyAddress = useCallback(async () => {
    if (!publicKey) return
    
    try {
      await navigator.clipboard.writeText(publicKey.toString())
      toast.success('Address copied to clipboard')
    } catch (error) {
      console.error('Error copying address:', error)
      toast.error('Failed to copy address')
    }
  }, [publicKey])

  const refreshBalance = useCallback(async () => {
    if (!connected) return
    await getBalance()
  }, [connected, getBalance])

  const isValidAddress = useCallback((address: string): boolean => {
    try {
      new PublicKey(address)
      return true
    } catch {
      return false
    }
  }, [])

  return {
    // Wallet state
    wallet,
    walletState,
    publicKey,
    connected,
    connecting,
    disconnecting,
    balance,
    loading,

    // Connection methods
    connect: connectWallet,
    disconnect: disconnectWallet,

    // Transaction methods
    sendSol,
    executeTransaction,
    signTransaction: signTransactionSafe,
    signAllTransactions: signAllTransactionsSafe,
    signMessage: signMessageSafe,

    // Utility methods
    getBalance,
    refreshBalance,
    formatAddress,
    copyAddress,
    isValidAddress,

    // Raw wallet adapter methods (for advanced usage)
    sendTransaction,
    connection
  }
}

export default useWallet
```