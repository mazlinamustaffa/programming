# Programming Fundamentals Hub

A responsive, interactive learning dashboard for an introductory C++ course. Built with React, Vite, Tailwind CSS, Recharts, and Lucide icons, with a static deployment configuration for GitHub Pages.

The hub brings together five core programming topics, each with **Notes, Exercise, Practical, Quiz, and Test** activities. The dashboard includes learning progress, interactive charts, searchable and filterable activity records, and CSV export.

## Develop locally

Use Node.js **22.12 or newer** (Node.js 24 LTS also works) and npm. Work in the existing repository checkout; a separate worktree is unnecessary.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite, including the `/programming/` path. The development server listens on port 5173 by default.

```sh
npm run lint                # Check JavaScript and React hooks
npm run build               # Produce the static site in dist/
npm run preview             # Preview the production build locally
npx playwright install chromium
npm test                    # Run the browser test suite
```

If Chromium is already installed in your environment, use it without downloading another browser:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test
```

No API key, environment secret, database, or server is required.

## Learning and data

The five topics are Introduction & Algorithms, Variables & Data Types, Operators & Expressions, Control Flow, and Functions & Arrays. Each contains notes with examples, a runnable exercise, a practical project, a three-question quiz, and a separate three-question test.

Read notes and mark them complete. Run exercises and practicals until stdout matches their expected output. Quizzes and tests provide answer explanations and save your latest score; at least two correct answers out of three completes an assessment. Model solutions can be revealed and loaded into the editor. Press Ctrl/⌘ + Enter to run code; Tab moves focus normally.

Learner progress, code drafts, display name, and weekly study days are stored in this browser's local storage; they do not sync across devices. Profile settings provide a CSV backup and a confirmed progress reset that retains your name and study plan.

Seeded progress and illustrative weekly activity are sample data for demonstration. KPI cards and topic completion update as you learn. This week's illustrative chart totals reflect your completed activities; last week is sample history. Reset progress in profile settings to start from zero. The app does not provide authentication, a backend, or a learning management system integration. CSV export downloads all currently filtered rows, including rows beyond the visible page.

C++ practice runs with the JSCPP interpreter in a Web Worker. It supports the beginner language subset used in the course, including primitive values, `cin`/`cout`, branches, loops, functions, and arrays. It is not a native compiler or complete C++ implementation: STL containers, classes, file access, and arbitrary external libraries are outside the supported subset. The app limits execution to five seconds and caps output to keep the interface responsive.

## Deploy to GitHub Pages

The Vite base path defaults to `/programming/`, matching the repository name. The GitHub Actions job explicitly sets `VITE_BASE_PATH=/programming/` so its builds and browser tests use the deployment path. The workflow installs from the committed lockfile, lints the app, builds and browser-tests it, then publishes `dist/` automatically on each push to `main`. It also supports manual runs.

1. Open [the repository's Pages settings](https://github.com/mazlinamustaffa/programming/settings/pages), then set **Build and deployment → Source** to **GitHub Actions**. This requires repository administration access. The workflow cannot enable Pages with its default GitHub Actions token.
2. Commit and push the project files and lockfile to `main`. In an existing clone, the following commits the application files and pushes your current commit to `main` without force:

   ```sh
   git add README.md .gitignore .github index.html package.json package-lock.json vite.config.js eslint.config.js playwright.config.js public src tests
   git commit -m "Publish Programming Fundamentals Hub with GitHub Pages"
   git push origin HEAD:main
   ```

3. Open [Actions → Deploy to GitHub Pages](https://github.com/mazlinamustaffa/programming/actions/workflows/deploy.yml). A push to `main` starts it automatically. If the files were already pushed, choose **Run workflow → main → Run workflow** after enabling Pages. If a run previously failed because Pages was disabled, select **Re-run all jobs**.
4. Wait for both **build** and **deploy** to finish with green checks. The deploy job shows the live URL under its `github-pages` environment.
5. Open **https://mazlinamustaffa.github.io/programming/** in Chrome. After publishing, check navigation, topic notes, quiz submission, C++ Run code, and CSV export. Browser data is separate from the local preview because the website uses a different origin.

If `Configure GitHub Pages` fails with a missing Pages site, finish step 1 and rerun the workflow. If a build or browser test fails, inspect the failed step and its `browser-test-results` artifact; deployment waits for all checks to pass. Do not upload `node_modules/` or commit `dist/` — the workflow builds and uploads the site.

For a different repository name, set `VITE_BASE_PATH` to its path when building. Use `/` for a root site or custom domain:

```sh
VITE_BASE_PATH=/ npm run build
VITE_BASE_PATH=/another-repository/ npm run build
```

For GitHub Actions, change `VITE_BASE_PATH` in the build job's `env` configuration and update the Playwright base URL and route assertions to match your new path. Publish the newly generated `dist/` directory. Navigation uses URL hashes, so GitHub Pages does not need server-side route rewrites.

## Project structure

```text
src/                       Application interface, course data, and C++ runner
public/                    Static assets
tests/                     Playwright browser tests
.github/workflows/         GitHub Pages deployment
vite.config.js             React, Tailwind, and deployment base path
```

Dependency versions are recorded in `package-lock.json`; use `npm ci` for repeatable installs. Generated build files, local environment files, and test reports are excluded from Git.
