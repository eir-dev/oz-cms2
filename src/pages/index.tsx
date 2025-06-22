import React, { useState, useEffect } from 'react'
import ApprovalDetailModal from '../components/approval-detail-modal'
import { Plus, FileText, Image, Code, Globe, Calendar, User, Tag } from 'lucide-react'

interface ContentItem {
  id: string
  title: string
  type: 'Markdown' | 'HTML' | 'JSON' | 'Image' | 'Text'
  targetLocation: string
  submittedBy: string
  submittedDate: string
  status: 'draft' | 'in_review' | 'ready_for_approval' | 'published' | 'archived'
  tags: string[]
  currentContent: string
  proposedContent: string
  comments: Array<{
    id: string
    author: string
    content: string
    timestamp: string
  }>
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Markdown': return <FileText className="w-4 h-4" />
    case 'HTML': return <Globe className="w-4 h-4" />
    case 'JSON': return <Code className="w-4 h-4" />
    case 'Image': return <Image className="w-4 h-4" />
    case 'Text': return <FileText className="w-4 h-4" />
    default: return <FileText className="w-4 h-4" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published': return 'bg-green-100 text-green-800 border-green-200'
    case 'ready_for_approval': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'in_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'archived': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function Dashboard() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const fetchContent = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/content')
      if (response.ok) {
        const data = await response.json()
        setContent(data)
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContent()
  }, [])

  const handleEdit = (item: ContentItem) => {
    setSelectedItem(item)
    setIsCreating(false)
    setShowModal(true)
  }

  const handleAddNew = () => {
    setSelectedItem(null)
    setIsCreating(true)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedItem(null)
    setIsCreating(false)
    fetchContent() // Refresh the list
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your content files with Git-powered version control
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Content
            </button>
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : content.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No content files</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first content file.</p>
            <div className="mt-6">
              <button
                onClick={handleAddNew}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Content
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {content.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(item.type)}
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {item.title}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-600">
                    {item.targetLocation}
                  </p>
                  
                  <div className="mt-4 flex items-center text-xs text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {item.submittedBy}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(item.submittedDate)}
                    </div>
                  </div>
                  
                  {item.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          <Tag className="w-2 h-2 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{item.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <button
                      onClick={() => handleEdit(item)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Edit Content
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval Detail Modal */}
      {showModal && (
        <ApprovalDetailModal
          editId={selectedItem?.id || 'new'}
          isOpen={showModal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
} 