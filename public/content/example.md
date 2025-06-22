# Example Content

This is an example markdown file created by the CMS.

When you create content through the CMS interface, it gets written to files like this one in the `public/` directory.

Cloudflare Pages will automatically serve these files as static content.

## How it works:

1. **CMS Interface** → Creates content via API
2. **API writes file** → Saves to `public/content/`
3. **Git commit** → Commits both metadata and static files
4. **GitHub** → Receives the push
5. **Cloudflare Pages** → Auto-deploys static files

Created: 2024-12-19 