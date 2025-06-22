import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, User, MessageSquare, Check, AlertTriangle, XCircle, Send } from 'lucide-react';

const ApprovalDetailModal = ({ 
  isOpen = true, 
  onClose = () => {}, 
  editId = "edit-123" 
}) => {
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Mock data - in real app this would be fetched from API
  const mockEditData = {
    id: editId,
    title: "Homepage Hero Section",
    type: "Markdown", // Can be: Markdown, HTML, JSON, Image
    targetLocation: "/home/hero.md",
    submittedBy: "Sarah Chen",
    submittedDate: "2024-01-15T10:30:00Z",
    status: "pending",
    tags: ["homepage", "hero", "marketing"],
    currentContent: `# Welcome to Our Platform

Transform your workflow with our innovative solution. 

[Get Started](#cta)`,
    proposedContent: `# Welcome to Our Revolutionary Platform

Transform your workflow with our cutting-edge, AI-powered solution that adapts to your needs.

**Key Benefits:**
- 50% faster processing
- Advanced analytics
- 24/7 support

[Start Free Trial](#cta)`,
    comments: [
      {
        id: "c1",
        author: "Mike Johnson",
        content: "The new copy looks great, but should we A/B test the 'Revolutionary' vs 'Innovative' messaging?",
        timestamp: "2024-01-15T14:20:00Z"
      },
      {
        id: "c2",
        author: "Sarah Chen",
        content: "Good point! I chose 'Revolutionary' based on our recent brand guidelines update. Happy to test both versions.",
        timestamp: "2024-01-15T15:45:00Z"
      }
    ]
  };

  // Different mock data based on content type for demo
  const getContentByType = (type) => {
    switch (type) {
      case 'HTML':
        return {
          current: `<div class="hero-section">
  <h1>Welcome to Our Platform</h1>
  <p>Transform your workflow with our innovative solution.</p>
  <button class="cta-button">Get Started</button>
</div>`,
          proposed: `<div class="hero-section bg-gradient">
  <h1 class="hero-title">Welcome to Our Revolutionary Platform</h1>
  <p class="hero-subtitle">Transform your workflow with our cutting-edge, AI-powered solution that adapts to your needs.</p>
  <div class="benefits-list">
    <ul>
      <li>50% faster processing</li>
      <li>Advanced analytics</li>
      <li>24/7 support</li>
    </ul>
  </div>
  <button class="cta-button primary">Start Free Trial</button>
</div>`
        };
      case 'JSON':
        return {
          current: `{
  "hero": {
    "title": "Welcome to Our Platform",
    "subtitle": "Transform your workflow with our innovative solution.",
    "cta": {
      "text": "Get Started",
      "link": "#cta"
    }
  }
}`,
          proposed: `{
  "hero": {
    "title": "Welcome to Our Revolutionary Platform",
    "subtitle": "Transform your workflow with our cutting-edge, AI-powered solution that adapts to your needs.",
    "benefits": [
      "50% faster processing",
      "Advanced analytics", 
      "24/7 support"
    ],
    "cta": {
      "text": "Start Free Trial",
      "link": "#cta",
      "style": "primary"
    },
    "background": "gradient"
  }
}`
        };
      case 'Image':
        return {
          current: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
          proposed: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop"
        };
      default:
        return {
          current: mockEditData.currentContent,
          proposed: mockEditData.proposedContent
        };
    }
  };

  useEffect(() => {
    if (isOpen && editId) {
      // Simulate API call
      setLoading(true);
      setTimeout(() => {
        const contentData = getContentByType(mockEditData.type);
        setEditData({
          ...mockEditData,
          currentContent: contentData.current,
          proposedContent: contentData.proposed
        });
        setLoading(false);
      }, 500);
    }
  }, [isOpen, editId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAction = async (action, comment = '') => {
    setActionLoading(action);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`${action} action performed with comment:`, comment);
    setActionLoading(null);
    onClose();
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    
    setSubmittingComment(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newCommentObj = {
      id: `c${editData.comments.length + 1}`,
      author: "Current User",
      content: newComment,
      timestamp: new Date().toISOString()
    };
    
    setEditData(prev => ({
      ...prev,
      comments: [...prev.comments, newCommentObj]
    }));
    
    setNewComment('');
    setSubmittingComment(false);
  };

  const renderDiff = () => {
    if (!editData) return null;
    
    // Handle different content types
    if (editData.type === 'Image') {
      return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="bg-red-100 dark:bg-red-800/30 px-3 sm:px-4 py-2 rounded-t-lg border-b border-red-200 dark:border-red-700">
              <span className="text-red-800 dark:text-red-200 font-medium text-xs sm:text-sm">Current Image</span>
            </div>
            <div className="p-2 sm:p-4">
              <img 
                src={editData.currentContent} 
                alt="Current version" 
                className="w-full h-auto rounded-lg border border-red-200 dark:border-red-700"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zOTkuNSAyMDBMMzUwIDI1MEg0NDlMMzk5LjUgMjAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMzUwIDI1MEgzMDBWMzAwSDUwMFYyNTBINDQ5TDM1MCAyNTBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMzMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2QjcyODAiPkltYWdlIG5vdCBmb3VuZDwvdGV4dD4KPHN2Zz4K';
                }}
              />
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="bg-green-100 dark:bg-green-800/30 px-3 sm:px-4 py-2 rounded-t-lg border-b border-green-200 dark:border-green-700">
              <span className="text-green-800 dark:text-green-200 font-medium text-xs sm:text-sm">Proposed Image</span>
            </div>
            <div className="p-2 sm:p-4">
              <img 
                src={editData.proposedContent} 
                alt="Proposed version" 
                className="w-full h-auto rounded-lg border border-green-200 dark:border-green-700"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRkNGREZFIi8+CjxwYXRoIGQ9Ik0zOTkuNSAyMDBMMzUwIDI1MEg0NDlMMzk5LjUgMjAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMzUwIDI1MEgzMDBWMzAwSDUwMFYyNTBINDQ5TDM1MCAyNTBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMzMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2QjcyODAiPlByb3Bvc2VkIGltYWdlIG5vdCBmb3VuZDwvdGV4dD4KPHN2Zz4K';
                }}
              />
            </div>
          </div>
        </div>
      );
    }

    // Handle HTML content with preview
    if (editData.type === 'HTML') {
      return (
        <div className="space-y-4">
          {/* Code Diff */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-4 font-mono text-xs sm:text-sm">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg min-h-0">
              <div className="bg-red-100 dark:bg-red-800/30 px-3 sm:px-4 py-2 rounded-t-lg border-b border-red-200 dark:border-red-700">
                <span className="text-red-800 dark:text-red-200 font-medium text-xs sm:text-sm">Current HTML</span>
              </div>
              <div className="p-2 sm:p-4 space-y-1 overflow-x-auto max-h-60 overflow-y-auto">
                {editData.currentContent.split('\n').map((line, index) => (
                  <div key={index} className="flex whitespace-nowrap">
                    <span className="text-red-400 dark:text-red-500 w-6 sm:w-8 text-right mr-2 sm:mr-4 select-none flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-red-800 dark:text-red-200 min-w-0">{line || ' '}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg min-h-0">
              <div className="bg-green-100 dark:bg-green-800/30 px-3 sm:px-4 py-2 rounded-t-lg border-b border-green-200 dark:border-green-700">
                <span className="text-green-800 dark:text-green-200 font-medium text-xs sm:text-sm">Proposed HTML</span>
              </div>
              <div className="p-2 sm:p-4 space-y-1 overflow-x-auto max-h-60 overflow-y-auto">
                {editData.proposedContent.split('\n').map((line, index) => (
                  <div key={index} className="flex whitespace-nowrap">
                    <span className="text-green-400 dark:text-green-500 w-6 sm:w-8 text-right mr-2 sm:mr-4 select-none flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-green-800 dark:text-green-200 min-w-0">{line || ' '}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* HTML Preview */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Live Preview Comparison</h4>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-4">
              <div className="border border-red-200 dark:border-red-700 rounded-lg">
                <div className="bg-red-100 dark:bg-red-800/30 px-3 py-2 text-xs text-red-800 dark:text-red-200 font-medium">
                  Current Preview
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 min-h-32">
                  <div dangerouslySetInnerHTML={{ __html: editData.currentContent }} />
                </div>
              </div>
              <div className="border border-green-200 dark:border-green-700 rounded-lg">
                <div className="bg-green-100 dark:bg-green-800/30 px-3 py-2 text-xs text-green-800 dark:text-green-200 font-medium">
                  Proposed Preview
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 min-h-32">
                  <div dangerouslySetInnerHTML={{ __html: editData.proposedContent }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Handle JSON with formatting
    if (editData.type === 'JSON') {
      const formatJson = (jsonString) => {
        try {
          return JSON.stringify(JSON.parse(jsonString), null, 2);
        } catch {
          return jsonString;
        }
      };

      const currentFormatted = formatJson(editData.currentContent);
      const proposedFormatted = formatJson(editData.proposedContent);

      return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-4 font-mono text-xs sm:text-sm">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg min-h-0">
            <div className="bg-red-100 dark:bg-red-800/30 px-3 sm:px-4 py-2 rounded-t-lg border-b border-red-200 dark:border-red-700">
              <span className="text-red-800 dark:text-red-200 font-medium text-xs sm:text-sm">Current JSON</span>
            </div>
            <div className="p-2 sm:p-4 space-y-1 overflow-x-auto max-h-80 overflow-y-auto">
              {currentFormatted.split('\n').map((line, index) => (
                <div key={index} className="flex whitespace-nowrap">
                  <span className="text-red-400 dark:text-red-500 w-6 sm:w-8 text-right mr-2 sm:mr-4 select-none flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-red-800 dark:text-red-200 min-w-0">{line || ' '}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg min-h-0">
            <div className="bg-green-100 dark:bg-green-800/30 px-3 sm:px-4 py-2 rounded-t-lg border-b border-green-200 dark:border-green-700">
              <span className="text-green-800 dark:text-green-200 font-medium text-xs sm:text-sm">Proposed JSON</span>
            </div>
            <div className="p-2 sm:p-4 space-y-1 overflow-x-auto max-h-80 overflow-y-auto">
              {proposedFormatted.split('\n').map((line, index) => (
                <div key={index} className="flex whitespace-nowrap">
                  <span className="text-green-400 dark:text-green-500 w-6 sm:w-8 text-right mr-2 sm:mr-4 select-none flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-green-800 dark:text-green-200 min-w-0">{line || ' '}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Default: Markdown/Text diff
    const currentLines = editData.currentContent.split('\n');
    const proposedLines = editData.proposedContent.split('\n');
    
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-4 font-mono text-xs sm:text-sm">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg min-h-0">
          <div className="bg-red-100 dark:bg-red-800/30 px-3 sm:px-4 py-2 rounded-t-lg border-b border-red-200 dark:border-red-700">
            <span className="text-red-800 dark:text-red-200 font-medium text-xs sm:text-sm">Current Version</span>
          </div>
          <div className="p-2 sm:p-4 space-y-1 overflow-x-auto">
            {currentLines.map((line, index) => (
              <div key={index} className="flex whitespace-nowrap">
                <span className="text-red-400 dark:text-red-500 w-6 sm:w-8 text-right mr-2 sm:mr-4 select-none flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-red-800 dark:text-red-200 min-w-0">{line || ' '}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg min-h-0">
          <div className="bg-green-100 dark:bg-green-800/30 px-3 sm:px-4 py-2 rounded-t-lg border-b border-green-200 dark:border-green-700">
            <span className="text-green-800 dark:text-green-200 font-medium text-xs sm:text-sm">Proposed Version</span>
          </div>
          <div className="p-2 sm:p-4 space-y-1 overflow-x-auto">
            {proposedLines.map((line, index) => (
              <div key={index} className="flex whitespace-nowrap">
                <span className="text-green-400 dark:text-green-500 w-6 sm:w-8 text-right mr-2 sm:mr-4 select-none flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-green-800 dark:text-green-200 min-w-0">{line || ' '}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Approve Content Update
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                    Submitted by {editData.submittedBy} on {formatDate(editData.submittedDate)}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[calc(95vh-200px)]">
              <div className="p-4 sm:p-6 space-y-6">
                {/* Edit Metadata Panel */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Edit Details
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Content Title</label>
                      <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium">{editData.title}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                      <div className="flex items-center gap-2">
                        <p className="text-sm sm:text-base text-gray-900 dark:text-white">{editData.type}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          editData.type === 'Image' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                          editData.type === 'HTML' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                          editData.type === 'JSON' ? 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200' :
                          'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        }`}>
                          {editData.type === 'Image' ? '🖼️' : 
                           editData.type === 'HTML' ? '🌐' :
                           editData.type === 'JSON' ? '📊' : '📝'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Target Location</label>
                      <p className="text-xs sm:text-sm text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded break-all">
                        {editData.targetLocation}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {editData.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diff Viewer */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Content Changes
                  </h3>
                  {renderDiff()}
                </div>

                {/* Comment Section */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Comments ({editData.comments.length})
                  </h3>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {editData.comments.map(comment => (
                      <div key={comment.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <div className="flex items-center">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-500" />
                            <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">{comment.author}</span>
                          </div>
                          <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            {formatDate(comment.timestamp)}
                          </div>
                        </div>
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{comment.content}</p>
                      </div>
                    ))}
                    
                    {/* New Comment Input */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none text-sm"
                            rows={3}
                          />
                        </div>
                        <button
                          onClick={handleCommentSubmit}
                          disabled={!newComment.trim() || submittingComment}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2 h-fit text-sm"
                        >
                          {submittingComment ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {editData.status === 'pending' && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={actionLoading}
                    className="px-4 sm:px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {actionLoading === 'reject' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject
                  </button>
                  
                  <button
                    onClick={() => handleAction('request-changes')}
                    disabled={actionLoading}
                    className="px-4 sm:px-6 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {actionLoading === 'request-changes' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    Request Changes
                  </button>
                  
                  <button
                    onClick={() => handleAction('approve')}
                    disabled={actionLoading}
                    className="px-4 sm:px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {actionLoading === 'approve' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ApprovalDetailModal;