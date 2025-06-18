```tsx
'use client'

import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Star, Plus, Eye, MessageSquare, Clock, CheckCircle, XCircle, Wallet, TrendingUp, Users, DollarSign } from 'lucide-react'

interface Service {
  id: string
  title: string
  description: string
  price: number
  category: string
  rating: number
  reviews: number
  status: 'active' | 'paused' | 'draft'
  orders: number
  revenue: number
  image: string
}

interface Order {
  id: string
  serviceTitle: string
  buyerAddress: string
  amount: number
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  createdAt: string
  deadline: string
  description: string
}

interface Stats {
  totalRevenue: number
  activeOrders: number
  completedOrders: number
  rating: number
}

export default function Dashboard() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [services, setServices] = useState<Service[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    activeOrders: 0,
    completedOrders: 0,
    rating: 0
  })
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false)
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    deliveryTime: ''
  })

  useEffect(() => {
    if (connected && publicKey) {
      fetchDashboardData()
    }
  }, [connected, publicKey])

  const fetchDashboardData = async () => {
    // Mock data - replace with actual Solana program calls
    const mockServices: Service[] = [
      {
        id: '1',
        title: 'Smart Contract Audit',
        description: 'Professional Solana smart contract security audit',
        price: 2.5,
        category: 'Development',
        rating: 4.9,
        reviews: 23,
        status: 'active',
        orders: 45,
        revenue: 112.5,
        image: '/api/placeholder/300/200'
      },
      {
        id: '2',
        title: 'NFT Collection Design',
        description: 'Custom NFT artwork and metadata generation',
        price: 1.8,
        category: 'Design',
        rating: 4.7,
        reviews: 18,
        status: 'active',
        orders: 32,
        revenue: 57.6,
        image: '/api/placeholder/300/200'
      }
    ]

    const mockOrders: Order[] = [
      {
        id: '1',
        serviceTitle: 'Smart Contract Audit',
        buyerAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        amount: 2.5,
        status: 'in-progress',
        createdAt: '2024-01-15',
        deadline: '2024-01-22',
        description: 'Need audit for DeFi protocol'
      },
      {
        id: '2',
        serviceTitle: 'NFT Collection Design',
        buyerAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        amount: 1.8,
        status: 'pending',
        createdAt: '2024-01-16',
        deadline: '2024-01-20',
        description: '1000 piece generative art collection'
      }
    ]

    setServices(mockServices)
    setOrders(mockOrders)
    setStats({
      totalRevenue: 170.1,
      activeOrders: 12,
      completedOrders: 65,
      rating: 4.8
    })
  }

  const handleCreateService = async () => {
    if (!newService.title || !newService.description || !newService.price) return

    // Mock service creation - replace with actual Solana program call
    const service: Service = {
      id: Date.now().toString(),
      title: newService.title,
      description: newService.description,
      price: parseFloat(newService.price),
      category: newService.category,
      rating: 0,
      reviews: 0,
      status: 'draft',
      orders: 0,
      revenue: 0,
      image: '/api/placeholder/300/200'
    }

    setServices([...services, service])
    setNewService({ title: '', description: '', price: '', category: '', deliveryTime: '' })
    setIsCreateServiceOpen(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'paused': return 'bg-orange-400'
      case 'draft': return 'bg-slate-400'
      case 'pending': return 'bg-orange-400'
      case 'in-progress': return 'bg-purple-600'
      case 'completed': return 'bg-green-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-slate-400'
    }
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-900">Connect Wallet</CardTitle>
            <CardDescription>Please connect your Solana wallet to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button className="bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600 text-white font-semibold px-8 py-3 rounded-xl">
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-inter">Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage your services and orders</p>
          </div>
          <Dialog open={isCreateServiceOpen} onOpenChange={setIsCreateServiceOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="w-5 h-5 mr-2" />
                Create Service
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900">Create New Service</DialogTitle>
                <DialogDescription>
                  List a new service on SolanaGigs marketplace
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-900 font-semibold">Service Title</Label>
                  <Input
                    id="title"
                    value={newService.title}
                    onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                    placeholder="e.g., Smart Contract Development"
                    className="rounded-xl border-slate-200 focus:border-purple-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-900 font-semibold">Description</Label>
                  <Textarea
                    id="description"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    placeholder="Describe your service in detail..."
                    className="rounded-xl border-slate-200 focus:border-purple-600 min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-slate-900 font-semibold">Price (SOL)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.1"
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                      placeholder="0.0"
                      className="rounded-xl border-slate-200 focus:border-purple-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-slate-900 font-semibold">Category</Label>
                    <Select value={newService.category} onValueChange={(value) => setNewService({ ...newService, category: value })}>
                      <SelectTrigger className="rounded-xl border-slate-200 focus:border-purple-600">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="writing">Writing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryTime" className="text-slate-900 font-semibold">Delivery Time</Label>
                  <Select value={newService.deliveryTime} onValueChange={(value) => setNewService({ ...newService, deliveryTime: value })}>
                    <SelectTrigger className="rounded-xl border-slate-200 focus:border-purple-600">
                      <SelectValue placeholder="Select delivery time" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="1-day">1 Day</SelectItem>
                      <SelectItem value="3-days">3 Days</SelectItem>
                      <SelectItem value="1-week">1 Week</SelectItem>
                      <SelectItem value="2-weeks">2 Weeks</SelectItem>
                      <SelectItem value="1-month">1 Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleCreateService}
                  className="w-full bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600 text-white font-semibold py-3 rounded-xl"
                >
                  Create Service
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalRevenue.toFixed(1)} SOL</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-600 to-green-500 rounded-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Active Orders</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.activeOrders}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-400 to-purple-600 rounded-xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Completed Orders</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.completedOrders}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-purple-600 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 border-