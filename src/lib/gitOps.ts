import simpleGit, { SimpleGit } from 'simple-git';
import { join } from 'path';

const git: SimpleGit = simpleGit(process.cwd());

// Static repository configuration
const REPO_URL = 'https://github.com/eir-dev/oz-cms2.git';
const REPO_URL_WITH_TOKEN = (token: string) => `https://${token}@github.com/eir-dev/oz-cms2.git`;

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
      const githubToken = process.env.GITHUB_TOKEN;
      
      if (!origin) {
        // No remote configured, set up the repository with or without token
        const repoUrl = githubToken ? REPO_URL_WITH_TOKEN(githubToken) : REPO_URL;
        await git.addRemote('origin', repoUrl);
        console.log('Configured remote repository:', REPO_URL);
      } else {
        // Remote exists, update it with token if available
        if (githubToken) {
          await git.remote(['set-url', 'origin', REPO_URL_WITH_TOKEN(githubToken)]);
          console.log('Updated remote with authentication');
        } else {
          // Ensure it's set to the static URL
          await git.remote(['set-url', 'origin', REPO_URL]);
          console.log('Remote repository configured:', REPO_URL);
        }
      }
    } catch (error) {
      console.warn('Failed to configure remote repository:', error);
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
      
      // Add all changes in both data directory and public content
      await git.add(['./data/*', './public/*']);
      
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
          // Check if main branch exists on remote
          try {
            await git.fetch('origin', 'main');
          } catch (fetchError) {
            // Main branch doesn't exist on remote, create it
            console.log('Creating main branch on remote...');
          }
          
          // Try to push, set upstream if needed
          try {
            await git.push();
          } catch (pushError) {
            // If push fails due to no upstream, set it up
            if (pushError instanceof Error && pushError.message.includes('upstream') || pushError.message.includes('refspec')) {
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
        return {
          success: true,
          message: `Committed successfully, but push failed: ${pushError instanceof Error ? pushError.message : 'Unknown error'}`
        };
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
      await this.ensureRemoteRepository();
      
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