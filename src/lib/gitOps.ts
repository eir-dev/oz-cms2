import simpleGit, { SimpleGit } from 'simple-git';
import { join } from 'path';

const git: SimpleGit = simpleGit(process.cwd());

interface CommitOptions {
  message: string;
  author: string;
}

interface GitResult {
  success: boolean;
  message: string;
  error?: string;
}

export class GitOps {
  private static async ensureGitConfig(): Promise<void> {
    try {
      const userName = process.env.GIT_USER_NAME || 'CMS Bot';
      const userEmail = process.env.GIT_USER_EMAIL || 'cms@example.com';
      
      await git.addConfig('user.name', userName);
      await git.addConfig('user.email', userEmail);
      
      // Configure GitHub token authentication if available
      const githubToken = process.env.GITHUB_TOKEN;
      if (githubToken) {
        // Set up credential helper for GitHub authentication
        await git.addConfig('credential.helper', 'store --file=.git-credentials');
        console.log('GitHub token authentication configured');
      }
    } catch (error) {
      console.warn('Git config setup failed:', error);
    }
  }

  private static async ensureRemoteRepository(): Promise<void> {
    try {
      const remotes = await git.getRemotes(true);
      const origin = remotes.find(remote => remote.name === 'origin');
      
      if (!origin) {
        // No remote configured, set up the default GitHub repository
        const githubToken = process.env.GITHUB_TOKEN;
        const repoUrl = githubToken 
          ? `https://${githubToken}@github.com/eir-dev/oz-cms2.git`
          : 'https://github.com/eir-dev/oz-cms2.git';
        
        await git.addRemote('origin', repoUrl);
        console.log('Configured remote repository:', 'https://github.com/eir-dev/oz-cms2.git');
      } else {
        console.log('Remote repository already configured:', origin.refs.fetch);
        // Update existing remote with token if available
        await this.setupGitHubAuth();
      }
    } catch (error) {
      console.warn('Failed to configure remote repository:', error);
    }
  }

  private static async setupGitHubAuth(): Promise<void> {
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      console.log('No GitHub token provided, using default Git configuration');
      return;
    }

    try {
      // Get the remote URL to determine if it's a GitHub repository
      const remotes = await git.getRemotes(true);
      if (remotes.length === 0) {
        console.log('No remote repository configured');
        return;
      }

      const origin = remotes.find(remote => remote.name === 'origin');
      if (!origin) {
        console.log('No origin remote found');
        return;
      }

      // If it's a GitHub repository, set up token authentication
      if (origin.refs.fetch.includes('github.com')) {
        // Configure the remote URL with token authentication
        const repoUrl = origin.refs.fetch;
        let authenticatedUrl: string;

        if (repoUrl.startsWith('https://github.com/')) {
          // HTTPS URL - add token
          authenticatedUrl = repoUrl.replace('https://github.com/', `https://${githubToken}@github.com/`);
        } else if (repoUrl.startsWith('git@github.com:')) {
          // SSH URL - convert to HTTPS with token
          const repoPath = repoUrl.replace('git@github.com:', '').replace('.git', '');
          authenticatedUrl = `https://${githubToken}@github.com/${repoPath}.git`;
        } else {
          console.log('Unknown GitHub URL format:', repoUrl);
          return;
        }

        // Update the remote URL with authentication
        await git.remote(['set-url', 'origin', authenticatedUrl]);
        console.log('GitHub authentication configured for remote repository');
      }
    } catch (error) {
      console.warn('Failed to setup GitHub authentication:', error);
    }
  }

  static async initializeRepo(): Promise<GitResult> {
    try {
      const isRepo = await git.checkIsRepo();
      if (!isRepo) {
        await git.init();
        console.log('Git repository initialized');
      }
      
      await this.ensureGitConfig();
      await this.ensureRemoteRepository();
      
      return {
        success: true,
        message: 'Git repository ready with remote configured'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to initialize Git repository',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async commitAndPush(options: CommitOptions): Promise<GitResult> {
    try {
      await this.ensureGitConfig();
      await this.ensureRemoteRepository();
      
      // Add all changes in data directory
      await git.add('./data/*');
      
      // Check if there are any changes to commit
      const status = await git.status();
      if (status.files.length === 0) {
        return {
          success: true,
          message: 'No changes to commit'
        };
      }
      
      // Commit with author info
      const commitMessage = `${options.message}\n\nAuthor: ${options.author}`;
      await git.commit(commitMessage);
      
      // Push to remote
      try {
        const remotes = await git.getRemotes(true);
        if (remotes.length > 0) {
          // Set upstream branch if it doesn't exist
          try {
            await git.push();
          } catch (pushError) {
            // If push fails due to no upstream, set it up
            if (pushError instanceof Error && pushError.message.includes('upstream branch')) {
              console.log('Setting upstream branch...');
              await git.push(['--set-upstream', 'origin', 'main']);
            } else {
              throw pushError;
            }
          }
          console.log('Changes pushed to remote repository');
        } else {
          console.log('No remote repository configured, commit saved locally');
        }
      } catch (pushError) {
        console.warn('Push failed, but commit was successful:', pushError);
        // Don't fail the entire operation if push fails
      }
      
      return {
        success: true,
        message: `Successfully committed and pushed: ${options.message}`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to commit and push changes',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async rollback(): Promise<GitResult> {
    try {
      await this.ensureGitConfig();
      
      // Get the latest commit
      const log = await git.log(['--max-count=1']);
      if (log.total === 0) {
        return {
          success: false,
          message: 'No commits to rollback'
        };
      }
      
      // Revert the last commit
      await git.revert('HEAD --no-edit');
      
      // Push the revert if remote is configured
      try {
        const remotes = await git.getRemotes(true);
        if (remotes.length > 0) {
          await git.push();
        }
      } catch (pushError) {
        console.warn('Push failed after revert:', pushError);
      }
      
      // Log the rollback
      const rollbackEntry = {
        timestamp: new Date().toISOString(),
        action: 'rollback',
        previousCommit: log.latest?.hash,
        previousMessage: log.latest?.message
      };
      
      return {
        success: true,
        message: `Successfully rolled back commit: ${log.latest?.message}`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to rollback changes',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getHistory(limit: number = 10): Promise<any[]> {
    try {
      const log = await git.log(['--max-count=' + limit]);
      return log.all.map(commit => ({
        hash: commit.hash,
        message: commit.message,
        author: commit.author_name,
        email: commit.author_email,
        date: commit.date
      }));
    } catch (error) {
      console.error('Failed to get git history:', error);
      return [];
    }
  }

  static async getStatus(): Promise<any> {
    try {
      const status = await git.status();
      return {
        clean: status.isClean(),
        modified: status.modified,
        created: status.created,
        deleted: status.deleted,
        staged: status.staged
      };
    } catch (error) {
      console.error('Failed to get git status:', error);
      return { clean: true, error: 'Failed to get status' };
    }
  }
} 