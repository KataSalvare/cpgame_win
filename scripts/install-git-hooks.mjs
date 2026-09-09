import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const APP_ROOT = path.resolve(SCRIPT_DIR, '..')

function runGit(args) {
  return spawnSync('git', args, {
    cwd: APP_ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

const repository = runGit(['rev-parse', '--show-toplevel'])

if (repository.status !== 0) {
  console.log('[git-hooks] Git repository not found; skipping hook installation.')
  process.exit(0)
}

const hookPath = path.relative(APP_ROOT, path.join(APP_ROOT, '.githooks')) || '.githooks'
const result = runGit(['config', '--local', 'core.hooksPath', hookPath])

if (result.status !== 0) {
  const error = String(result.stderr || '').trim()
  console.error(`[git-hooks] Failed to configure core.hooksPath${error ? `: ${error}` : ''}`)
  process.exit(result.status || 1)
}

console.log(`[git-hooks] Enabled ${hookPath}`)
