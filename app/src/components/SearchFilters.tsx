```tsx
'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X, ChevronDown, Star, Shield, Clock, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface SearchFiltersProps {
  onFiltersChange: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
}

interface FilterState {
  searchQuery: string
  category: string
  subcategory: string
  priceRange: [number, number]
  deliveryTime: string
  sellerLevel: string[]
  rating: number
  verified: boolean
  online: boolean
  sortBy: string
  tags: string[]
}

const categories = [
  {
    id: 'development',
    name: 'Development & Tech',
    subcategories: [
      'Smart Contracts',
      'dApp Development',
      'Web3 Integration',
      'Blockchain Consulting',
      'Token Creation',
      'NFT Development',
      'DeFi Protocols',
      'Security Audits'
    ]
  },
  {
    id: 'design',
    name: 'Design & Creative',
    subcategories: [
      'UI/UX Design',
      'NFT Art',
      'Brand Identity',
      'Web Design',
      'Logo Design',
      'Illustrations',
      'Animation',
      '3D Modeling'
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing & Growth',
    subcategories: [
      'Community Management',
      'Social Media',
      'Content Creation',
      'Influencer Marketing',
      'PR & Communications',
      'SEO',
      'Paid Advertising',
      'Growth Hacking'
    ]
  },
  {
    id: 'writing',
    name: 'Writing & Content',
    subcategories: [
      'Technical Writing',
      'Whitepaper Writing',
      'Blog Posts',
      'Copywriting',
      'Documentation',
      'Grant Writing',
      'Social Media Content',
      'Press Releases'
    ]
  },
  {
    id: 'consulting',
    name: 'Business & Consulting',
    subcategories: [
      'Tokenomics Design',
      'Business Strategy',
      'Legal Consulting',
      'Financial Planning',
      'Project Management',
      'Market Research',
      'Compliance',
      'Investment Advisory'
    ]
  }
]

const deliveryOptions = [
  { value: 'any', label: 'Any Time' },
  { value: '24h', label: '24 Hours' },
  { value: '3d', label: '3 Days' },
  { value: '7d', label: '1 Week' },
  { value: '14d', label: '2 Weeks' },
  { value: '30d', label: '1 Month' }
]

const sellerLevels = [
  { id: 'new', label: 'New Seller', color: 'bg-slate-100 text-slate-700' },
  { id: 'level1', label: 'Level 1', color: 'bg-green-100 text-green-700' },
  { id: 'level2', label: 'Level 2', color: 'bg-purple-100 text-purple-700' },
  { id: 'top', label: 'Top Rated', color: 'bg-orange-100 text-orange-700' }
]

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Best Rating' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'delivery', label: 'Fastest Delivery' },
  { value: 'newest', label: 'Newest First' }
]

const popularTags = [
  'Solana', 'DeFi', 'NFT', 'Web3', 'Smart Contract', 'Token', 'dApp', 'Blockchain',
  'Rust', 'JavaScript', 'React', 'Node.js', 'Python', 'Anchor', 'Metaplex'
]

export default function SearchFilters({ onFiltersChange, initialFilters }: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: '',
    subcategory: '',
    priceRange: [0, 10000],
    deliveryTime: 'any',
    sellerLevel: [],
    rating: 0,
    verified: false,
    online: false,
    sortBy: 'relevance',
    tags: [],
    ...initialFilters
  })

  const [isExpanded, setIsExpanded] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  useEffect(() => {
    const count = [
      filters.category && 1,
      filters.subcategory && 1,
      filters.priceRange[0] > 0 || filters.priceRange[1] < 10000 ? 1 : 0,
      filters.deliveryTime !== 'any' && 1,
      filters.sellerLevel.length > 0 && 1,
      filters.rating > 0 && 1,
      filters.verified && 1,
      filters.online && 1,
      filters.tags.length > 0 && 1
    ].filter(Boolean).length

    setActiveFiltersCount(count)
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearAllFilters = () => {
    setFilters({
      searchQuery: filters.searchQuery,
      category: '',
      subcategory: '',
      priceRange: [0, 10000],
      deliveryTime: 'any',
      sellerLevel: [],
      rating: 0,
      verified: false,
      online: false,
      sortBy: 'relevance',
      tags: []
    })
  }

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const selectedCategory = categories.find(cat => cat.id === filters.category)

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <Card className="rounded-xl shadow-lg border-0 bg-white">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                placeholder="Search for services..."
                value={filters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
                className="pl-10 h-12 rounded-xl border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 text-base"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-12 px-4 rounded-xl border-slate-200 hover:bg-slate-50 flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expanded Filters */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <Card className="rounded-xl shadow-lg border-0 bg-white">
            <CardContent className="p-6 space-y-6">
              {/* Quick Actions */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    onClick={clearAllFilters}
                    className="text-slate-600 hover:text-slate-900 text-sm"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Category & Subcategory */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Category</label>
                    <Select value={filters.category} onValueChange={(value) => {
                      updateFilter('category', value)
                      updateFilter('subcategory', '')
                    }}>
                      <SelectTrigger className="rounded-xl border-slate-200">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCategory && (
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Subcategory</label>
                      <Select value={filters.subcategory} onValueChange={(value) => updateFilter('subcategory', value)}>
                        <SelectTrigger className="rounded-xl border-slate-200">
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedCategory.subcategories.map(sub => (
                            <SelectItem key={sub} value={sub.toLowerCase().replace(/\s+/g, '-')}>
                              {sub}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Price Range & Delivery */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Price Range (SOL)
                    </label>
                    <div className="px-3">
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(value) => updateFilter('priceRange', value)}
                        max={10000}
                        min={0}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-slate-500 mt-1">
                        <span>{filters.priceRange[0]} SOL</span>
                        <span>{filters.priceRange[1]} SOL</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Delivery Time</label>
                    <Select value={filters.deliveryTime} onValueChange={(value) => updateFilter('deliveryTime', value)}>
                      <SelectTrigger className="rounded-xl border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Seller Level & Rating */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Seller Level</label>
                    <div className="space-y-2">
                      {sellerLevels.map(level => (
                        <div key={level.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={level.id}
                            checked={filters.sellerLevel.includes(level.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateFilter('sellerLevel', [...filters.sellerLevel, level.id])
                              } else {
                                updateFilter('sellerLevel', filters.sellerLevel.filter(l => l !== level.id))
                              }
                            }}
                          />
                          <label htmlFor={level.id} className="text-sm cursor-pointer">
                            <Badge className={`${level.color} text-xs`}>
                              {level.label}
                            </Badge>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Minimum Rating
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          onClick={() => updateFilter('rating', rating === filters.rating ? 0 : rating)}
                          className={`p-1 rounded transition-colors ${
                            rating <= filters.rating
                              ? 'text-orange-400'
                              : 'text-slate-300 hover:text-orange-400'
                          }`}
                        >
                          <Star className="h-5 w-5 fill-current" />
                        </button>
                      ))}
                      <span className="text-sm text-slate-600 ml-2">
                        {filters.rating > 0 ? `${filters.rating}+ stars` : 'Any rating'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Options */}
              <div