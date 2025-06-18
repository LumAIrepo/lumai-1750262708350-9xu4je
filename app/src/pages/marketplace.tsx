```tsx
'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Star, Shield, Clock, DollarSign, TrendingUp, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'

interface Gig {
  id: string
  title: string
  description: string
  price: number
  currency: 'SOL' | 'USDC'
  category: string
  seller: {
    name: string
    avatar: string
    rating: number
    reviewCount: number
    isVerified: boolean
    completedOrders: number
  }
  tags: string[]
  deliveryTime: string
  images: string[]
  featured: boolean
  level: 'Basic' | 'Standard' | 'Premium'
}

interface Category {
  id: string
  name: string
  icon: React.ReactNode
  count: number
}

const mockGigs: Gig[] = [
  {
    id: '1',
    title: 'I will create a custom Solana NFT collection with metadata',
    description: 'Professional NFT collection creation with custom artwork, metadata generation, and smart contract deployment on Solana.',
    price: 2.5,
    currency: 'SOL',
    category: 'NFT Development',
    seller: {
      name: 'CryptoArtist',
      avatar: '/avatars/artist1.jpg',
      rating: 4.9,
      reviewCount: 127,
      isVerified: true,
      completedOrders: 89
    },
    tags: ['NFT', 'Solana', 'Metadata', 'Smart Contract'],
    deliveryTime: '3 days',
    images: ['/gigs/nft1.jpg', '/gigs/nft2.jpg'],
    featured: true,
    level: 'Premium'
  },
  {
    id: '2',
    title: 'I will develop a Solana DeFi protocol with yield farming',
    description: 'Complete DeFi protocol development including liquidity pools, yield farming mechanisms, and governance tokens.',
    price: 15.0,
    currency: 'SOL',
    category: 'DeFi Development',
    seller: {
      name: 'SolDev',
      avatar: '/avatars/dev1.jpg',
      rating: 5.0,
      reviewCount: 43,
      isVerified: true,
      completedOrders: 31
    },
    tags: ['DeFi', 'Yield Farming', 'Liquidity', 'Governance'],
    deliveryTime: '14 days',
    images: ['/gigs/defi1.jpg'],
    featured: true,
    level: 'Premium'
  },
  {
    id: '3',
    title: 'I will audit your Solana smart contract for security vulnerabilities',
    description: 'Comprehensive security audit of your Solana programs with detailed report and recommendations.',
    price: 5.0,
    currency: 'SOL',
    category: 'Security Audit',
    seller: {
      name: 'SecureCode',
      avatar: '/avatars/auditor1.jpg',
      rating: 4.8,
      reviewCount: 76,
      isVerified: true,
      completedOrders: 52
    },
    tags: ['Security', 'Audit', 'Smart Contract', 'Vulnerability'],
    deliveryTime: '7 days',
    images: ['/gigs/audit1.jpg'],
    featured: false,
    level: 'Standard'
  },
  {
    id: '4',
    title: 'I will create a Solana trading bot with custom strategies',
    description: 'Automated trading bot development with custom strategies, risk management, and real-time monitoring.',
    price: 8.5,
    currency: 'SOL',
    category: 'Trading Bots',
    seller: {
      name: 'BotMaster',
      avatar: '/avatars/bot1.jpg',
      rating: 4.7,
      reviewCount: 94,
      isVerified: true,
      completedOrders: 67
    },
    tags: ['Trading Bot', 'Automation', 'Strategy', 'Risk Management'],
    deliveryTime: '10 days',
    images: ['/gigs/bot1.jpg', '/gigs/bot2.jpg'],
    featured: false,
    level: 'Standard'
  },
  {
    id: '5',
    title: 'I will design a modern Web3 UI/UX for your Solana dApp',
    description: 'Professional UI/UX design for Solana applications with modern crypto-native design patterns.',
    price: 3.2,
    currency: 'SOL',
    category: 'UI/UX Design',
    seller: {
      name: 'Web3Designer',
      avatar: '/avatars/designer1.jpg',
      rating: 4.9,
      reviewCount: 156,
      isVerified: true,
      completedOrders: 112
    },
    tags: ['UI/UX', 'Web3', 'Design', 'Figma'],
    deliveryTime: '5 days',
    images: ['/gigs/design1.jpg'],
    featured: false,
    level: 'Basic'
  },
  {
    id: '6',
    title: 'I will integrate Solana Pay into your e-commerce platform',
    description: 'Complete Solana Pay integration with QR codes, transaction handling, and webhook notifications.',
    price: 4.0,
    currency: 'SOL',
    category: 'Payment Integration',
    seller: {
      name: 'PayIntegrator',
      avatar: '/avatars/pay1.jpg',
      rating: 4.6,
      reviewCount: 38,
      isVerified: false,
      completedOrders: 24
    },
    tags: ['Solana Pay', 'E-commerce', 'QR Code', 'Webhooks'],
    deliveryTime: '6 days',
    images: ['/gigs/pay1.jpg'],
    featured: false,
    level: 'Standard'
  }
]

const categories: Category[] = [
  { id: 'all', name: 'All Categories', icon: <TrendingUp className="w-4 h-4" />, count: 1247 },
  { id: 'nft', name: 'NFT Development', icon: <Zap className="w-4 h-4" />, count: 324 },
  { id: 'defi', name: 'DeFi Development', icon: <DollarSign className="w-4 h-4" />, count: 189 },
  { id: 'security', name: 'Security Audit', icon: <Shield className="w-4 h-4" />, count: 156 },
  { id: 'bots', name: 'Trading Bots', icon: <Users className="w-4 h-4" />, count: 98 },
  { id: 'design', name: 'UI/UX Design', icon: <Star className="w-4 h-4" />, count: 267 },
  { id: 'payment', name: 'Payment Integration', icon: <Clock className="w-4 h-4" />, count: 87 }
]

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [priceRange, setPriceRange] = useState('all')
  const [filteredGigs, setFilteredGigs] = useState<Gig[]>(mockGigs)
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null)
  const { connected, publicKey } = useWallet()
  const { connection } = useConnection()

  useEffect(() => {
    let filtered = mockGigs

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(gig =>
        gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      const categoryMap: { [key: string]: string } = {
        'nft': 'NFT Development',
        'defi': 'DeFi Development',
        'security': 'Security Audit',
        'bots': 'Trading Bots',
        'design': 'UI/UX Design',
        'payment': 'Payment Integration'
      }
      filtered = filtered.filter(gig => gig.category === categoryMap[selectedCategory])
    }

    // Filter by price range
    if (priceRange !== 'all') {
      switch (priceRange) {
        case 'under-5':
          filtered = filtered.filter(gig => gig.price < 5)
          break
        case '5-10':
          filtered = filtered.filter(gig => gig.price >= 5 && gig.price <= 10)
          break
        case 'over-10':
          filtered = filtered.filter(gig => gig.price > 10)
          break
      }
    }

    // Sort results
    switch (sortBy) {
      case 'featured':
        filtered = filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        break
      case 'price-low':
        filtered = filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered = filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered = filtered.sort((a, b) => b.seller.rating - a.seller.rating)
        break
      case 'newest':
        filtered = filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id))
        break
    }

    setFilteredGigs(filtered)
  }, [searchQuery, selectedCategory, sortBy, priceRange])

  const handleOrderGig = async (gig: Gig) => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet to place an order')
      return
    }

    try {
      // Here you would implement the actual Solana transaction
      // For now, we'll just show a success message
      alert(`Order placed for "${gig.title}" - ${gig.price} ${gig.currency}`)
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-green-500 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              Find the Perfect Solana Services
            </h1>
            <p className="text-xl mb-8 text-purple-100">
              Connect with top-rated developers, designers, and experts in the Solana ecosystem
            </p>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search for Solana services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg rounded-xl border-0 bg-white/10 backdrop-blur-sm text-white placeholder:text-purple-200 focus:bg-white/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 justify-center">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-xl px-6 py-3 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-purple-600 to-green-500 text-white border-0'
                  : 'border-purple-200 text-slate-700 hover:border-purple-400'
              }`}
            >
              {category.icon}
              <span className="ml-2">{category.name}</span>
              <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-600">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-4 items-center justify-between bg-white rounded-xl p-6 shadow-lg">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Filters:</span>
            </div>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-40 rounded-xl">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-5">Under 5 SOL</SelectItem>
                <SelectItem value="5-10">5-10 SOL</SelectItem>
                <SelectItem value="over-10">Over 10 SOL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 rounded-xl">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured First</SelectItem