// Renders the drawing: `mockups.mjs` → `mockups.html` → one PNG per frame and theme.
//
//   pnpm design:frames                  (from apps/frontend)
//
// The stylesheet is `src/index.css` itself, compiled by the app's own Tailwind, so the frames use
// exactly the tokens and fonts that ship. Fonts are inlined from `@fontsource-variable/*`, never
// fetched: a silent fallback to a system font would make every measurement in the drawing wrong.
//
// Screenshots need Playwright's Chromium. It is not a dependency of this app; the script uses a
// global install.

import { execSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { build } from 'vite'
import { frames } from './mockups.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const indexCss = join(here, '../../../../src/index.css')

const figure = (f) => `<figure id="${f.file}" class="flex flex-col gap-2">
  <figcaption class="flex max-w-full flex-col gap-0.5" style="width:${f.size.w}px">
    <div class="flex items-baseline gap-2">
      <span class="font-mono text-[13px] font-semibold">${f.file.slice(0, 2)}</span>
      <span class="text-[13px] font-medium">${f.title}</span>
      <span class="ml-auto font-mono text-[11px] text-muted-foreground">${f.size.w}×${f.size.h}${f.now ? ` · now ${f.now}` : ''}</span>
    </div>
    <div class="text-[12px] text-muted-foreground">${f.note}</div>
  </figcaption>
  <div class="shrink-0">
    <div class="frame overflow-hidden" style="width:${f.size.w}px;height:${f.size.h}px">${f.html}</div>
  </div>
</figure>`

const page = (head) => `<!doctype html>
<html lang="en" class="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Reisenotiz frames</title>
${head}
</head>
<body class="min-h-dvh bg-muted font-sans text-foreground antialiased">
<header class="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border bg-background px-6 py-3">
  <div class="text-[15px] font-semibold">Reisenotiz — reconciled frames</div>
  <div class="text-[12px] text-muted-foreground">Drawn from <span class="font-mono">DESIGN-SYSTEM.md</span> and <span class="font-mono">SCREENS.md</span>. Where a frame and a decision disagree, the frame is wrong.</div>
  <button onclick="document.documentElement.classList.toggle('dark')" class="ml-auto h-9 rounded-md border border-input bg-background px-3 text-[13px] font-medium">Theme</button>
</header>
<main class="flex flex-wrap items-start gap-10 p-6">
${frames.map(figure).join('\n')}
</main>
</body>
</html>
`

// ─── Compile the stylesheet ──────────────────────────────────────────────────────────────────

const tmp = mkdtempSync(join(tmpdir(), 'reisenotiz-frames-'))
try {
  writeFileSync(join(tmp, 'entry.css'), [
    `@import '${relative(tmp, indexCss)}';`,
    `@source '${relative(tmp, join(here, 'mockups.mjs'))}';`,
    `@source '${relative(tmp, join(here, 'build.mjs'))}';`,
  ].join('\n'))
  writeFileSync(join(tmp, 'index.html'), page('<link rel="stylesheet" href="./entry.css">'))

  await build({
    root: tmp,
    configFile: false,
    logLevel: 'warn',
    plugins: [tailwindcss()],
    build: { outDir: join(tmp, 'dist'), assetsInlineLimit: () => true },
  })

  const assets = join(tmp, 'dist/assets')
  const css = readdirSync(assets).filter((f) => f.endsWith('.css')).map((f) => readFileSync(join(assets, f), 'utf8')).join('\n')
  writeFileSync(join(here, 'mockups.html'), page(`<style>\n${css}\n</style>`))
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
console.log('wrote mockups.html')

// ─── Capture ─────────────────────────────────────────────────────────────────────────────────

const loadPlaywright = async () => {
  try {
    return await import('playwright')
  } catch {
    const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim()
    return createRequire(join(globalRoot, 'noop.js'))('playwright')
  }
}

const { chromium } = await loadPlaywright()
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 })
const tab = await context.newPage()
await tab.goto(`file://${join(here, 'mockups.html')}`)
await tab.evaluate(() => document.fonts.ready)

const missing = await tab.evaluate(() =>
  ['Inter Variable', 'JetBrains Mono Variable'].filter((family) => !document.fonts.check(`16px "${family}"`)))
if (missing.length) throw new Error(`fonts did not load: ${missing.join(', ')}`)

for (const theme of ['dark', 'light']) {
  await tab.evaluate((dark) => document.documentElement.classList.toggle('dark', dark), theme === 'dark')
  for (const f of frames) {
    await tab.locator(`[id="${f.file}"] .frame`).screenshot({ path: join(here, `${f.file}-${theme}.png`) })
  }
}
await browser.close()
console.log(`wrote ${frames.length * 2} frames`)
