#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')
const { TextDecoder } = require('node:util')

const strict = process.argv.includes('--strict') || process.argv.includes('--ci')
const root = process.cwd()
const decoder = new TextDecoder('utf-8', { fatal: true })

const FILES = {
  agents: 'AGENTS.md',
  index: 'docs/requirements/index.md',
  project: 'docs/requirements/project.md',
  archive: 'docs/requirements/archive.md',
  review: 'docs/requirements/review-log.md',
  conflicts: 'docs/requirements/conflicts.md',
  rules: 'docs/agent-rules/requirements-workflow.md',
}

const STATUS = new Set([
  'proposed',
  'accepted',
  'in-progress',
  'done',
  'rejected',
  'pending-confirmation',
])

const errors = []
const warnings = []

function fail(message) {
  errors.push(message)
}

function warn(message) {
  warnings.push(message)
}

function readUtf8(file) {
  const full = path.join(root, file)
  if (!fs.existsSync(full)) {
    fail(`Missing required file: ${file}`)
    return ''
  }
  try {
    return decoder.decode(fs.readFileSync(full))
  } catch (_) {
    fail(`File is not valid UTF-8: ${file}`)
    return ''
  }
}

function parseDate(dateText) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return null
  const date = new Date(`${dateText}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return null
  return date
}

function daysSince(date) {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
}

function parseProjectEntries(content) {
  const headerRegex = /^### \[(REQ-PRJ-\d{8}-\d{2})\] (.+)$/gm
  const headers = []
  let match
  while ((match = headerRegex.exec(content)) !== null) {
    headers.push({ id: match[1], title: match[2].trim(), end: headerRegex.lastIndex, start: match.index })
  }
  const entries = []
  for (let i = 0; i < headers.length; i += 1) {
    const current = headers[i]
    const nextStart = i + 1 < headers.length ? headers[i + 1].start : content.length
    const block = content.slice(current.end, nextStart)
    const fields = {}
    const fieldRegex = /^- ([A-Za-z][A-Za-z-]*):\s*(.+)$/gm
    let fieldMatch
    while ((fieldMatch = fieldRegex.exec(block)) !== null) {
      fields[fieldMatch[1]] = fieldMatch[2].trim()
    }
    const required = [
      'Date',
      'Updated',
      'Source',
      'Type',
      'Priority',
      'Scope',
      'Tags',
      'Statement',
      'Rationale',
      'Status',
      'Supersedes',
      'Trace',
    ]
    required.forEach((name) => {
      if (!fields[name]) fail(`[${current.id}] Missing field: ${name}`)
    })
    if (fields.Scope && fields.Scope !== 'project') fail(`[${current.id}] Scope must be project`)
    if (fields.Status && !STATUS.has(fields.Status)) fail(`[${current.id}] Invalid status: ${fields.Status}`)
    if (fields.Date && !parseDate(fields.Date)) fail(`[${current.id}] Invalid Date: ${fields.Date}`)
    if (fields.Updated && !parseDate(fields.Updated)) fail(`[${current.id}] Invalid Updated: ${fields.Updated}`)
    const acceptancePattern = /- Acceptance:\s*\r?\n(?:\s{2,}\d+\.\s+.+\r?\n?)+/m
    if (!acceptancePattern.test(block)) fail(`[${current.id}] Acceptance must include numbered lines`)
    const traceMatches = [...String(fields.Trace || '').matchAll(/`([^`]+)`/g)].map((m) => m[1])
    if (!traceMatches.length) fail(`[${current.id}] Trace must include at least one backticked path`)
    traceMatches.forEach((tracePath) => {
      const full = path.join(root, tracePath)
      if (!fs.existsSync(full)) fail(`[${current.id}] Trace path not found: ${tracePath}`)
    })
    entries.push({
      id: current.id,
      title: current.title,
      priority: fields.Priority || '',
      status: fields.Status || '',
      tags: fields.Tags || '',
      updated: fields.Updated || '',
    })
  }
  return entries
}

