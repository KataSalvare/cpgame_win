import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  getPreferredNpmCommand,
  getPreferredNpxCommand,
  runCommandSync,
} from './utils/command-runtime.mjs'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const APP_ROOT = path.resolve(SCRIPT_DIR, '..')
const ZERO_SHA = /^0+$/

function run(command, args, env) {
  const result = runCommandSync({
    command,
    args,
    cwd: APP_ROOT,
    env,
    timeoutMs: 15 * 60 * 1000,
    maxBuffer: 32 * 1024 * 1024,
  })

  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  return result.status === 0
}

function gitOutput(args) {
  const result = runCommandSync({ command: 'git', args, cwd: APP_ROOT, timeoutMs: 30_000 })
  if (result.status !== 0) return ''
  return result.stdout.trim()
}

function readPushRefs() {
  if (process.stdin.isTTY) return []

  try {
    const input = fs.readFileSync(0, 'utf8')
    return input
      .split(/\r?\n/)
      .map((line) => line.trim().split(/\s+/))
      .filter((parts) => parts.length >= 4)
      .map(([, localSha, , remoteSha]) => ({ localSha, remoteSha }))
  } catch {
    return []
  }
}

function getChangedFiles() {
  const refs = readPushRefs()
  if (refs.length === 0) {
    return gitOutput(['diff', '--name-only', 'HEAD^', 'HEAD'])
      .split(/\r?\n/)
      .filter(Boolean)
  }

  const files = new Set()
  for (const { localSha, remoteSha } of refs) {
    if (!localSha || ZERO_SHA.test(localSha)) continue

    const args = ZERO_SHA.test(remoteSha || '')
      ? ['ls-tree', '-r', '--name-only', localSha]
      : ['diff', '--name-only', remoteSha, localSha]

    for (const file of gitOutput(args).split(/\r?\n/).filter(Boolean)) files.add(file)
  }
  return [...files]
}

function hasDeploymentChanges(files) {
  return files.some((file) => file === 'wrangler.jsonc' || file.startsWith('worker/'))
}

const npmCommand = getPreferredNpmCommand()
const checks = [
  ['lint', npmCommand, ['run', 'lint']],
  ['build', npmCommand, ['run', 'build']],
  ['docs', npmCommand, ['run', 'check:docs']],
]

for (const [name, command, args] of checks) {
  console.log(`[quality] Running ${name} check...`)
  if (!run(command, args)) {
    console.error(`[quality] ${name} check failed; push aborted.`)
    process.exit(1)
  }
}

const changedFiles = getChangedFiles()
if (hasDeploymentChanges(changedFiles)) {
  console.log('[quality] Deployment files changed; running Wrangler dry-run...')
  const npxCommand = getPreferredNpxCommand()
  if (!run(npxCommand, ['--no-install', 'wrangler', 'deploy', '--dry-run'], {
    WRANGLER_WRITE_LOGS: 'false',
    WRANGLER_LOG_PATH: path.join(os.tmpdir(), 'product-make-wrangler-logs'),
  })) {
    console.error('[quality] Wrangler dry-run failed; push aborted.')
    process.exit(1)
  }
}

console.log('[quality] Push checks passed.')
