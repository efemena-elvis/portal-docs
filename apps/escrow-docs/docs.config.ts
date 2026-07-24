/**
 * Escrow Docs Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * Central config for site identity, design, and layout.
 * Changes here take effect on the next build / server restart.
 */

const docsConfig = {
  // ── API ────────────────────────────────────────────────────────────────────
  api: {
    baseUrl: "https://api.escrow.vesicash.com",
  },

  // ── Site metadata ──────────────────────────────────────────────────────────
  site: {
    name: "Vesicash Escrow Developer Docs",
    tagline: "Escrow API Integration Guide",
    domain: "docs.escrow.vesicash.com",
    logo: {
      text: "Vesicash Escrow",
      image: "/vesicash-logo.png" as string | undefined,
      darkImage: "/vesicash-dark.png" as string | undefined,
    },
    /** Small pill badge shown beneath the logo's bottom-right corner */
    badge: {
      text: "Escrow",
      visible: true,
    },
  },

  // ── Design ─────────────────────────────────────────────────────────────────
  design: {
    primaryColor: "#3AB75D",
    darkColor: "#011A27",
    backgroundColor: "#FFFFFF",
    sidebarBackground: "#F1F7F6",
    fontFamily: "Inter",
    borderRadius: "md" as "none" | "sm" | "md" | "lg" | "full",
  },

  // ── Layout ─────────────────────────────────────────────────────────────────
  layout: {
    sidebarWidth: 256,
    codePanelWidth: 420,
    defaultLanguage: "curl" as "curl" | "node" | "python" | "php",
    showSearch: true,
    showCodePanel: true,
    showBreadcrumb: true,
  },

  // ── Navigation extras ──────────────────────────────────────────────────────
  nav: {
    footerLinks: [] as { label: string; href: string; external?: boolean }[],
  },

  // ── Topbar links ───────────────────────────────────────────────────────────
  topbar: {
    primaryLinks: [
      { label: "Docs", href: "/", visible: true },
      { label: "API Reference", href: "auto:first-endpoint", visible: true },
      { label: "Guides", href: "auto:first-page", visible: true },
    ] as { label: string; href: string; visible?: boolean }[],

    utilityLinks: [
      {
        label: "Dashboard",
        href: "https://escrow.vesicash.com",
        visible: true,
      },
      {
        label: "Support",
        href: "mailto:developers@vesicash.com",
        visible: true,
      },
    ] as { label: string; href: string; visible?: boolean }[],
  },
};

export default docsConfig;
export type DocsConfig = typeof docsConfig;
