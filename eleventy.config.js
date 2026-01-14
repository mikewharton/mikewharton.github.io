/** @type {import("@11ty/eleventy").UserConfig} */
const path = require("path");
const glob = require("glob");
const yaml = require("js-yaml");
const fs = require("fs");

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension("yml", contents => yaml.load(contents));
  eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));

  // ---------------------------------------------------------------------------
  // Path prefix (GitHub Pages support)
  // ---------------------------------------------------------------------------
  const pathPrefix = process.env.ELEVENTY_PATH_PREFIX || "/";
  eleventyConfig.addGlobalData("pathPrefix", pathPrefix);

  // ---------------------------------------------------------------------------
  // Passthrough copies
  // ---------------------------------------------------------------------------
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy("src/style.css");
  eleventyConfig.addPassthroughCopy("src/script.js");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/research");

  // ---------------------------------------------------------------------------
  // Content collections
  // ---------------------------------------------------------------------------
  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/posts/**/*.md")
  );

  eleventyConfig.addCollection("research", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/research/**/*.md")
  );

  eleventyConfig.addCollection("featuredResearch", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/research/**/*.md")
      .filter(item => item?.data?.featured === true)
      .sort((a, b) => (b.date || 0) - (a.date || 0))
  );

  // ---------------------------------------------------------------------------
  // Per-page computed gallery images (research posts)
  // ---------------------------------------------------------------------------
  eleventyConfig.addGlobalData("eleventyComputed", {
    galleryImages: (data) => {
      if (!data.page?.inputPath) return [];

      // Only apply to research posts
      if (!data.page.inputPath.includes("/research/")) return [];

      const dir = path.dirname(data.page.inputPath);
      if (!fs.existsSync(dir)) return [];

      return fs.readdirSync(dir)
        .filter(f => /\.(png|jpe?g|webp|gif|svg)$/i.test(f))
        .filter(f => !/^hero|^cover/i.test(f))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map(img => ({
          src: data.page.url.replace(/\/$/, "") + "/" + img,
          alt: img.replace(/[-_]/g, " ").replace(/\.\w+$/, "")
        }));
    }
  });

  // ---------------------------------------------------------------------------
  // Music images collection (gallery)
  // ---------------------------------------------------------------------------
  eleventyConfig.addCollection("musicImages", () => {
    const files = glob.sync("src/assets/photos/music/**/*.{jpg,jpeg,png,webp}");

    return files.map((file) => ({
      src: file.replace(/^src\//, "").replace(/\\/g, "/"),
      alt: path
        .basename(file, path.extname(file))
        .replace(/[-_]/g, " ")
    }));
  });

  // ---------------------------------------------------------------------------
  // Art images collection (gallery)
  // ---------------------------------------------------------------------------
  eleventyConfig.addCollection("artImages", () => {
    const files = glob.sync("src/assets/photos/art/**/*.{jpg,jpeg,png,webp}");

    return files.map((file) => ({
      src: file.replace(/^src\//, "").replace(/\\/g, "/"),
      alt: path
        .basename(file, path.extname(file))
        .replace(/[-_]/g, " ")
    }));
  });

  // ---------------------------------------------------------------------------
  // Photography images collection (gallery)
  // ---------------------------------------------------------------------------
  eleventyConfig.addCollection("photographyImages", () => {
    const files = glob.sync("src/assets/photos/photography/**/*.{jpg,jpeg,png,webp}");

    return files.map((file) => ({
      src: file.replace(/^src\//, "").replace(/\\/g, "/"),
      alt: path
        .basename(file, path.extname(file))
        .replace(/[-_]/g, " ")
    }));
  });

  // ---------------------------------------------------------------------------
  // Filters
  // ---------------------------------------------------------------------------
  eleventyConfig.addFilter(
    "date",
    (dateInput, format = "d MMMM yyyy", locale = "en-GB") => {
      if (!dateInput) return "";

      // Handle YYYY-MM (month + year only)
      if (typeof dateInput === "string" && /^\d{4}-\d{2}$/.test(dateInput)) {
        const [year, month] = dateInput.split("-");
        const d = new Date(Number(year), Number(month) - 1, 1);

        return d.toLocaleDateString(locale, {
          month: "long",
          year: "numeric"
        });
      }

      const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
      if (isNaN(d)) return "";

      if (format === "d MMMM yyyy") {
        return d.toLocaleDateString(locale, {
          day: "numeric",
          month: "long",
          year: "numeric"
        });
      }

      if (format === "d MMM yyyy" || format === "d MMM, yyyy") {
        return d.toLocaleDateString(locale, {
          day: "numeric",
          month: "long",
          year: "numeric"
        });
      }

      if (format === "yyyy") {
        return String(d.getFullYear());
      }

      return d.toLocaleDateString(locale);
    }
  );

  eleventyConfig.addFilter("stripSlashes", (value) =>
    String(value || "").replace(/^\/+|\/+$/g, "")
  );

  eleventyConfig.addFilter("unique", (array) =>
    Array.isArray(array) ? [...new Set(array)] : []
  );

  eleventyConfig.addFilter("push", (array, item) =>
    Array.isArray(array) ? [...array, item] : [item]
  );

  eleventyConfig.addFilter("getAllKeywords", (posts) => {
    if (!Array.isArray(posts)) return [];
    const keywords = new Set();
    posts.forEach(post => {
      post?.data?.keywords?.forEach(k => keywords.add(k));
    });
    return [...keywords].sort();
  });

  // Shuffle an array (non-mutating, build-time)
  eleventyConfig.addFilter("shuffle", (array) => {
    if (!Array.isArray(array)) return [];
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });



  // ---------------------------------------------------------------------------
  // Eleventy config
  // ---------------------------------------------------------------------------
  return {
    pathPrefix,

    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },

    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["html", "md", "njk"]
  };
};

