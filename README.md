# Loro Docs

The Chinese documentation source for https://cn.loro.dev/.

# Development

```bash
pnpm install
pnpm dev
```

# SEO checks

```bash
pnpm test:seo
pnpm build
pnpm test:seo:build
```

The build regenerates RSS feeds, sitemaps and robots.txt. API presentation helpers
belong in `components/api-reference/`, never under `pages/`.

`lib/translated-routes.json` lists verified English/Chinese route pairs. Add a
route only when its counterpart is published at https://loro.dev/, then update
the Chinese route list in `loro-dev/loro-docs` after publishing the translation.
Keep the hreflang sets reciprocal and the canonical URL on each page's own host.
The initial list was checked against `loro-dev/loro-docs` main commit
`a9b231a1e9eba7f6dc3f37bb9fc95af8135de870` and this repository's main commit
`24c9bc9ce66e358029787f49358eebb27e3fd328` on 2026-09-30.
