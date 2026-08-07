import fs from 'node:fs/promises'
import path from 'node:path'
import * as parse5 from 'parse5'

const ROOT = process.cwd()
const MIRROR_ROOT = path.join(ROOT, 'developer.anduril.com')
const PAGES_ROOT = path.join(ROOT, 'pages')
const PUBLIC_IMG_ROOT = path.join(ROOT, 'public', 'img')

// Mirror path -> target pages/ path mapping. This table is intentionally
// explicit so extraction scope and navigation granularity remain deterministic.
const PAGE_MAP = [
  ['developer.anduril.com/guides/concepts/principles.html', 'pages/guides/concepts/principles.mdx'],
  ['developer.anduril.com/guides/getting-started/quickstart.html', 'pages/guides/getting-started/quickstart.mdx'],
  ['developer.anduril.com/guides/getting-started/set-up.html', 'pages/guides/getting-started/set-up.mdx'],
  ['developer.anduril.com/guides/getting-started/authenticate.html', 'pages/guides/getting-started/authenticate.mdx'],
  ['developer.anduril.com/guides/entities/overview.html', 'pages/guides/entities/overview.mdx'],
  ['developer.anduril.com/guides/entities/publish.html', 'pages/guides/entities/publish.mdx'],
  ['developer.anduril.com/guides/entities/watch.html', 'pages/guides/entities/watch.mdx'],
  ['developer.anduril.com/guides/tasks/overview.html', 'pages/guides/tasks/overview.mdx'],
  ['developer.anduril.com/guides/tasks/define-a-task.html', 'pages/guides/tasks/define-a-task.mdx'],
  ['developer.anduril.com/guides/tasks/command-and-operate.html', 'pages/guides/tasks/command-and-operate.mdx'],
  ['developer.anduril.com/guides/tasks/integrate-an-agent.html', 'pages/guides/tasks/integrate-an-agent.mdx'],
  ['developer.anduril.com/guides/objects/overview.html', 'pages/guides/objects/overview.mdx'],
  ['developer.anduril.com/guides/objects/upload.html', 'pages/guides/objects/upload.mdx'],
  ['developer.anduril.com/guides/objects/download.html', 'pages/guides/objects/download.mdx'],
  ['developer.anduril.com/guides/objects/manage.html', 'pages/guides/objects/manage.mdx'],
  ['developer.anduril.com/guides/best-practices/choose-a-protocol.html', 'pages/guides/best-practices/choose-a-protocol.mdx'],
  ['developer.anduril.com/guides/best-practices/configure-certificates.html', 'pages/guides/best-practices/configure-certificates.mdx'],
  ['developer.anduril.com/guides/best-practices/retry-connections.html', 'pages/guides/best-practices/retry-connections.mdx'],
  ['developer.anduril.com/guides/developer-tools/registry.html', 'pages/guides/developer-tools/registry.mdx'],
  ['developer.anduril.com/guides/developer-tools/sandboxes.html', 'pages/guides/developer-tools/sandboxes.mdx'],
  ['developer.anduril.com/guides/developer-tools/skills.html', 'pages/guides/developer-tools/skills.mdx'],
  ['developer.anduril.com/reference/overview/overview.html', 'pages/reference/overview/overview.mdx'],
  ['developer.anduril.com/reference/overview/versioning/migrating-to-v2.html', 'pages/reference/overview/versioning/migrating-to-v2.mdx'],
  ['developer.anduril.com/reference/rest/entities/publish-entity.html', 'pages/reference/rest/entities/publish-entity.mdx'],
  ['developer.anduril.com/reference/rest/entities/get-entity.html', 'pages/reference/rest/entities/get-entity.mdx'],
  ['developer.anduril.com/reference/rest/entities/override-entity.html', 'pages/reference/rest/entities/override-entity.mdx'],
  ['developer.anduril.com/reference/rest/entities/remove-entity-override.html', 'pages/reference/rest/entities/remove-entity-override.mdx'],
  ['developer.anduril.com/reference/rest/entities/stream-entities.html', 'pages/reference/rest/entities/stream-entities.mdx'],
  ['developer.anduril.com/reference/rest/entities/long-poll-entity-events.html', 'pages/reference/rest/entities/long-poll-entity-events.mdx'],
  ['developer.anduril.com/reference/rest/tasks/create-task.html', 'pages/reference/rest/tasks/create-task.mdx'],
  ['developer.anduril.com/reference/rest/tasks/get-task.html', 'pages/reference/rest/tasks/get-task.mdx'],
  ['developer.anduril.com/reference/rest/tasks/query-tasks.html', 'pages/reference/rest/tasks/query-tasks.mdx'],
  ['developer.anduril.com/reference/rest/tasks/cancel-task.html', 'pages/reference/rest/tasks/cancel-task.mdx'],
  ['developer.anduril.com/reference/rest/tasks/update-task-status.html', 'pages/reference/rest/tasks/update-task-status.mdx'],
  ['developer.anduril.com/reference/rest/tasks/stream-tasks.html', 'pages/reference/rest/tasks/stream-tasks.mdx'],
  ['developer.anduril.com/reference/rest/tasks/listen-as-agent.html', 'pages/reference/rest/tasks/listen-as-agent.mdx'],
  ['developer.anduril.com/reference/rest/tasks/stream-as-agent.html', 'pages/reference/rest/tasks/stream-as-agent.mdx'],
  ['developer.anduril.com/reference/rest/tasks/stream-manual-control-frames.html', 'pages/reference/rest/tasks/stream-manual-control-frames.mdx'],
  ['developer.anduril.com/reference/rest/objects/upload-object.html', 'pages/reference/rest/objects/upload-object.mdx'],
  ['developer.anduril.com/reference/rest/objects/get-object.html', 'pages/reference/rest/objects/get-object.mdx'],
  ['developer.anduril.com/reference/rest/objects/get-object-metadata.html', 'pages/reference/rest/objects/get-object-metadata.mdx'],
  ['developer.anduril.com/reference/rest/objects/list-objects.html', 'pages/reference/rest/objects/list-objects.mdx'],
  ['developer.anduril.com/reference/rest/objects/delete-object.html', 'pages/reference/rest/objects/delete-object.mdx'],
  ['developer.anduril.com/reference/rest/oauth/get-token.html', 'pages/reference/rest/oauth/get-token.mdx'],
  ['developer.anduril.com/reference/grpc/anduril-entitymanager-v-1/entity-manager-api/anduril-entitymanager-v-1-get-entity.html', 'pages/reference/grpc/entitymanager-v1/get-entity.mdx'],
  ['developer.anduril.com/reference/grpc/anduril-entitymanager-v-1/entity-manager-api/anduril-entitymanager-v-1-publish-entity.html', 'pages/reference/grpc/entitymanager-v1/publish-entity.mdx'],
  ['developer.anduril.com/reference/grpc/anduril-entitymanager-v-1/entity-manager-api/anduril-entitymanager-v-1-publish-entities.html', 'pages/reference/grpc/entitymanager-v1/publish-entities.mdx'],
  ['developer.anduril.com/reference/grpc/anduril-entitymanager-v-1/entity-manager-api/anduril-entitymanager-v-1-override-entity.html', 'pages/reference/grpc/entitymanager-v1/override-entity.mdx'],
  ['developer.anduril.com/reference/grpc/anduril-entitymanager-v-1/entity-manager-api/anduril-entitymanager-v-1-remove-entity-override.html', 'pages/reference/grpc/entitymanager-v1/remove-entity-override.mdx'],
  ['developer.anduril.com/reference/grpc/anduril-entitymanager-v-1/entity-manager-api/anduril-entitymanager-v-1-stream-entity-components.html', 'pages/reference/grpc/entitymanager-v1/stream-entity-components.mdx'],
  ['developer.anduril.com/reference/grpc/anduril-taskmanager-v-1/task-manager-api/anduril-taskmanager-v-1-create-task.html', 'pages/reference/grpc/taskmanager-v1/create-task.mdx'],
  ['developer.anduril.com/reference/grpc/anduril-taskmanager-v-1/task-manager-api/anduril-taskmanager-v-1-get-task.html', 'pages/reference/grpc/taskmanager-v1/get-task.mdx'],
  ['developer.anduril.com/reference/grpc/anduril-taskmanager-v-1/task-manager-api/anduril-taskmanager-v-1-query-tasks.html', 'pages/reference/grpc/taskmanager-v1/query-tasks.mdx'],
  ['developer.anduril.com/reference/grpc/anduril-taskmanager-v-1/task-manager-api/anduril-taskmanager-v-1-cancel-task.html', 'pages/reference/grpc/taskmanager-v1/cancel-task.mdx'],
  ['developer.anduril.com/reference/grpc/anduril-taskmanager-v-1/task-manager-api/anduril-taskmanager-v-1-update-status.html', 'pages/reference/grpc/taskmanager-v1/update-status.mdx'],
  ['developer.anduril.com/reference/grpc/anduril-taskmanager-v-1/task-manager-api/anduril-taskmanager-v-1-stream-tasks.html', 'pages/reference/grpc/taskmanager-v1/stream-tasks.mdx'],
  ['developer.anduril.com/reference/grpc/anduril-taskmanager-v-1/task-manager-api/anduril-taskmanager-v-1-listen-as-agent.html', 'pages/reference/grpc/taskmanager-v1/listen-as-agent.mdx'],
  ['developer.anduril.com/reference/grpc/anduril-taskmanager-v-1/task-manager-api/anduril-taskmanager-v-1-listen-for-manual-control-frames.html', 'pages/reference/grpc/taskmanager-v1/listen-for-manual-control-frames.mdx'],
  ['developer.anduril.com/samples/overview.html', 'pages/samples/overview.mdx'],
  ['developer.anduril.com/license.html', 'pages/license.mdx'],
  ['developer.anduril.com/changelog.html', 'pages/changelog.mdx']
]

