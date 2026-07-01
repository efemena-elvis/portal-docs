/**
 * Vesicash Docs Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * Central config for data sources, design, and layout.
 * Changes here take effect on the next build / server restart.
 *
 * Note: Postman credentials (API key, collection UID) are NOT set here —
 * they live in .env and are read securely via runtimeConfig at runtime.
 */

const docsConfig = {
  // ── API ────────────────────────────────────────────────────────────────────
  api: {
    /**
     * The base URL for all API endpoints. Used in endpoint display and code
     * examples. The Postman collection variable 'base_url' takes precedence
     * when present; this value serves as the project-wide fallback.
     */
    baseUrl: "https://api.portal.vesicash.com",
  },

  // ── Data source ────────────────────────────────────────────────────────────
  source: {
    /**
     * Which source to try first.
     * 'postman' → fetch live from Postman API, fall back to JSON if it fails
     * 'json'    → load from the local JSON file, fall back to Postman if it fails
     */
    priority: "json" as "postman" | "json",

    postman: {
      /** How long (ms) to cache the Postman response in memory between requests */
      cacheTtlMs: 5 * 60 * 1000, // 5 minutes
    },

    json: {
      /**
       * Path to a local Postman collection JSON export, relative to project root.
       * Used as fallback when Postman is unavailable, or as the primary source
       * when priority is 'json'. Set to null to disable JSON fallback entirely.
       */
      path: "./public/collection.json" as string | null,
    },
  },

  // ── Site metadata ──────────────────────────────────────────────────────────
  site: {
    name: "Vesicash Portal Developer Docs",
    tagline: "Merchant API Integration Guide",
    domain: "developers.vesicash.com",
    logo: {
      /** Text shown in the sidebar header */
      text: "Vesicash",
      /** Path to an image in /public — set to override the text logo */
      image: "/vesicash-logo.png" as string | null,
      /** Dark-mode variant — shown when the dark class is active */
      darkImage: "/vesicash-dark.png" as string | null,
    },
  },

  // ── Design ─────────────────────────────────────────────────────────────────
  design: {
    /** Primary accent — used for active nav items, links, and badges */
    primaryColor: "#3AB75D",
    /** Dark background used in the code panel and hero areas */
    darkColor: "#011A27",
    /** Page background */
    backgroundColor: "#FFFFFF",
    /** Sidebar background */
    sidebarBackground: "#F1F7F6",
    /** Body font — must be available on Google Fonts */
    fontFamily: "Inter",
    /** Border radius scale applied across components */
    borderRadius: "md" as "none" | "sm" | "md" | "lg" | "full",
  },

  // ── Layout ─────────────────────────────────────────────────────────────────
  layout: {
    /** Width of the left navigation sidebar in pixels */
    sidebarWidth: 256,
    /** Width of the right code panel in pixels */
    codePanelWidth: 420,
    /** Default language tab shown in code examples */
    defaultLanguage: "curl" as "curl" | "node" | "python" | "php",
    /** Show the ⌘K search bar in the sidebar */
    showSearch: true,
    /** Show the right-hand code panel on endpoint pages */
    showCodePanel: true,
    /** Show breadcrumb navigation on endpoint pages */
    showBreadcrumb: true,
  },

  // ── Navigation extras ──────────────────────────────────────────────────────
  nav: {
    /**
     * Extra links shown at the bottom of the sidebar, below the auto-generated
     * collection nav. Add external links with external: true.
     */
    footerLinks: [] as { label: string; href: string; external?: boolean }[],
  },
};

export default docsConfig;
export type DocsConfig = typeof docsConfig;
