/** @type {import("@11ty/eleventy").UserConfig} */
module.exports = function (eleventyConfig) {
  // Path prefix: use env var if set (useful for GitHub Pages), otherwise default "/"
  const pathPrefix = process.env.ELEVENTY_PATH_PREFIX || "/";

  // Make pathPrefix available to templates via global data
  eleventyConfig.addGlobalData("pathPrefix", pathPrefix);

  // Copy static assets straight through to _site/
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy("src/style.css");
  eleventyConfig.addPassthroughCopy("src/script.js");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");

  // Collections: pick up Markdown files under src/posts/ and src/research/
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/**/*.md");
  });

  eleventyConfig.addCollection("research", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/research/**/*.md");
  });

  eleventyConfig.addCollection("announcements", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/announcements/**/*.md")
      .sort((a, b) => a.date - b.date);
  });


  // Simple date filter to support templates like: {{ post.date | date("d MMMM yyyy") }}
  // Defaults to en-GB locale (British English).
  eleventyConfig.addFilter("date", function (dateInput, format = "d MMMM yyyy", locale = "en-GB") {
    if (!dateInput) return "";
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(d)) return "";

    // Map a few commonly used format strings to Intl options.
    // Extend here if you use additional custom formats.
    if (format === "d MMMM yyyy") {
      return d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
    }
    if (format === "d MMM yyyy" || format === "d MMM, yyyy") {
      return d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
    }
    if (format === "yyyy") {
      return d.getFullYear().toString();
    }
    if (format === "dd/MM/yyyy") {
      // zero-padded day/month
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }

    // Fallback — use locale default for safety
    return d.toLocaleDateString(locale);
  });

  // Optional: a convenience filter to trim leading/trailing slashes (useful for some templates)
  eleventyConfig.addFilter("stripSlashes", function (value) {
    return String(value || "").replace(/^\/+|\/+$/g, "");
  });

  // Filter to get unique values from an array
  eleventyConfig.addFilter("unique", function (array) {
    if (!Array.isArray(array)) return [];
    return [...new Set(array)];
  });

  // Filter to push an item to an array
  eleventyConfig.addFilter("push", function (array, item) {
    if (!Array.isArray(array)) return [item];
    return [...array, item];
  });

  // Filter to extract all unique keywords from a collection of posts
  eleventyConfig.addFilter("getAllKeywords", function (posts) {
    if (!Array.isArray(posts)) return [];
    const keywords = new Set();
    posts.forEach(post => {
      if (post.data && post.data.keywords && Array.isArray(post.data.keywords)) {
        post.data.keywords.forEach(keyword => keywords.add(keyword));
      }
    });
    return Array.from(keywords).sort();
  });

  return {
    // This ensures eleventy uses the pathPrefix when building URLs
    pathPrefix: pathPrefix,

    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },

    // Use Nunjucks everywhere (for .njk, .md, .html with front matter)
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",

    // Allow these template formats
    templateFormats: ["html", "md", "njk"]
  };
};
