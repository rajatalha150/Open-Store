# Images

This directory holds static images served by the application.

Product, category, and uploaded branding images are managed through the admin panel and stored in Vercel Blob. Product variant image mappings point to existing product gallery URLs; they do not create files in this directory.

## Store Logo

The store logo is managed through the admin panel at **Admin > Settings > Store Logo**. Uploaded logos are stored in Vercel Blob (not in this directory).

**Recommended specifications:**
- Format: PNG or SVG with transparent background
- Max width: 500px
- The header falls back to displaying the store name as text when no logo is set
