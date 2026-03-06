/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Ollama Host - URL where Ollama is running */
  "ollamaHost": string,
  /** Ollama Model - The model to use for translation */
  "ollamaModel": string,
  /** Input Method - Where to read text from when a translation command is triggered */
  "inputMethod": "clipboard" | "selection"
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `swedish-to-english` command */
  export type SwedishToEnglish = ExtensionPreferences & {}
  /** Preferences accessible in the `english-to-swedish` command */
  export type EnglishToSwedish = ExtensionPreferences & {}
  /** Preferences accessible in the `swedish-to-german` command */
  export type SwedishToGerman = ExtensionPreferences & {}
  /** Preferences accessible in the `german-to-swedish` command */
  export type GermanToSwedish = ExtensionPreferences & {}
  /** Preferences accessible in the `german-to-english` command */
  export type GermanToEnglish = ExtensionPreferences & {}
  /** Preferences accessible in the `english-to-german` command */
  export type EnglishToGerman = ExtensionPreferences & {}
  /** Preferences accessible in the `translation-history` command */
  export type TranslationHistory = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `swedish-to-english` command */
  export type SwedishToEnglish = {}
  /** Arguments passed to the `english-to-swedish` command */
  export type EnglishToSwedish = {}
  /** Arguments passed to the `swedish-to-german` command */
  export type SwedishToGerman = {}
  /** Arguments passed to the `german-to-swedish` command */
  export type GermanToSwedish = {}
  /** Arguments passed to the `german-to-english` command */
  export type GermanToEnglish = {}
  /** Arguments passed to the `english-to-german` command */
  export type EnglishToGerman = {}
  /** Arguments passed to the `translation-history` command */
  export type TranslationHistory = {}
}

