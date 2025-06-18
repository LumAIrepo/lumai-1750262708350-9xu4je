```tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useWallet } from '@solana/wallet-adapter-react'
import { Send, Search, Star, Shield, Clock, Paperclip, MoreVertical, Phone, Video } from 'lucide-react'

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  type: 'text' | 'file' | 'gig-offer' | 'payment'
  metadata?: {
    fileName?: string
    fileSize?: number
    gigId?: string
    amount?: number
  }
}

interface Conversation {
  id: string
  participants: string[]
  lastMessage: Message
  unreadCount: number
  gigId?: string
  gigTitle?: string
}

interface User {
  id: string
  username: string
  avatar: string
  isOnline: boolean
  rating: number
  isVerified: boolean
  lastSeen?: Date
}

export default function MessagingSystem() {
  const { publicKey } = useWallet()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<Record<string, User>>({})
  const [isTyping, setIsTyping] = useState(false)
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock data - in production, this would come from your backend/blockchain
  useEffect(() => {
    const mockUsers: Record<string, User> = {
      'user1': {
        id: 'user1',
        username: 'CryptoDesigner',
        avatar: '/avatars/user1.jpg',
        isOnline: true,
        rating: 4.9,
        isVerified: true
      },
      'user2': {
        id: 'user2',
        username: 'SolDeveloper',
        avatar: '/avatars/user2.jpg',
        isOnline: false,
        rating: 4.7,
        isVerified: true,
        lastSeen: new Date(Date.now() - 3600000)
      },
      'user3': {
        id: 'user3',
        username: 'NFTArtist',
        avatar: '/avatars/user3.jpg',
        isOnline: true,
        rating: 4.8,
        isVerified: false
      }
    }

    const mockConversations: Conversation[] = [
      {
        id: 'conv1',
        participants: [publicKey?.toString() || 'current-user', 'user1'],
        lastMessage: {
          id: 'msg1',
          senderId: 'user1',
          receiverId: publicKey?.toString() || 'current-user',
          content: 'I can definitely help you with that logo design! When do you need it completed?',
          timestamp: new Date(Date.now() - 300000),
          type: 'text'
        },
        unreadCount: 2,
        gigId: 'gig1',
        gigTitle: 'Professional Logo Design'
      },
      {
        id: 'conv2',
        participants: [publicKey?.toString() || 'current-user', 'user2'],
        lastMessage: {
          id: 'msg2',
          senderId: publicKey?.toString() || 'current-user',
          receiverId: 'user2',
          content: 'Thanks for the smart contract audit. Everything looks good!',
          timestamp: new Date(Date.now() - 3600000),
          type: 'text'
        },
        unreadCount: 0,
        gigId: 'gig2',
        gigTitle: 'Smart Contract Audit'
      }
    ]

    setUsers(mockUsers)
    setConversations(mockConversations)
  }, [publicKey])

  useEffect(() => {
    if (selectedConversation) {
      // Mock messages for selected conversation
      const mockMessages: Message[] = [
        {
          id: 'msg1',
          senderId: 'user1',
          receiverId: publicKey?.toString() || 'current-user',
          content: 'Hi! I saw your gig request for a logo design. I\'d love to work on this project with you.',
          timestamp: new Date(Date.now() - 7200000),
          type: 'text'
        },
        {
          id: 'msg2',
          senderId: publicKey?.toString() || 'current-user',
          receiverId: 'user1',
          content: 'Great! Can you show me some of your previous work?',
          timestamp: new Date(Date.now() - 7000000),
          type: 'text'
        },
        {
          id: 'msg3',
          senderId: 'user1',
          receiverId: publicKey?.toString() || 'current-user',
          content: 'I can definitely help you with that logo design! When do you need it completed?',
          timestamp: new Date(Date.now() - 300000),
          type: 'text'
        }
      ]
      setMessages(mockMessages)
    }
  }, [selectedConversation, publicKey])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: publicKey?.toString() || 'current-user',
      receiverId: getOtherParticipant(selectedConversation),
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Update conversation's last message
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation 
        ? { ...conv, lastMessage: message }
        : conv
    ))
  }

  const getOtherParticipant = (conversationId: string): string => {
    const conversation = conversations.find(c => c.id === conversationId)
    if (!conversation) return ''
    return conversation.participants.find(p => p !== (publicKey?.toString() || 'current-user')) || ''
  }

  const getParticipantUser = (conversationId: string): User | null => {
    const otherParticipant = getOtherParticipant(conversationId)
    return users[otherParticipant] || null
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  const filteredConversations = conversations.filter(conv => {
    const user = getParticipantUser(conv.id)
    return user?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.gigTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Messages</h2>
            <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600 text-white rounded-xl">
                  New Chat
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-xl">
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input 
                    placeholder="Search users..." 
                    className="rounded-xl"
                  />
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {Object.values(users).map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.username[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-slate-900">{user.username}</span>
                              {user.isVerified && <Shield className="h-4 w-4 text-green-500" />}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-orange-400 fill-current" />
                              <span className="text-sm text-slate-600">{user.rating}</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="rounded-xl">
                          Message
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.map(conversation => {
              const user = getParticipantUser(conversation.id)
              if (!user) return null

              return (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-colors mb-2 ${
                    selectedConversation === conversation.id
                      ? 'bg-gradient-to-r from-purple-50 to-green-50 border border-purple-200'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.username[0]}</AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-slate-900 truncate">{user.username}</span>
                          {user.isVerified && <Shield className="h-4 w-4 text-green-500 flex-shrink-0" />}
                        </div>
                        <span className="text-xs text-slate-500">{formatTime(conversation.lastMessage.timestamp)}</span>
                      </div>
                      {conversation.gigTitle && (
                        <div className="text-xs text-purple-600 mb-1">{conversation.gigTitle}</div>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600 truncate">{conversation.lastMessage.content}</p>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-gradient-to-r from-purple-600 to-green-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const user = getParticipantUser(selectedConversation)
                    if (!user) return null
                    
                    return (
                      <>
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.username[0]}</AvatarFallback>
                          </Avatar>
                          {user.isOnline && (
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-slate-900">{user.username}</span>
                            {user.isVerified && <Shield className="h-4 w-4 text-green-