const CHANGELOG_PAGE_MAP = [
  ['developer.anduril.com/changelog/2026/8/3.html', 'pages/changelog/2026/8/3.mdx'],
  ['developer.anduril.com/changelog/2026/7/23.html', 'pages/changelog/2026/7/23.mdx'],
  ['developer.anduril.com/changelog/2026/6/9.html', 'pages/changelog/2026/6/9.mdx'],
  ['developer.anduril.com/changelog/2026/5/11.html', 'pages/changelog/2026/5/11.mdx'],
  ['developer.anduril.com/changelog/2026/4/22.html', 'pages/changelog/2026/4/22.mdx'],
  ['developer.anduril.com/changelog/2026/4/14.html', 'pages/changelog/2026/4/14.mdx'],
  ['developer.anduril.com/changelog/2026/2/5.html', 'pages/changelog/2026/2/5.mdx'],
  ['developer.anduril.com/changelog/2026/1/15.html', 'pages/changelog/2026/1/15.mdx'],
  ['developer.anduril.com/changelog/2025/12/12.html', 'pages/changelog/2025/12/12.mdx'],
  ['developer.anduril.com/changelog/2025/10/27.html', 'pages/changelog/2025/10/27.mdx'],
  ['developer.anduril.com/changelog/2025/10/3.html', 'pages/changelog/2025/10/3.mdx'],
  ['developer.anduril.com/changelog/2025/9/5.html', 'pages/changelog/2025/9/5.mdx'],
  ['developer.anduril.com/changelog/2025/8/11.html', 'pages/changelog/2025/8/11.mdx'],
  ['developer.anduril.com/changelog/2025/7/24.html', 'pages/changelog/2025/7/24.mdx']
]

