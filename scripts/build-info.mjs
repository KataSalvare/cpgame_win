import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

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

  return {
    version: fs.readFileSync(path.join(rootDir, 'release-version.txt'), 'utf8').trim(),
    revision,
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outputPath = path.join(rootDir, 'dist', 'version.json')
  fs.writeFileSync(outputPath, `${JSON.stringify(getBuildInfo(), null, 2)}\n`)
}
