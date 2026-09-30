const translatedRoutes = require("./translated-routes.json");

const CHINESE_ORIGIN = "https://cn.loro.dev";
const ENGLISH_ORIGIN = "https://loro.dev";

// Verified against both repositories on 2026-09-30. Chinese source:
// loro-dev/loro-docs-zh@24c9bc9ce66e358029787f49358eebb27e3fd328.
// Add a route only once its equivalent is published in both languages.
const translatedRouteSet = new Set(translatedRoutes);

function normalizePath(asPath = "/") {
  const path = asPath.split(/[?#]/)[0].replace(/^\/+|\/+$/g, "");
  return path ? `/${path}` : "/";
}

function getSeoUrls(asPath) {
  const path = normalizePath(asPath);
  return {
    canonicalUrl: `${CHINESE_ORIGIN}${path}`,
    englishUrl: `${ENGLISH_ORIGIN}${path}`,
    hasTranslation: translatedRouteSet.has(path),
  };
}

module.exports = { CHINESE_ORIGIN, ENGLISH_ORIGIN, normalizePath, getSeoUrls };
