# Consistency audit — updated 2026-10-13

This audit inspects existing artifacts. The update verifies descriptive quantitative results from recovered existing responses. It is not a new evaluation, data collection, or qualitative recoding.

| Aspect | Submitted manuscript | Archived source / instructional PDFs | Treatment |
|---|---|---|---|
| Topics / activities | 20 / 80 | 20 / 80 | Confirmed mechanically in `content-inventory.json`. |
| Product/code topics | PLOC and LLOC separately; Technical Debt | LOC combines physical/logical counting; includes churn and artifact counts; no separate Technical Debt topic | Revised paper reports the artifact inventory and distinguishes quality concepts from metrics. |
| Career labels | Junior → Mid-Level (CK) → Senior (process) | Executable UI: Junior → Senior (CK, 40 points) → Pleno (process, 100 points) | Content blocks used as the primary description; discrepancy explicit. PDFs also label CK Senior and process Pleno. |
| Fourth-activity points | Uniform 4 | Product/code 4; CK and process 3 | Revised scoring table; no content/scoring alteration to code. |
| Metadata thresholds | 40 and 100 | `levelMeta.unlockScore` contains 12/24 but LevelSelection actually uses constants 40/100 | Executable UI rules reported; unused metadata discrepancy preserved. |
| Challenge timing | Unspecified | 50 seconds | Described as archive property, not evaluation duration. |
| Topic completion | Implied mastery | No remaining answerable activity; attempted wrong answers count as attempts; challenge requires three correct answers | Removed inference that unlocking demonstrates mastery. |
| Evaluation population | Undergraduate in abstract; undergraduate and graduate in Participants | Recovered self-reported labels: Graduação 18, Ensino médio 9, Mestrado 1; prior SE subject 26 yes/2 no | Paper uses participants and reports labels without inferring enrollment, cohort or institution. Completed/ongoing education unknown. |
| Completion / session length | All completed in Study Design; duration absent | Response export supplies post-use dates, but no time-on-task or full-topic completion logs | Completion assertion removed; duration and completion remain limitations. Response timestamps cannot establish session duration. |
| SUS / agreement | Summary statistics and three agreement distributions | Recovered 28 complete SUS and agreement records; exact exported Portuguese labels | Rounded original aggregates confirmed; SUS counts by item and reproduction script supplied. Full form configuration unavailable. |
| Open coding | Category frequencies | Recovered 20 positive, 13 difficulty and 11 suggestion comments; authors confirm grouping; original coding matrix unavailable | Comments redacted and detached from quantitative IDs. Original category counts preserved as reports; no new recoding. |
| Persistence timestamps | Claimed in prose | Type Player / visible save operations do not document timestamps | Unsupported timestamp claim removed; no backend queried. |
| Backend | Supabase/PostgreSQL | No SQL schema or security policies supplied | Reproduction limit explicit. Environment-based configuration is the only code change. |
| Illustration terminology | Learning cycle includes game/player/badges/streaks | Core implementation is flashcards, multiple-choice questions, feedback, points, unlocking | Paper uses derived vector diagrams; no claim of undocumented badges/streaks. |

The original source revision cannot be uniquely linked to the evaluated cohort with the available records. The paper distinguishes reported study findings from inspected archive properties. The authors must verify this relationship before claiming full replication.

Earlier documentation is preserved under `history/2026-10-12/`. The new identified GitHub documentation repository matches the old instructional files byte-for-byte and supplies no missing evaluation logs or coding matrix. The privately preserved response export is a distinct recovered source.
