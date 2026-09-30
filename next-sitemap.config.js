/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl: process.env.SITE_URL || "https://cn.loro.dev",

  generateRobotsTxt: true, // (optional)

  // API handlers and former presentation-helper routes are not content pages.
  exclude: ["/api/*", "/docs/api/indent", "/docs/api/method"],
};
