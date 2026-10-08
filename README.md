# PROGRAMMING FUNDAMENTALS

**LEARN • PRACTICE • CODE • ACHIEVE**

A colourful, responsive C++ teaching and learning hub for Semester 1 Diploma in Information Technology students. Lecturer: **Ts. Mazlina Md Mustaffa**. Prepared by **3M@MazlinaMdMustaffa**.

This upgrades the existing React/Vite project in **mazlinamustaffa/programming**. The permanent GitHub Pages address and repository remain the same:

**https://mazlinamustaffa.github.io/programming/**

The platform uses React, Vite, Tailwind CSS, Recharts, Lucide icons, JSCPP and JSZip. It runs as a static website: no paid backend, API secret or database server is required. It has no fake administrator login, central student records, LMS grade sync or SSO.

## Develop and preview

Use Node.js **22.12 or newer** (Node.js 24 LTS also works) and npm. Use the existing repository checkout; a separate worktree is unnecessary.

```sh
cd /workspace/programming
npm ci --cache /workspace/.npm-cache --no-audit --no-fund
npm run dev
```

Open the address printed by Vite, including **`/programming/`**; normally this is `http://localhost:5173/programming/`. The development server listens on all interfaces for an environment-supported preview. A public preview URL depends on the hosting environment’s port-forwarding capabilities.

```sh
npm run lint                # JavaScript, React and hooks checks
npm run build               # Static production files in dist/
npm run preview             # Production preview, normally port 4173
npm run test:unit           # Content, scoring and timer logic validation
npx playwright install chromium
npm test                    # Unit validation and browser tests
```

If the environment already provides Chromium, avoid downloading another copy:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test
```

Browser tests use the production site at `http://127.0.0.1:4173/programming/`. The test command starts a production preview when needed. Test/build logs and the GitHub Actions run provide the evidence for a particular revision; this README does not imply that every future content update has already passed.

## Learning platform

The main navigation provides **Dashboard Overview, My Learning, Topic 1–5, Infographic Library, Comic Notes Library, Interactive Quiz, Practical Assessment, Quiz & Game Zone, Practice Lab, Learning Progress, Responsible AI, Lecturer Guide and Content Manager**.

| Topic | Learning scope |
| --- | --- |
| 1 — Introduction to Programming Language | Programming languages, history, types, approaches and generations; programs and programmers; language translators; input/process/output; problem solving, algorithms, flowcharts and pseudocode. |
| 2 — Fundamentals of Programming | Basic C++ structure, variables, constants, data types, operators, expressions, input/output and basic statements. |
| 3 — Program Control Structure | Sequence, `if`, `if-else`, else-if, `switch`, `for`, `while`, `do-while` and appropriate nested structures. |
| 4 — Arrays | Declaration, initialisation, element access, manipulation, one-dimensional arrays and processing with loops. |
| 5 — Functions | Introductory functions, declarations, definitions, calls, parameters, arguments, returns and passing arguments. Function overloading is excluded. |

Each topic includes an overview, learning objectives, quick notes, infographic and comic slots, C++ examples, an interactive theory quiz, a practical assessment, published game links and learning reflection. Optional Bahasa Melayu explanations support selected concepts.

**Official syllabus verification is required.** No official syllabus document or official learning-outcome codes were supplied. The topic structure follows the requested scope; the lecturer must confirm exact alignment, especially Topic 5 through subtopic **5.2.3**, before formal assessment. AI-assisted notes, examples, MCQs and practical briefs are labelled as requiring human verification. Lecturer-uploaded resources retain their own authorship.

The original beginner code-practice environment and legacy records are retained. New assessment results are kept separate from legacy demonstration marks, so sample performance is not presented as current student achievement.

## Theory quizzes

There are **five quizzes, exactly ten MCQs per topic: 50 questions in total**. Each quiz has a **15-minute** countdown, previous/next navigation, question selection, highlighted answers, submit, automatic timeout submission, score feedback, review explanations and retry.

