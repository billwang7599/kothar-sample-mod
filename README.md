# Hello: a sample Kothar mod

An example community mod for [Kothar](https://github.com/billwang7599/kothar), and the template for your own. It's
in the Marketplace as **Hello**, so you can try the whole community-mods flow with it, and it's small enough to read in
one sitting.

What it does:

- **A Hello tab** in the right sidebar of every space and worker: the space's name, how many messages you've sent,
  how many replies finished, and a live time since your last message. It redraws when a turn starts or ends.
- **Say hello**, a command in each chat's General tab (and a button on the tab), which writes a greeting into the chat.
  Agents don't see it.
- **A Greeting setting** for what Say hello writes.
- **A `hello_stats` tool** agents can call to learn how many messages you've sent in their chat.

It reads your chats' logs to count messages, and nothing else: it runs no programs, reaches no network and sends no
messages. Its `manifest.json` says so, and Kothar holds it to that.

## Try it

1. **Settings → Community mods:** turn on **Community mods** and confirm the warning.
2. **Browse…** opens the Marketplace. Find **Hello** and install it. It arrives turned off.
3. Turn **Hello** on, then press **Restart**.
4. Open any space: there's a **Hello** tab beside General.

## Make your own

Click **Use this template** to start a mod in a repo of your own. You own it: Kothar's marketplace only points at your
repo and installs from your latest GitHub release.

## What's here

| File | What it is |
|---|---|
| `src/index.ts` | The mod: one object, default-exported, with a comment for each thing it lists in `uses`. |
| `manifest.json` | Its id, name, version, author, description, `api` and `uses`. |
| `types/mod-api.ts` | Kothar's mod API types (MIT), copied in. `npm run update-types` fetches the latest. |
| `scripts/check.mjs` | Checks the built mod as Kothar will. |
| `.github/workflows/release.yml` | On a `v*` tag, builds and checks `main.mjs` and publishes it with `manifest.json`. |

Kothar's mod API isn't on npm, so the types are copied into the repo. They're types only, so nothing from them ends up
in `main.mjs`.

1. In `manifest.json` and `src/index.ts`, change `id` (lowercase letters, digits and dashes), `name`, `description` and
   `author`. The two ids must match.
2. Write the mod. The [mod API](types/mod-api.ts) has hooks for chats and turns, permission requests, panels, commands,
   settings, MCP servers and tools. Kothar's agents that work below a space are called **workers**; a chat that is
   one has `worker: true`.
3. List everything it uses in `manifest.json`'s `uses`. Kothar shows this list to people before they install it, and
   won't start a mod that does more:

   | Mod field or host call | List |
   |---|---|
   | `tools` / `mcpServers` / `instructions` / `panels` / `commands` / `settings` / `chats` / `setup` | the same name |
   | `onPermissionRequested` | `permissions` |
   | `transformMessage`, `transformOutput` | `transforms` |
   | `onEvent`, `onTurnStarted`, `onTurnCompleted`, `onStatusChanged`, `onSessionEnded`, `onChatCreated`, `onChatRemoved`, `onChatArchived`, `onLimitReached` | `events` |
   | `host.chats`, `host.chat`, `host.read`, `host.space` | `readChats` |
   | `host.send`, `host.createChat`, `host.retry`, `host.continue`, `host.interrupt` | `sendMessages` |
   | `host.accounts`, `host.useAccount` | `accounts` |
   | `host.run`, `host.spawn`, `host.openTerminal` | `run` |

   `host.note`, `host.storage` and `host.refresh` need nothing listed. List only what you use: every entry is something
   a user has to agree to. If your mod doesn't need Hello's tab, tool or counter, delete them and their `uses`.

## Build and try it

```sh
npm install
npm run build      # bundles src/ into main.mjs
npm run check      # checks main.mjs and manifest.json as Kothar will
```

`main.mjs` must be a single ES module that imports only `node:` built-ins. esbuild bundles any packages you use into
it.

To try it in Kothar without publishing, go to **Settings → Community mods → Browse… → Install from folder…** and pick
this folder. It installs as "Local", off. Turn it on in **Settings → Community mods** and press **Restart**. After you
change it, run `npm run build`, press **Reinstall** in the Marketplace, and restart.

## Publish

1. Bump `version` in `manifest.json`.
2. Tag it: `git tag v1.2.0 && git push --tags`. The tag must be `v` plus the manifest's version. The release workflow
   builds, checks and publishes `manifest.json` and `main.mjs`.
3. The first time only, submit it to the catalog with a PR to
   [kothar-marketplace](https://github.com/billwang7599/kothar-marketplace#submit-a-theme-or-mod).

After that, each release you publish reaches users as **Update** on their Marketplace page, without another review.
Users update when they choose. If an update lists more in `uses` than before, Kothar turns the mod off until they allow
it again.

## A theme instead?

Themes are JSON, not code. See [kothar-themes](https://github.com/billwang7599/kothar-themes#make-your-own-theme).
