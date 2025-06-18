```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, MapPin, Calendar, Shield, Award, ExternalLink, MessageCircle, Heart, Share2 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface UserProfile {
  address: string
  username: string
  displayName: string
  bio: string
  avatar: string
  coverImage: string
  location: string
  joinedDate: string
  isVerified: boolean
  rating: number
  totalReviews: number
  completedGigs: number
  responseTime: string
  languages: string[]
  skills: string[]
  socialLinks: {
    twitter?: string
    discord?: string
    github?: string
    website?: string
  }
}

interface Gig {
  id: string
  title: string
  description: string
  price: number
  currency: string
  category: string
  images: string[]
  rating: number
  reviews: number
  deliveryTime: string
  isActive: boolean
}

interface Review {
  id: string
  reviewer: string
  reviewerAvatar: string
  rating: number
  comment: string
  date: string
  gigTitle: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { address } = router.query
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [gigs, setGigs] = useState<Gig[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState('gigs')

  const isOwnProfile = publicKey?.toString() === address

  useEffect(() => {
    if (address) {
      fetchProfileData()
    }
  }, [address])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      
      // Mock data - replace with actual API calls
      const mockProfile: UserProfile = {
        address: address as string,
        username: 'solana_dev_pro',
        displayName: 'Alex Thompson',
        bio: 'Full-stack Solana developer with 5+ years of experience building DeFi protocols and NFT marketplaces. Specialized in Anchor framework and React frontends.',
        avatar: '/api/placeholder/150/150',
        coverImage: '/api/placeholder/800/300',
        location: 'San Francisco, CA',
        joinedDate: '2022-03-15',
        isVerified: true,
        rating: 4.9,
        totalReviews: 127,
        completedGigs: 89,
        responseTime: '< 1 hour',
        languages: ['English', 'Spanish'],
        skills: ['Solana', 'Rust', 'Anchor', 'React', 'TypeScript', 'DeFi', 'NFTs'],
        socialLinks: {
          twitter: 'https://twitter.com/solana_dev_pro',
          github: 'https://github.com/solana-dev-pro',
          website: 'https://alexthompson.dev'
        }
      }

      const mockGigs: Gig[] = [
        {
          id: '1',
          title: 'Build Custom Solana DeFi Protocol',
          description: 'I will create a complete DeFi protocol on Solana with lending, borrowing, and yield farming features.',
          price: 2500,
          currency: 'USDC',
          category: 'DeFi Development',
          images: ['/api/placeholder/300/200'],
          rating: 5.0,
          reviews: 12,
          deliveryTime: '14 days',
          isActive: true
        },
        {
          id: '2',
          title: 'NFT Marketplace Development',
          description: 'Complete NFT marketplace with minting, trading, and royalty distribution on Solana.',
          price: 1800,
          currency: 'SOL',
          category: 'NFT Development',
          images: ['/api/placeholder/300/200'],
          rating: 4.8,
          reviews: 8,
          deliveryTime: '10 days',
          isActive: true
        }
      ]

      const mockReviews: Review[] = [
        {
          id: '1',
          reviewer: 'crypto_trader_99',
          reviewerAvatar: '/api/placeholder/40/40',
          rating: 5,
          comment: 'Exceptional work! Alex delivered a high-quality DeFi protocol exactly as specified. Great communication throughout the project.',
          date: '2024-01-15',
          gigTitle: 'Build Custom Solana DeFi Protocol'
        },
        {
          id: '2',
          reviewer: 'nft_collector',
          reviewerAvatar: '/api/placeholder/40/40',
          rating: 5,
          comment: 'Amazing NFT marketplace! Clean code, great UI, and delivered ahead of schedule. Highly recommend!',
          date: '2024-01-10',
          gigTitle: 'NFT Marketplace Development'
        }
      ]

      setProfile(mockProfile)
      setGigs(mockGigs)
      setReviews(mockReviews)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    try {
      // Implement follow/unfollow logic
      setIsFollowing(!isFollowing)
      toast({
        title: isFollowing ? 'Unfollowed' : 'Following',
        description: `You are now ${isFollowing ? 'not following' : 'following'} ${profile?.displayName}`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update follow status',
        variant: 'destructive'
      })
    }
  }

  const handleMessage = () => {
    // Navigate to messaging
    router.push(`/messages?user=${address}`)
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${profile?.displayName} - SolanaGigs`,
        url: window.location.href
      })
    } catch (error) {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: 'Link Copied',
        description: 'Profile link copied to clipboard'
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Profile Not Found</h2>
          <p className="text-slate-600 mb-6">The profile you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/')} className="bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600">
            Go Home
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Cover Image */}
      <div className="relative h-80 bg-gradient-to-r from-purple-600 to-green-500">
        <img 
          src={profile.coverImage} 
          alt="Cover" 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 to-green-500/50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        {/* Profile Header */}
        <Card className="mb-8 shadow-xl border-0 rounded-xl">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={profile.avatar} alt={profile.displayName} />
                  <AvatarFallback className="text-2xl bg-gradient-to-r from-purple-600 to-green-500 text-white">
                    {profile.displayName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {profile.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-slate-900">{profile.displayName}</h1>
                      {profile.isVerified && (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg text-slate-600 mb-2">@{profile.username}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                        <span className="font-semibold">{profile.rating}</span>
                        <span>({profile.totalReviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {new Date(profile.joinedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {!isOwnProfile && (
                    <div className="flex gap-3">
                      <Button
                        onClick={handleFollow}
                        variant={isFollowing ? "outline" : "default"}
                        className={isFollowing ? "border-purple-600 text-purple-600 hover:bg-purple-50" : "bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600"}
                      >
                        <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                      <Button onClick={handleMessage} variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button onClick={handleShare} variant="outline" size="icon" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-slate-700 mb-4">{profile.bio}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{profile.completedGigs}</div>
                  <div className="text-sm text-slate-500">Completed Gigs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{profile.responseTime}</div>
                  <div className="text-sm text-slate-500">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{profile.totalReviews}</div>
                  <div className="text-sm text-slate-500">Total Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{profile.languages.length}</div>
                  <div className="text-sm text-slate-500">Languages</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="gigs">Active Gigs</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              </TabsList>

              <TabsContent value="gigs" className="space-y-6">
                {gigs.map((gig) => (
                  <Card key={gig.id} className="hover:shadow-lg transition-shadow duration-300 rounded-xl border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className