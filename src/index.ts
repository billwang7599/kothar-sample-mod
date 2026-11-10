import type { ChatDetail, ChatEntry, Mod, ModContext, ModHost, ModView } from '../types/mod-api.ts'

// A community mod is one object, the default export of main.mjs. Every field it sets, and every host call it makes,
// must be listed in manifest.json's "uses". This one lists:
//   panels     the Hello tab in the right sidebar
//   commands   "Say hello" in each chat's General tab
//   settings   the greeting
//   tools      hello_stats, a tool agents can call
//   events     onTurnStarted and onTurnCompleted, to redraw the tab as messages come and go
//   readChats  host.read and host.space, to count messages and name the space
// It never runs programs, reaches the network or sends messages. host.note and host.refresh need nothing listed.

const ID = 'hello'
const PANEL = 'hello'

type Counts = { yours: number; replies: number; last?: number }

// What's happened in a chat so far, from its log.
function countsOf(host: ModHost, chatId: string): Counts {
  const entries: ChatEntry[] = host.read(chatId)
  const yours = entries.filter((e) => e.type === 'user.message')
  return {
    yours: yours.length,
    replies: entries.filter((e) => e.type === 'turn.completed' && !e.error).length,
    ...(yours.length && { last: Date.parse(yours[yours.length - 1]!.at) }),
  }
}

// The space a chat belongs to: a worker's is its lead's.
const spaceName = (host: ModHost, chat: ChatDetail) => host.space(chat.id)?.name ?? chat.name

const greet = (chat: ChatDetail, { values, host }: ModContext) => host.note(chat.id, String(values.greeting))

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

function panelView(chat: ChatDetail, { host }: ModContext): ModView {
  const counts = countsOf(host, chat.id)
  return {
    type: 'stack',
    children: [
      { type: 'heading', text: `Hello, ${spaceName(host, chat)}` },
      {
        type: 'list',
        items: [
          { key: 'yours', label: 'Your messages', detail: String(counts.yours) },
          { key: 'replies', label: 'Replies', detail: String(counts.replies), hint: 'Turns that finished without an error' },
          counts.last
            ? { key: 'last', label: 'Since your last message', since: counts.last }
            : { key: 'last', label: 'Since your last message', detail: 'Nothing sent yet' },
        ],
      },
      {
        type: 'row',
        children: [{ type: 'button', label: 'Say hello', action: { name: 'greet' }, variant: 'primary' }],
      },
      { type: 'text', text: 'From the Hello mod, an example community mod.', tone: 'faint', small: true },
    ],
  }
}

const mod: Mod = {
  id: ID,
  name: 'Hello',
  description: 'An example community mod: a tab counting the messages in each space, a greeting command, and a tool.',
  // Community mods always arrive off, whatever this says; it only matters for built-in mods.
  enabledByDefault: false,
  settings: [
    {
      key: 'greeting',
      label: 'Greeting',
      description: 'What Say hello writes into the chat.',
      type: 'text',
      default: 'Hello from the Hello mod.',
    },
  ],
  panels: [
    {
      id: PANEL,
      title: 'Hello',
      render: panelView,
      onAction(action, chat, context) {
        if (action.name === 'greet') greet(chat, context)
      },
    },
  ],
  commands: [
    {
      id: 'greet',
      label: 'Say hello',
      hint: "Writes the greeting from this mod's settings into the chat. Agents don't see it.",
      run: greet,
    },
  ],
  tools: [
    {
      name: 'hello_stats',
      description: "Tells you how many messages the user has sent in this chat and how many of your turns have finished.",
      inputSchema: { type: 'object', properties: {} },
      offered: () => true,
      run(_input, { caller, host }) {
        const { yours, replies } = countsOf(host, caller.id)
        return `${plural(yours, 'message', 'messages')} from the user, ${plural(replies, 'finished turn', 'finished turns')}.`
      },
    },
  ],
  // Redraw the tab when a turn starts and ends. refresh only redraws panels that are open.
  onTurnStarted: ({ chat }, { host }) => host.refresh(chat.id),
  onTurnCompleted: ({ chat }, { host }) => host.refresh(chat.id),
}

export default mod