Every MCQ contains four options, one correct answer, a Revised Bloom’s Taxonomy level and a meaningful explanation. Every stem starts with an appropriate action verb. The distribution in each quiz is:

| Level | Questions | Purpose |
| --- | ---: | --- |
| C1 — Remember | 2 | Identify or recognise foundational knowledge. |
| C2 — Understand | 3 | Interpret or explain meaning. |
| C3 — Apply | 3 | Apply, calculate, determine or predict using a scenario. |
| C4 — Analyze | 2 | Analyse, compare or debug code and reasoning. |

A correct answer earns **1 mark**; an incorrect or unanswered question earns **0**. The maximum is **10 marks**. Submitted results show score, percentage, correct/incorrect/unanswered counts, time used, Bloom’s performance and answer explanations. Device-local attempts and a deadline-based timer support recovery after returning to the page. Browser timers are learning aids, not secure invigilation.

## Hands-on practical assessments

There are **five practical assessments**, each designed for **60 minutes**. They are programming/problem-solving tasks, separate from the theory quizzes:

1. Identify input/process/output and produce an algorithm, flowchart and pseudocode.
2. Build a basic C++ program with variables, data types, operators and input/output.
3. Build a program with selection and iteration.
4. Store and process values with a one-dimensional array.
5. Build a modular program with functions, parameters and return values.

Each brief includes learning objectives, a scenario, instructions, input/processing/output requirements, expected behaviour, test cases, submission guidance and a downloadable question sheet. The practical interface provides task reading, a 60-minute timer, a warning at ten minutes remaining and a rubric.

| Practical criterion | Marks |
| --- | ---: |
| Problem understanding and algorithm | 15 |
| Program structure and syntax | 20 |
| Correct programming logic | 25 |
| Functional implementation | 20 |
| Testing and debugging | 10 |
| Output and documentation | 10 |
| **Total** | **100** |

Descriptors are adapted to the topic; Topic 1 assesses planning artefacts rather than requiring advanced C++ implementation. **A lecturer must evaluate practical work and enter any marks.** These marks are manually entered browser records, not authenticated official grades. The countdown does not submit source files. Submit work through the lecturer’s approved institutional method; this website does not collect or centrally store submissions.

For assessment tasks, compile and run C++ in your own IDE or an approved platform. One standard command is `g++ -std=c++17 main.cpp -o main`, followed by running the resulting executable. Check normal, boundary and invalid inputs as appropriate.

The preserved Practice Lab offers real execution through **JSCPP in a Web Worker**, not a native compiler. It supports the beginner subset used by its exercises: primitive values, `cin`/`cout`, branches, loops, functions and arrays. STL containers, classes, file access and arbitrary external libraries are outside that supported subset. Execution has a five-second limit and an output cap. Use a full C++ toolchain to verify assessed programs.

## Add your own resources and games

**Content Manager** is a local visual editing tool for the lecturer. There is no login because it cannot modify the public website directly. Never enter GitHub passwords or tokens in the dashboard.

- Infographic notes accept **JPG, PNG and WEBP**.
- Comic notes accept **JPG, PNG, WEBP and PDF**.
- PDF notes accept **PDF**.
- Game links accept validated external **HTTPS** URLs, topic, title, platform, description and difficulty. Supported labels include Wayground/Quizizz, Wordwall, Kahoot, Blooket, Gimkit, Google Forms and Other.

Choose a topic, enter the title and description, select the file or paste the URL, preview it, then choose **Save draft**. You can view, edit, replace or delete drafts. Games open in a new tab with safe external-link handling; they are not embedded.

Uploads are limited to **10 MB per file**. Extension, MIME type and file signatures are checked; renaming another file to an image or PDF does not make it valid. Uploaded files and drafts are stored using **IndexedDB in this browser** (`programming-fundamentals-content:v1`, `drafts` store), with appropriate local-storage use for small learning preferences. This avoids storing large files in localStorage. Storage depends on available browser quota and may be cleared by private browsing, browser resets or device cleanup. Keep exported backups of important materials.

