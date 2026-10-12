# DevEvolution — SBQS 2026 replication materials

Associated paper: **DevEvolution: A Web-Based Gamified Educational Application for Software Measurement and Analysis**, SBQS 2026, Education in Software Quality track.

Authors in submission order: Vanessa Rodrigues de Oliveira, Vanusa Rodrigues de Oliveira, Bento Rafael Siqueira, Cristiane Aparecida Lana, Samira Santos da Silva. Affiliations and institutional contacts: [AUTHORS.md](AUTHORS.md).

This identified release preserves instructional documents from the existing public archive and provides a source snapshot with deployment configuration decoupled from the original service. No new intervention, experiment, participant data collection, or learning-effectiveness analysis is represented here.

## Contents and scope

- `originals/instructional-materials/`: six unchanged instructional PDFs and the original README.
- `derived/source/`: application source; only Supabase deployment configuration changed to environment variables, with `.env.example`.
- `derived/configuration.patch`: exact configuration-only diff.
- `derived/content-inventory.json`: mechanical inventory of topics, flashcards, questions and scoring from the archived code.
- `derived/reported-*.csv`: aggregate values transcribed from the submitted manuscript, explicitly **not participant-level data** and not independently recomputed.
- `CONSISTENCY.md`: differences between the source archive, instructional materials, and submitted manuscript.
- `manifest-sha256.json`: provenance and file checksums.

## Empirical replication limitation

The retrieved documentation archive contains six instructional PDFs and a README. It does **not** contain the administered evaluation questionnaire, individual SUS responses, demographic records, or qualitative coding matrix. The source archive likewise does not supply those records. This release supports artifact inspection but does not independently reproduce the empirical evaluation. The reported SUS mean of 92.1 and other statistics remain manuscript reports pending verification. No synthetic data or reconstructed administered questionnaire is included.

## Running the source

Use the package manifest and supplied Bun lockfile. Copy `derived/source/.env.example` to a local `.env` and configure a separately provisioned Supabase project. Install dependencies and run the `dev` command in `package.json`. The archive does not include SQL schema/migrations or row-level security policies; backend reproduction therefore requires author-supplied configuration. The web deployment is https://dev-evolution-game.lovable.app/; the public source snapshot is not proven to be exactly the version evaluated by all participants.

## Provenance and privacy

Downloaded on 2026-10-12 from:
- https://anonymous.4open.science/r/dev-documentacao-69D6/
- https://anonymous.4open.science/r/dev-evolution-game-467a7222-6B2B/

Original downloaded archives are preserved locally. Instructional PDFs are published byte-for-byte. Source configuration changes are documented in a derived file; learning content, labels and scoring are preserved. Operational player names, emails and database exports are excluded. Private reviews and private revision spreadsheets are excluded. No new license is asserted; reuse permissions should be confirmed with the authors where not present in original materials.
