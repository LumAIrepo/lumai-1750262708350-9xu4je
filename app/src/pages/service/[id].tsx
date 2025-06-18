```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Star, Shield, Clock, DollarSign, User, MessageCircle, CheckCircle, AlertCircle, ArrowLeft, Heart, Share2, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/components/ui/use-toast'

interface ServicePackage {
  id: string
  name: string
  description: string
  price: number
  deliveryTime: number
  revisions: number
  features: string[]
}

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  createdAt: string
  packageName: string
}

interface ServiceProvider {
  id: string
  name: string
  avatar: string
  verified: boolean
  level: string
  rating: number
  totalReviews: number
  responseTime: string
  completionRate: number
  memberSince: string
  skills: string[]
  languages: string[]
}

interface Service {
  id: string
  title: string
  description: string
  category: string
  subcategory: string
  images: string[]
  provider: ServiceProvider
  packages: ServicePackage[]
  totalOrders: number
  inQueue: number
  tags: string[]
  faq: Array<{ question: string; answer: string }>
}

export default function ServiceDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { connected, publicKey } = useWallet()
  const { connection } = useConnection()
  
  const [service, setService] = useState<Service | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null)
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [orderRequirements, setOrderRequirements] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [reportReason, setReportReason] = useState('')
  const [isFavorited, setIsFavorited] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (id) {
      fetchServiceData()
    }
  }, [id])

  const fetchServiceData = async () => {
    try {
      setLoading(true)
      
      // Mock service data - replace with actual API call
      const mockService: Service = {
        id: id as string,
        title: "Professional Solana Smart Contract Development & Audit",
        description: "I will develop secure and efficient Solana smart contracts using Anchor framework. With 5+ years of blockchain development experience, I specialize in DeFi protocols, NFT marketplaces, and custom dApps. All contracts include comprehensive testing and security audits.",
        category: "Programming & Tech",
        subcategory: "Blockchain Development",
        images: [
          "/api/placeholder/800/600",
          "/api/placeholder/800/600",
          "/api/placeholder/800/600"
        ],
        provider: {
          id: "provider-1",
          name: "Alex Chen",
          avatar: "/api/placeholder/100/100",
          verified: true,
          level: "Level 2 Seller",
          rating: 4.9,
          totalReviews: 247,
          responseTime: "1 hour",
          completionRate: 98,
          memberSince: "2022",
          skills: ["Solana", "Rust", "Anchor", "TypeScript", "React"],
          languages: ["English", "Mandarin"]
        },
        packages: [
          {
            id: "basic",
            name: "Basic",
            description: "Simple smart contract with basic functionality",
            price: 0.5,
            deliveryTime: 3,
            revisions: 2,
            features: [
              "Basic smart contract development",
              "Source code included",
              "Basic testing",
              "Documentation"
            ]
          },
          {
            id: "standard",
            name: "Standard",
            description: "Advanced contract with custom features",
            price: 1.2,
            deliveryTime: 5,
            revisions: 3,
            features: [
              "Advanced smart contract development",
              "Custom features implementation",
              "Comprehensive testing",
              "Detailed documentation",
              "Basic security audit"
            ]
          },
          {
            id: "premium",
            name: "Premium",
            description: "Enterprise-grade contract with full audit",
            price: 2.5,
            deliveryTime: 7,
            revisions: 5,
            features: [
              "Enterprise-grade smart contract",
              "Full custom implementation",
              "Extensive testing suite",
              "Complete documentation",
              "Professional security audit",
              "Deployment assistance",
              "30-day support"
            ]
          }
        ],
        totalOrders: 156,
        inQueue: 3,
        tags: ["solana", "smart-contracts", "rust", "anchor", "defi"],
        faq: [
          {
            question: "What programming languages do you use?",
            answer: "I primarily use Rust for Solana smart contracts with the Anchor framework, and TypeScript/JavaScript for frontend integration."
          },
          {
            question: "Do you provide ongoing support?",
            answer: "Yes, I provide 30 days of free support for Premium packages and 14 days for Standard packages."
          },
          {
            question: "Can you work with existing codebases?",
            answer: "Absolutely! I can review, modify, and extend existing Solana programs."
          }
        ]
      }

      const mockReviews: Review[] = [
        {
          id: "review-1",
          userId: "user-1",
          userName: "Sarah Johnson",
          userAvatar: "/api/placeholder/50/50",
          rating: 5,
          comment: "Exceptional work! Alex delivered a flawless smart contract for our DeFi protocol. The code quality is outstanding and the documentation is comprehensive.",
          createdAt: "2024-01-15",
          packageName: "Premium"
        },
        {
          id: "review-2",
          userId: "user-2",
          userName: "Mike Rodriguez",
          userAvatar: "/api/placeholder/50/50",
          rating: 5,
          comment: "Great communication and delivered exactly what was promised. The contract passed all our internal audits without any issues.",
          createdAt: "2024-01-10",
          packageName: "Standard"
        },
        {
          id: "review-3",
          userId: "user-3",
          userName: "Emma Wilson",
          userAvatar: "/api/placeholder/50/50",
          rating: 4,
          comment: "Solid work, delivered on time. Minor revisions were handled quickly and professionally.",
          createdAt: "2024-01-05",
          packageName: "Basic"
        }
      ]

      setService(mockService)
      setReviews(mockReviews)
      setSelectedPackage(mockService.packages[1]) // Default to Standard package
    } catch (error) {
      console.error('Error fetching service:', error)
      toast({
        title: "Error",
        description: "Failed to load service details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOrderService = async () => {
    if (!connected || !publicKey || !selectedPackage) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to place an order",
        variant: "destructive"
      })
      return
    }

    try {
      setProcessing(true)
      
      // Mock order creation - replace with actual Solana transaction
      const orderAmount = selectedPackage.price * LAMPORTS_PER_SOL
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Order Placed Successfully!",
        description: `Your order for ${selectedPackage.name} package has been placed.`
      })
      
      setOrderDialogOpen(false)
      setOrderRequirements('')
      
      // Redirect to orders page
      router.push('/orders')
    } catch (error) {
      console.error('Error placing order:', error)
      toast({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleContactSeller = async () => {
    if (!connected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to contact the seller",
        variant: "destructive"
      })
      return
    }

    try {
      setProcessing(true)
      
      // Mock message sending
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the seller."
      })
      
      setContactDialogOpen(false)
      setContactMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Failed to Send",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleReportService = async () => {
    try {
      setProcessing(true)
      
      // Mock report submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Report Submitted",
        description: "Thank you for your report. We'll review it shortly."
      })
      
      setReportDialogOpen(false)
      setReportReason('')
    } catch (error) {
      console.error('Error submitting report:', error)
      toast({
        title: "Failed to Report",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited)
    toast({
      title: isFavorited ? "Removed from Favorites" : "Added to Favorites",
      description: isFavorited ? "Service removed from your favorites" : "Service added to your favorites"
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Service Not Found</h1>
          <Button onClick={() => router.push('/')} className="bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600">
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
              className={`${isFavorited ? 'text-red-500' : 'text-slate-600'} hover:text-red-500`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
              <Share2 className="h-4 w-4" />
            </Button>
            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                  <Flag className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-0 shadow-2xl rounded-xl">
                <DialogHeader>
                  <DialogTitle className="text-slate-900">Report Service</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="report-reason">Reason for reporting</Label>
                    <Textarea
                      id="report-reason"
                      placeholder="Please describe the issue..."
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="mt-1 border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleReportService}
                      disabled={!reportReason.trim() || processing}
                      className="bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600 rounded-xl"
                    >
                      {processing ? 'Submitting...' : 'Submit Report'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setReportDialogOpen(false)}
                      className="border-slate-200 rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>