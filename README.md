# Kothar sample mod

A minimal community mod for [Kothar](https://github.com/billwang7599/kothar), and the template for your own. It adds
one command, **Say hello**, to each chat's General tab, which writes a greeting into the chat, and one setting for the
greeting.

Click **Use this template** to start a mod in a repo of your own. You own it: Kothar's marketplace only points at your
repo and installs from your latest GitHub release.

## What's here

| File | What it is |
|---|---|
| `src/index.ts` | The mod: one object, default-exported. |
| `manifest.json` | Its id, name, version, author, description, `api` and `uses`. |
| `types/mod-api.ts` | Kothar's mod API types (MIT), copied in. `npm run update-types` fetches the latest. |
| `scripts/check.mjs` | Checks the built mod as Kothar will. |
| `.github/workflows/release.yml` | On a `v*` tag, builds and checks `main.mjs` and publishes it with `manifest.json`. |

Kothar's mod API isn't on npm, so the types are copied into the repo. They're types only, so nothing from them ends up
in `main.mjs`.

## Make it yours

1. In `manifest.json` and `src/index.ts`, change `id` (lowercase letters, digits and dashes), `name`, `description` and
   `author`. The two ids must match.
2. Write the mod. The [mod API](types/mod-api.ts) has hooks for chats and turns, permission requests, panels, commands,
   settings, MCP servers and tools.
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
   | `host.run`, `host.spawn` | `run` |

   `host.note`, `host.storage` and `host.refresh` need nothing listed. List only what you use: every entry is something
   a user has to agree to.

## Build and try it

```sh
npm install
npm run build      # bundles src/ into main.mjs
npm run check      # checks main.mjs and manifest.json as Kothar will
```

`main.mjs` must be a single ES module that imports only `node:` built-ins. esbuild bundles any packages you use into
it.

To try it in Kothar without publishing, go to **Settings → Marketplace → Install from folder…** and pick this folder.
It installs as "Local", off. Turn it on in **Settings → Community mods** and restart Kothar. After you change it, run
`npm run build` again, press **Reinstall** on the Marketplace page, and restart.

## Publish

1. Bump `version` in `manifest.json`.
2. Tag it: `git tag v1.0.0 && git push --tags`. The tag must be `v` plus the manifest's version. The release workflow
   builds, checks and publishes `manifest.json` and `main.mjs`.
3. The first time only, submit it to the catalog with a PR to
   [kothar-marketplace](https://github.com/billwang7599/kothar-marketplace#submit-a-theme-or-mod).

After that, each release you publish reaches users as **Update** on their Marketplace page, without another review.
Users update when they choose. If an update lists more in `uses` than before, Kothar turns the mod off until they allow
it again.

## A theme instead?

Themes are JSON, not code. See [kothar-themes](https://github.com/billwang7599/kothar-themes#make-your-own-theme).
