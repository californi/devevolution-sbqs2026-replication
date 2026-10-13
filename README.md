# DevEvolution — project and replication materials for SBQS 2026

Associated paper: **DevEvolution: A Web-Based Gamified Educational Application for Software Measurement and Analysis**, SBQS 2026, Education in Software Quality track.

## Article and authors

This is the public project repository associated with the article above, prepared for the **Education in Software Quality track of SBQS 2026**. The application source, instructional materials and available anonymized evaluation records are described below.

Authors are listed in the submitted order:

| Author | Affiliation | Location | Email |
|---|---|---|---|
| Vanessa Rodrigues de Oliveira | Institute of Science, Technology and Innovation (ICTIN), Federal University of Lavras (UFLA) | São Sebastião do Paraíso, Minas Gerais, Brazil | vanessa.oliveira9@estudante.ufla.br |
| Vanusa Rodrigues de Oliveira | Institute of Science, Technology and Innovation (ICTIN), Federal University of Lavras (UFLA) | São Sebastião do Paraíso, Minas Gerais, Brazil | vanusa.oliveira1@estudante.ufla.br |
| Bento Rafael Siqueira | Department of Applied Computing (DAC), Federal University of Lavras (UFLA) | Lavras, Minas Gerais, Brazil | bento.siqueira@ufla.br |
| Cristiane Aparecida Lana | Institute of Science, Technology and Innovation (ICTIN), Federal University of Lavras (UFLA) | São Sebastião do Paraíso, Minas Gerais, Brazil | cristiane.lana@ufla.br |
| Samira Santos da Silva | Institute of Science, Technology and Innovation (ICTIN), Federal University of Lavras (UFLA) | São Sebastião do Paraíso, Minas Gerais, Brazil | samirasilva@ufla.br |

The same author information is preserved in [AUTHORS.md](AUTHORS.md). Project source: [derived/source](derived/source). Web application: [DevEvolution](https://dev-evolution-game.lovable.app/).

Updated 2026-10-13 after recovery of an existing author-supplied evaluation response export.

This identified release preserves instructional documents from the existing public archive and provides a source snapshot with deployment configuration decoupled from the original service. No new intervention, experiment, participant data collection, or learning-effectiveness analysis is represented here.

## Contents and scope

- `originals/instructional-materials/`: six unchanged instructional PDFs and the original README.
- `derived/source/`: application source; only Supabase deployment configuration changed to environment variables, with `.env.example`.
- `derived/configuration.patch`: exact configuration-only diff.
- `derived/content-inventory.json`: mechanical inventory of topics, flashcards, questions and scoring from the archived code.
- `derived/reported-*.csv`: preserved historical manuscript transcriptions.
- `derived/evaluation/`: anonymized responses (28 complete SUS and three usefulness items), recovered Portuguese question labels, recomputed scores/frequencies, profile aggregates, separately redacted comments, privacy documentation, and a standard-library Python reproduction script.
- `history/2026-10-12/`: earlier release documentation preserved before recovery of evaluation records.
- `CONSISTENCY.md`: differences between the source archive, instructional materials, and submitted manuscript.
- `manifest-sha256.json`: provenance and file checksums.

## Reproducing the recovered quantitative results

Run `python3 derived/evaluation/recompute.py`. This reproduces the mean SUS 92.05357142857143, median 95, sample standard deviation 7.699614331027291 (n-1), minimum 70, maximum 100, and all SUS and agreement frequencies. The submitted rounded statistics are confirmed. No responses were imputed or excluded and no new data were collected.

The export recovers the Portuguese question labels, not the complete form layout, consent text, demographic choices, required-field settings or routing. Authors confirm online application and grouping of comments. The original coding matrix, detailed reconciliation procedure, evaluated code revision, interaction duration and full-topic completion remain undocumented. Original qualitative category frequencies remain reported values; this release does not perform a new qualitative recoding.

The education labels are aggregates of self-reports; whether they describe completed or ongoing education is unknown. Prior knowledge is a retrospective self-rating collected post-use, not a knowledge pre-test. No objective learning, retention or transfer outcome was collected.

## Running the source

Clone this repository and enter the application source directory:

```sh
git clone https://github.com/californi/devevolution-sbqs2026-replication.git
cd devevolution-sbqs2026-replication/derived/source
```

Use the package manifest and supplied Bun lockfile. In the application source directory, copy `.env.example` to a local `.env` and configure a separately provisioned Supabase project. Install dependencies and run the `dev` command in `package.json`. The archive does not include SQL schema/migrations or row-level security policies; backend reproduction therefore requires author-supplied configuration. The web deployment is https://dev-evolution-game.lovable.app/; the public source snapshot is not proven to be exactly the version evaluated by all participants.

## Provenance and privacy

Downloaded on 2026-10-12 from:
- https://anonymous.4open.science/r/dev-documentacao-69D6/
- https://anonymous.4open.science/r/dev-evolution-game-467a7222-6B2B/

Original downloaded archives are preserved locally. Instructional PDFs are published byte-for-byte. Source configuration changes are documented in a derived file; learning content, labels and scoring are preserved. Operational player names, emails and database exports are excluded. Private reviews and private revision spreadsheets are excluded. No new license is asserted; reuse permissions should be confirmed with the authors where not present in original materials.

The identified instructional repository https://github.com/vanessarodrigues5307/dev-documentacao was downloaded on 2026-10-13 and contains the same six PDFs and original README byte-for-byte as the earlier anonymous documentation archive. It contains no additional evaluation-duration, completion or coding records. The evaluation export was supplied separately by the authors. Its original workbook is preserved privately. See `derived/evaluation/PRIVACY.md` for transformations; exact timestamps, individual profiles and comment-to-score mappings are excluded. Private review documents and revision workbooks are not public replication materials.
