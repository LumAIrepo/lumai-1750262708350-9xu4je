```tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, Shield, Clock, DollarSign, Eye, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ServiceCardProps {
  id: string
  title: string
  description: string
  price: number
  currency: 'SOL' | 'USDC'
  deliveryTime: string
  rating: number
  reviewCount: number
  seller: {
    id: string
    name: string
    avatar?: string
    isVerified: boolean
    level: 'New' | 'Level 1' | 'Level 2' | 'Top Rated'
  }
  tags: string[]
  image: string
  isFavorited?: boolean
  viewCount: number
  className?: string
  onFavorite?: (id: string) => void
  onClick?: (id: string) => void
}

export default function ServiceCard({
  id,
  title,
  description,
  price,
  currency,
  deliveryTime,
  rating,
  reviewCount,
  seller,
  tags,
  image,
  isFavorited = false,
  viewCount,
  className,
  onFavorite,
  onClick
}: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [favorited, setFavorited] = useState(isFavorited)

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorited(!favorited)
    onFavorite?.(id)
  }

  const handleCardClick = () => {
    onClick?.(id)
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'New':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'Level 1':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Level 2':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'Top Rated':
        return 'bg-gradient-to-r from-purple-100 to-green-100 text-purple-700 border-purple-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        'bg-white border border-slate-200 rounded-xl overflow-hidden',
        'shadow-lg hover:shadow-2xl',
        isHovered && 'ring-2 ring-purple-200',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <CardHeader className="p-0 relative">
        <div className="relative overflow-hidden rounded-t-xl">
          <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className={cn(
              'absolute top-3 right-3 p-2 rounded-full transition-all duration-200',
              'bg-white/90 hover:bg-white shadow-md hover:shadow-lg',
              favorited ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
            )}
          >
            <Heart className={cn('w-4 h-4', favorited && 'fill-current')} />
          </button>

          {/* View Count */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-md text-xs">
            <Eye className="w-3 h-3" />
            <span>{viewCount.toLocaleString()}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Seller Info */}
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={seller.avatar} alt={seller.name} />
            <AvatarFallback className="text-xs bg-purple-100 text-purple-700">
              {seller.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-slate-600 font-medium">{seller.name}</span>
          {seller.isVerified && (
            <Shield className="w-4 h-4 text-green-500 fill-current" />
          )}
          <Badge
            variant="outline"
            className={cn('text-xs px-2 py-0.5 ml-auto', getLevelBadgeColor(seller.level))}
          >
            {seller.level}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-900 line-clamp-2 leading-tight group-hover:text-purple-700 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-purple-100 hover:text-purple-700 transition-colors"
            >
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600"
            >
              +{tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-orange-400 fill-current" />
            <span className="text-sm font-medium text-slate-900">
              {rating.toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-slate-500">
            ({reviewCount.toLocaleString()} reviews)
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4" />
          <span>{deliveryTime}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-500">Starting at</div>
            <div className="flex items-center gap-1 font-bold text-slate-900">
              <DollarSign className="w-4 h-4" />
              <span>{price}</span>
              <span className="text-sm font-medium text-purple-600">{currency}</span>
            </div>
          </div>
          
          <Button
            size="sm"
            className={cn(
              'bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600',
              'text-white font-medium px-4 py-2 rounded-xl',
              'shadow-md hover:shadow-lg transition-all duration-200',
              'border-0 hover:scale-105'
            )}
            onClick={(e) => {
              e.stopPropagation()
              onClick?.(id)
            }}
          >
            View Gig
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
```