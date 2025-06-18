```tsx
'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { AlertCircle, Upload, X, Plus, Star, Shield, Clock, DollarSign } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ServiceFormProps {
  initialData?: {
    id?: string
    title: string
    description: string
    category: string
    subcategory: string
    price: number
    deliveryTime: number
    revisions: number
    tags: string[]
    requirements: string
    images: string[]
    isActive: boolean
  }
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
}

const categories = [
  {
    name: 'Development',
    subcategories: ['Smart Contracts', 'dApp Development', 'Web3 Integration', 'Token Creation', 'NFT Development']
  },
  {
    name: 'Design',
    subcategories: ['UI/UX Design', 'Logo Design', 'NFT Art', 'Brand Identity', 'Web Design']
  },
  {
    name: 'Marketing',
    subcategories: ['Community Management', 'Content Creation', 'Social Media', 'Influencer Marketing', 'PR Services']
  },
  {
    name: 'Consulting',
    subcategories: ['Tokenomics', 'Security Audit', 'Business Strategy', 'Technical Advisory', 'Legal Compliance']
  },
  {
    name: 'Content',
    subcategories: ['Technical Writing', 'Whitepaper', 'Documentation', 'Blog Posts', 'Video Content']
  }
]

const deliveryOptions = [
  { value: 1, label: '1 Day' },
  { value: 3, label: '3 Days' },
  { value: 7, label: '1 Week' },
  { value: 14, label: '2 Weeks' },
  { value: 30, label: '1 Month' }
]

export default function ServiceForm({ initialData, onSubmit, onCancel, isEditing = false }: ServiceFormProps) {
  const { connected, publicKey } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    subcategory: initialData?.subcategory || '',
    price: initialData?.price || 0,
    deliveryTime: initialData?.deliveryTime || 7,
    revisions: initialData?.revisions || 1,
    tags: initialData?.tags || [],
    requirements: initialData?.requirements || '',
    images: initialData?.images || [],
    isActive: initialData?.isActive ?? true
  })

  const [newTag, setNewTag] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialData?.category || '')

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Service title is required'
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Service description is required'
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.subcategory) {
      newErrors.subcategory = 'Subcategory is required'
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!connected || !publicKey) {
      setErrors({ wallet: 'Please connect your wallet to continue' })
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        ...formData,
        seller: publicKey.toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error submitting service:', error)
      setErrors({ submit: 'Failed to submit service. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setFormData(prev => ({
      ...prev,
      category,
      subcategory: ''
    }))
  }

  const selectedCategoryData = categories.find(cat => cat.name === selectedCategory)

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isEditing ? 'Edit Service' : 'Create New Service'}
          </h1>
          <p className="text-slate-600">
            {isEditing ? 'Update your service details' : 'List your skills and start earning SOL'}
          </p>
        </div>

        {!connected && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Please connect your wallet to create or edit services.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-green-500 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Service Details
              </CardTitle>
              <CardDescription className="text-purple-100">
                Provide clear and compelling information about your service
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-900 font-medium">
                  Service Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="I will create a professional Solana dApp for you"
                  className={`rounded-xl border-2 ${errors.title ? 'border-red-300' : 'border-slate-200'} focus:border-purple-500`}
                  maxLength={80}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title}</p>
                )}
                <p className="text-slate-500 text-sm">{formData.title.length}/80 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-900 font-medium">
                  Service Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your service in detail. What will you deliver? What makes your service unique?"
                  className={`rounded-xl border-2 min-h-32 ${errors.description ? 'border-red-300' : 'border-slate-200'} focus:border-purple-500`}
                  maxLength={1200}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
                <p className="text-slate-500 text-sm">{formData.description.length}/1200 characters</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-900 font-medium">Category *</Label>
                  <Select value={formData.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger className={`rounded-xl border-2 ${errors.category ? 'border-red-300' : 'border-slate-200'}`}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-red-500 text-sm">{errors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-900 font-medium">Subcategory *</Label>
                  <Select 
                    value={formData.subcategory} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory: value }))}
                    disabled={!selectedCategory}
                  >
                    <SelectTrigger className={`rounded-xl border-2 ${errors.subcategory ? 'border-red-300' : 'border-slate-200'}`}>
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategoryData?.subcategories.map((subcategory) => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subcategory && (
                    <p className="text-red-500 text-sm">{errors.subcategory}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Delivery */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-500 to-purple-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing & Delivery
              </CardTitle>
              <CardDescription className="text-green-100">
                Set your price and delivery terms
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-slate-900 font-medium">
                    Price (SOL) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className={`rounded-xl border-2 ${errors.price ? 'border-red-300' : 'border-slate-200'} focus:border-green-500`}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm">{errors.price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-900 font-medium">Delivery Time</Label>
                  <Select 
                    value={formData.deliveryTime.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, deliveryTime: parseInt(value) }))}
                  >
                    <SelectTrigger className="rounded-xl border-2 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revisions" className="text-slate-900 font-medium">
                    Revisions Included
                  </Label>
                  <Input
                    id="revisions"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.revisions}
                    onChange={(e) => setFormData(prev => ({ ...prev, revisions: parseInt(e.target.value) || 0 }))}
                    className="rounded-xl border-2 border-slate-200 focus:border-green-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>