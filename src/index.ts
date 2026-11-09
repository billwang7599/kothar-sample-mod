import type { Mod } from '../types/mod-api.ts'

// A community mod is one object, the default export of main.mjs. Every field it sets, and every host call it makes,
// must be listed in manifest.json's "uses": here "commands" and "settings". host.note needs nothing listed.
const mod: Mod = {
  id: 'sample-mod',
  name: 'Sample mod',
  description: 'A minimal community mod: a command that writes a greeting into the chat, and a setting for it.',
  // Community mods are always off until the user turns them on; this only matters for stock mods.
  enabledByDefault: false,
  settings: [{ key: 'greeting', label: 'Greeting', type: 'text', default: 'Hello from a community mod.' }],
  commands: [
    {
      id: 'greet',
      label: 'Say hello',
      hint: "Writes the greeting from Settings into this chat. Agents don't see it.",
      run(chat, { values, host }) {
        host.note(chat.id, String(values.greeting))
      },
    },
  ],
}

export default mod
