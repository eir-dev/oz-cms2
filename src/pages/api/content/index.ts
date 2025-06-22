import type { NextApiRequest, NextApiResponse } from 'next'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

const DATA_FILE = join(process.cwd(), 'data', 'content.json')
const PUBLIC_DIR = join(process.cwd(), 'public')

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

function writeStaticFile(targetLocation: string, content: string): void {
  try {
    // Remove leading slash and ensure it's under public/
    const cleanPath = targetLocation.startsWith('/') ? targetLocation.slice(1) : targetLocation;
    const fullPath = join(PUBLIC_DIR, cleanPath);
    const dir = dirname(fullPath);
    
    // Create directory if it doesn't exist
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    // Write the content file
    writeFileSync(fullPath, content, 'utf8');
    console.log(`Static file written: ${fullPath}`);
  } catch (error) {
    console.error('Error writing static file:', error);
    throw new Error('Failed to write static file');
  }
}

function readContentData(): ContentItem[] {
  try {
    if (!existsSync(DATA_FILE)) {
      return []
    }
    const data = readFileSync(DATA_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading content data:', error)
    return []
  }
}

function writeContentData(data: ContentItem[]): void {
  try {
    // Ensure data directory exists
    const dataDir = dirname(DATA_FILE);
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing content data:', error)
    throw new Error('Failed to save content')
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple auth check
  const adminSecret = process.env.ADMIN_SECRET
  if (adminSecret && req.method !== 'GET') {
    const providedSecret = req.headers['x-admin-secret']
    if (providedSecret !== adminSecret) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  if (req.method === 'GET') {
    try {
      const content = readContentData()
      res.status(200).json(content)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch content' })
    }
  } else if (req.method === 'POST') {
    try {
      const { title, type, targetLocation, submittedBy, currentContent, proposedContent, tags = [] } = req.body
      
      if (!title || !type || !targetLocation || !submittedBy || !proposedContent) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // Write the static file to public directory
      writeStaticFile(targetLocation, proposedContent);

      const content = readContentData()
      const newItem: ContentItem = {
        id: `edit-${Date.now()}`,
        title,
        type: type as ContentItem['type'],
        targetLocation,
        submittedBy,
        submittedDate: new Date().toISOString(),
        status: 'draft',
        tags,
        currentContent: currentContent || '',
        proposedContent,
        comments: []
      }

      content.push(newItem)
      writeContentData(content)
      
      res.status(201).json({
        ...newItem,
        staticFileWritten: true,
        publicPath: targetLocation
      })
    } catch (error) {
      console.error('Content creation error:', error);
      res.status(500).json({ error: 'Failed to create content' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).json({ error: 'Method not allowed' })
  }
} 