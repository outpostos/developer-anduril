import type { DocsThemeConfig } from 'nextra-theme-docs'
import {
  AndurilH1,
  AndurilLogo,
  AndurilMain,
  AndurilNavbarLinks
} from './components/anduril-theme'

const config: DocsThemeConfig = {
  logo: <AndurilLogo />,
  logoLink: '/',
  project: {},
  docsRepositoryBase: 'https://github.com/outpostos/developer-anduril/tree/main',
  darkMode: false,
  nextThemes: {
    defaultTheme: 'dark',
    forcedTheme: 'dark',
    storageKey: 'developer-anduril-theme'
  },
  backgroundColor: {
    light: '#ffffff',
    dark: '#111113'
  },
  color: {
    hue: 109,
    saturation: 70,
    lightness: {
      light: 27,
      dark: 61
    }
  },
  head: () => (
    <>
      <link rel="icon" href="/favicon.ico" />
      <meta name="theme-color" content="#111113" />
    </>
  ),
  navbar: {
    extraContent: <AndurilNavbarLinks />
  },
  search: {
    placeholder: 'Search'
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: false,
    autoCollapse: false
  },
  components: {
    h1: AndurilH1
  },
  main: AndurilMain,
  toc: {
    float: true,
    title: 'On this page',
    backToTop: null
  },
  editLink: {
    component: null
  },
  feedback: {
    content: null
  },
  themeSwitch: {
    component: null
  },
  notFound: {
    content: '返回文档首页',
    labels: 'broken-link'
  },
  footer: {
    content: (
      <span className="anduril-footer-content">
        Anduril Developer Documentation 中文版
      </span>
    )
  }
}

export default config
