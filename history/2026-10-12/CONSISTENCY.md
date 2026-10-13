# Consistency audit — 2026-10-12

This audit inspects existing artifacts. It is not a new evaluation or reanalysis of participant-level data.

| Aspect | Submitted manuscript | Archived source / instructional PDFs | Treatment |
|---|---|---|---|
| Topics / activities | 20 / 80 | 20 / 80 | Confirmed mechanically in `content-inventory.json`. |
| Product/code topics | PLOC and LLOC separately; Technical Debt | LOC combines physical/logical counting; includes churn and artifact counts; no separate Technical Debt topic | Revised paper reports the artifact inventory and distinguishes quality concepts from metrics. |
| Career labels | Junior → Mid-Level (CK) → Senior (process) | Executable UI: Junior → Senior (CK, 40 points) → Pleno (process, 100 points) | Content blocks used as the primary description; discrepancy explicit. PDFs also label CK Senior and process Pleno. |
| Fourth-activity points | Uniform 4 | Product/code 4; CK and process 3 | Revised scoring table; no content/scoring alteration to code. |
| Metadata thresholds | 40 and 100 | `levelMeta.unlockScore` contains 12/24 but LevelSelection actually uses constants 40/100 | Executable UI rules reported; unused metadata discrepancy preserved. |
| Challenge timing | Unspecified | 50 seconds | Described as archive property, not evaluation duration. |
| Topic completion | Implied mastery | No remaining answerable activity; attempted wrong answers count as attempts; challenge requires three correct answers | Removed inference that unlocking demonstrates mastery. |
| Evaluation population | Undergraduate in abstract; undergraduate and graduate in Participants | No participant records in public archives | Author confirmation required; no demographic records generated. |
| Completion / session length | All completed in Study Design; duration absent | No evaluation logs | Completion assertion removed; confirmation notes in paper. |
| SUS / open coding | Summary statistics / category frequencies | No raw evaluation responses, administered instrument, codebook, or assignment matrix | Reported values preserved and labelled; per-item analysis cannot be reconstructed. |
| Persistence timestamps | Claimed in prose | Type Player / visible save operations do not document timestamps | Unsupported timestamp claim removed; no backend queried. |
| Backend | Supabase/PostgreSQL | No SQL schema or security policies supplied | Reproduction limit explicit. Environment-based configuration is the only code change. |
| Illustration terminology | Learning cycle includes game/player/badges/streaks | Core implementation is flashcards, multiple-choice questions, feedback, points, unlocking | Paper uses derived vector diagrams; no claim of undocumented badges/streaks. |

The original source revision cannot be uniquely linked to the evaluated cohort with the available records. The paper distinguishes reported study findings from inspected archive properties. The authors must verify this relationship before claiming full replication.
