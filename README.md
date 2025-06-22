# OZ CMS 2.0

A lightweight content management system with approval workflow, built with Next.js and designed for deployment on Vercel.

## Features

- **Approval Detail Modal**: Comprehensive modal for reviewing content changes with side-by-side diff viewing
- **Multiple Content Types**: Support for Markdown, HTML, JSON, and Image content
- **Comment System**: Built-in commenting for collaboration during review process
- **Approval Workflow**: Simple workflow from draft → review → approval → published
- **No External Dependencies**: Uses local JSON file storage for simplicity

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view the application

### Environment Variables

For production deployment, set the following environment variable:

- `ADMIN_SECRET`: Secret key for protecting write operations (optional)

## Project Structure

```
├── src/
│   ├── components/          # React components
│   │   └── approval-detail-modal.tsx
│   ├── pages/              # Next.js pages
│   │   ├── api/            # API routes
│   │   ├── _app.tsx        # App wrapper
│   │   └── index.tsx       # Main demo page
│   └── styles/             # Global styles
├── data/
│   └── content.json        # Content storage
└── vercel.json             # Vercel deployment config
```

## API Routes

- `GET /api/content` - Get all content items
- `POST /api/content` - Create new content item
- `GET /api/content/[id]` - Get specific content item
- `PUT /api/content/[id]` - Update content item
- `DELETE /api/content/[id]` - Delete content item

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set `ADMIN_SECRET` environment variable (optional)
4. Deploy

The app will automatically deploy and be available at your Vercel URL.

## Demo

The main page includes a demonstration of the ApprovalDetailModal component with sample content in different formats (Markdown, HTML, JSON, Images).

## Development

To add new features:

1. Create components in `src/components/`
2. Add pages in `src/pages/` 
3. Add API routes in `src/pages/api/`
4. Update content structure in `data/content.json`

## License

MIT License 