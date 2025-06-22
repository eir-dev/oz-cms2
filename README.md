# OZ CMS 2 - Git-Powered Content Management System

A lightweight, Git-powered CMS built with Next.js 14, TypeScript, and Tailwind CSS. Features real-time content editing with automatic Git commits and an approval workflow system.

## Features

- 📝 Real-time content editing with live preview
- 🔄 Git-powered version control with automatic commits
- 👥 Approval workflow system
- 📱 Responsive design with modern UI
- 🚀 Fast builds and serverless deployment ready
- 📊 Content diff visualization for multiple formats (Markdown, HTML, JSON, Images)

## Development

```bash
# Install dependencies
npm install

# Start development server
PORT=8088 npm run dev
```

Visit `http://localhost:8088` to see the application.

## Deployment

### Google Cloud Run (CMS Application)

The CMS application runs on Google Cloud Run and pushes content to GitHub:

```bash
# Build and deploy to Cloud Run
chmod +x deploy.sh
./deploy.sh YOUR_PROJECT_ID
```

### Cloudflare Pages (Static Site)

Your static site is automatically deployed from GitHub to Cloudflare Pages:

1. Connect your GitHub repository to Cloudflare Pages
2. Configure automatic deployments on push to main branch
3. Your CMS pushes content → GitHub → Cloudflare Pages auto-deploys

### Architecture Flow

```
CMS (Cloud Run) → Git Push → GitHub → Cloudflare Pages (Static Site)
```

## Environment Variables

Create a `.env.local` file:

```env
API_TOKEN=your_secret_token_here
GIT_USER_NAME=Your Name
GIT_USER_EMAIL=your.email@example.com
GITHUB_TOKEN=your_github_personal_access_token
```

## Project Structure

```
src/
├── components/          # React components
│   ├── approval-detail-modal.tsx
│   ├── commit-push-editor.tsx
│   └── git-controls.tsx
├── lib/                # Utilities and Git operations
│   └── gitOps.ts
├── pages/              # Next.js pages and API routes
│   ├── api/            # API endpoints
│   │   ├── content/    # Content CRUD operations
│   │   ├── publish.ts  # Git commit and push
│   │   ├── rollback.ts # Git revert operations
│   │   └── git/        # Git status and operations
│   └── index.tsx       # Main application page
└── data/               # Content storage directory
    └── content/        # Individual content files
```

## Tech Stack

- **Framework:** Next.js 14 with TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Git Operations:** Simple Git
- **CMS Deployment:** Google Cloud Run
- **Static Site:** Cloudflare Pages (auto-deployed from GitHub)

## Git Integration

The CMS automatically handles Git operations:
- Creates commits when content is saved
- Pushes changes to remote repository
- Supports rollback via `git revert`
- Maintains clean commit history with descriptive messages

## API Routes

### Content Management
- `GET /api/content` - Get all content items
- `POST /api/content` - Create new content item
- `GET /api/content/[id]` - Get specific content item
- `PUT /api/content/[id]` - Update content item
- `DELETE /api/content/[id]` - Delete content item

### Git Operations
- `POST /api/publish` - Commit and push changes to Git
- `POST /api/rollback` - Revert last commit
- `GET /api/git/status` - Get repository status and history

## Production Considerations

### Security
- Uses non-root user in Docker container
- Optional API token authentication
- Environment-based configuration

### Performance
- Optimized Docker image with Alpine Linux
- Next.js standalone build for minimal memory usage
- Automatic scaling with Cloud Run (0-10 instances)

### Cost Optimization
- Pay-per-request pricing with Cloud Run
- Automatic scale-to-zero when not in use
- Minimal resource allocation (1 CPU, 1Gi memory)

## License

MIT License 