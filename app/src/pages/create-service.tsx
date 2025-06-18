```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Upload, Plus, X, Star, Shield, Clock, DollarSign } from 'lucide-react'
import Link from 'next/link'

const categories = [
  'Development & Programming',
  'Design & Creative',
  'Writing & Translation',
  'Marketing & SEO',
  'Business & Consulting',
  'Music & Audio',
  'Video & Animation',
  'Data & Analytics',
  'Blockchain & Web3',
  'AI & Machine Learning'
]

const deliveryTimes = [
  { value: '1', label: '1 day' },
  { value: '3', label: '3 days' },
  { value: '7', label: '1 week' },
  { value: '14', label: '2 weeks' },
  { value: '30', label: '1 month' },
  { value: '60', label: '2 months' }
]

export default function CreateServicePage() {
  const router = useRouter()
  const { connected, publicKey } = useWallet()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    price: '',
    deliveryTime: '',
    revisions: '3',
    requirements: '',
    images: [] as File[]
  })
  
  const [currentTag, setCurrentTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + formData.images.length <= 5) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files]
      }))
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required'
    if (!formData.deliveryTime) newErrors.deliveryTime = 'Delivery time is required'
    if (formData.tags.length === 0) newErrors.tags = 'At least one tag is required'
    if (formData.images.length === 0) newErrors.images = 'At least one image is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!connected || !publicKey) {
      alert('Please connect your wallet first')
      return
    }
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // Here you would implement the actual service creation logic
      // This would involve uploading images to IPFS/Arweave
      // Creating the service on-chain or in your database
      // For now, we'll simulate the process
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      router.push('/dashboard/services')
    } catch (error) {
      console.error('Error creating service:', error)
      alert('Failed to create service. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-slate-900">Wallet Required</CardTitle>
            <CardDescription>
              Please connect your Solana wallet to create a service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600 text-white rounded-xl">
                Go Back Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:bg-slate-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Create New Service</h1>
            <p className="text-slate-600 mt-1">Share your skills and start earning SOL</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Tell clients what you're offering and make it stand out
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-slate-900 font-medium">Service Title *</Label>
                <Input
                  id="title"
                  placeholder="I will create a stunning website for your business"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`mt-2 rounded-xl border-slate-200 focus:border-purple-500 focus:ring-purple-500 ${errors.title ? 'border-red-500' : ''}`}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="description" className="text-slate-900 font-medium">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your service in detail. What will you deliver? What makes you the right person for this job?"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className={`mt-2 rounded-xl border-slate-200 focus:border-purple-500 focus:ring-purple-500 ${errors.description ? 'border-red-500' : ''}`}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <Label htmlFor="category" className="text-slate-900 font-medium">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className={`mt-2 rounded-xl border-slate-200 focus:border-purple-500 focus:ring-purple-500 ${errors.category ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="rounded-lg">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <Label className="text-slate-900 font-medium">Tags * (Max 5)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add a tag"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="rounded-xl border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    disabled={!currentTag.trim() || formData.tags.length >= 5}
                    className="bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-purple-100 text-purple-800 hover:bg-purple-200 rounded-lg"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-purple-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Delivery */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Pricing & Delivery
              </CardTitle>
              <CardDescription>
                Set your price and delivery expectations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price" className="text-slate-900 font-medium">Price (SOL) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="5.00"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className={`mt-2 rounded-xl border-slate-200 focus:border-purple-500 focus:ring-purple-500 ${errors.price ? 'border-red-500' : ''}`}
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <Label htmlFor="deliveryTime" className="text-slate-900 font-medium">Delivery Time *</Label>
                  <Select value={formData.deliveryTime} onValueChange={(value) => handleInputChange('deliveryTime', value)}>
                    <SelectTrigger className={`mt-2 rounded-xl border-slate-200 focus:border-purple-500 focus:ring-purple-500 ${errors.deliveryTime ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select delivery time" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {deliveryTimes.map((time) => (
                        <SelectItem key={time.value} value={time.value} className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {time.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.deliveryTime && <p className="text-red-500 text-sm mt-1">{errors.deliveryTime}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="revisions" className="text-slate-900 font-medium">Number of Revisions</Label>
                <Input
                  id="revisions"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.revisions}
                  onChange={(e) => handleInputChange('revisions', e.target.value)}
                  className="mt-2 rounded-xl