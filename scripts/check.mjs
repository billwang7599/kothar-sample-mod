// Checks the built extension as Kothar will before it runs it: manifest.json is valid, main.mjs is one self-contained
// ES module whose default export is the extension named in the manifest, and the extension sets nothing its manifest's
// "uses" doesn't list. Run after npm run build. Host calls are checked by Kothar at runtime, so test them with Install
// from folder.
import { readFileSync, statSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const ID = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/
const VERSION = /^\d{1,6}\.\d{1,6}\.\d{1,6}$/
const MAX_EXTENSION_BYTES = 5 * 1024 * 1024
// Kept in step with Kothar's packages/core/src/extensions.ts.
const USES = ['tools', 'mcpServers', 'instructions', 'permissions', 'transforms', 'events', 'panels', 'commands', 'settings', 'chats', 'setup', 'readChats', 'sendMessages', 'accounts', 'run']
const FIELD_USES = {
  tools: 'tools',
  mcpServers: 'mcpServers',
  instructions: 'instructions',
  onPermissionRequested: 'permissions',
  transformMessage: 'transforms',
  transformOutput: 'transforms',
  onEvent: 'events',
  onTurnStarted: 'events',
  onTurnCompleted: 'events',
  onStatusChanged: 'events',
  onSessionEnded: 'events',
  onChatCreated: 'events',
  onChatRemoved: 'events',
  onChatArchived: 'events',
  onLimitReached: 'events',
  panels: 'panels',
  commands: 'commands',
  settings: 'settings',
  chats: 'chats',
  setup: 'setup',
}

const fail = (message) => {
  console.error(`FAIL ${message}`)
  process.exit(1)
}
const text = (value, what, max) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max) fail(`manifest.json ${what} must be text of 1 to ${max} characters`)
}

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'))
const fields = ['id', 'name', 'version', 'author', 'description', 'api', 'uses']
const extra = Object.keys(manifest).find((key) => !fields.includes(key))
if (extra) fail(`manifest.json has an unknown field "${extra}"`)
if (!ID.test(manifest.id ?? '')) fail('manifest.json id must be lowercase letters, digits and dashes')
if (!VERSION.test(manifest.version ?? '')) fail('manifest.json version must look like 1.2.3')
text(manifest.name, 'name', 40)
text(manifest.author, 'author', 60)
text(manifest.description, 'description', 200)
if (manifest.api !== 1) fail('manifest.json api must be 1')
if (!Array.isArray(manifest.uses)) fail('manifest.json uses must be a list')
const unknown = manifest.uses.find((use) => !USES.includes(use))
if (unknown !== undefined) fail(`manifest.json uses "${unknown}", which isn't one of: ${USES.join(', ')}`)

const tag = process.env.GITHUB_REF_NAME
if (tag?.startsWith('v') && tag !== `v${manifest.version}`) fail(`the tag ${tag} doesn't match manifest.json's version ${manifest.version}`)

let size
try {
  size = statSync('main.mjs').size
} catch {
  fail('there is no main.mjs: run npm run build')
}
if (size > MAX_EXTENSION_BYTES) fail(`main.mjs is over ${MAX_EXTENSION_BYTES} bytes`)
const source = readFileSync('main.mjs', 'utf8')
const imported = [...source.matchAll(/(?:^|[\s;])(?:import|export)\b[^'"`]*?\bfrom\s*['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]/g)]
  .map((m) => m[1] ?? m[2])
  .filter((name) => !name.startsWith('node:'))
if (imported.length) fail(`main.mjs imports ${imported.join(', ')}; bundle everything except node: built-ins`)

const extension = (await import(pathToFileURL('main.mjs').href)).default
if (!extension || typeof extension !== 'object') fail('main.mjs has no default export')
if (extension.id !== manifest.id) fail(`the extension's id "${extension.id}" isn't manifest.json's "${manifest.id}"`)
const set = (value) => value !== undefined && !(Array.isArray(value) && value.length === 0)
const unlisted = [...new Set(Object.entries(FIELD_USES).filter(([field]) => set(extension[field])).map(([, use]) => use))].filter(
  (use) => !manifest.uses.includes(use),
)
if (unlisted.length) fail(`the extension uses ${unlisted.map((u) => `"${u}"`).join(', ')} without listing it in manifest.json`)
console.log(`ok   ${manifest.id} ${manifest.version}`)
