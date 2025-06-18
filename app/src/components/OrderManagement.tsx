```tsx
'use client'

import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, CheckCircle, XCircle, AlertCircle, Star, MessageSquare, Upload, Download, Eye, DollarSign, Calendar, User, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface Order {
  id: string
  gigId: string
  gigTitle: string
  buyerAddress: string
  sellerAddress: string
  buyerName: string
  sellerName: string
  buyerAvatar?: string
  sellerAvatar?: string
  amount: number
  status: 'pending' | 'active' | 'in_review' | 'completed' | 'cancelled' | 'disputed'
  createdAt: Date
  deadline: Date
  description: string
  requirements: string
  milestones: Milestone[]
  messages: Message[]
  deliverables: Deliverable[]
  escrowAddress?: string
  rating?: number
  review?: string
}

interface Milestone {
  id: string
  title: string
  description: string
  amount: number
  status: 'pending' | 'in_progress' | 'completed' | 'approved'
  dueDate: Date
  completedAt?: Date
}

interface Message {
  id: string
  sender: 'buyer' | 'seller'
  content: string
  timestamp: Date
  attachments?: string[]
}

interface Deliverable {
  id: string
  name: string
  url: string
  uploadedAt: Date
  type: 'file' | 'link'
  size?: number
}

export default function OrderManagement() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [activeTab, setActiveTab] = useState('active')
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  const [deliverableFile, setDeliverableFile] = useState<File | null>(null)
  const [deliverableUrl, setDeliverableUrl] = useState('')
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')

  useEffect(() => {
    if (connected && publicKey) {
      fetchOrders()
    }
  }, [connected, publicKey])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call
      const mockOrders: Order[] = [
        {
          id: '1',
          gigId: 'gig-1',
          gigTitle: 'Custom Solana Smart Contract Development',
          buyerAddress: publicKey?.toString() || '',
          sellerAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
          buyerName: 'Alice Johnson',
          sellerName: 'Bob Smith',
          buyerAvatar: '/avatars/alice.jpg',
          sellerAvatar: '/avatars/bob.jpg',
          amount: 5.5,
          status: 'active',
          createdAt: new Date('2024-01-15'),
          deadline: new Date('2024-02-15'),
          description: 'Need a custom smart contract for my DeFi project with specific tokenomics',
          requirements: 'Must include staking mechanism, governance features, and audit documentation',
          milestones: [
            {
              id: 'm1',
              title: 'Initial Contract Structure',
              description: 'Basic contract setup with core functions',
              amount: 2.0,
              status: 'completed',
              dueDate: new Date('2024-01-25'),
              completedAt: new Date('2024-01-24')
            },
            {
              id: 'm2',
              title: 'Staking Implementation',
              description: 'Add staking and rewards mechanism',
              amount: 2.0,
              status: 'in_progress',
              dueDate: new Date('2024-02-05')
            },
            {
              id: 'm3',
              title: 'Testing & Documentation',
              description: 'Complete testing suite and documentation',
              amount: 1.5,
              status: 'pending',
              dueDate: new Date('2024-02-15')
            }
          ],
          messages: [
            {
              id: 'msg1',
              sender: 'buyer',
              content: 'Hi! Looking forward to working with you on this project.',
              timestamp: new Date('2024-01-15T10:00:00')
            },
            {
              id: 'msg2',
              sender: 'seller',
              content: 'Thanks! I\'ve started working on the initial structure. Will have an update soon.',
              timestamp: new Date('2024-01-16T14:30:00')
            }
          ],
          deliverables: [
            {
              id: 'd1',
              name: 'contract-v1.rs',
              url: '/files/contract-v1.rs',
              uploadedAt: new Date('2024-01-24'),
              type: 'file',
              size: 15420
            }
          ],
          escrowAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
        },
        {
          id: '2',
          gigId: 'gig-2',
          gigTitle: 'NFT Marketplace Frontend',
          buyerAddress: publicKey?.toString() || '',
          sellerAddress: '5dSHdvJBQ8o8naR9VX4M4GX11kMvSmHd94buUNTCzZRp',
          buyerName: 'Alice Johnson',
          sellerName: 'Carol Davis',
          amount: 3.2,
          status: 'in_review',
          createdAt: new Date('2024-01-10'),
          deadline: new Date('2024-02-10'),
          description: 'Build a responsive NFT marketplace frontend with wallet integration',
          requirements: 'React/Next.js, Tailwind CSS, Solana wallet adapter integration',
          milestones: [
            {
              id: 'm4',
              title: 'UI Design & Setup',
              description: 'Create responsive design and project setup',
              amount: 1.2,
              status: 'completed',
              dueDate: new Date('2024-01-20'),
              completedAt: new Date('2024-01-19')
            },
            {
              id: 'm5',
              title: 'Wallet Integration',
              description: 'Implement Solana wallet connection and transactions',
              amount: 2.0,
              status: 'completed',
              dueDate: new Date('2024-02-05'),
              completedAt: new Date('2024-02-04')
            }
          ],
          messages: [],
          deliverables: [
            {
              id: 'd2',
              name: 'nft-marketplace-frontend.zip',
              url: '/files/nft-marketplace-frontend.zip',
              uploadedAt: new Date('2024-02-04'),
              type: 'file',
              size: 2048000
            }
          ]
        }
      ]
      setOrders(mockOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_review': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'disputed': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'active': return <AlertCircle className="w-4 h-4" />
      case 'in_review': return <Eye className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      case 'disputed': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getMilestoneProgress = (milestones: Milestone[]) => {
    const completed = milestones.filter(m => m.status === 'completed' || m.status === 'approved').length
    return (completed / milestones.length) * 100
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedOrder) return

    try {
      const message: Message = {
        id: Date.now().toString(),
        sender: 'buyer', // Determine based on current user
        content: newMessage,
        timestamp: new Date()
      }

      setSelectedOrder({
        ...selectedOrder,
        messages: [...selectedOrder.messages, message]
      })

      setNewMessage('')
      toast.success('Message sent successfully')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const handleApproveMilestone = async (milestoneId: string) => {
    if (!selectedOrder) return

    try {
      const updatedMilestones = selectedOrder.milestones.map(m =>
        m.id === milestoneId ? { ...m, status: 'approved' as const } : m
      )

      setSelectedOrder({
        ...selectedOrder,
        milestones: updatedMilestones
      })

      toast.success('Milestone approved successfully')
    } catch (error) {
      console.error('Error approving milestone:', error)
      toast.error('Failed to approve milestone')
    }
  }

  const handleUploadDeliverable = async () => {
    if (!deliverableFile && !deliverableUrl) return

    try {
      const deliverable: Deliverable = {
        id: Date.now().toString(),
        name: deliverableFile ? deliverableFile.name : 'External Link',
        url: deliverableFile ? URL.createObjectURL(deliverableFile) : deliverableUrl,
        uploadedAt: new Date(),
        type: deliverableFile ? 'file' : 'link',
        size: deliverableFile?.size
      }

      if (selectedOrder) {
        setSelectedOrder({
          ...selectedOrder,
          deliverables: [...selectedOrder.deliverables, deliverable]
        })
      }

      setDeliverableFile(null)
      setDeliverableUrl('')
      toast.success('Deliverable uploaded successfully')
    } catch (error) {
      console.error('Error uploading deliverable:', error)
      toast.error('Failed to upload deliverable')
    }
  }

  const handleCompleteOrder = async () => {
    if (!selectedOrder) return

    try {
      // Release escrow funds
      setSelectedOrder({
        ...selectedOrder,
        status: 'completed',
        rating,
        review
      })

      toast.success('Order completed successfully')
    } catch (error) {
      console.error('Error completing order:', error)
      toast.error('Failed to complete order')
    }
  }

  const filteredOrders = orders.filter(order => {
    switch (activeTab) {
      case 'active': return ['pending', 'active', 'in_review'].includes(order.status)
      case 'completed': return order.status === 'completed'
      case 'cancelled': return ['cancelled', 'disputed'].includes(order.status)
      default: return true
    }
  })

  if (!connected) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md rounded-xl shadow-lg border-0">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Connect Your Wallet</h3>
            <p className="text-slate-600 mb-6">Please connect your Solana wallet to view and manage your orders.</p>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600 text-white rounded-xl">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Order Management</h1>
          <p className="text-slate-600">Track and manage your active orders and milestones</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white rounded-xl p-