const INDEX_ALIAS_MAP = [
  ['developer.anduril.com/guides/concepts/overview.html', 'pages/guides/index.mdx'],
  ['developer.anduril.com/guides/concepts/overview.html', 'pages/guides/concepts/index.mdx'],
  ['developer.anduril.com/guides/getting-started/quickstart.html', 'pages/guides/getting-started/index.mdx'],
  ['developer.anduril.com/guides/entities/overview.html', 'pages/guides/entities/index.mdx'],
  ['developer.anduril.com/guides/tasks/overview.html', 'pages/guides/tasks/index.mdx'],
  ['developer.anduril.com/guides/objects/overview.html', 'pages/guides/objects/index.mdx'],
  ['developer.anduril.com/guides/best-practices/choose-a-protocol.html', 'pages/guides/best-practices/index.mdx'],
  ['developer.anduril.com/guides/developer-tools/registry.html', 'pages/guides/developer-tools/index.mdx'],
  ['developer.anduril.com/reference/overview/overview.html', 'pages/reference/index.mdx'],
  ['developer.anduril.com/reference/overview/overview.html', 'pages/reference/overview/index.mdx'],
  ['developer.anduril.com/reference/overview/versioning/migrating-to-v2.html', 'pages/reference/overview/versioning/index.mdx'],
  ['developer.anduril.com/reference/rest/entities/get-entity.html', 'pages/reference/rest/index.mdx'],
  ['developer.anduril.com/reference/rest/entities/get-entity.html', 'pages/reference/rest/entities/index.mdx'],
  ['developer.anduril.com/reference/rest/tasks/create-task.html', 'pages/reference/rest/tasks/index.mdx'],
  ['developer.anduril.com/reference/rest/objects/upload-object.html', 'pages/reference/rest/objects/index.mdx'],
  ['developer.anduril.com/reference/rest/oauth/get-token.html', 'pages/reference/rest/oauth/index.mdx'],
  ['developer.anduril.com/reference/grpc/anduril-entitymanager-v-1/entity-manager-api/anduril-entitymanager-v-1-get-entity.html', 'pages/reference/grpc/index.mdx'],
  ['developer.anduril.com/reference/grpc/anduril-entitymanager-v-1/entity-manager-api/anduril-entitymanager-v-1-get-entity.html', 'pages/reference/grpc/entitymanager-v1/index.mdx'],
  ['developer.anduril.com/reference/grpc/anduril-taskmanager-v-1/task-manager-api/anduril-taskmanager-v-1-create-task.html', 'pages/reference/grpc/taskmanager-v1/index.mdx'],
  ['developer.anduril.com/samples/overview.html', 'pages/samples/index.mdx'],
  ['developer.anduril.com/changelog/2025/7/24.html', 'pages/changelog/2025/index.mdx'],
  ['developer.anduril.com/changelog/2025/7/24.html', 'pages/changelog/2025/7/index.mdx'],
  ['developer.anduril.com/changelog/2025/8/11.html', 'pages/changelog/2025/8/index.mdx'],
  ['developer.anduril.com/changelog/2025/9/5.html', 'pages/changelog/2025/9/index.mdx'],
  ['developer.anduril.com/changelog/2025/10/3.html', 'pages/changelog/2025/10/index.mdx'],
  ['developer.anduril.com/changelog/2025/12/12.html', 'pages/changelog/2025/12/index.mdx'],
  ['developer.anduril.com/changelog/2026/8/3.html', 'pages/changelog/2026/index.mdx'],
  ['developer.anduril.com/changelog/2026/1/15.html', 'pages/changelog/2026/1/index.mdx'],
  ['developer.anduril.com/changelog/2026/2/5.html', 'pages/changelog/2026/2/index.mdx'],
  ['developer.anduril.com/changelog/2026/4/14.html', 'pages/changelog/2026/4/index.mdx'],
  ['developer.anduril.com/changelog/2026/5/11.html', 'pages/changelog/2026/5/index.mdx'],
  ['developer.anduril.com/changelog/2026/6/9.html', 'pages/changelog/2026/6/index.mdx'],
  ['developer.anduril.com/changelog/2026/7/23.html', 'pages/changelog/2026/7/index.mdx'],
  ['developer.anduril.com/changelog/2026/8/3.html', 'pages/changelog/2026/8/index.mdx']
]

