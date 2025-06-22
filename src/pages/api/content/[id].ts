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

function writeStaticFile(targetLocation: string, content: string): void {
  try {
    const cleanPath = targetLocation.startsWith('/') ? targetLocation.slice(1) : targetLocation;
    const fullPath = join(PUBLIC_DIR, cleanPath);
    const dir = dirname(fullPath);
    
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    writeFileSync(fullPath, content, 'utf8');
    console.log(`Static file written: ${fullPath}`);
  } catch (error) {
    console.error('Error writing static file:', error);
    throw new Error('Failed to write static file');
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid content ID' })
  }

  // Simple auth check for non-GET requests
  const adminSecret = process.env.ADMIN_SECRET
  if (adminSecret && req.method !== 'GET') {
    const providedSecret = req.headers['x-admin-secret']
    if (providedSecret !== adminSecret) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  const content = readContentData()
  const itemIndex = content.findIndex(item => item.id === id)

  if (req.method === 'GET') {
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Content not found' })
    }
    res.status(200).json(content[itemIndex])
  } 
  
  else if (req.method === 'PUT') {
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Content not found' })
    }

    try {
      const { title, type, targetLocation, proposedContent, status, tags, comments } = req.body
      
      // Update the content item
      const updatedItem: ContentItem = {
        ...content[itemIndex],
        title: title || content[itemIndex].title,
        type: type || content[itemIndex].type,
        targetLocation: targetLocation || content[itemIndex].targetLocation,
        proposedContent: proposedContent || content[itemIndex].proposedContent,
        status: status || content[itemIndex].status,
        tags: tags || content[itemIndex].tags,
        comments: comments || content[itemIndex].comments
      }

      // Write static file if content changed
      if (proposedContent && proposedContent !== content[itemIndex].proposedContent) {
        writeStaticFile(updatedItem.targetLocation, proposedContent);
      }

      content[itemIndex] = updatedItem
      writeContentData(content)
      
      res.status(200).json(updatedItem)
    } catch (error) {
      console.error('Content update error:', error);
      res.status(500).json({ error: 'Failed to update content' })
    }
  } 
  
  else if (req.method === 'DELETE') {
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Content not found' })
    }

    content.splice(itemIndex, 1)
    writeContentData(content)
    
    res.status(200).json({ message: 'Content deleted successfully' })
  } 
  
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    res.status(405).json({ error: 'Method not allowed' })
  }
} 