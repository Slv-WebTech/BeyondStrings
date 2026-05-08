import 'dotenv/config';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const ROUTES_FILE = path.resolve(ROOT, 'scripts', 'sitemap-routes.json');
const PUBLIC_DIR = path.resolve(ROOT, 'public');

function normalizeBaseUrl(input) {
    const value = String(input || '').trim();
    if (!value) {
        return 'https://beyondstrings.app';
    }
    try {
        const asUrl = new URL(value);
        return `${asUrl.origin}`;
    } catch {
        return value.replace(/\/$/, '');
    }
}

function normalizePath(routePath) {
    const raw = String(routePath || '').trim();
    if (!raw) return '/';
    if (raw === '/') return '/';
    return raw.startsWith('/') ? raw : `/${raw}`;
}

function xmlEscape(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');
}

async function readConfiguredRoutes() {
    try {
        const raw = await readFile(ROUTES_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function readEnvRoutes() {
    return String(process.env.PUBLIC_CONTENT_PATHS || '')
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((routePath) => ({
            path: routePath,
            changefreq: 'weekly',
            priority: 0.8
        }));
}

function dedupeRoutes(routes) {
    const seen = new Set();
    return routes.filter((item) => {
        const key = normalizePath(item.path);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function renderSitemap(baseUrl, routes) {
    const today = new Date().toISOString().slice(0, 10);
    const entries = routes.map((route) => {
        const routePath = normalizePath(route.path);
        const loc = routePath === '/' ? `${baseUrl}/` : `${baseUrl}${routePath}`;
        const changefreq = route.changefreq || 'weekly';
        const priority = Number.isFinite(Number(route.priority)) ? Number(route.priority).toFixed(1) : '0.8';
        return [
            '  <url>',
            `    <loc>${xmlEscape(loc)}</loc>`,
            `    <lastmod>${today}</lastmod>`,
            `    <changefreq>${xmlEscape(changefreq)}</changefreq>`,
            `    <priority>${priority}</priority>`,
            '  </url>'
        ].join('\n');
    });

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...entries,
        '</urlset>',
        ''
    ].join('\n');
}

function renderRobots(baseUrl) {
    const lines = [
        'User-agent: *',
        'Allow: /',
        '',
        '# Do not index authenticated/private app routes',
        'Disallow: /admin',
        'Disallow: /chat',
        'Disallow: /chat/',
        'Disallow: /home',
        'Disallow: /profile',
        'Disallow: /imported/',
        'Disallow: /login',
        'Disallow: /sign-up',
        '',
        `Sitemap: ${baseUrl}/sitemap.xml`,
        ''
    ];
    return lines.join('\n');
}

async function main() {
    const baseUrl = normalizeBaseUrl(process.env.PUBLIC_APP_URL || process.env.SITE_URL);
    const configuredRoutes = await readConfiguredRoutes();
    const envRoutes = readEnvRoutes();
    const routes = dedupeRoutes([...configuredRoutes, ...envRoutes]);
    const safeRoutes = routes.length ? routes : [{ path: '/', changefreq: 'weekly', priority: 1.0 }];

    const sitemap = renderSitemap(baseUrl, safeRoutes);
    const robots = renderRobots(baseUrl);

    await writeFile(path.resolve(PUBLIC_DIR, 'sitemap.xml'), sitemap, 'utf8');
    await writeFile(path.resolve(PUBLIC_DIR, 'robots.txt'), robots, 'utf8');

    console.log(`SEO assets generated for ${baseUrl}`);
    console.log(`sitemap routes: ${safeRoutes.map((r) => normalizePath(r.path)).join(', ')}`);
}

main().catch((error) => {
    console.error('Failed to generate sitemap/robots:', error);
    process.exit(1);
});
