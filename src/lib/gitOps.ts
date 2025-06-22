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
    } catch (error) {
      console.warn('Git config setup failed:', error);
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
      
      return {
        success: true,
        message: 'Git repository ready'
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
      
      // Push to remote if configured
      try {
        const remotes = await git.getRemotes(true);
        if (remotes.length > 0) {
          await git.push();
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
        message: `Successfully committed: ${options.message}`
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