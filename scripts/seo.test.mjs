import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { getSeoUrls, normalizePath } = require("../lib/seo.js");
const routes = require("../lib/translated-routes.json");
const sitemap = require("../next-sitemap.config.js");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(path.join(root, file), "utf8");

function contentFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? contentFiles(file) : /\.mdx?$/.test(file) ? [file] : [];
  });
}

test("canonical paths omit tracking queries, fragments and trailing slashes", () => {
  for (const input of [undefined, "", "/", "/?lang=zh#top"]) {
    assert.equal(normalizePath(input), "/");
  }
  for (const input of ["/docs/", "docs", "/docs?utm_source=test#top", "/docs/#top"]) {
    assert.equal(normalizePath(input), "/docs");
  }
  assert.equal(getSeoUrls("/docs/api/js/?utm_source=test#lorotext").canonicalUrl,
    "https://cn.loro.dev/docs/api/js");
});

test("language alternates require a verified equivalent content route", () => {
  assert.equal(new Set(routes).size, routes.length);
  const sourceRoutes = new Set(contentFiles(path.join(root, "pages")).map((file) => {
    const route = `/${path.relative(path.join(root, "pages"), file)}`
      .replace(/\.mdx?$/, "").replace(/\/index$/, "");
    return route || "/";
  }));
  for (const route of routes) {
    assert.ok(sourceRoutes.has(route), `Missing Chinese content: ${route}`);
    assert.equal(getSeoUrls(`${route}?source=test`).hasTranslation, true);
    assert.equal(getSeoUrls(route).englishUrl, `https://loro.dev${route}`);
  }
  for (const route of ["/docs/api/indent", "/docs/api/method", "/404",
    "/blog/mergeable-containers", "/changelog/v1.9.0", "/docs/advanced/jsonpath",
    "/blog/crdt-is-not-enough", "/a-future-untranslated-page"]) {
    assert.equal(getSeoUrls(route).hasTranslation, false);
  }
});

test("API presentation helpers live outside the route directory", () => {
  for (const file of ["indent.jsx", "method.jsx", "api-reference.module.css"]) {
    assert.equal(existsSync(path.join(root, "pages/docs/api", file)), false);
  }
  for (const file of ["Indent.jsx", "Method.jsx", "api-reference.module.css"]) {
    assert.ok(existsSync(path.join(root, "components/api-reference", file)));
  }
  assert.match(read("pages/docs/api/js.mdx"), /components\/api-reference\/Indent/);
  assert.match(read("pages/docs/api/js.mdx"), /components\/api-reference\/Method/);
  assert.match(read("pages/docs/api/js.mdx"), /components\/api-reference\/api-reference\.module\.css/);
  assert.ok(sitemap.exclude.includes("/docs/api/indent"));
  assert.ok(sitemap.exclude.includes("/docs/api/method"));
  assert.ok(sitemap.exclude.includes("/api/*"));
});

test("Chinese metadata and sitemap use the Chinese origin", () => {
  assert.equal(sitemap.siteUrl, process.env.SITE_URL || "https://cn.loro.dev");
  const theme = read("theme.config.jsx");
  assert.match(theme, /<link rel="canonical" href=\{canonicalUrl\}/);
  assert.match(theme, /httpEquiv="Content-Language" content="zh-CN"/);
  assert.match(theme, /hrefLang="en" href=\{englishUrl\}/);
  assert.match(theme, /hrefLang="zh" href=\{canonicalUrl\}/);
  assert.match(theme, /hrefLang="x-default" href=\{englishUrl\}/);
  assert.match(theme, /hasTranslation &&/);
  assert.match(theme, /loro-dev\/loro-docs-zh\/tree\/main/);
  assert.match(read("pages/_document.tsx"), /<Html lang="zh-CN">/);
  assert.match(read("gen-rss.js"), /const BASE_URL = "https:\/\/cn\.loro\.dev"/);
  assert.match(JSON.parse(read("package.json")).scripts.build, /gen-rss\.js/);
});

test("malformed translated links are repaired without changing their destinations", () => {
  for (const file of contentFiles(path.join(root, "pages"))) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /https?:\/\/(?:github\.com|twitter\.com)\/https?:\/\//, file);
  }
  for (const [file, target] of [
    ["pages/blog/v1.0.mdx", "automerge-paper-bench"],
    ["pages/blog/v1.0.mdx", "loro-blog-examples"],
    ["pages/docs/performance/native.mdx", "crdt-bench-native"],
    ["pages/docs/performance/index.md", "crdt-benchmarks"],
    ["pages/blog/crdt-richtext.mdx", "fugue-bench"],
  ]) {
    assert.ok(read(file).includes(`https://github.com/zxch3n/${target}`));
  }
  assert.match(read("pages/about.mdx"), /\[Zixuan Chen\]\(https:\/\/github\.com\/zxch3n\)/);
  assert.match(read("pages/docs/api/js.mdx"), /\[富文本博文\]\(\/blog\/loro-richtext\)。/);
  assert.doesNotMatch(read("pages/docs/api/js.mdx"), /https:\/\/loro\.dev\/blog\/loro-richtext。/);
});

test("API and event documentation compile with literal version comparisons", async () => {
  const { compileMdx } = await import("nextra/compile");
  for (const file of ["pages/docs/api/js.mdx", "pages/docs/tutorial/event.mdx"]) {
    await compileMdx(read(file), { filePath: path.join(root, file), codeHighlight: false });
  }
});
