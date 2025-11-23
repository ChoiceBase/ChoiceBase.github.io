/**
 * Generate sitemap.xml dynamically
 * Run: node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const baseUrl = 'https://choicebase.github.io';
const currentDate = new Date().toISOString().split('T')[0];

const pages = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/html/resource-list.html?category=ai-tools', priority: '0.9', changefreq: 'weekly' },
  { loc: '/html/resource-list.html?category=jobs', priority: '0.9', changefreq: 'weekly' },
  { loc: '/html/resource-list.html?category=programming', priority: '0.9', changefreq: 'weekly' },
  { loc: '/html/resource-list.html?category=upskilling', priority: '0.9', changefreq: 'weekly' },
  { loc: '/html/career_nexus.html', priority: '0.8', changefreq: 'monthly' },
  { loc: '/html/contact.html', priority: '0.7', changefreq: 'monthly' },
  { loc: '/html/org.html', priority: '0.6', changefreq: 'monthly' },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemap, 'utf8');
console.log('✅ Sitemap generated successfully at:', sitemapPath);

