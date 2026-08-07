import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const PAGES_ROOT = path.join(ROOT, 'pages')
const PUBLIC_ROOT = path.join(ROOT, 'public')

const failures = []

function fail(message) {
  failures.push(message)
}

async function exists(file) {
  try {
    await fs.access(file)
    return true
  } catch {
    return false
  }
}

async function listMdxFiles(dir = PAGES_ROOT) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await listMdxFiles(absolute))
    } else if (entry.name.endsWith('.mdx')) {
      files.push(absolute)
    }
  }
  return files
}

function stripHashAndQuery(target) {
  return target.split('#')[0].split('?')[0]
}

async function pageExists(target) {
  const clean = stripHashAndQuery(target).replace(/^\/+/, '')
  if (!clean) return true
  const candidates = [
    path.join(PAGES_ROOT, `${clean}.mdx`),
    path.join(PAGES_ROOT, clean, 'index.mdx')
  ]
  return (await Promise.all(candidates.map(exists))).some(Boolean)
}

async function validateLinksAndImages(files) {
  const linkPattern = /!?\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
  for (const file of files) {
    const rel = path.relative(ROOT, file)
    const mdx = await fs.readFile(file, 'utf8')
    for (const match of mdx.matchAll(linkPattern)) {
      const full = match[0]
      const target = match[1]
      if (/^(https?:|mailto:|tel:|#)/.test(target)) continue
      if (full.startsWith('!')) {
        if (!target.startsWith('/img/')) continue
        const imagePath = path.join(PUBLIC_ROOT, decodeURIComponent(stripHashAndQuery(target).replace(/^\/+/, '')))
        if (!await exists(imagePath)) fail(`${rel}: missing image ${target}`)
        continue
      }
      if (!target.startsWith('/')) continue
      if (!await pageExists(target)) fail(`${rel}: broken internal link ${target}`)
    }
  }
}

async function validateExtractionRegressions() {
  const restCreate = await fs.readFile(path.join(ROOT, 'pages/reference/rest/tasks/create-task.mdx'), 'utf8')
  const grpcCreate = await fs.readFile(path.join(ROOT, 'pages/reference/grpc/taskmanager-v1/create-task.mdx'), 'utf8')
  const publish = await fs.readFile(path.join(ROOT, 'pages/guides/entities/publish.mdx'), 'utf8')

  if (!restCreate.includes('- `taskId` — _string · optional_ — 如果非空')) {
    fail('REST create-task request field taskId is not rendered as one atomic property bullet')
  }

  const standalonePropertyMeta = /^- _(?:string|object|boolean|datetime|integer|number|list of objects)(?:Optional|Required)_$/gim
  if (standalonePropertyMeta.test(restCreate)) {
    fail('REST create-task contains standalone property type/optional bullets')
  }

  if (!grpcCreate.includes('### 请求') || !grpcCreate.includes('- `task_id` — _string_ — 如果非空')) {
    fail('gRPC create-task is missing extracted Request field descriptions')
  }

  if (!grpcCreate.includes('### 响应') || !grpcCreate.includes('- `task` — _object_ — 已创建的任务。')) {
    fail('gRPC create-task is missing extracted Response field descriptions')
  }

  for (const keyword of ['Airplane', 'Animal', 'Car', 'Person', 'Radar', 'Satellite', 'Submarine', 'UAV']) {
    if (!publish.includes(keyword)) fail(`guides/entities/publish.mdx is missing platform keyword ${keyword}`)
  }
}

const files = await listMdxFiles()
await validateLinksAndImages(files)
await validateExtractionRegressions()

if (failures.length) {
  console.error(`validation failed with ${failures.length} issue(s):`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`validation passed: ${files.length} MDX files, internal links/images, extraction regressions`)
