import type { ComponentProps, ReactNode } from 'react'
import { useState } from 'react'
import { useConfig } from 'nextra-theme-docs'
import { useFSRoute } from 'nextra/hooks'

const groups = [
  ['/guides/concepts', 'Concepts'],
  ['/guides/getting-started', 'Getting started'],
  ['/guides/best-practices', 'Best practices'],
  ['/guides/developer-tools', 'Developer tools'],
  ['/guides/entities', 'Entities'],
  ['/guides/tasks', 'Tasks'],
  ['/guides/objects', 'Objects'],
  ['/reference', 'Reference'],
  ['/samples', 'Samples'],
  ['/license', 'License'],
  ['/changelog', 'Changelog']
] as const

function getEyebrow(route: string, fallback?: string) {
  const match = groups.find(([prefix]) => route === prefix || route.startsWith(`${prefix}/`))
  return match?.[1] || fallback || 'Anduril'
}

export function AndurilLogo() {
  return (
    <span className="anduril-brand" aria-label="ANDURIL">
      <img src="/brand/anduril-logo.svg" alt="" />
    </span>
  )
}

export function AndurilNavbarLinks() {
  return (
    <div className="anduril-navbar-links">
      <a href="mailto:lattice-developers@anduril.com">Contact</a>
      <a href="https://www.anduril.com/lattice-sdk/" target="_blank" rel="noreferrer">
        Learn More
      </a>
    </div>
  )
}

export function AndurilMain({ children }: { children: ReactNode }) {
  return <div className="anduril-main">{children}</div>
}

export function AndurilH1(props: ComponentProps<'h1'>) {
  const route = useFSRoute()
  const { title } = useConfig()
  return (
    <div className="anduril-title-block">
      <div className="anduril-eyebrow">{getEyebrow(route, title)}</div>
      <div className="anduril-heading-row">
        <h1 {...props} />
        <CopyPageButton />
      </div>
    </div>
  )
}

function CopyPageButton() {
  const [copied, setCopied] = useState(false)

  async function copyPage() {
    if (typeof window === 'undefined') return
    await navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button className="anduril-copy-page" type="button" onClick={copyPage}>
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      <span>{copied ? 'Copied' : 'Copy page'}</span>
      <ChevronDown aria-hidden="true" className="anduril-copy-chevron" />
    </button>
  )
}

function Copy(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

function Check(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function ChevronDown(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
