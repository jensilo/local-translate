# LocalTranslate

Translate selected text between Swedish, English, and German – entirely offline, powered by a local Unsloth Desktop model.

## Commands

| Command             | Direction                         |
| ------------------- | --------------------------------- |
| Swedish → English   | SV → EN                           |
| English → Swedish   | EN → SV                           |
| Swedish → German    | SV → DE                           |
| German → Swedish    | DE → SV                           |
| German → English    | DE → EN                           |
| English → German    | EN → DE                           |
| Translation History | Browse and copy past translations |

## How it works

1. Select text (or copy it, depending on your Input Method setting)
2. Trigger a translation command in Raycast
3. The translated text appears in a panel — press **⌘↵** to copy it to clipboard
4. Press **⌘R** to reload and translate fresh content at any time

## Requirements

Unsloth Desktop must be running locally, with a translation model loaded. Create an API key in Unsloth Desktop and add it to the extension's Raycast preferences.

## Preferences

| Preference          | Default                           | Description                                                                                                                                                                                                        |
| ------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unsloth API Key     | —                                 | API key created in Unsloth Desktop                                                                                                                                                                                 |
| Unsloth API URL     | `http://127.0.0.1:8888/v1`        | Local OpenAI-compatible Unsloth endpoint                                                                                                                                                                           |
| Unsloth Model       | `unsloth/gemma-4-E2B-it-qat-GGUF` | Loaded model ID used for translation                                                                                                                                                                               |
| Translation Context | Sweden tech-company guidance      | Optional terminology and audience guidance added to every translation                                                                                                                                              |
| Input Method        | Selected Text                     | Whether to read text from the current selection or the clipboard. Selected Text works well in most cases; switch to Clipboard if you experience issues with multiple apps having active selections simultaneously. |

All preferences can be changed in Raycast → Extensions → LocalTranslate → Preferences.

## Updating the local extension

Raycast registers this project as a local extension. After code changes, run `npm run dev` until it reports a successful build, then stop it with `Ctrl-C`. Raycast retains the updated extension and runs it normally without the development watcher.
