export function useDocsConfig() {
  return useRuntimeConfig().public as {
    site: { name: string; tagline: string; domain: string; logo: { text: string; image: string | null; darkImage: string | null } }
    design: { primaryColor: string; darkColor: string; backgroundColor: string; sidebarBackground: string; fontFamily: string; borderRadius: string }
    layout: { sidebarWidth: number; codePanelWidth: number; defaultLanguage: string; showSearch: boolean; showCodePanel: boolean; showBreadcrumb: boolean }
    nav: { footerLinks: { label: string; href: string; external?: boolean }[] }
    api: { baseUrl: string }
  }
}
