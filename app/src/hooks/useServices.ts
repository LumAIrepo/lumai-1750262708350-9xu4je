```typescript
import { useState, useEffect, useCallback } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor'
import { toast } from 'sonner'

export interface Service {
  id: string
  title: string
  description: string
  category: string
  subcategory: string
  price: number
  currency: 'SOL' | 'USDC'
  deliveryTime: number
  seller: {
    publicKey: string
    username: string
    avatar?: string
    rating: number
    totalReviews: number
    isVerified: boolean
    completedOrders: number
    responseTime: string
  }
  images: string[]
  tags: string[]
  features: string[]
  requirements: string[]
  faqs: Array<{
    question: string
    answer: string
  }>
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  totalOrders: number
  rating: number
  reviews: Review[]
}

export interface Review {
  id: string
  serviceId: string
  buyer: {
    publicKey: string
    username: string
    avatar?: string
  }
  rating: number
  comment: string
  createdAt: Date
}

export interface ServiceFilters {
  category?: string
  subcategory?: string
  minPrice?: number
  maxPrice?: number
  currency?: 'SOL' | 'USDC'
  deliveryTime?: number
  rating?: number
  search?: string
  sortBy?: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'rating' | 'popular'
}

export interface CreateServiceData {
  title: string
  description: string
  category: string
  subcategory: string
  price: number
  currency: 'SOL' | 'USDC'
  deliveryTime: number
  images: string[]
  tags: string[]
  features: string[]
  requirements: string[]
  faqs: Array<{
    question: string
    answer: string
  }>
}

export interface UseServicesReturn {
  services: Service[]
  loading: boolean
  error: string | null
  totalServices: number
  currentPage: number
  totalPages: number
  filters: ServiceFilters
  userServices: Service[]
  featuredServices: Service[]
  
  // Actions
  fetchServices: (page?: number, filters?: ServiceFilters) => Promise<void>
  fetchUserServices: () => Promise<void>
  fetchFeaturedServices: () => Promise<void>
  createService: (data: CreateServiceData) => Promise<string | null>
  updateService: (serviceId: string, data: Partial<CreateServiceData>) => Promise<boolean>
  deleteService: (serviceId: string) => Promise<boolean>
  toggleServiceStatus: (serviceId: string) => Promise<boolean>
  searchServices: (query: string) => Promise<Service[]>
  getServiceById: (serviceId: string) => Promise<Service | null>
  getServicesByCategory: (category: string) => Promise<Service[]>
  setFilters: (filters: ServiceFilters) => void
  clearFilters: () => void
  
  // Reviews
  addReview: (serviceId: string, rating: number, comment: string) => Promise<boolean>
  getServiceReviews: (serviceId: string) => Promise<Review[]>
}

const SERVICES_PER_PAGE = 12
const PROGRAM_ID = new PublicKey('SoLanaGigsProgram11111111111111111111111111')

export function useServices(): UseServicesReturn {
  const { connection } = useConnection()
  const { publicKey, signTransaction } = useWallet()
  
  const [services, setServices] = useState<Service[]>([])
  const [userServices, setUserServices] = useState<Service[]>([])
  const [featuredServices, setFeaturedServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalServices, setTotalServices] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [filters, setFiltersState] = useState<ServiceFilters>({})

  // Mock data for development
  const mockServices: Service[] = [
    {
      id: '1',
      title: 'Custom Solana Smart Contract Development',
      description: 'I will develop a custom smart contract for your Solana project with full testing and deployment support.',
      category: 'Development',
      subcategory: 'Smart Contracts',
      price: 5.5,
      currency: 'SOL',
      deliveryTime: 7,
      seller: {
        publicKey: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        username: 'soldev_master',
        avatar: '/avatars/dev1.jpg',
        rating: 4.9,
        totalReviews: 127,
        isVerified: true,
        completedOrders: 89,
        responseTime: '< 1 hour'
      },
      images: ['/services/smart-contract-1.jpg', '/services/smart-contract-2.jpg'],
      tags: ['solana', 'smart-contract', 'rust', 'anchor'],
      features: [
        'Custom smart contract development',
        'Full testing suite',
        'Deployment assistance',
        '30-day support'
      ],
      requirements: [
        'Detailed project requirements',
        'Smart contract specifications',
        'Testing scenarios'
      ],
      faqs: [
        {
          question: 'What programming language do you use?',
          answer: 'I use Rust with the Anchor framework for Solana smart contract development.'
        },
        {
          question: 'Do you provide ongoing support?',
          answer: 'Yes, I provide 30 days of free support after delivery.'
        }
      ],
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      totalOrders: 89,
      rating: 4.9,
      reviews: []
    },
    {
      id: '2',
      title: 'Professional Solana dApp UI/UX Design',
      description: 'Complete UI/UX design for your Solana dApp with modern design principles and Web3 best practices.',
      category: 'Design',
      subcategory: 'UI/UX',
      price: 3.2,
      currency: 'SOL',
      deliveryTime: 5,
      seller: {
        publicKey: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        username: 'web3_designer',
        avatar: '/avatars/designer1.jpg',
        rating: 4.8,
        totalReviews: 94,
        isVerified: true,
        completedOrders: 67,
        responseTime: '< 2 hours'
      },
      images: ['/services/ui-design-1.jpg', '/services/ui-design-2.jpg'],
      tags: ['ui-design', 'ux-design', 'figma', 'web3'],
      features: [
        'Complete UI/UX design',
        'Figma source files',
        'Responsive design',
        'Design system'
      ],
      requirements: [
        'Project brief and requirements',
        'Brand guidelines (if any)',
        'Reference designs or inspiration'
      ],
      faqs: [
        {
          question: 'What design tools do you use?',
          answer: 'I primarily use Figma for all design work and provide source files.'
        },
        {
          question: 'Do you provide development-ready assets?',
          answer: 'Yes, I provide all assets optimized for development including SVGs and PNGs.'
        }
      ],
      isActive: true,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
      totalOrders: 67,
      rating: 4.8,
      reviews: []
    }
  ]

  const fetchServices = useCallback(async (page = 1, newFilters?: ServiceFilters) => {
    setLoading(true)
    setError(null)
    
    try {
      // In production, this would be an API call to your backend
      // For now, we'll simulate with mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let filteredServices = [...mockServices]
      const activeFilters = newFilters || filters
      
      // Apply filters
      if (activeFilters.category) {
        filteredServices = filteredServices.filter(s => s.category === activeFilters.category)
      }
      
      if (activeFilters.subcategory) {
        filteredServices = filteredServices.filter(s => s.subcategory === activeFilters.subcategory)
      }
      
      if (activeFilters.minPrice !== undefined) {
        filteredServices = filteredServices.filter(s => s.price >= activeFilters.minPrice!)
      }
      
      if (activeFilters.maxPrice !== undefined) {
        filteredServices = filteredServices.filter(s => s.price <= activeFilters.maxPrice!)
      }
      
      if (activeFilters.currency) {
        filteredServices = filteredServices.filter(s => s.currency === activeFilters.currency)
      }
      
      if (activeFilters.deliveryTime) {
        filteredServices = filteredServices.filter(s => s.deliveryTime <= activeFilters.deliveryTime!)
      }
      
      if (activeFilters.rating) {
        filteredServices = filteredServices.filter(s => s.rating >= activeFilters.rating!)
      }
      
      if (activeFilters.search) {
        const searchTerm = activeFilters.search.toLowerCase()
        filteredServices = filteredServices.filter(s => 
          s.title.toLowerCase().includes(searchTerm) ||
          s.description.toLowerCase().includes(searchTerm) ||
          s.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        )
      }
      
      // Apply sorting
      switch (activeFilters.sortBy) {
        case 'newest':
          filteredServices.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          break
        case 'oldest':
          filteredServices.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
          break
        case 'price-low':
          filteredServices.sort((a, b) => a.price - b.price)
          break
        case 'price-high':
          filteredServices.sort((a, b) => b.price - a.price)
          break
        case 'rating':
          filteredServices.sort((a, b) => b.rating - a.rating)
          break
        case 'popular':
          filteredServices.sort((a, b) => b.totalOrders - a.totalOrders)
          break
        default:
          break
      }
      
      const total = filteredServices.length
      const pages = Math.ceil(total / SERVICES_PER_PAGE)
      const startIndex = (page - 1) * SERVICES_PER_PAGE
      const endIndex = startIndex + SERVICES_PER_PAGE
      const paginatedServices = filteredServices.slice(startIndex, endIndex)
      
      setServices(paginatedServices)
      setTotalServices(total)
      setCurrentPage(page)
      setTotalPages(pages)
      
    } catch (err) {
      setError('Failed to fetch services')
      console.error('Error fetching services:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  const fetchUserServices = useCallback(async () => {
    if (!publicKey) return
    
    setLoading(true)
    setError(null)
    
    try {
      // In production, fetch user's services from backend
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const userServicesData = mockServices.filter(s => 
        s.seller.publicKey === publicKey.toString()
      )
      
      setUserServices(userServicesData)
      
    } catch (err) {
      setError('Failed to fetch user services')
      console.error('Error fetching user services:', err)
    } finally {
      setLoading(false)
    }
  }, [publicKey])

  const fetchFeaturedServices = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // In production, fetch featured services from backend
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const featured = mockServices
        .filter(s => s.rating >= 4.8)
        .sort((a, b) => b.totalOrders - a.totalOrders)
        .slice(0, 6)
      
      setFeaturedServices(featured)
      
    } catch (err) {
      setError('Failed to fetch featured services')
      console.error('Error fetching featured services:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createService = useCallback(async (data: CreateServiceData): Promise<string | null> => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your wallet')
      return null
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // In production, this would interact with your Solana program
      // For now, we'll simulate the creation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newServiceId = `service_${Date.now()}`
      
      // Simulate blockchain transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: PROGRAM_ID,
          lamports: 0.01 * LAMPORTS_PER_SOL // Service creation fee
        })
      )
      
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey
      
      // In production, you would sign and send this transaction
      // const signedTransaction = await signTransaction(transaction)
      // const signature = await connection.sendRawTransaction(signedTransaction.serialize())
      
      toast.success('Service created successfully!')
      
      // Refresh user services
      await fetchUserServices()
      
      return newServiceId
      
    } catch (err) {
      setError('Failed to create service')
      toast.error('Failed to create service')
      console.error('Error creating service:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [publicKey, signTransaction, connection, fetchUserServices])

  const updateService = useCallback(async (serviceId: string, data: Partial<CreateServiceData>): Promise<boolean> => {
    if (!publicKey) {
      toast.error('Please connect your wallet')
      return false
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // In