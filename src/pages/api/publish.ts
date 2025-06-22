import type { NextApiRequest, NextApiResponse } from 'next'
import { GitOps } from '@/lib/gitOps'

interface PublishRequest {
  message: string;
  author: string;
}

function isAuthorized(req: NextApiRequest): boolean {
  const apiToken = process.env.API_TOKEN;
  if (!apiToken) return true; // No auth required if no token set
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  return token === apiToken;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { message, author }: PublishRequest = req.body;
    
    if (!message || !author) {
      return res.status(400).json({ 
        error: 'Missing required fields: message and author' 
      });
    }

    // Initialize Git repo if needed
    await GitOps.initializeRepo();
    
    // Commit and push changes
    const result = await GitOps.commitAndPush({ message, author });
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.message,
        details: result.error
      });
    }
  } catch (error) {
    console.error('Publish error:', error);
    res.status(500).json({ 
      error: 'Failed to publish changes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 