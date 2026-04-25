# Contributing

Thanks for your interest. Platypus is in active development; small, focused PRs are easiest to land.

## Getting started

1. Follow the build requirements in the [README](README.md).
2. Run `npm run tauri dev` to launch the app in development mode.
3. Frontend hot-reloads automatically; backend changes require a restart.

## Project structure

```
src/                       React + TypeScript frontend
  screens/                 Top-level screens (ChatScreen, etc.)
  features/                Feature modules (Projects, etc.)
  Providers/               Global context providers (settings, etc.)

src-tauri/                 Rust backend
  src/engine/              Audio, transcription, vector, AI engines
  src/repository/          SQLite data access
  src/configuration/       Settings, app state, DB init
  src/permissions/         macOS permission prompts

website/                   Marketing site (platypusnotes.com)
scripts/                   Build and release scripts
```

## Pull requests

- One change per PR. Keep diffs focused.
- For non-trivial changes, open an issue first to discuss approach.
- Test the feature in the running app before submitting — type checks and `cargo check` verify code correctness, not feature correctness.
- Commit messages should explain the *why*, not just the *what*.

## Reporting issues

Please include:

- OS and version (for macOS, the chip — M1/M2/M3/Intel)
- Whether you're using local or OpenAI transcription
- Tauri logs (Settings → there's no log viewer yet, but logs go to stdout when running `npm run tauri dev`)
- Steps to reproduce

## Areas where help is especially welcome

- **Speaker diarization** — currently unsupported; would need either a cloud provider integration (Deepgram / AssemblyAI) or a local pipeline using a speaker-embedding ONNX model
- **Windows release builds + CI** — macOS signed builds are scripted; Windows side is unfinished
- **Linux support** — Tauri supports it but we haven't tested
- **Transcription accuracy testing** across accents, noise conditions, and chunk lengths
- **Additional LLM providers** — anything OpenAI-compatible should drop in cleanly

## Code style

- **Frontend**: TypeScript strict mode, prefer functional components, use existing Chakra primitives over custom CSS
- **Backend**: standard `rustfmt` and `clippy`; pattern-match on errors rather than `unwrap` outside main and tests
- **No new dependencies without justification** — Rust compile times are already long, every additional crate makes it worse

## License

By contributing you agree your contributions will be licensed under the MIT license, the same license that covers the project.
