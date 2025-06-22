import React, { useState } from 'react'
import ApprovalDetailModal from '@/components/approval-detail-modal'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(true)
  const [selectedEditId, setSelectedEditId] = useState('edit-123')

  const demoEdits = [
    { id: 'edit-123', title: 'Homepage Hero Section', type: 'Markdown' },
    { id: 'edit-124', title: 'About Page Content', type: 'HTML' },
    { id: 'edit-125', title: 'Product Config', type: 'JSON' },
    { id: 'edit-126', title: 'Hero Banner Image', type: 'Image' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          OZ CMS - Approval Detail Modal Demo
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Content Awaiting Approval
          </h2>
          
          <div className="space-y-3">
            {demoEdits.map((edit) => (
              <div
                key={edit.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  setSelectedEditId(edit.id)
                  setIsModalOpen(true)
                }}
              >
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {edit.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Type: {edit.type}
                  </p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Modal Controls
          </h2>
          
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Open Modal
            </button>
            
            <select
              value={selectedEditId}
              onChange={(e) => setSelectedEditId(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {demoEdits.map((edit) => (
                <option key={edit.id} value={edit.id}>
                  {edit.title} ({edit.type})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ApprovalDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editId={selectedEditId}
      />
    </div>
  )
} 