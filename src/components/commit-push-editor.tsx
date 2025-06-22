import React, { useState } from 'react'

export default function CommitPushTestPage() {
  const [filename, setFilename] = useState('test.txt')
  const [content, setContent] = useState('')
  const [commitMessage, setCommitMessage] = useState('Initial commit')
  const [author, setAuthor] = useState('dev@eir.inc')
  const [status, setStatus] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setStatus([])
    
    try {
      // Step 1: Save the file to data/content/
      setStatus(prev => [...prev, `📝 Saving file: data/content/${filename}`])
      
      const saveResponse = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: filename.replace('.txt', '').replace('.md', ''),
          type: filename.endsWith('.md') ? 'Markdown' : 'Text',
          targetLocation: `/content/${filename}`,
          submittedBy: author,
          currentContent: '',
          proposedContent: content,
          tags: ['test', 'editor']
        })
      })

      if (!saveResponse.ok) {
        throw new Error(`Failed to save file: ${saveResponse.statusText}`)
      }

      setStatus(prev => [...prev, `✅ File saved as data/content/${filename}`])
      
      // Step 2: Commit and push to Git
      setStatus(prev => [...prev, `🔄 Committing to Git repository...`])
      
      const publishResponse = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: commitMessage,
          author: author
        })
      })

      const publishData = await publishResponse.json()

      if (publishResponse.ok) {
        setStatus(prev => [...prev, `✅ ${publishData.message}`])
        if (publishData.message.includes('pushed')) {
          setStatus(prev => [...prev, `🚀 Successfully pushed to GitHub!`])
        }
      } else {
        throw new Error(publishData.error || 'Failed to commit changes')
      }
      
    } catch (err: any) {
      setStatus(prev => [...prev, `❌ Error: ${err.message}`])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 border border-gray-200 rounded-xl shadow-lg bg-white">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">🚀 Real Git Commit + Push Editor</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filename</label>
          <input 
            value={filename} 
            onChange={e => setFilename(e.target.value)} 
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Enter filename..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">File Content</label>
          <textarea 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            className="w-full border border-gray-300 rounded px-3 py-2 h-40 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Enter your content here..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Commit Message</label>
          <input 
            value={commitMessage} 
            onChange={e => setCommitMessage(e.target.value)} 
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Describe your changes..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Author Email</label>
          <input 
            value={author} 
            onChange={e => setAuthor(e.target.value)} 
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="your@email.com"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !content.trim() || !commitMessage.trim()}
          className="w-full bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Processing...' : 'Save File & Commit to Git 🔥'}
        </button>
      </div>

      {status.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm space-y-2">
            {status.map((msg, i) => (
              <div key={i} className="flex items-center gap-2">
                <span>{msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}