const LEGACY_PLACEHOLDERS = [
  'pages/reference/rest/entities.mdx',
  'pages/reference/rest/tasks.mdx',
  'pages/reference/rest/objects.mdx',
  'pages/reference/rest/oauth.mdx',
  'pages/reference/grpc/entitymanager-v1.mdx',
  'pages/reference/grpc/taskmanager-v1.mdx'
]

const CANONICAL_PAGE_MAP = [...PAGE_MAP, ...CHANGELOG_PAGE_MAP]

const sourceToTarget = new Map(CANONICAL_PAGE_MAP.map(([source, target]) => [
  normalizeMirrorPath(source),
  '/' + target.replace(/^pages\//, '').replace(/\.mdx$/, '').replace(/\/overview$/, '/overview')
]))

const generatedTargets = []
const copiedImages = new Map()
const assetPathByAssetRel = new Map()

function normalizeMirrorPath(filePath) {
  return filePath.replaceAll(path.sep, '/').replace(/^\.?\//, '')
}

function attrs(node) {
  return new Map((node.attrs || []).map((attr) => [attr.name, attr.value]))
}

function attr(node, name) {
  return attrs(node).get(name) || ''
}

function className(node) {
  return attr(node, 'class')
}

function children(node) {
  return node.childNodes || []
}

function isElement(node, tagName) {
  return node.tagName === tagName
}

function hasClassPart(node, part) {
  return className(node).includes(part)
}

function textContent(node) {
  if (!node) return ''
  if (node.nodeName === '#text') return node.value
  if (node.nodeName === '#comment') return ''
  if (['script', 'style', 'svg', 'noscript'].includes(node.tagName)) return ''
  return children(node).map(textContent).join('')
}

function compactText(node) {
  return textContent(node).replace(/\s+/g, ' ').trim()
}

function walk(node, visit, parents = []) {
  visit(node, parents)
  for (const child of children(node)) walk(child, visit, [...parents, node])
}

function findFirst(node, predicate) {
  let found
  walk(node, (candidate, parents) => {
    if (!found && predicate(candidate, parents)) found = candidate
  })
  return found
}

function findAll(node, predicate) {
  const found = []
  walk(node, (candidate, parents) => {
    if (predicate(candidate, parents)) found.push(candidate)
  })
  return found
}

function isInside(parents, predicate) {
  return parents.some(predicate)
}

function escapeText(text) {
  return text
    .replaceAll('\\r\\n', '\\n')
    .replaceAll('\\r', '\\n')
    .replaceAll('\\', '\\\\')
    .replaceAll('{', '\\{')
    .replaceAll('}', '\\}')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function escapeInlineCode(text) {
  return text.replaceAll('`', '\\`')
}

function escapeYaml(text) {
  return text.replaceAll('\\', '\\\\').replaceAll('"', '\\"')
}

function inline(nodes, sourceFile) {
  let out = ''
  for (const node of nodes) {
    if (node.nodeName === '#text') {
      out += escapeText(node.value.replace(/\s+/g, ' '))
      continue
    }
    if (node.nodeName === '#comment' || ['script', 'style', 'svg', 'noscript'].includes(node.tagName)) continue
    const tag = node.tagName
    if (tag === 'br') {
      out += '  \n'
    } else if (tag === 'code') {
      out += '`' + escapeInlineCode(textContent(node).trim()) + '`'
    } else if (tag === 'strong' || tag === 'b') {
      out += '**' + inline(children(node), sourceFile).trim() + '**'
    } else if (tag === 'em' || tag === 'i') {
      out += '*' + inline(children(node), sourceFile).trim() + '*'
    } else if (tag === 'a') {
      const label = inline(children(node), sourceFile).trim() || escapeText(attr(node, 'href'))
      const href = rewriteHref(attr(node, 'href'), sourceFile)
      out += href ? `[${label}](${href})` : label
    } else if (tag === 'img') {
      out += renderImage(node, sourceFile)
    } else {
      out += inline(children(node), sourceFile)
    }
  }
  return out.replace(/[ \t]+/g, ' ')
}

function blockText(node, sourceFile) {
  return inline(children(node), sourceFile).replace(/\s+/g, ' ').trim()
}

function headingDepth(tagName) {
  return Number(tagName.replace('h', ''))
}

function shouldSkipBlock(node) {
  if (node.nodeName === '#comment') return true
  if (['script', 'style', 'svg', 'noscript'].includes(node.tagName)) return true
  const cls = className(node)
  return cls.includes('fern-footer') ||
    cls.includes('fern-breadcrumb') ||
    cls.includes('fern-sidebar') ||
    cls.includes('fern-toc') ||
    cls.includes('fern-page-actions') ||
    cls.includes('fern-header') ||
    cls.includes('copy-button') ||
    attr(node, 'aria-label') === 'Copy page'
}

function renderBlocks(nodes, sourceFile, context = {}) {
  const blocks = []

  for (const node of nodes) {
    if (shouldSkipBlock(node)) continue
    if (node.nodeName === '#text') {
      const text = node.value.replace(/\s+/g, ' ').trim()
      if (text) blocks.push(escapeText(text))
      continue
    }

    const tag = node.tagName
    const cls = className(node)

    if (/^h[1-4]$/.test(tag)) {
      const title = blockText(node, sourceFile)
      if (title && !context.skipH1) blocks.push(`${'#'.repeat(headingDepth(tag))} ${title}`)
      continue
    }

    if (tag === 'p') {
      const text = blockText(node, sourceFile)
      if (text) blocks.push(text)
      continue
    }

    if (tag === 'pre') {
      const code = extractCode(node)
      if (code.text.trim()) blocks.push(fencedCode(code.text, inferLanguage(code.text, context)))
      continue
    }

    if (tag === 'ul' || tag === 'ol') {
      const list = renderList(node, sourceFile, tag === 'ol', 0)
      if (list) blocks.push(list)
      continue
    }

    if (tag === 'blockquote') {
      const quote = renderBlocks(children(node), sourceFile, context).join('\n\n')
      if (quote.trim()) blocks.push(quote.split('\n').map((line) => `> ${line}`).join('\n'))
      continue
    }

    if (tag === 'table' && !cls.includes('code-block-line-group')) {
      const table = renderTable(node, sourceFile)
      if (table) blocks.push(table)
      continue
    }

    if (tag === 'img') {
      const image = renderImage(node, sourceFile)
      if (image) blocks.push(image)
      continue
    }

    if (cls.includes('fern-api-property')) {
      const property = renderProperty(node, sourceFile)
      if (property) blocks.push(property)
      continue
    }

    if (cls.includes('border-card') && findFirst(node, (candidate) => candidate.tagName === 'pre')) {
      const card = renderCodeCard(node, sourceFile, context)
      if (card) blocks.push(card)
      continue
    }

    if (tag === 'button' || tag === 'select') continue

    const nested = renderBlocks(children(node), sourceFile, context)
    if (nested.length) blocks.push(...nested)
  }

  return dedupeAdjacent(blocks)
}

function dedupeAdjacent(blocks) {
  const out = []
  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed) continue
    if (out[out.length - 1] !== trimmed) out.push(trimmed)
  }
  return out
}

function renderList(node, sourceFile, ordered, depth) {
  const lines = []
  const items = children(node).filter((child) => child.tagName === 'li')
  items.forEach((item, index) => {
    const nestedLists = children(item).filter((child) => child.tagName === 'ul' || child.tagName === 'ol')
    const contentNodes = children(item).filter((child) => child.tagName !== 'ul' && child.tagName !== 'ol')
    const text = renderBlocks(contentNodes, sourceFile, {}).join(' ').replace(/\n+/g, ' ').trim() || blockText(item, sourceFile)
    const marker = ordered ? `${index + 1}.` : '-'
    lines.push(`${'  '.repeat(depth)}${marker} ${text}`.trimEnd())
    for (const nested of nestedLists) {
      const nestedText = renderList(nested, sourceFile, nested.tagName === 'ol', depth + 1)
      if (nestedText) lines.push(nestedText)
    }
  })
  return lines.join('\n')
}

function renderTable(node, sourceFile) {
  const rows = findAll(node, (candidate) => candidate.tagName === 'tr' && !isInside([], () => false))
    .filter((row) => !className(row).includes('code-block-line'))
    .map((row) => children(row).filter((cell) => ['th', 'td'].includes(cell.tagName)).map((cell) => blockText(cell, sourceFile).replaceAll('|', '\\|')))
    .filter((row) => row.length)

  if (!rows.length) return ''
  const width = Math.max(...rows.map((row) => row.length))
  const normalized = rows.map((row) => [...row, ...Array(width - row.length).fill('')])
  const header = normalized[0]
  const body = normalized.slice(1)
  return [
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...body.map((row) => `| ${row.join(' | ')} |`)
  ].join('\n')
}

function renderProperty(node, sourceFile) {
  const key = compactText(findFirst(node, (candidate) => hasClassPart(candidate, 'fern-api-property-key'))) || ''
  const meta = compactText(findFirst(node, (candidate) => hasClassPart(candidate, 'fern-api-property-meta'))) || ''
  const descriptions = findAll(node, (candidate, parents) =>
    hasClassPart(candidate, 'fern-prose') && !isInside(parents, (parent) => parent !== node && hasClassPart(parent, 'fern-api-property'))
  ).map((candidate) => blockText(candidate, sourceFile)).filter(Boolean)
  const label = [key && `\`${escapeInlineCode(key)}\``, meta && `_${escapeText(meta)}_`].filter(Boolean).join(' ')
  const description = descriptions.join(' ')
  return ['- ' + (label || blockText(node, sourceFile)), description ? `  ${description}` : ''].filter(Boolean).join('\n')
}

function renderCodeCard(node, sourceFile, context) {
  const title = extractCodeCardTitle(node)
  const pre = findFirst(node, (candidate) => candidate.tagName === 'pre')
  const code = extractCode(pre)
  if (!code.text.trim()) return ''
  const label = title ? `**${escapeText(title)}**\n\n` : ''
  return label + fencedCode(code.text, inferLanguage(code.text, { ...context, title }))
}

function extractCodeCardTitle(node) {
  const button = findFirst(node, (candidate, parents) =>
    candidate.tagName === 'button' && !isInside(parents, (parent) => parent.tagName === 'pre')
  )
  const title = compactText(button).replace(/([a-z])([0-9])/gi, '$1 $2').replace(/([0-9])([A-Z])/g, '$1 $2')
  return title.replace(/\s+/g, ' ').trim()
}

function extractCode(preNode) {
  if (!preNode) return { text: '' }
  const rows = findAll(preNode, (candidate) => candidate.tagName === 'tr' && className(candidate).includes('code-block-line'))
  if (rows.length) {
    const lines = rows.map((row) => {
      const content = findFirst(row, (candidate) => candidate.tagName === 'td' && className(candidate).includes('code-block-line-content'))
      return textContent(content).replace(/\s+$/g, '')
    })
    return { text: lines.join('\n') }
  }
  return { text: textContent(preNode).trimEnd() }
}

function fencedCode(text, lang) {
  const fence = text.includes('```') ? '````' : '```'
  return `${fence}${lang || ''}\n${text.trimEnd()}\n${fence}`
}

function inferLanguage(text, context = {}) {
  const sample = text.trim()
  const title = (context.title || '').toLowerCase()
  if (sample.startsWith('curl ') || sample.includes('\ncurl ') || title.includes('curl')) return 'bash'
  if (/^(GET|POST|PUT|PATCH|DELETE|STREAM)\s+\//.test(sample) || /\/api\/v\d+\//.test(sample.split('\n')[0] || '')) return 'http'
  if ((sample.startsWith('{') && sample.endsWith('}')) || sample.startsWith('[')) return 'json'
  if (/\bsyntax\s*=\s*"proto3"|^rpc\s+\w+|^message\s+\w+|^service\s+\w+/m.test(sample)) return 'proto'
  if (/^npm |^yarn |^pnpm |^pip |^export |^mkdir |^cd /m.test(sample)) return 'bash'
  return ''
}

function renderImage(node, sourceFile) {
  const src = attr(node, 'src')
  if (!src || src.startsWith('data:')) return ''
  const alt = attr(node, 'alt') || ''
  const rewritten = rewriteImage(src, sourceFile)
  return rewritten ? `![${escapeText(alt)}](${rewritten})` : ''
}

function rewriteImage(src, sourceFile) {
  if (/^https?:\/\//.test(src)) return src
  const cleanSrc = src.split(/[?#]/)[0]
  if (cleanSrc.startsWith('file:')) {
    const assetRel = cleanSrc.replace(/^file:/, '')
    const indexedSource = assetPathByAssetRel.get(assetRel)
    if (!indexedSource) return ''
    const rel = normalizeMirrorPath(path.relative(MIRROR_ROOT, indexedSource))
    const publicRel = rel.replace(/^_files\//, '').replace(/^api\//, 'api/')
    copiedImages.set(indexedSource, path.join(PUBLIC_IMG_ROOT, publicRel))
    return '/img/' + publicRel.split('/').map(encodeURIComponent).join('/')
  }
  const absoluteSource = path.resolve(path.dirname(path.join(ROOT, sourceFile)), cleanSrc)
  if (!absoluteSource.startsWith(MIRROR_ROOT)) return src
  const rel = normalizeMirrorPath(path.relative(MIRROR_ROOT, absoluteSource))
  const publicRel = rel.replace(/^_files\//, '').replace(/^api\//, 'api/')
  const target = path.join(PUBLIC_IMG_ROOT, publicRel)
  copiedImages.set(absoluteSource, target)
  return '/img/' + publicRel.split('/').map(encodeURIComponent).join('/')
}

function rewriteHref(href, sourceFile) {
  if (!href || href.startsWith('#')) return href
  if (/^(https?:|mailto:|tel:)/.test(href)) return href
  const [plain, hash = ''] = href.split('#')
  const clean = plain.split(/[?#]/)[0]
  if (!clean) return hash ? '#' + hash : ''
  if (!clean.endsWith('.html')) return href
  const absolute = path.resolve(path.dirname(path.join(ROOT, sourceFile)), clean)
  const mirrorRel = normalizeMirrorPath(path.relative(ROOT, absolute))
  const mapped = sourceToTarget.get(mirrorRel)
  if (mapped) return mapped + (hash ? '#' + hash : '')
  const fallback = '/' + normalizeMirrorPath(path.relative(MIRROR_ROOT, absolute)).replace(/\.html$/, '')
  return fallback + (hash ? '#' + hash : '')
}

function extractHeader(article, sourceFile) {
  const header = children(article).find((child) => child.tagName === 'header')
  const h1 = findFirst(header || article, (candidate) => candidate.tagName === 'h1')
  const title = compactText(h1) || path.basename(sourceFile, '.html')
  const paragraphs = findAll(header || {}, (candidate) => candidate.tagName === 'p').map((node) => blockText(node, sourceFile)).filter(Boolean)
  const method = findFirst(header || {}, (candidate) => attr(candidate, 'data-http-method'))
  const endpoint = findAll(header || {}, (candidate) => candidate.tagName === 'span' || candidate.tagName === 'code' || candidate.tagName === 'p')
    .map(compactText)
    .find((text) => /\/api\/v\d+\//.test(text))

  return {
    title,
    description: paragraphs.find((text) => text !== title) || '',
    endpoint: method && endpoint ? `${attr(method, 'data-http-method')} ${endpoint.replace(/^https?:\/\/[^/]+/, '')}` : ''
  }
}

async function convertPage(sourceFile, targetFile) {
  const raw = await fs.readFile(path.join(ROOT, sourceFile), 'utf8')
  const document = parse5.parse(raw)
  const main = findFirst(document, (node) => node.tagName === 'main')
  if (!main) return { skipped: true, reason: 'no <main>' }
  const article = findFirst(main, (node, parents) =>
    node.tagName === 'article' && !isInside(parents, (parent) => parent.tagName === 'aside')
  )
  if (!article) return { skipped: true, reason: 'no article' }

  const header = extractHeader(article, sourceFile)
  const contentRoots = children(article).filter((child) => child.tagName !== 'header')
  const bodyBlocks = renderBlocks(contentRoots, sourceFile, { title: header.title })
  const usefulBlocks = bodyBlocks.filter((block) => !/^# /.test(block))
  if (!usefulBlocks.join('\n').trim()) return { skipped: true, reason: 'empty body' }

  const frontmatter = [
    '---',
    `title: "${escapeYaml(header.title)}"`,
    header.description ? `description: "${escapeYaml(header.description)}"` : '',
    '---'
  ].filter(Boolean).join('\n')

  const intro = [`# ${escapeText(header.title)}`]
  if (header.description) intro.push(header.description)
  if (header.endpoint) intro.push(`**Endpoint**: \`${escapeInlineCode(header.endpoint)}\``)

  const mdx = normalizeMdx([frontmatter, ...intro, ...usefulBlocks].join('\n\n') + '\n')
  const absoluteTarget = path.join(ROOT, targetFile)
  await fs.mkdir(path.dirname(absoluteTarget), { recursive: true })
  await fs.writeFile(absoluteTarget, mdx)
  generatedTargets.push(targetFile)
  return { skipped: false, title: header.title, bytes: mdx.length }
}

function normalizeMdx(mdx) {
  return mdx
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\\\{#([A-Za-z0-9_-]+)\\\}/g, '{#$1}')
}

async function copyImages() {
  for (const [source, target] of copiedImages) {
    try {
      await fs.mkdir(path.dirname(target), { recursive: true })
      await fs.copyFile(source, target)
    } catch (error) {
      console.warn(`warning: could not copy image ${source}: ${error.message}`)
    }
  }
}

async function indexAssets() {
  async function visit(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    entries.sort((a, b) => a.name.localeCompare(b.name))
    for (const entry of entries) {
      const absolute = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await visit(absolute)
        continue
      }
      const rel = normalizeMirrorPath(path.relative(MIRROR_ROOT, absolute))
      const marker = '/assets/'
      const index = rel.indexOf(marker)
      if (index === -1) continue
      const assetRel = rel.slice(index + 1)
      if (!assetPathByAssetRel.has(assetRel)) assetPathByAssetRel.set(assetRel, absolute)
    }
  }
  await visit(path.join(MIRROR_ROOT, '_files'))
}

async function removeLegacyPlaceholders() {
  for (const file of LEGACY_PLACEHOLDERS) {
    try {
      await fs.rm(path.join(ROOT, file), { force: true })
    } catch {
      // rm -f semantics: stale placeholder deletion must stay idempotent.
    }
  }
}

async function main() {
  await indexAssets()
  const protectedFile = 'pages/guides/concepts/overview.mdx'
  for (const [source, target] of [...CANONICAL_PAGE_MAP, ...INDEX_ALIAS_MAP]) {
    if (target === protectedFile) continue
    const result = await convertPage(source, target)
    if (result.skipped) {
      console.log(`skip ${source} -> ${target}: ${result.reason}`)
    } else {
      console.log(`write ${target} (${result.title}, ${result.bytes} bytes)`)
    }
  }
  await copyImages()
  await removeLegacyPlaceholders()
  console.log(`generated ${generatedTargets.length} MDX pages`)
  console.log(`copied ${copiedImages.size} images`)
}

await main()
