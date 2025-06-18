```tsx
'use client'

import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star, MapPin, Calendar, DollarSign, Shield, Award, Edit, Plus, ExternalLink, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface UserProfile {
  publicKey: string
  username: string
  displayName: string
  bio: string
  avatar: string
  location: string
  joinedDate: string
  rating: number
  totalReviews: number
  completedGigs: number
  totalEarnings: number
  skills: string[]
  languages: string[]
  isVerified: boolean
  badges: string[]
  portfolio: PortfolioItem[]
  activeGigs: Gig[]
  reviews: Review[]
}

interface PortfolioItem {
  id: string
  title: string
  description: string
  image: string
  category: string
  price: number
  completedAt: string
}

interface Gig {
  id: string
  title: string
  description: string
  price: number
  category: string
  deliveryTime: string
  image: string
  status: 'active' | 'paused' | 'draft'
}

interface Review {
  id: string
  rating: number
  comment: string
  reviewer: string
  reviewerAvatar: string
  createdAt: string
  gigTitle: string
}

export default function UserProfile({ userId, isOwnProfile = false }: { userId?: string, isOwnProfile?: boolean }) {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    location: '',
    skills: '',
    languages: ''
  })
  const [copiedAddress, setCopiedAddress] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [userId, publicKey])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call
      const mockProfile: UserProfile = {
        publicKey: userId || publicKey?.toString() || '',
        username: 'solana_dev_pro',
        displayName: 'Alex Thompson',
        bio: 'Full-stack Solana developer with 3+ years of experience building DeFi protocols and NFT marketplaces. Specialized in Anchor framework and React frontends.',
        avatar: '/api/placeholder/150/150',
        location: 'San Francisco, CA',
        joinedDate: '2023-01-15',
        rating: 4.9,
        totalReviews: 127,
        completedGigs: 89,
        totalEarnings: 45.7,
        skills: ['Solana Development', 'Anchor Framework', 'React', 'TypeScript', 'Rust', 'Web3.js'],
        languages: ['English', 'Spanish'],
        isVerified: true,
        badges: ['Top Rated', 'Fast Delivery', 'Expert Verified'],
        portfolio: [
          {
            id: '1',
            title: 'DeFi Yield Farming Protocol',
            description: 'Built a complete yield farming protocol with staking rewards',
            image: '/api/placeholder/300/200',
            category: 'DeFi Development',
            price: 2.5,
            completedAt: '2024-01-15'
          },
          {
            id: '2',
            title: 'NFT Marketplace Frontend',
            description: 'React-based NFT marketplace with wallet integration',
            image: '/api/placeholder/300/200',
            category: 'Frontend Development',
            price: 1.8,
            completedAt: '2024-01-10'
          }
        ],
        activeGigs: [
          {
            id: '1',
            title: 'Custom Solana Smart Contract Development',
            description: 'I will develop custom smart contracts using Anchor framework',
            price: 0.5,
            category: 'Smart Contracts',
            deliveryTime: '3 days',
            image: '/api/placeholder/300/200',
            status: 'active'
          },
          {
            id: '2',
            title: 'Solana dApp Frontend Integration',
            description: 'I will integrate your smart contracts with a React frontend',
            price: 0.8,
            category: 'Frontend Development',
            deliveryTime: '5 days',
            image: '/api/placeholder/300/200',
            status: 'active'
          }
        ],
        reviews: [
          {
            id: '1',
            rating: 5,
            comment: 'Excellent work! Delivered exactly what was promised and on time.',
            reviewer: 'crypto_trader_99',
            reviewerAvatar: '/api/placeholder/40/40',
            createdAt: '2024-01-20',
            gigTitle: 'Custom Smart Contract'
          },
          {
            id: '2',
            rating: 5,
            comment: 'Great communication and high-quality code. Will hire again!',
            reviewer: 'defi_builder',
            reviewerAvatar: '/api/placeholder/40/40',
            createdAt: '2024-01-18',
            gigTitle: 'dApp Frontend'
          }
        ]
      }
      setProfile(mockProfile)
      setEditForm({
        displayName: mockProfile.displayName,
        bio: mockProfile.bio,
        location: mockProfile.location,
        skills: mockProfile.skills.join(', '),
        languages: mockProfile.languages.join(', ')
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleEditProfile = async () => {
    try {
      // Mock API call - replace with actual implementation
      const updatedProfile = {
        ...profile!,
        displayName: editForm.displayName,
        bio: editForm.bio,
        location: editForm.location,
        skills: editForm.skills.split(',').map(s => s.trim()),
        languages: editForm.languages.split(',').map(l => l.trim())
      }
      setProfile(updatedProfile)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const copyAddress = async () => {
    if (profile?.publicKey) {
      await navigator.clipboard.writeText(profile.publicKey)
      setCopiedAddress(true)
      toast.success('Address copied to clipboard')
      setTimeout(() => setCopiedAddress(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
          <p className="text-slate-600">The requested profile could not be found.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="mb-8 shadow-lg border-0 bg-white">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex flex-col items-center lg:items-start">
                <Avatar className="w-32 h-32 mb-4 ring-4 ring-purple-100">
                  <AvatarImage src={profile.avatar} alt={profile.displayName} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-600 to-green-500 text-white">
                    {profile.displayName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-slate-900">{profile.displayName}</h1>
                  {profile.isVerified && (
                    <Shield className="w-6 h-6 text-green-500" />
                  )}
                </div>
                
                <p className="text-lg text-slate-600 mb-2">@{profile.username}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={copyAddress}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-purple-600 transition-colors"
                  >
                    <span className="font-mono">
                      {profile.publicKey.slice(0, 8)}...{profile.publicKey.slice(-8)}
                    </span>
                    {copiedAddress ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.badges.map((badge, index) => (
                    <Badge key={index} className="bg-gradient-to-r from-purple-600 to-green-500 text-white">
                      <Award className="w-3 h-3 mr-1" />
                      {badge}
                    </Badge>
                  ))}
                </div>

                {isOwnProfile && (
                  <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600 text-white">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="displayName">Display Name</Label>
                          <Input
                            id="displayName"
                            value={editForm.displayName}
                            onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                            className="rounded-xl"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={editForm.bio}
                            onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                            className="rounded-xl"
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={editForm.location}
                            onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                            className="rounded-xl"
                          />
                        </div>
                        <div>
                          <Label htmlFor="skills">Skills (comma separated)</Label>
                          <Input
                            id="skills"
                            value={editForm.skills}
                            onChange={(e) => setEditForm({...editForm, skills: e.target.value})}
                            className="rounded-xl"
                          />
                        </div>
                        <div>
                          <Label htmlFor="languages">Languages (comma separated)</Label>
                          <Input
                            id="languages"
                            value={editForm.languages}
                            onChange={(e) => setEditForm({...editForm, languages: e.target.value})}
                            className="rounded-xl"
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={handleEditProfile}
                            className="bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600 text-white"
                          >
                            Save Changes
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            className="rounded-xl"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-5 h-5 text-orange-400 mr-1" />
                      <span className="text-2xl font-bold text-slate-900">{profile.rating}</span>
                    </div>
                    <p className="text-sm text-slate-600">{profile.totalReviews} reviews</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 mb-2">{profile.completedGigs}</div>
                    <p className="text-sm text-slate-600">Completed Gigs</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <DollarSign className="w-5 h-5 text-green-500 mr-1" />
                      <span className="text-2xl font-bold text-slate-900">{profile.totalEarnings}</span>