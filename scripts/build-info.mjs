import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function hashDirectories(directories) {
  const hash = createHash('sha256')
  const visit = (directory) => {
    if (!fs.existsSync(directory)) return
    const stats = fs.statSync(directory)
    if (stats.isFile()) {
      hash.update(path.relative(rootDir, directory))
      hash.update(fs.readFileSync(directory))
      return
    }
    const entries = fs.readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.name !== '.DS_Store')
      .sort((left, right) => left.name.localeCompare(right.name))

    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        visit(entryPath)
      } else if (entry.isFile()) {
        hash.update(path.relative(rootDir, entryPath))
        hash.update(fs.readFileSync(entryPath))
      }
    }
  }

  directories.forEach((directory) => visit(path.join(rootDir, directory)))
  return hash.digest('hex').slice(0, 16)
}

function getPageBuilds(coreRevision) {
  const prototypesDir = path.join(rootDir, 'src/prototypes')
  return Object.fromEntries(
    fs.readdirSync(prototypesDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => [
        entry.name,
        hashDirectories([`src/prototypes/${entry.name}`, 'src/components', 'src/themes/grayscale-prototype']).concat(coreRevision),
      ]),
  )
}

export function getBuildInfo() {
  let revision = `build-${Date.now()}`
  try {
    revision = execFileSync('git', ['rev-parse', '--short=12', 'HEAD'], {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    // Git metadata is not available in some build environments.
  }

  const coreRevision = hashDirectories([
    'tools',
    'src/components',
    'src/main.tsx',
    'src/App.css',
    'src/themes/grayscale-prototype',
  ])

  return {
    version: fs.readFileSync(path.join(rootDir, 'release-version.txt'), 'utf8').trim(),
    revision,
    coreRevision,
    pages: getPageBuilds(coreRevision),
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outputPath = path.join(rootDir, 'dist', 'version.json')
  fs.writeFileSync(outputPath, `${JSON.stringify(getBuildInfo(), null, 2)}\n`)
}
