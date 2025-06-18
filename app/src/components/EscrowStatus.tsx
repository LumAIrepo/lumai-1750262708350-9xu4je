```tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Clock, Shield, CheckCircle, XCircle, AlertTriangle, Wallet, User, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EscrowData {
  id: string
  gigTitle: string
  buyer: string
  seller: string
  amount: number
  status: 'pending' | 'funded' | 'in_progress' | 'disputed' | 'completed' | 'cancelled'
  createdAt: Date
  deadline: Date
  milestones: {
    id: string
    description: string
    amount: number
    status: 'pending' | 'completed' | 'disputed'
    completedAt?: Date
  }[]
  disputeReason?: string
  releaseConditions: string[]
}

interface EscrowStatusProps {
  escrowId: string
  userRole: 'buyer' | 'seller' | 'admin'
  onStatusChange?: (newStatus: string) => void
}

export default function EscrowStatus({ escrowId, userRole, onStatusChange }: EscrowStatusProps) {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [escrowData, setEscrowData] = useState<EscrowData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [balance, setBalance] = useState<number>(0)

  useEffect(() => {
    fetchEscrowData()
    if (connected && publicKey) {
      fetchWalletBalance()
    }
  }, [escrowId, connected, publicKey])

  const fetchEscrowData = async () => {
    try {
      setLoading(true)
      // Simulate API call to fetch escrow data
      const mockData: EscrowData = {
        id: escrowId,
        gigTitle: 'Custom Solana Smart Contract Development',
        buyer: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU',
        seller: 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC7Hg6TJ8N4k2',
        amount: 2.5,
        status: 'in_progress',
        createdAt: new Date('2024-01-15'),
        deadline: new Date('2024-02-15'),
        milestones: [
          {
            id: '1',
            description: 'Project setup and initial architecture',
            amount: 0.8,
            status: 'completed',
            completedAt: new Date('2024-01-20')
          },
          {
            id: '2',
            description: 'Core smart contract implementation',
            amount: 1.2,
            status: 'pending'
          },
          {
            id: '3',
            description: 'Testing and deployment',
            amount: 0.5,
            status: 'pending'
          }
        ],
        releaseConditions: [
          'All milestones completed',
          'Code review passed',
          'Client approval received'
        ]
      }
      setEscrowData(mockData)
    } catch (error) {
      console.error('Error fetching escrow data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWalletBalance = async () => {
    if (!publicKey || !connection) return
    try {
      const balance = await connection.getBalance(publicKey)
      setBalance(balance / LAMPORTS_PER_SOL)
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'funded':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'disputed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'funded':
        return <Wallet className="w-4 h-4" />
      case 'in_progress':
        return <Shield className="w-4 h-4" />
      case 'disputed':
        return <AlertTriangle className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const calculateProgress = () => {
    if (!escrowData) return 0
    const completedMilestones = escrowData.milestones.filter(m => m.status === 'completed').length
    return (completedMilestones / escrowData.milestones.length) * 100
  }

  const handleReleaseFunds = async () => {
    if (!connected || !publicKey) return
    
    setActionLoading(true)
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (escrowData) {
        const updatedData = { ...escrowData, status: 'completed' as const }
        setEscrowData(updatedData)
        onStatusChange?.('completed')
      }
    } catch (error) {
      console.error('Error releasing funds:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDispute = async () => {
    if (!connected || !publicKey) return
    
    setActionLoading(true)
    try {
      // Simulate dispute initiation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (escrowData) {
        const updatedData = { 
          ...escrowData, 
          status: 'disputed' as const,
          disputeReason: 'Work not completed as specified'
        }
        setEscrowData(updatedData)
        onStatusChange?.('disputed')
      }
    } catch (error) {
      console.error('Error initiating dispute:', error)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg border-0 rounded-xl">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded-lg w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!escrowData) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg border-0 rounded-xl">
        <CardContent className="p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Escrow Not Found</h3>
          <p className="text-slate-600">The requested escrow could not be found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Main Status Card */}
      <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-green-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold mb-2">{escrowData.gigTitle}</CardTitle>
              <p className="text-purple-100">Escrow ID: {escrowData.id}</p>
            </div>
            <Badge className={cn("px-4 py-2 text-sm font-medium border rounded-lg", getStatusColor(escrowData.status))}>
              <div className="flex items-center gap-2">
                {getStatusIcon(escrowData.status)}
                {escrowData.status.replace('_', ' ').toUpperCase()}
              </div>
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Project Progress</h3>
              <span className="text-sm text-slate-600">{Math.round(calculateProgress())}% Complete</span>
            </div>
            <Progress value={calculateProgress()} className="h-3 bg-slate-200">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-green-500 rounded-full transition-all duration-300"
                style={{ width: `${calculateProgress()}%` }}
              />
            </Progress>
          </div>

          {/* Key Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-600">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Total Amount</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{escrowData.amount} SOL</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-600">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Seller</span>
              </div>
              <p className="text-sm font-mono text-slate-900 break-all">
                {escrowData.seller.slice(0, 8)}...{escrowData.seller.slice(-8)}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Deadline</span>
              </div>
              <p className="text-sm text-slate-900">
                {escrowData.deadline.toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones Card */}
      <Card className="bg-white shadow-lg border-0 rounded-xl">
        <CardHeader className="p-6 border-b border-slate-200">
          <CardTitle className="text-xl font-semibold text-slate-900">Project Milestones</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {escrowData.milestones.map((milestone, index) => (
              <div key={milestone.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  milestone.status === 'completed' 
                    ? "bg-green-500 text-white" 
                    : milestone.status === 'disputed'
                    ? "bg-red-500 text-white"
                    : "bg-slate-300 text-slate-600"
                )}>
                  {milestone.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : milestone.status === 'disputed' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">{milestone.description}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-slate-600">{milestone.amount} SOL</span>
                    {milestone.completedAt && (
                      <span className="text-sm text-green-600">
                        Completed {milestone.completedAt.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <Badge className={cn(
                  "px-3 py-1 text-xs font-medium border rounded-lg",
                  getStatusColor(milestone.status)
                )}>
                  {milestone.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions Card */}
      {connected && (userRole === 'buyer' || userRole === 'seller') && (
        <Card className="bg-white shadow-lg border-0 rounded-xl">
          <CardHeader className="p-6 border-b border-slate-200">
            <CardTitle className="text-xl font-semibold text-slate-900">Available Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              {userRole === 'buyer' && escrowData.status === 'in_progress' && (
                <>
                  <Button
                    onClick={handleReleaseF