The Infographic Library and Comic Notes Library start with intentional topic placeholders. No random images or fabricated materials are supplied. Actual published resources provide topic labels, previews, zoom, downloads and a return-to-topic action. Add an accessible description to every uploaded resource, and provide a text equivalent for image-only notes and accessible PDFs.

### Local versus public

| Content state | Visible to | How it changes |
| --- | --- | --- |
| **Local draft** | This browser/device | Saved in Content Manager; not automatically public. |
| **Published content** | Everyone who opens the website | Version-controlled files committed to this repository and deployed by GitHub Actions. |

The public catalogue is loaded from **`public/content/manifest.json`**. Resource files live under **`public/content/`**. File paths are relative to the existing Vite base path, so the content works at `/programming/` on GitHub Pages. The export workflow prepares resource files and metadata for publication; there is no hidden server-side upload or automatic GitHub write access.

### Publish an update package

1. Open **Content Manager**, add or edit your materials and game links, and save the drafts. Review titles, topic assignments, descriptions, file previews and URLs.
2. Choose **Export update package** to download `programming-content-update-YYYY-MM-DD.zip`. It contains `README-PUBLISH.txt`, a complete `public/content/manifest.json`, existing published resource files and saved draft files. Unsaved form edits are excluded. Export does not itself publish the site. Keep a copy as your local backup.
3. Extract the ZIP and read `README-PUBLISH.txt`. Replace only the existing `public/content/` folder with the prepared content folder in **the same `mazlinamustaffa/programming` repository**. Review the manifest so existing resources remain included and only intended changes are published. Refresh the dashboard before preparing a later update to avoid exporting an old catalogue.
4. In GitHub’s web interface, open the existing repository on `main`, select **Add file → Upload files**, and upload the prepared files in their matching project folders. GitHub does not unpack ZIP archives: extract first and check the destination paths. Alternatively, copy the package into your local checkout and use Git as below.
5. Commit the reviewed content update to `main`. The existing **Deploy to GitHub Pages** workflow builds, checks and publishes it.
6. Wait for green **build** and **deploy** jobs. Open the permanent website in a fresh tab and confirm the new resource cards, previews, downloads and game links. Refresh cached tabs if needed. Once changes are public, discard their old local draft copies if desired; discarding a local draft does not delete published content.

```sh
# Run from the existing repository after copying the extracted content files.
git diff -- public/content
git add public/content
git commit -m "Update Programming Fundamentals learning resources"
git push origin main
```

Planning a published deletion creates a local removal draft. The exported manifest omits that resource, so its card disappears after deployment. With GitHub web uploads, also delete any old orphaned files if you need their previous public download URLs to stop working.

Only publish material you have permission to share. Anything committed under `public/` and deployed to GitHub Pages is public; do not include confidential assessment answers, student records or private documents. For restricted resources, use an authorised institutional platform and share only an appropriate public link.

## Learning progress and privacy

Topic completion, quiz attempts, practical status, reflections and charts use actual available device-local activity. A fresh learner starts with no fabricated assessment results. CSV export supports local review and backup. Progress is **device- and browser-specific**; another device, browser, origin or private window has its own data. Clearing website storage can remove progress and drafts.

The upgraded format uses `programming-fundamentals-hub:v2` and separates current learning from the original `programming-fundamentals-hub:v1` records. Legacy stored content and code drafts are retained; demonstration marks are not automatically promoted into new actual quiz results. Export important legacy records before clearing browser data.

There is no central lecturer dashboard, authenticated student identity, secure gradebook or automatic cross-device sync. Share permitted progress exports through an approved method. Externally opened games are governed by their own privacy/access policies.

## Responsible AI and lecturer evidence

**Responsible AI in Learning** covers academic integrity, plagiarism, disclosure, bias, privacy, critical thinking and human verification. Interactive reflection scenarios and a downloadable disclosure template support ethical decisions. AI access is optional; learners do not need a paid AI account.

**Lecturer Guide** maps the 11 supplied IBM SkillsBuild evaluation criteria to visible features and identifies missing evidence. An optional self-review worksheet uses 0–2 per criterion, up to 22; this is **not an official evaluator score, guarantee, certification or endorsement**. Official descriptors take precedence.

