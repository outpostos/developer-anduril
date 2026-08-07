import type { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <strong>Anduril 开发者文档</strong>,
  project: {
    link: 'https://github.com/outpostos/developer-anduril'
  },
  docsRepositoryBase: 'https://github.com/outpostos/developer-anduril/tree/main',
  darkMode: true,
  nextThemes: {
    defaultTheme: 'dark',
    storageKey: 'developer-anduril-theme'
  },
  backgroundColor: {
    light: '#ffffff',
    dark: '#111113'
  },
  search: {
    component: null
  },
  editLink: {
    component: null
  },
  feedback: {
    content: null
  },
  footer: {
    content: 'Anduril 开发者文档站中文版'
  }
}

export default config
