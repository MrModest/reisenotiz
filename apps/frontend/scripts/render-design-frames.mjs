// Renders each screen of the design handoff to apps/frontend/docs/design/handoff-2026-09/frames/.
//
// Why this exists: the .dc.html files wrap their content in <x-dc> and load support.js,
// which fetches React from unpkg. Where unpkg is unreachable (agent sandboxes, offline,
// restrictive proxies) the custom element never upgrades and every frame collapses to
// zero height. This script flattens the document first — lifts the <helmet> <style> into
// <head>, drops the wrapper and the runtime — then screenshots each [data-screen-label].
//
// Webfonts are inlined as data URIs from node_modules so the type is correct without
// reaching fonts.googleapis.com. Install them first:
//   pnpm add -D @fontsource/inter @fontsource/jetbrains-mono
//
// Usage: node scripts/render-design-frames.mjs
// Requires: playwright, and a Chromium at PLAYWRIGHT_BROWSERS_PATH or CHROMIUM_PATH.

import { chromium } from 'playwright'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const dir = path.join(root, 'docs/design/handoff-2026-09')
const source = path.join(dir, 'travel-planner.dc.html')
const flattened = path.join(dir, 'travel-planner.standalone.html')
const out = path.join(dir, 'frames')

// Composite contact sheets — each is just the individual frames tiled, so skip them.
const COMPOSITES = new Set(['Mobile core', 'Mobile detail views', 'Mobile create and edit', 'Desktop'])

const FACES = [
  ['Inter', 'inter', [400, 500, 600, 700]],
  ['JetBrains Mono', 'jetbrains-mono', [400, 500]],
]

function fontCss() {
  const rules = []
  for (const [family, pkg, weights] of FACES) {
    for (const weight of weights) {
      const file = path.join(root, `node_modules/@fontsource/${pkg}/files/${pkg}-latin-${weight}-normal.woff2`)
      if (!existsSync(file)) {
        console.warn(`missing ${file} — run: pnpm add -D @fontsource/inter @fontsource/jetbrains-mono`)
        return ''
      }
      const b64 = readFileSync(file).toString('base64')
      rules.push(
        `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:block;` +
          `src:url(data:font/woff2;base64,${b64}) format('woff2');}`,
      )
    }
  }
  // The mock asks for 'Inter Variable' first; alias it to the static faces.
  rules.push(rules[0].replace("'Inter'", "'Inter Variable'"))
  return rules.join('')
}

function flatten() {
  let html = readFileSync(source, 'utf8')
  const helmet = html.match(/<helmet>([\s\S]*?)<\/helmet>/)
  let head = helmet ? helmet[1] : ''
  if (helmet) html = html.replace(helmet[0], '')
  head = head.replace(/<link[^>]*>/g, '').replace(/<meta[^>]*>/g, '') // remote fonts; inlined below
  html = html
    .replace('<script src="./support.js"></script>', '')
    .replaceAll('<x-dc>', '')
    .replaceAll('</x-dc>', '')
    .replace('</head>', `${head}<style>${fontCss()}</style>\n</head>`)
  writeFileSync(flattened, html)
  return html.length
}

const executablePath = process.env.CHROMIUM_PATH || undefined

console.log('flattened', flatten(), 'bytes ->', path.relative(root, flattened))
mkdirSync(out, { recursive: true })

const browser = await chromium.launch({ executablePath })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 })
// Everything needed is inline; abort the rest so a blocked host cannot hang the run.
await page.route('**/*', (r) => (r.request().url().startsWith('file://') ? r.continue() : r.abort()))
await page.goto('file://' + flattened, { waitUntil: 'domcontentloaded', timeout: 60_000 })
await page.waitForTimeout(2500)
try { await page.evaluate(() => document.fonts.ready) } catch { /* fonts are inline; ready is best-effort */ }

const labels = await page.$$eval('[data-screen-label]', (els) =>
  els.map((el) => {
    const { width, height } = el.getBoundingClientRect()
    return { label: el.getAttribute('data-screen-label'), width: Math.round(width), height: Math.round(height) }
  }),
)

let index = 0
for (const { label, width, height } of labels) {
  const n = String(index++).padStart(2, '0')
  if (COMPOSITES.has(label)) { console.log('skip (composite)', label); continue }
  if (width < 50 || height < 50) { console.log('skip (collapsed)', label, `${width}x${height}`); continue }
  const name = `${n}-${label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`
  await page.locator(`[data-screen-label="${label}"]`).first().screenshot({ path: path.join(out, name) })
  console.log('ok', name, `${width}x${height}`)
}

await browser.close()