Further evidence is needed for official syllabus mapping, authentic learner needs, pilot outcomes, accessibility and bilingual feedback, assessment moderation, LMS/SSO requirements and consented continuous improvement. The website URL and downloadable materials can be shared in an LMS; this does not claim an implemented LMS or SSO integration.

## Publish the upgraded site on GitHub Pages

The existing deployment is preserved. **Do not create another repository or Pages website.** Vite defaults to **`/programming/`**, and the GitHub Actions build explicitly sets `VITE_BASE_PATH=/programming/`. Hash navigation avoids server-side route rewrites.

The workflow in **`.github/workflows/deploy.yml`** runs on pushes to `main` and supports manual runs. It installs from `package-lock.json`, lints, builds, validates and browser-tests the production app, then deploys `dist/`. A failed required check prevents deployment.

1. If Pages is not already active, open [Pages settings](https://github.com/mazlinamustaffa/programming/settings/pages) and select **Build and deployment → Source → GitHub Actions**. This needs repository administrator access; the default workflow token cannot activate Pages itself.
2. Review changes, run the checks and commit to the existing repository. Do not commit `node_modules/`, `dist/`, private files or browser data.

   ```sh
   npm run lint
   npm run build
   npm test
   git status --short
   git add README.md .github index.html package.json package-lock.json vite.config.js eslint.config.js playwright.config.js public src tests
   git commit -m "Upgrade Programming Fundamentals teaching and learning hub"
   git push origin main
   ```

3. Open [Actions → Deploy to GitHub Pages](https://github.com/mazlinamustaffa/programming/actions/workflows/deploy.yml). A push starts deployment automatically. For an already-pushed revision, choose **Run workflow → main**. Rerun a failed Pages-disabled deployment after activating Pages.
4. Wait for green **build** and **deploy** jobs, then open **https://mazlinamustaffa.github.io/programming/** in Chrome. The deploy job’s `github-pages` environment shows the public URL.
5. Verify navigation, topic notes, quiz start/review, practical task downloads, library previews, local draft editing, game links, code practice, reduced motion and CSV export on desktop and a phone. Local preview data and live-site data are separate because they use different origins.

If Pages configuration fails with a missing site, finish step 1 before rerunning. If a check fails, inspect the failing job and its `browser-test-results` artifact. Deployment status is established by the actual workflow result and live-site response, not merely by a successful local build.

## Project structure

```text
src/components/             Shared shell, charts and preserved practice components
src/features/               Learning, quiz, practical, resource and guide interfaces
src/data/                   Learning content, question banks and practical briefs
src/lib/                    Device state, storage, content export and scoring helpers
src/workers/                Restricted beginner C++ runner
public/content/             Version-controlled public resource catalogue and files
tests/                      Content, timer, score and browser validation
.github/workflows/deploy.yml Existing GitHub Pages deployment workflow
vite.config.js              React, Tailwind and /programming/ base path
```

Use `npm ci` for repeatable installs. Dependency versions are pinned by `package-lock.json`. Generated builds, local environment files and browser test reports remain excluded from Git.

## Verified upgrade checks

The upgraded production application passed a frozen-lockfile installation, production build, clean ESLint check, **75 Node validation tests** and **17 Chromium integration tests** in the cloud workspace. All 50 new quiz answers were exercised through the interface. Native C++17 checks validated code-based questions, examples and practice solutions; all seven new runnable practice solutions also produced the expected output in the existing browser interpreter.

Browser coverage includes timers after navigation and reload, marking, downloadable practical briefs, CSV filters, IndexedDB draft editing and ZIP export, file replacement and signature checks, public resource previews and safe game links, preserved legacy code/records, keyboard interactions, reduced motion, and enlarged text at **320, 390 and 768 pixels**. PDF notes and comic PDFs were additionally checked with a real PDF for preview, native zoom, exact downloads and topic return.

These technical checks do not replace lecturer verification of the unavailable official syllabus, formal assessment moderation or student pilot evidence.
