```tsx
'use client'

import { useState, useEffect } from 'react'
import { Star, StarIcon, ThumbsUp, ThumbsDown, Shield, Verified, Calendar, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey } from '@solana/web3.js'

interface Review {
  id: string
  reviewer: {
    publicKey: string
    username: string
    avatar?: string
    isVerified: boolean
    totalReviews: number
  }
  rating: number
  title: string
  content: string
  createdAt: Date
  helpful: number
  notHelpful: number
  gigId: string
  orderId: string
  isVerifiedPurchase: boolean
  response?: {
    content: string
    createdAt: Date
  }
}

interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

interface ReviewSystemProps {
  gigId: string
  sellerId?: string
  canReview?: boolean
  orderId?: string
}

export default function ReviewSystem({ gigId, sellerId, canReview = false, orderId }: ReviewSystemProps) {
  const { publicKey, connected } = useWallet()
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    content: ''
  })
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest')
  const [filterRating, setFilterRating] = useState<number | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [gigId, sortBy, filterRating])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      // Simulate API call
      const mockReviews: Review[] = [
        {
          id: '1',
          reviewer: {
            publicKey: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU',
            username: 'CryptoBuilder',
            avatar: '/avatars/user1.jpg',
            isVerified: true,
            totalReviews: 23
          },
          rating: 5,
          title: 'Excellent Smart Contract Development',
          content: 'Outstanding work on my DeFi protocol. The developer delivered clean, well-documented code and was very responsive throughout the project. Highly recommend!',
          createdAt: new Date('2024-01-15'),
          helpful: 12,
          notHelpful: 1,
          gigId,
          orderId: 'order_123',
          isVerifiedPurchase: true,
          response: {
            content: 'Thank you for the great review! It was a pleasure working on your project.',
            createdAt: new Date('2024-01-16')
          }
        },
        {
          id: '2',
          reviewer: {
            publicKey: '4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZQff4P3bkLKi',
            username: 'SolanaFan',
            isVerified: false,
            totalReviews: 7
          },
          rating: 4,
          title: 'Good work, minor delays',
          content: 'The final product was great, but there were some communication issues and minor delays. Overall satisfied with the outcome.',
          createdAt: new Date('2024-01-10'),
          helpful: 8,
          notHelpful: 2,
          gigId,
          orderId: 'order_124',
          isVerifiedPurchase: true
        },
        {
          id: '3',
          reviewer: {
            publicKey: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
            username: 'DevMaster',
            isVerified: true,
            totalReviews: 45
          },
          rating: 5,
          title: 'Professional and Fast',
          content: 'Delivered exactly what was promised, on time and within budget. Great communication throughout the project.',
          createdAt: new Date('2024-01-05'),
          helpful: 15,
          notHelpful: 0,
          gigId,
          orderId: 'order_125',
          isVerifiedPurchase: true
        }
      ]

      const stats: ReviewStats = {
        totalReviews: mockReviews.length,
        averageRating: mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length,
        ratingDistribution: {
          5: mockReviews.filter(r => r.rating === 5).length,
          4: mockReviews.filter(r => r.rating === 4).length,
          3: mockReviews.filter(r => r.rating === 3).length,
          2: mockReviews.filter(r => r.rating === 2).length,
          1: mockReviews.filter(r => r.rating === 1).length
        }
      }

      setReviews(mockReviews)
      setReviewStats(stats)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!connected || !publicKey || !orderId) return

    try {
      setSubmitting(true)
      
      // Simulate API call to submit review
      const review: Review = {
        id: Date.now().toString(),
        reviewer: {
          publicKey: publicKey.toString(),
          username: 'You',
          isVerified: false,
          totalReviews: 1
        },
        rating: newReview.rating,
        title: newReview.title,
        content: newReview.content,
        createdAt: new Date(),
        helpful: 0,
        notHelpful: 0,
        gigId,
        orderId,
        isVerifiedPurchase: true
      }

      setReviews(prev => [review, ...prev])
      setNewReview({ rating: 0, title: '', content: '' })
      setShowReviewDialog(false)
      
      // Update stats
      const newTotal = reviewStats.totalReviews + 1
      const newAverage = ((reviewStats.averageRating * reviewStats.totalReviews) + newReview.rating) / newTotal
      
      setReviewStats(prev => ({
        ...prev,
        totalReviews: newTotal,
        averageRating: newAverage,
        ratingDistribution: {
          ...prev.ratingDistribution,
          [newReview.rating]: prev.ratingDistribution[newReview.rating as keyof typeof prev.ratingDistribution] + 1
        }
      }))
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleHelpfulVote = async (reviewId: string, isHelpful: boolean) => {
    // Simulate API call
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            helpful: isHelpful ? review.helpful + 1 : review.helpful,
            notHelpful: !isHelpful ? review.notHelpful + 1 : review.notHelpful
          }
        : review
    ))
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    }

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating 
                ? 'fill-orange-400 text-orange-400' 
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const renderInteractiveStars = (rating: number, onRatingChange: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="transition-colors hover:scale-110"
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating 
                  ? 'fill-orange-400 text-orange-400' 
                  : 'text-slate-300 hover:text-orange-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  const filteredAndSortedReviews = reviews
    .filter(review => filterRating ? review.rating === filterRating : true)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'highest':
          return b.rating - a.rating
        case 'lowest':
          return a.rating - b.rating
        case 'helpful':
          return b.helpful - a.helpful
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded-xl w-48 mb-4"></div>
          <div className="h-32 bg-slate-200 rounded-xl mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      <Card className="bg-white shadow-lg border-0 rounded-xl">
        <CardHeader>
          <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
            <Star className="w-5 h-5 text-orange-400" />
            Reviews & Ratings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-900 mb-2">
                {reviewStats.averageRating.toFixed(1)}
              </div>
              {renderStars(Math.round(reviewStats.averageRating), 'lg')}
              <div className="text-slate-600 mt-2">
                Based on {reviewStats.totalReviews} reviews
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm text-slate-600">{rating}</span>
                    <Star className="w-3 h-3 text-orange-400" />
                  </div>
                  <Progress 
                    value={reviewStats.totalReviews > 0 ? (reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution] / reviewStats.totalReviews) * 100 : 0}
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-slate-600 w-8">
                    {reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review Button */}
          {canReview && connected && (
            <div className="pt-4 border-t">
              <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600 text-white rounded-xl">
                    Write a Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-slate-900">Write Your Review</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-slate-700">Rating</Label>
                      {renderInteractiveStars(newReview.rating, (rating) => 
                        setNewReview(prev => ({ ...prev, rating }))
                      )}
                    </div>
                    <div>
                      <Label htmlFor="review-title" className="text-slate-700">Title</Label>
                      <input
                        id="review-title"
                        type="text"
                        value={newReview.title}
                        onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target