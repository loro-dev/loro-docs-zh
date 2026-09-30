import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const routes = require("../lib/translated-routes.json");
const siteOrigin = require("../next-sitemap.config.js").siteUrl.replace(/\/$/, "");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(path.join(root, file), "utf8");
const manifest = JSON.parse(read(".next/server/pages-manifest.json"));
const sitemap = read("public/sitemap-0.xml");

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1].toLowerCase(), m[2]]));
}

for (const route of routes) {
  assert.ok(manifest[route], `Missing built route: ${route}`);
  assert.ok(manifest[route].endsWith(".html"), `Expected static page: ${route}`);
  const html = read(`.next/server/${manifest[route]}`);
  const canonical = `https://cn.loro.dev${route}`;
  const english = `https://loro.dev${route}`;
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1];
  assert.ok(head, `Missing head: ${route}`);
  const links = [...head.matchAll(/<link\b[^>]*>/g)].map(([tag]) => attributes(tag));
  assert.deepEqual(links.filter((link) => link.rel === "canonical").map((link) => link.href), [canonical], route);
  assert.deepEqual(Object.fromEntries(links.filter((link) => link.hreflang).map((link) => [link.hreflang, link.href])),
    { en: english, zh: canonical, "x-default": english }, route);
  assert.match(html, /<html[^>]*lang="zh-CN"/, route);
  assert.match(head, /http-equiv="Content-Language" content="zh-CN"/, route);
  assert.doesNotMatch(html, /href="[^"]*https?(?::|%3A)(?:\/|%2F){2}[^"<]*https?(?::|%3A)/, route);
}

for (const route of ["/docs/api/indent", "/docs/api/method"]) {
  assert.equal(manifest[route], undefined, `Helper still built as page: ${route}`);
  assert.ok(!sitemap.includes(route), `Helper in sitemap: ${route}`);
}
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
assert.ok(sitemapUrls.length > 0);
for (const url of sitemapUrls) {
  assert.equal(new URL(url).origin, siteOrigin, `Wrong sitemap host: ${url}`);
}
assert.ok(read("public/robots.txt").includes(`${siteOrigin}/sitemap.xml`));
for (const feed of ["public/blog.xml", "public/changelog.xml"]) {
  const xml = read(feed);
  assert.doesNotMatch(xml, /https?:\/\/(?:github\.com|twitter\.com)\/https?:\/\//, feed);
  assert.doesNotMatch(xml, /<link>https:\/\/loro\.dev/, feed);
  assert.match(xml, /<link>https:\/\/cn\.loro\.dev/, feed);
}
console.log(`Verified canonical, reciprocal language links and Chinese metadata on ${routes.length} built pages; helper routes absent and sitemap host correct.`);
