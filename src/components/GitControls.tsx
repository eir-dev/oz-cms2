import React, { useState } from 'react';
import { GitBranch, Upload, RotateCcw, History, AlertCircle, CheckCircle } from 'lucide-react';

interface GitControlsProps {
  onPublish?: (message: string, author: string) => void;
  onRollback?: () => void;
}

const GitControls: React.FC<GitControlsProps> = ({ onPublish, onRollback }) => {
  const [publishMessage, setPublishMessage] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const handlePublish = async () => {
    if (!publishMessage.trim() || !authorName.trim()) {
      setStatus({ type: 'error', message: 'Please provide both commit message and author name' });
      return;
    }

    setIsPublishing(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: publishMessage,
          author: authorName
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: data.message });
        setPublishMessage('');
        onPublish?.(publishMessage, authorName);
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to publish changes' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error occurred' });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRollback = async () => {
    if (!confirm('Are you sure you want to rollback the last commit? This cannot be undone.')) {
      return;
    }

    setIsRollingBack(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/rollback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: data.message });
        onRollback?.();
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to rollback changes' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error occurred' });
    } finally {
      setIsRollingBack(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <GitBranch className="w-5 h-5 mr-2" />
        Git Controls
      </h2>

      {/* Status Message */}
      {status.type && (
        <div className={`mb-4 p-3 rounded-lg flex items-center ${
          status.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
        }`}>
          {status.type === 'success' ? (
            <CheckCircle className="w-4 h-4 mr-2" />
          ) : (
            <AlertCircle className="w-4 h-4 mr-2" />
          )}
          {status.message}
        </div>
      )}

      {/* Publish Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
          <Upload className="w-4 h-4 mr-2" />
          Publish Changes
        </h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Commit Message
            </label>
            <input
              type="text"
              value={publishMessage}
              onChange={(e) => setPublishMessage(e.target.value)}
              placeholder="Describe your changes..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Author Name
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          <button
            onClick={handlePublish}
            disabled={isPublishing || !publishMessage.trim() || !authorName.trim()}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isPublishing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isPublishing ? 'Publishing...' : 'Commit & Push to GitHub'}
          </button>
        </div>
      </div>

      {/* Rollback Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
          <RotateCcw className="w-4 h-4 mr-2" />
          Rollback
        </h3>
        
        <button
          onClick={handleRollback}
          disabled={isRollingBack}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isRollingBack ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <RotateCcw className="w-4 h-4" />
          )}
          {isRollingBack ? 'Rolling back...' : 'Rollback Last Commit'}
        </button>
      </div>
    </div>
  );
};

export default GitControls; 