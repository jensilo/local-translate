# LocalTranslate

Translate selected text between Swedish, English, and German — entirely offline, powered by a local [Ollama](https://ollama.com) model.

## Commands

| Command | Direction |
|---|---|
| Swedish → English | SV → EN |
| English → Swedish | EN → SV |
| Swedish → German | SV → DE |
| German → Swedish | DE → SV |
| German → English | DE → EN |
| English → German | EN → DE |
| Translation History | Browse and copy past translations |

## How it works

1. Select text (or copy it, depending on your Input Method setting)
2. Trigger a translation command in Raycast
3. The translated text appears in a panel — press **⌘↵** to copy it to clipboard
4. Press **⌘R** to reload and translate fresh content at any time

## Requirements

[Ollama](https://ollama.com) must be installed and running locally, with the translation model pulled:

```bash
ollama pull translategemma:latest
ollama serve
```

## Preferences

| Preference | Default | Description |
|---|---|---|
| Ollama Host | `http://localhost:11434` | URL where Ollama is running |
| Ollama Model | `translategemma:latest` | Model used for translation |
| Input Method | Selected Text | Whether to read from the current text selection or the clipboard. Selected Text works well in most cases; switch to Clipboard if you experience issues with multiple apps having active selections simultaneously. |

All preferences can be changed in Raycast → Extensions → LocalTranslate → Preferences.
