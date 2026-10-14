from pathlib import Path
import shutil,json,hashlib,sys
W=Path(__file__).resolve().parent.parent;D=Path(__file__).resolve().parent;A=D/'preview-app';S=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else W/'replication-release/derived/source/src'
source=(S/'components/DevEvolutionGame.tsx').read_text()
# Use the actual supplied view components; omit authentication/persistence controller.
views=source[:source.index('export default function DevEvolutionGame()')]+source[source.index('function FloatingBlobs()'):]
views=views.replace('import { supabase, type Player } from "@/lib/supabase";','type Player = { id: string; name: string; email: string; score: number; current_level: string; current_session: string; completed_quiz_ids: string[]; total_correct: number };')
views=views.replace('from "@/lib/contentDatabase"','from "./contentDatabase"')
views+='\nexport { Header, LevelSelect, StudyMode, QuizMode, SessionTrail, ModuleSummary };\n'
(A/'GameViews.tsx').write_text(views)
shutil.copy2(S/'lib/contentDatabase.ts',A/'contentDatabase.ts')
shutil.copy2(S/'styles.css',A/'original-styles.css')
translations={
 'junior_title':'Junior Developer','senior_title':'Senior Developer','pleno_title':'Mid-Level Developer',
 'topic_titles':['LOC Metric (Lines of Code)','Function Points (FP)','Cyclomatic Complexity (McCabe)','Nesting Depth','Parameters per Method','Maintainability Index','Code Smells','Code Churn','Modules, Classes, Methods and Requirements'],
 'loc_card':'<strong>Definition and Purpose:</strong> <strong>Lines of Code</strong> is one of the oldest software engineering metrics. It measures <strong>software size</strong> by counting the number of lines in its source code.',
 'questions':[
  {'question':'What does LOC directly measure in software?','options':['Algorithm complexity.','Source-code size.','Execution speed.','Number of bugs found.'],'explanation':'LOC (Lines of Code) measures software size by counting its source-code lines.'},
  {'question':'What is the main technical limitation of LOC?','options':['It is very difficult to automate.','It requires complex mathematical calculations.','It measures quantity, not quality or complexity.','It only works for the Java language.'],'explanation':'LOC measures quantity, not quality. It does not capture the actual complexity or quality of software.'}],
 'summary_cards':[
  '<strong>Definition:</strong> A metric created by <strong>Thomas McCabe in 1976</strong> to measure the <strong>complexity of a module</strong> (function or method). It counts the number of <strong>linearly independent execution paths</strong> that code can follow to its end.',
  '<strong>Factors Increasing Complexity:</strong><br/>Complexity increases with each <strong>predicate node</strong>: a decision point or control-flow branch.<br/>Examples include conditionals and loops, such as <strong>if</strong>, <strong>while</strong>, and <strong>switch</strong>.',
  '<strong>Risk Limits</strong> (Reference Values):<br/><strong>1 to 10:</strong> Simple method (low risk).<br/><strong>11 to 20:</strong> Moderately complex (moderate risk).<br/><strong>21 to 50:</strong> Very complex (high risk).<br/><strong>Above 50:</strong> Extremely high risk and unstable.',
  '<strong>Equivalent Formulas</strong> (Graph Calculation): From a <strong>control-flow graph</strong>, three equivalent formulas give complexity <strong>V(G)</strong>:<br/>1. <strong>V(G) = R</strong> (R: number of regions/enclosed spaces).<br/>2. <strong>V(G) = E - N + 2</strong> (E: edges/arrows; N: nodes).<br/>3. <strong>V(G) = P + 1</strong> (P: predicate nodes/decision points).',
  '<strong>Practical Calculation Example:</strong><br/><strong>Decision Points (P):</strong> Code with one <strong>if</strong> and one <strong>while</strong> has two decision points (<strong>P = 2</strong>).<br/><strong>Calculation:</strong> Using <strong>V(G) = P + 1</strong>, the result is <strong>V(G) = 2 + 1 = 3</strong>.',
  '<strong>Minimum Coverage Testing:</strong> Complexity determines the <strong>minimum number of unit tests</strong> required to cover all possible code paths. A method with complexity <strong>3</strong> needs at least <strong>three distinct unit tests</strong>. This guarantees <strong>100% coverage</strong> of linearly independent paths, leaving no branch or logical deviation untested and unvalidated.'
 ]}
(A/'translations.json').write_text(json.dumps(translations,ensure_ascii=False,indent=2)+'\n')
(D/'source-provenance.json').write_text(json.dumps({'source':'replication-release/derived/source/src/components/DevEvolutionGame.tsx','source_sha256':hashlib.sha256(source.encode()).hexdigest(),'method':'Render original supplied React views and original CSS with editorial English text; illustrative states match supplied screenshots; no authentication, backend access, player data or new evaluation','source_claims':'The six summary cards translate the original instructional claims without independently validating risk bands, formula conditions or coverage guarantees'},indent=2)+'\n')
print('Original view components and styles preserved for English editorial rendering')