function parseIndex(content) {
  const lines = content.split(/\r?\n/)
  const entries = []
  let section = 'unknown'
  const regex =
    /^- \[(REQ-PRJ-\d{8}-\d{2})\] \| (.+?) \| scope:project \| priority:(P0|P1|P2) \| status:([a-z-]+) \| tags:([A-Za-z0-9,_-]+) \| updated:(\d{4}-\d{2}-\d{2})$/
  lines.forEach((line, idx) => {
    if (/^## Active$/.test(line)) section = 'active'
    if (/^## Archived$/.test(line)) section = 'archived'
    if (!line.startsWith('- ')) return
    if (line.trim() === '- (none)') return
    const match = line.match(regex)
    if (!match) {
      fail(`Invalid index line format at docs/requirements/index.md:${idx + 1}`)
      return
    }
    entries.push({
      id: match[1],
      title: match[2].trim(),
      priority: match[3],
      status: match[4],
      tags: match[5],
      updated: match[6],
      section,
    })
  })
  return entries
}

function checkReviewLog(content) {
  const lines = content.split(/\r?\n/)
  const pattern = /^- (\d{4}-\d{2}-\d{2}) \| (weekly|monthly) \| owner:([A-Za-z0-9_-]+) \| note:(.+)$/
  const dates = []
  lines.forEach((line, idx) => {
    if (!line.startsWith('- ')) return
    if (line.trim() === '- (none)') return
    const m = line.match(pattern)
    if (!m) {
      fail(`Invalid review log line at docs/requirements/review-log.md:${idx + 1}`)
      return
    }
    const d = parseDate(m[1])
    if (!d) fail(`Invalid review date: ${m[1]}`)
    else dates.push(d)
  })
  if (!dates.length) {
    fail('Review log is empty')
    return
  }
  const latest = dates.sort((a, b) => b.getTime() - a.getTime())[0]
  const stale = daysSince(latest)
  if (stale > 45) {
    const msg = `Review log is stale (${stale} days)`
    if (strict) fail(msg)
    else warn(msg)
  }
}

function checkConflicts(content) {
  const lines = content.split(/\r?\n/)
  const pattern =
    /^- \[(OPEN|RESOLVED)\] (CONFLICT-\d{8}-\d{2}) \| (.+) \| opened:(\d{4}-\d{2}-\d{2}) \| owner:([A-Za-z0-9_-]+)$/
  lines.forEach((line, idx) => {
    if (!line.startsWith('- [')) return
    if (line.trim() === '- (none)') return
    const m = line.match(pattern)
    if (!m) {
      fail(`Invalid conflict line at docs/requirements/conflicts.md:${idx + 1}`)
      return
    }
    const opened = parseDate(m[4])
    if (!opened) {
      fail(`Invalid conflict date: ${m[4]}`)
      return
    }
    if (m[1] === 'OPEN' && daysSince(opened) > 14) {
      const msg = `[${m[2]}] OPEN conflict older than 14 days`
      if (strict) fail(msg)
      else warn(msg)
    }
  })
}

Object.values(FILES).forEach((file) => readUtf8(file))

const projectContent = readUtf8(FILES.project)
const indexContent = readUtf8(FILES.index)
const reviewContent = readUtf8(FILES.review)
const conflictsContent = readUtf8(FILES.conflicts)

const projectEntries = parseProjectEntries(projectContent)
const indexEntries = parseIndex(indexContent)
const indexMap = new Map(indexEntries.map((entry) => [entry.id, entry]))

projectEntries.forEach((entry) => {
  const line = indexMap.get(entry.id)
  if (!line) {
    fail(`[${entry.id}] Missing in index Active section`)
    return
  }
  if (line.section !== 'active') fail(`[${entry.id}] Must be in Active section`)
  if (line.priority !== entry.priority) fail(`[${entry.id}] Priority mismatch with index`)
  if (line.status !== entry.status) fail(`[${entry.id}] Status mismatch with index`)
  if (line.tags !== entry.tags) fail(`[${entry.id}] Tags mismatch with index`)
  if (line.updated !== entry.updated) fail(`[${entry.id}] Updated mismatch with index`)
})

indexEntries.forEach((entry) => {
  if (!projectEntries.find((item) => item.id === entry.id) && entry.section === 'active') {
    fail(`[${entry.id}] Present in Active index but missing in project.md`)
  }
})

checkReviewLog(reviewContent)
checkConflicts(conflictsContent)

if (errors.length) {
  console.error('\nRequirement guard failed:\n')
  errors.forEach((item, i) => console.error(`${i + 1}. ${item}`))
  if (warnings.length) {
    console.error('\nWarnings:')
    warnings.forEach((item, i) => console.error(`${i + 1}. ${item}`))
  }
  process.exit(1)
}

console.log('Requirement guard passed.')
console.log(`- Project entries: ${projectEntries.length}`)
console.log(`- Index entries: ${indexEntries.length}`)
if (warnings.length) {
  console.log('\nWarnings:')
  warnings.forEach((item, i) => console.log(`${i + 1}. ${item}`))
}
