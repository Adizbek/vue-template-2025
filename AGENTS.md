# Repository Guidelines

## About our company
We are a technology company specializing in speech processing solutions, including Text-to-Speech (TTS) and Speech-to-Text (STT) services. Our mission is to provide high-quality, scalable, and easy-to-integrate speech technologies for developers and businesses worldwide.
Our team is dedicated to innovation in the field of speech recognition and synthesis, aiming to enhance user experiences across various applications such as virtual assistants, accessibility tools, and customer service platforms.
Our products leverage advanced machine learning algorithms to deliver natural-sounding speech and accurate transcription services, catering to a diverse range of languages and dialects.
We prioritize customer satisfaction and continuously work on improving our offerings based on user feedback and technological advancements in the speech processing domain.
Our UI/UX team focuses on creating intuitive and user-friendly interfaces, ensuring that our clients can easily manage and utilize our TTS and STT services through our dashboard.
Our products design should be futuristic, minimalistic, and user-centric, reflecting our commitment to cutting-edge technology and exceptional user experiences.

## Project overview
This repository hosts a Vue 3 application scaffolded with Vite, TypeScript, Pinia, and Tailwind CSS.
Our project is dashboard for serving TTS, STT for various applications.
Users use our dashboard to manage their TTS/STT services, monitor usage, and configure settings.
Initial features are:
- Customer profile
- Billing and transaction history
- Limits and usage monitoring
- STT and TTS playground for testing audio inputs and outputs
- API key management
- Balance top-up and payment methods
- Login and registration. External login via OAuth2 providers (Google and GitHub) is supported.

## Project Structure & Module Organization
Source lives in `src/`, with feature views in `src/pages`, shared UI in `src/components`, composables and helpers in `src/lib`, global state in `src/stores`, and router config in `src/router`. Unit tests sit beside code in `src/__tests__`, while static assets go under `public/`. Keep cross-cutting styles in `src/styles.css`, and update `vite.config.ts` plus `tsconfig*.json` when introducing new aliases.

## Build, Test, and Development Commands
Use `npm run dev` for the Vite dev server, and `npm run preview` to inspect the production bundle locally. Ship-ready bundles come from `npm run build`, which runs `vue-tsc` via `npm run type-check` before `vite build`. `npm run lint` fans out to ESLint and Oxlint; run them individually (`npm run lint:eslint`, `npm run lint:oxlint`) when debugging. Format Vue/TS files with `npm run format`. Execute unit suites with `npm run test:unit`; pass `--runInBand` for flaky specs or `--watch` during development.

## Coding Style & Naming Conventions
Write Vue SFCs in `<script setup lang="ts">` with TypeScript strictness. Components use PascalCase filenames (e.g., `PatientSummaryCard.vue`); composables follow the `useThing` camelCase pattern; Pinia stores live in `src/stores/<name>Store.ts`. Prefer 2-space indentation, trailing commas, and descriptive prop names. Run Prettier before committing, and address lint feedback rather than silencing rules.

## Testing Guidelines
Vitest plus `@vue/test-utils` is the primary stack. Mirror component names in test files (`FooCard.spec.ts`) and co-locate under `src/__tests__` when the suite spans multiple modules. Target meaningful coverage for UI logic—critical stores and composables should have at least baseline interaction tests before merging. Include regression tests whenever fixing a bug.

## Commit & Pull Request Guidelines
Git history currently uses short, imperative subjects (e.g., "Initial commit"); continue this style and prefix with scope when useful (`feat(router): add admin route`). Every PR should describe intent, list notable UI changes, link tracked issues, and attach before/after screenshots for visual updates. Flag any required migrations or env changes in the description, and ensure CI lint/test commands pass locally before requesting review.

## Environment & Configuration Notes
Develop against Node 20.19+ (or 22.12+). Declare env vars in `.env` and type them in `env.d.ts` for IDE safety. Tailwind and component tokens are managed via `components.json`; update it when introducing new design primitives. Keep secrets out of `public/` and prefer runtime configuration via `import.meta.env`.
