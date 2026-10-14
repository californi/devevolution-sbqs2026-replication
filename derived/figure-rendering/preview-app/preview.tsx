import React from 'react';
import {createRoot} from 'react-dom/client';
import {Header,LevelSelect,StudyMode,QuizMode,SessionTrail,ModuleSummary} from './GameViews';
import {contentDatabase,sessionOrder,levelMeta} from './contentDatabase';
import t from './translations.json';
const noOp=()=>{};
levelMeta.junior.name=t.junior_title;levelMeta.junior.role=t.junior_title;
levelMeta.senior.name=t.senior_title;levelMeta.senior.role=t.senior_title;
levelMeta.pleno.name=t.pleno_title;levelMeta.pleno.role=t.pleno_title;
sessionOrder.junior.forEach((id,i)=>contentDatabase.junior[id].title=t.topic_titles[i]);
const loc=contentDatabase.junior['1.1'];loc.flashcards[0]=t.loc_card;
t.questions.forEach((x,i)=>{const q=loc.quizzes[i];const correct=q.options.indexOf(q.correct);q.question=x.question;q.options=x.options;q.correct=x.options[correct];q.explanation=x.explanation;});
contentDatabase.junior['1.3'].flashcards=t.summary_cards;
const mode=new URLSearchParams(location.search).get('view')||'levels';
const player={id:'illustration-only',name:'Hidden_User',email:'',score:mode==='correct'?2:0,current_level:'junior',current_session:mode==='summary'?'1.3':'1.1',completed_quiz_ids:mode==='wrong'?['x_s11q1']:mode==='correct'?['x_s11q1','s11q2']:[],total_correct:mode==='correct'?1:0};
function Preview(){
 const qIndex=mode==='correct'?1:0;const q=loc.quizzes[qIndex];
 return <div id="preview">
  {!['levels','path','summary'].includes(mode)&&<Header player={player} onLogoClick={noOp}/>}
  <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
   {mode==='levels'&&<LevelSelect player={player} onStart={noOp} onOpenSummary={noOp}/>}
   {mode==='study'&&<StudyMode player={player} flashIdx={0} onNext={noOp} onPrev={noOp} onBack={noOp}/>}
   {['wrong','correct'].includes(mode)&&<QuizMode player={player} quizIdx={qIndex} selected={mode==='correct'?q.correct:q.options[2]} locked={true} lastAwarded={mode==='correct'?2:0} onAnswer={noOp} onContinue={noOp} onTimeout={noOp} onBack={noOp}/>}
   {mode==='path'&&<SessionTrail player={player} onStartSession={noOp} onBack={noOp} onOpenSummary={noOp}/>}
   {mode==='summary'&&<ModuleSummary player={player} onContinue={noOp} onOpenSummary={noOp}/>}
  </main>
 </div>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
// Translate UI wording only; classes, SVG icons, gradients and component structure stay intact.
const mappings:[RegExp,string][]=[
 [/Métricas OO\s*[·-]\s*CK/g,'OO Metrics - CK'],[/Métricas de Produto/g,'Product Metrics'],[/Métricas de Processo/g,'Process Metrics'],
 [/Dev Júnior/g,'Junior Developer'],[/Dev Sênior/g,'Senior Developer'],[/Dev Pleno/g,'Mid-Level Developer'],
 [/Escolha sua aventura/g,'Choose your adventure'],[/Escolha sua fase/g,'Choose your stage'],[/Evolua dominando as métricas de software!/g,'Advance by practicing software metrics!'],
 [/Começar fase (\d+)/g,'Start stage $1'],[/Precisa de (\d+) pontos/g,'Requires $1 points'],[/Fase (\d+)/g,'Stage $1'],[/Fase/g,'Stage'],
 [/Resumos das sub-sessões/g,'Topic summaries'],[/Conclua um módulo para desbloquear o resumo dele\./g,'Complete a topic to unlock its summary.'],
 [/Jogo das Métricas/g,'Metrics Game'],[/Voltar à trilha/g,'Back to path'],[/Voltar às fases/g,'Back to stages'],
 [/Estudo · Módulo/g,'Study · Topic'],[/Quiz · Módulo/g,'Quiz · Topic'],[/Cartão (\d+) de (\d+) — aprenda no seu ritmo!/g,'Card $1 of $2 - learn at your own pace!'],[/Cartão/g,'Card'],
 [/Anterior/g,'Previous'],[/Próximo/g,'Next'],[/Pergunta (\d+) de (\d+)/g,'Question $1 of $2'],[/vale (\d+) pontos?/g,'worth $1 points'],[/worth 1 points/g,'worth 1 point'],
 [/Resposta incorreta · 0 pontos/g,'Incorrect answer - 0 points'],[/A resposta certa:/g,'Correct answer:'],[/Explicação:/g,'Explanation:'],
 [/Mandou bem!/g,'Well done!'],[/pontos/g,'points'],[/ponto/g,'point'],[/na sua conta!/g,'added to your score!'],[/Próxima pergunta/g,'Next question'],[/Concluir sessão/g,'Finish topic'],
 [/Sua trilha de aprendizado/g,'Your learning path'],[/Fase:/g,'Stage:'],[/Siga a trilha do início ao fim · (\d+) de (\d+) módulos concluídos/g,'Follow the path from start to finish - $1 of $2 topics completed'],
 [/Início/g,'Start'],[/Você está aqui/g,'You are here'],[/Módulo/g,'Topic'],[/Conclua o anterior/g,'Complete the previous topic'],[/Concluído/g,'Completed'],[/Jogar agora/g,'Play now'],[/Fim da fase/g,'End of stage'],
 [/Resumo do módulo/g,'Topic summary'],[/Revise os flashcards deste módulo antes de seguir\./g,'Review this topic\u0027s flashcards before continuing.'],[/Ver resumo/g,'View summary']
];
setTimeout(()=>{
 const walker=document.createTreeWalker(document.getElementById('root')!,NodeFilter.SHOW_TEXT);const nodes:Text[]=[];while(walker.nextNode())nodes.push(walker.currentNode as Text);
 for(const node of nodes){let value=node.data;for(const [p,r] of mappings)value=value.replace(p,r);node.data=value;
  if(value.trim()&&node.parentElement&&!node.parentElement.closest('svg')&&!['Dev','Evolution','Hidden_User','A','B','C','D','0','2','pts'].includes(value.trim())){
   const span=document.createElement('span');span.className='editorial-en';node.replaceWith(span);span.append(node);
  }
 }
 document.body.dataset.ready='true';
},500);
