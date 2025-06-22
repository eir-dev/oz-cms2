import type { NextApiRequest, NextApiResponse } from 'next'
import { GitOps } from '@/lib/gitOps'

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
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Initialize Git repo if needed
    await GitOps.initializeRepo();
    
    // Get Git status and history
    const [status, history] = await Promise.all([
      GitOps.getStatus(),
      GitOps.getHistory(10)
    ]);
    
    res.status(200).json({
      status,
      history,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Git status error:', error);
    res.status(500).json({ 
      error: 'Failed to get Git status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 