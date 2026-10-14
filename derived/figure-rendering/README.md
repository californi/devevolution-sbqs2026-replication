# English editorial renderings of the archived interface

These files reproduce the **presentation** of Figures 3 and 4 in the article. They use the original supplied React view components and CSS, with English editorial text and illustration-only states corresponding to the supplied screenshots. They do not implement a new educational intervention, participant evaluation or evaluated localized version. The source snapshot is not uniquely tied to the evaluated revision.

Cards, SVG icons, gradients, path structure, locking and feedback styling are retained. Animations are paused for a legible static illustration. Translated text appears blue as requested for the annotated article. Figure 3 shows selection, a flashcard and incorrect/correct feedback. Figure 4 shows the first five path nodes and first three summary cards. Complete original Portuguese illustrations are preserved in `../evaluation/supplement-originals.pdf`.

The authentication/persistence controller is omitted from this renderer. No backend is contacted, no account is created and no participant records are used. `Hidden_User`, score 0/2 and the selected answer states are illustration fixtures corresponding to supplied views, not new research data. Question answers, point values and original application source are unchanged. Translated source-card risk, formula or coverage claims are not independently validated.

## Reproduce

Requirements: Python with ReportLab, Node.js, pnpm and Chrome (or a Chromium executable set through `CHROME_BIN`). Commands below run in this directory:

```sh
python3 prepare_views.py ../source/src
pnpm --dir preview-app install --ignore-scripts
(cd preview-app && node build.mjs && node node_modules/@tailwindcss/cli/dist/index.mjs -i preview-input.css -o preview.css)
python3 cache_fonts.py
node capture_views.mjs
python3 assemble_figures.py output
```

The source module and CSS are copied into a separate preview directory. The Google font families referenced by the original CSS are cached locally; font files and installed dependencies are not included in this release. The generated figure PDFs are under `output/`. Browser/platform/font availability can affect typography and pixel output; this is not a claim of pixel-identical reproduction of the evaluated deployment.
