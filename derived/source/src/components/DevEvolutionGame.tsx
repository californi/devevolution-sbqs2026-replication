import { useCallback, useState, useEffect } from "react";
import {
  Rocket,
  Lock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  ScrollText,
  LogIn,
  User,
  Mail,
  Star,
  Sparkles,
  Crown,
  Sprout,
  BookOpen,
  ArrowRight,
  PartyPopper,
  X,
  Zap,
  Layers,
  CircleCheck,
  Circle,
  Play,
  Monitor,
  Server,
  Cloud,
  Database,
  Cpu,
  GitBranch,
  Terminal,
  Flag,
  Trophy,
  AlarmClock,
  Flame,
} from "lucide-react";
import { supabase, type Player } from "@/lib/supabase";
import {
  contentDatabase,
  sessionOrder,
  levelMeta,
  type LevelKey,
  type Quiz,
  type Session,
} from "@/lib/contentDatabase";

type View = "login" | "levels" | "sessions" | "study" | "quiz" | "moduleSummary";

const SENIOR_UNLOCK = 40;
const PLENO_UNLOCK = 100;
const CHALLENGE_SECONDS = 50;

function roleFor(level: string): string {
  return levelMeta[(level as LevelKey) ?? "junior"]?.role ?? "Dev Júnior";
}

function cleanTitle(t: string): string {
  return t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim();
}

// Challenge (4th question) only unlocks if the first 3 questions were answered correctly.
function challengeUnlocked(session: Session, p: Player): boolean {
  return session.quizzes
    .slice(0, 3)
    .every((q) => p.completed_quiz_ids.includes(q.id));
}

// A question is "attempted" if answered right (id) or wrong (x_id) — it can never be redone.
function isAttempted(quiz: Quiz, p: Player): boolean {
  return p.completed_quiz_ids.includes(quiz.id) || p.completed_quiz_ids.includes(`x_${quiz.id}`);
}

// Next answerable question index, skipping attempted ones and the locked challenge.
function nextPlayableIndex(session: Session, fromIdx: number, p: Player): number {
  for (let i = fromIdx; i < session.quizzes.length; i++) {
    const q = session.quizzes[i];
    if (q.challenge && !challengeUnlocked(session, p)) continue;
    if (!isAttempted(q, p)) return i;
  }
  return -1;
}

// A module is complete once there are no more playable questions left (right OR wrong).
function sessionCompleted(session: Session, p: Player): boolean {
  return nextPlayableIndex(session, 0, p) === -1;
}

// A module is unlocked if it is the first OR the previous module is fully completed.
function moduleUnlocked(level: LevelKey, index: number, p: Player): boolean {
  if (index <= 0) return true;
  const order = sessionOrder[level] ?? [];
  const prev = contentDatabase[level]?.[order[index - 1]];
  return prev ? sessionCompleted(prev, p) : false;
}

export default function DevEvolutionGame() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [view, setView] = useState<View>("login");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [flashIdx, setFlashIdx] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [lastAwarded, setLastAwarded] = useState<number | null>(null);
  const [summaryTarget, setSummaryTarget] = useState<{ level: LevelKey; id: string } | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const savePlayer = useCallback(async (patch: Partial<Player>, current?: Player) => {
    const target = current ?? player;
    if (!target) return;
    const merged = { ...target, ...patch };
    setPlayer(merged);
    const { error } = await supabase
      .from("players")
      .update({
        score: merged.score,
        current_level: merged.current_level,
        current_session: merged.current_session,
        completed_quiz_ids: merged.completed_quiz_ids,
        total_correct: merged.total_correct,
      })
      .eq("id", merged.id);
    if (error) console.error("auto-save failed", error);
  }, [player]);

  const handleLogin = async () => {
    setAuthError(null);
    if (!name.trim() || !email.trim()) {
      setAuthError("Preencha seu nome e e-mail para começar.");
      return;
    }
    setLoading(true);
    try {
      const { data: existing, error: selErr } = await supabase
        .from("players")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();
      if (selErr) throw selErr;
      let p: Player;
      if (existing) {
        p = {
          ...existing,
          completed_quiz_ids: Array.isArray(existing.completed_quiz_ids)
            ? existing.completed_quiz_ids
            : [],
        } as Player;
      } else {
        const { data: created, error: insErr } = await supabase
          .from("players")
          .insert({
            email: email.trim().toLowerCase(),
            name: name.trim(),
            score: 0,
            current_level: "junior",
            current_session: "1.1",
            completed_quiz_ids: [],
            total_correct: 0,
          })
          .select("*")
          .single();
        if (insErr) throw insErr;
        p = { ...created, completed_quiz_ids: created.completed_quiz_ids ?? [] } as Player;
      }
      setPlayer(p);
      setView("levels");
    } catch (e: any) {
      setAuthError(e.message ?? "Não foi possível entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const goHome = async () => {
    if (player) await savePlayer({}, player);
    setView("levels");
    resetQuizState();
  };

  const resetQuizState = () => {
    setFlashIdx(0);
    setQuizIdx(0);
    setSelected(null);
    setLocked(false);
    setLastAwarded(null);
  };

  const startLevel = (level: LevelKey) => {
    if (!player) return;
    savePlayer({ current_level: level });
    setView("sessions");
  };

  const startSession = (sessionId: string) => {
    if (!player) return;
    const level = player.current_level as LevelKey;
    const order = sessionOrder[level] ?? [];
    const idx = order.indexOf(sessionId);
    if (!moduleUnlocked(level, idx, player)) return;
    savePlayer({ current_session: sessionId });
    resetQuizState();
    setView("study");
  };

  const endSession = () => {
    if (!player) return;
    // Show a recap of the flashcards after finishing the module (right or wrong).
    setView("moduleSummary");
    setSelected(null);
    setLocked(false);
    setLastAwarded(null);
  };

  const finishModuleSummary = () => {
    if (!player) return;
    const order = sessionOrder[player.current_level as LevelKey];
    const idx = order.indexOf(player.current_session);
    const nextSession = order[idx + 1];
    if (nextSession) {
      savePlayer({ current_session: nextSession });
    }
    resetQuizState();
    setView("sessions");
  };

  const backToSessions = () => {
    if (player) savePlayer({}, player);
    resetQuizState();
    setView("sessions");
  };

  const submitAnswer = (quiz: Quiz, opt: string) => {
    if (locked || !player) return;
    setSelected(opt);
    setLocked(true);
    const correct = opt === quiz.correct;
    if (correct) {
      const alreadyDone = player.completed_quiz_ids.includes(quiz.id);
      const newCompleted = alreadyDone
        ? player.completed_quiz_ids
        : [...player.completed_quiz_ids, quiz.id];
      const newTotal = alreadyDone ? player.total_correct : player.total_correct + 1;
      const newScore = alreadyDone ? player.score : player.score + quiz.points;
      setLastAwarded(quiz.points);
      savePlayer(
        {
          score: newScore,
          completed_quiz_ids: newCompleted,
          total_correct: newTotal,
        },
        player,
      );
    } else {
      // Mark the question as attempted (wrong) so it can never be redone, without awarding points.
      const wrongMark = `x_${quiz.id}`;
      const newCompleted = player.completed_quiz_ids.includes(wrongMark)
        ? player.completed_quiz_ids
        : [...player.completed_quiz_ids, wrongMark];
      setLastAwarded(0);
      savePlayer({ completed_quiz_ids: newCompleted }, player);
    }
  };

  // Time ran out on the timed challenge — count as a wrong (attempted) answer.
  const timeoutAnswer = (quiz: Quiz) => {
    if (locked || !player) return;
    setSelected("__timeout__");
    setLocked(true);
    const wrongMark = `x_${quiz.id}`;
    const newCompleted = player.completed_quiz_ids.includes(wrongMark)
      ? player.completed_quiz_ids
      : [...player.completed_quiz_ids, wrongMark];
    setLastAwarded(0);
    savePlayer({ completed_quiz_ids: newCompleted }, player);
  };

  const goNextQuestion = () => {
    if (!player) return;
    const session = contentDatabase[player.current_level as LevelKey]?.[player.current_session];
    if (!session) return;
    setSelected(null);
    setLocked(false);
    setLastAwarded(null);
    const next = nextPlayableIndex(session, quizIdx + 1, player);
    if (next >= 0) {
      setQuizIdx(next);
    } else {
      endSession();
    }
  };

  const advanceFlashcard = () => {
    if (!player) return;
    const session = contentDatabase[player.current_level as LevelKey]?.[player.current_session];
    if (!session) return;
    if (flashIdx + 1 < session.flashcards.length) {
      setFlashIdx(flashIdx + 1);
    } else {
      const first = nextPlayableIndex(session, 0, player);
      if (first >= 0) {
        setQuizIdx(first);
        setSelected(null);
        setLocked(false);
        setLastAwarded(null);
        setView("quiz");
      } else {
        endSession();
      }
    }
  };

  if (view === "login" || !player) {
    return <LoginScreen
      name={name} setName={setName}
      email={email} setEmail={setEmail}
      onSubmit={handleLogin}
      loading={loading}
      error={authError}
    />;
  }

  return (
    <div className="min-h-screen">
      <Header player={player} onLogoClick={goHome} />
      <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        {view === "levels" && <LevelSelect player={player} onStart={startLevel} onOpenSummary={(level, id) => setSummaryTarget({ level, id })} />}
        {view === "sessions" && <SessionTrail player={player} onStartSession={startSession} onBack={() => setView("levels")} onOpenSummary={(level, id) => setSummaryTarget({ level, id })} />}
        {view === "study" && <StudyMode player={player} flashIdx={flashIdx} onNext={advanceFlashcard} onPrev={() => setFlashIdx(Math.max(0, flashIdx - 1))} onBack={backToSessions} />}
        {view === "quiz" && (
          <QuizMode
            player={player}
            quizIdx={quizIdx}
            selected={selected}
            locked={locked}
            lastAwarded={lastAwarded}
            onAnswer={submitAnswer}
            onContinue={goNextQuestion}
            onTimeout={timeoutAnswer}
            onBack={backToSessions}
          />
        )}
        {view === "moduleSummary" && (
          <ModuleSummary player={player} onContinue={finishModuleSummary} onOpenSummary={(level, id) => setSummaryTarget({ level, id })} />
        )}
      </main>

      {summaryTarget && (
        <SummaryModal
          level={summaryTarget.level}
          sessionId={summaryTarget.id}
          onClose={() => setSummaryTarget(null)}
        />
      )}
    </div>
  );
}

/* =================== Componentes =================== */

function FloatingBlobs() {
  return (
    <>
      <div className="pointer-events-none absolute -top-20 -left-16 w-72 h-72 rounded-full opacity-50 blur-3xl float-soft" style={{ background: "var(--pop-sky)" }} />
      <div className="pointer-events-none absolute -bottom-24 -right-16 w-80 h-80 rounded-full opacity-50 blur-3xl float-soft" style={{ background: "var(--pop-violet)", animationDelay: "1.5s" }} />
      <div className="pointer-events-none absolute top-1/2 -right-10 w-40 h-40 rounded-full opacity-40 blur-2xl float-soft" style={{ background: "var(--pop-mint)", animationDelay: "0.8s" }} />
    </>
  );
}

function LoginScreen(props: {
  name: string; setName: (s: string) => void;
  email: string; setEmail: (s: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <FloatingBlobs />
      <div className="w-full max-w-md card-pop p-8 md:p-10 relative pop-in">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Bem-vindo ao jogo!
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            Dev<span className="text-glow">Evolution</span>
          </h1>
          <p className="text-base text-muted-foreground mt-2">
            Aprenda métricas de software jogando 🎯
          </p>
        </div>

        <div className="space-y-4">
          <Field
            icon={<User className="w-4 h-4" />}
            label="Seu nome"
            value={props.name}
            onChange={props.setName}
            placeholder="Como podemos te chamar?"
            type="text"
          />
          <Field
            icon={<Mail className="w-4 h-4" />}
            label="E-mail"
            value={props.email}
            onChange={props.setEmail}
            placeholder="voce@exemplo.com"
            type="email"
          />

          {props.error && (
            <div className="text-destructive bg-destructive/10 border-2 border-destructive/40 rounded-2xl p-3 text-sm flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" /> {props.error}
            </div>
          )}

          <button
            onClick={props.onSubmit}
            disabled={props.loading}
            className="btn-fun w-full text-base py-4 flex items-center justify-center gap-2 shimmer"
          >
            <LogIn className="w-5 h-5" />
            {props.loading ? "Entrando..." : "Começar a jogar!"}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t-2 border-dashed border-border text-sm text-muted-foreground flex justify-between items-center">
          <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-[oklch(0.85_0.18_95)]" /> Versão 1.0</span>
          <span className="flex items-center gap-1.5 text-accent-foreground"><span className="w-2 h-2 rounded-full bg-[oklch(0.72_0.2_145)] animate-pulse" /> Conectado</span>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, value, onChange, placeholder, type }: {
  icon: React.ReactNode; label: string; value: string;
  onChange: (s: string) => void; placeholder: string; type: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
        <span className="text-primary">{icon}</span> {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-base px-4 py-3 rounded-2xl border-2 border-border bg-input focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition text-foreground placeholder:text-muted-foreground/70"
      />
    </div>
  );
}

function Header({ player, onLogoClick }: { player: Player; onLogoClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b-2 border-border">
      <div className="mx-auto max-w-5xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <button onClick={onLogoClick} className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl grid place-items-center text-white shadow-md hover-wiggle" style={{ background: "var(--gradient-button)" }}>
            <Rocket className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-lg font-display font-bold tracking-tight">Dev<span className="text-glow">Evolution</span></span>
            <span className="text-xs text-muted-foreground">Jogo das Métricas</span>
          </div>
        </button>
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <Chip icon={<User className="w-3.5 h-3.5" />} label={player.name} />
          <Chip icon={<Crown className="w-3.5 h-3.5" />} label={roleFor(player.current_level)} variant="accent" />
          <Chip icon={<Star className="w-3.5 h-3.5" />} label={`${player.score} pts`} variant="primary" />
        </div>
      </div>
    </header>
  );
}

function Chip({ icon, label, variant = "default" }: { icon: React.ReactNode; label: string; variant?: "default" | "primary" | "accent" }) {
  const styles = {
    default: "bg-secondary text-secondary-foreground border-secondary",
    primary: "text-white border-transparent shadow-md",
    accent: "text-accent-foreground border-transparent shadow-md",
  }[variant];
  const bg = variant === "primary"
    ? { background: "var(--gradient-button)" }
    : variant === "accent"
      ? { background: "var(--gradient-mint)" }
      : undefined;
  return (
    <span className={`px-3 py-1.5 rounded-full border-2 ${styles} flex items-center gap-1.5`} style={bg}>
      {icon} {label}
    </span>
  );
}

function SectionHeader({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold mb-3">
        <Sparkles className="w-3.5 h-3.5" /> {kicker}
      </div>
      <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">{title}</h2>
      {sub && <p className="text-muted-foreground mt-2 text-base">{sub}</p>}
    </div>
  );
}

function LevelSelect({ player, onStart, onOpenSummary }: { player: Player; onStart: (l: LevelKey) => void; onOpenSummary: (level: LevelKey, id: string) => void }) {
  // Every sub-session already completed becomes available for review as a summary.
  const completedSummaries = (["junior", "pleno", "senior"] as LevelKey[]).flatMap((lvl) =>
    (sessionOrder[lvl] ?? [])
      .map((id) => ({ level: lvl, id, session: contentDatabase[lvl]?.[id] }))
      .filter((x) => x.session && sessionCompleted(x.session, player)),
  );

  return (
    <div className="pop-in">
      <SectionHeader
        kicker="Escolha sua aventura"
        title="Escolha sua fase"
        sub="Evolua dominando as métricas de software!"
      />

      <div className="grid md:grid-cols-3 gap-5">
        <LevelCard
          index="01"
          title="Dev Júnior"
          subtitle="Métricas de Produto"
          icon={<Sprout className="w-6 h-6" />}
          color="var(--gradient-mint)"
          unlocked
          ctaLabel="Começar fase 01"
          onClick={() => onStart("junior")}
        />
        <LevelCard
          index="02"
          title="Dev Sênior"
          subtitle="Métricas OO · CK"
          icon={<Crown className="w-6 h-6" />}
          color="var(--gradient-fun)"
          unlocked={player.score >= SENIOR_UNLOCK}
          lockText={`Precisa de ${SENIOR_UNLOCK} pontos`}
          ctaLabel="Começar fase 02"
          onClick={() => onStart("senior")}
        />
        <LevelCard
          index="03"
          title="Dev Pleno"
          subtitle="Métricas de Processo"
          icon={<Zap className="w-6 h-6" />}
          color="var(--gradient-button)"
          unlocked={player.score >= PLENO_UNLOCK}
          lockText={`Precisa de ${PLENO_UNLOCK} pontos`}
          ctaLabel="Começar fase 03"
          onClick={() => onStart("pleno")}
        />
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl grid place-items-center text-white shadow-md" style={{ background: "var(--gradient-warn)" }}>
            <ScrollText className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-lg">Resumos das sub-sessões</p>
            <p className="text-muted-foreground text-sm">
              {completedSummaries.length > 0
                ? "Revise os flashcards dos módulos que você já concluiu."
                : "Conclua um módulo para desbloquear o resumo dele."}
            </p>
          </div>
        </div>

        {completedSummaries.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {completedSummaries.map(({ level, id, session }) => (
              <button
                key={`${level}-${id}`}
                onClick={() => onOpenSummary(level, id)}
                className="card-pop p-4 flex items-center justify-between gap-3 text-left hover:-translate-y-0.5 transition"
              >
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-full">
                    {levelMeta[level]?.name} · {id}
                  </span>
                  <p className="font-bold text-sm mt-1 truncate">{cleanTitle(session!.title)}</p>
                </div>
                <span className="btn-fun px-4 py-2 text-xs flex items-center gap-1.5 shrink-0">
                  <BookOpen className="w-3.5 h-3.5" /> Ver
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LevelCard(props: {
  index: string; title: string; subtitle: string; icon: React.ReactNode;
  color: string;
  unlocked: boolean; lockText?: string; ctaLabel: string; onClick: () => void;
}) {
  const locked = !props.unlocked;
  return (
    <div className={`relative overflow-hidden p-6 flex flex-col card-pop ${locked ? "opacity-70" : ""}`}>
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-25 blur-2xl" style={{ background: props.color }} />
      <div className="flex items-start justify-between mb-6 relative">
        <div
          className={`w-14 h-14 rounded-2xl grid place-items-center shadow-md ${locked ? "bg-muted text-muted-foreground" : "text-white hover-wiggle"}`}
          style={locked ? undefined : { background: props.color }}
        >
          {locked ? <Lock className="w-5 h-5" /> : props.icon}
        </div>
        <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">Fase {props.index}</span>
      </div>
      <h3 className="text-2xl font-display font-bold tracking-tight">{props.title}</h3>
      <p className="text-muted-foreground text-base mt-1 mb-6">{props.subtitle}</p>
      <div className="mt-auto">
        {props.unlocked ? (
          <button
            onClick={props.onClick}
            className="btn-fun w-full text-sm py-3 flex items-center justify-center gap-2"
            style={{ background: props.color }}
          >
            {props.ctaLabel} <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-full bg-muted text-muted-foreground text-sm font-bold py-3 rounded-full flex items-center justify-center gap-2 border-2 border-dashed border-border">
            <Lock className="w-4 h-4" /> {props.lockText}
          </div>
        )}
      </div>
    </div>
  );
}

function StudyMode({ player, flashIdx, onNext, onPrev, onBack }: {
  player: Player; flashIdx: number; onNext: () => void; onPrev: () => void; onBack: () => void;
}) {
  const session = contentDatabase[player.current_level as LevelKey]?.[player.current_session];
  if (!session) return <EmptySession />;
  const total = session.flashcards.length;
  const isLast = flashIdx === total - 1;
  return (
    <div className="pop-in">
      <BackButton onClick={onBack} label="Voltar à trilha" />
      <SectionHeader
        kicker={`Estudo · Módulo ${player.current_session}`}
        title={cleanTitle(session.title)}
        sub={`Cartão ${flashIdx + 1} de ${total} — aprenda no seu ritmo!`}
      />


      <div className="relative flashcard-blue p-8 md:p-12 min-h-[260px] flex items-center overflow-hidden shimmer">
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: "var(--gradient-button)" }} />
        <div className="absolute top-3 left-5 text-xs font-bold text-muted-foreground">
          Cartão {String(flashIdx + 1).padStart(2, "0")}
        </div>
        <p
          className="text-lg md:text-xl leading-relaxed text-foreground"
          dangerouslySetInnerHTML={{ __html: session.flashcards[flashIdx] }}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3 justify-between items-center">
        <button
          onClick={onPrev} disabled={flashIdx === 0}
          className="px-5 py-3 rounded-full border-2 border-border bg-card text-foreground font-bold text-sm disabled:opacity-40 hover:border-primary hover:text-primary transition flex items-center gap-2 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>

        <div className="flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`h-2 w-8 rounded-full transition-all ${i <= flashIdx ? "" : "bg-border"}`} style={i <= flashIdx ? { background: "var(--gradient-button)" } : undefined} />
          ))}
        </div>

        <button
          onClick={onNext}
          className="btn-fun px-6 py-3 text-sm flex items-center gap-2"
        >
          {isLast ? "Vamos ao quiz!" : "Próximo"} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function QuizMode({ player, quizIdx, selected, locked, lastAwarded, onAnswer, onContinue, onTimeout, onBack }: {
  player: Player; quizIdx: number; selected: string | null; locked: boolean;
  lastAwarded: number | null;
  onAnswer: (q: Quiz, opt: string) => void; onContinue: () => void;
  onTimeout: (q: Quiz) => void; onBack: () => void;
}) {
  const session = contentDatabase[player.current_level as LevelKey]?.[player.current_session];
  const quiz = session?.quizzes[quizIdx];
  const isChallenge = !!quiz?.challenge;
  const [timeLeft, setTimeLeft] = useState(CHALLENGE_SECONDS);

  // Countdown timer — only on the timed final challenge, while it's not answered yet.
  useEffect(() => {
    if (!quiz || !isChallenge || locked) return;
    setTimeLeft(CHALLENGE_SECONDS);
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          onTimeout(quiz);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.id, isChallenge, locked]);

  if (!session || !quiz) return <EmptySession />;
  const total = session.quizzes.length;
  const isCorrect = locked && selected === quiz.correct;
  const isWrong = locked && selected !== quiz.correct;
  const hasNext = locked && nextPlayableIndex(session, quizIdx + 1, player) >= 0;
  const urgent = isChallenge && !locked && timeLeft <= 10;

  return (
    <div className={`pop-in ${urgent ? "challenge-shake" : ""}`}>
      <BackButton onClick={onBack} label="Voltar à trilha" />
      <SectionHeader
        kicker={`Quiz · Módulo ${player.current_session}`}
        title={cleanTitle(session.title)}
      />

      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
        <Chip icon={<BookOpen className="w-3.5 h-3.5" />} label={`Pergunta ${quizIdx + 1} de ${total}`} />
        <Chip icon={<Star className="w-3.5 h-3.5" />} label={`vale ${quiz.points} ${quiz.points === 1 ? "ponto" : "pontos"}`} variant="primary" />
        {isChallenge && (
          <span className="px-3 py-1.5 rounded-full border-2 border-transparent text-white flex items-center gap-1.5 font-bold shadow-md challenge-pulse" style={{ background: "var(--gradient-warn)" }}>
            <Flame className="w-3.5 h-3.5" /> DESAFIO FINAL
          </span>
        )}
        {isChallenge && !locked && (
          <span
            className={`px-3 py-1.5 rounded-full border-2 flex items-center gap-1.5 font-bold tabular-nums ${
              timeLeft <= 10
                ? "bg-destructive text-destructive-foreground border-destructive timer-pulse"
                : "bg-card text-foreground border-border"
            }`}
          >
            <AlarmClock className="w-4 h-4" /> {timeLeft}s
          </span>
        )}
      </div>

      {isChallenge && !locked && (
        <div className="mb-4 w-full h-2.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-1000 ease-linear"
            style={{
              width: `${(timeLeft / CHALLENGE_SECONDS) * 100}%`,
              background: timeLeft <= 10 ? "var(--destructive)" : "var(--gradient-warn)",
            }}
          />
        </div>
      )}

      <div className="w-full h-2.5 bg-border rounded-full overflow-hidden mb-8">
        <div className="h-full transition-all" style={{ width: `${(quizIdx / total) * 100}%`, background: "var(--gradient-button)" }} />
      </div>


      <div
        className={`card-pop p-6 md:p-8 ${isChallenge && !locked ? "challenge-card" : ""}`}
        style={isChallenge ? { background: "var(--destructive)", color: "oklch(1 0 0)", borderColor: "oklch(1 0 0 / 0.4)" } : undefined}
      >
        {isChallenge && !locked && (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide" style={{ background: "oklch(1 0 0 / 0.2)", color: "oklch(1 0 0)" }}>
            <Flame className="w-3.5 h-3.5 flash-icon" /> Responda rápido — vale {quiz.points} pontos!
          </div>
        )}
        <p className="text-xl md:text-2xl font-display font-semibold mb-4 leading-snug" style={isChallenge ? { color: "oklch(1 0 0)" } : undefined}>
          {quiz.question}
        </p>

        {quiz.code && (
          <pre className="mb-6 overflow-x-auto rounded-2xl p-4 text-sm md:text-base font-mono whitespace-pre" style={{ background: "oklch(0.28 0.06 255 / 0.95)", color: "oklch(0.96 0.04 200)" }}>
            <code>{quiz.code}</code>
          </pre>
        )}
        <div className="space-y-3">
          {quiz.options.map((opt, i) => {
            const isSel = selected === opt;
            const showCorrect = locked && opt === quiz.correct;
            const showWrong = locked && isSel && opt !== quiz.correct;
            const letter = String.fromCharCode(65 + i);
            return (
              <button
                key={opt}
                disabled={locked}
                onClick={() => onAnswer(quiz, opt)}
                className={`w-full text-left text-base font-medium px-4 py-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 group ${
                  showCorrect ? "bg-[oklch(0.95_0.1_145)] border-[oklch(0.72_0.2_145)] text-foreground" :
                  showWrong ? "bg-destructive/10 border-destructive text-foreground" :
                  isSel ? "bg-primary/10 border-primary text-foreground" :
                  isChallenge ? "bg-white/95 border-white/60 text-black hover:bg-white hover:border-white" :
                  "bg-card border-border text-foreground hover:border-primary hover:-translate-y-0.5 hover:shadow-md"
                } ${locked && !showCorrect && !showWrong ? "opacity-50" : ""} disabled:cursor-not-allowed`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`text-sm font-bold w-9 h-9 rounded-xl grid place-items-center border-2 ${
                      showCorrect
                        ? "border-[oklch(0.72_0.2_145)] bg-[oklch(0.72_0.2_145)] text-white"
                        : showWrong
                          ? "border-destructive bg-destructive text-white"
                          : isChallenge
                            ? "border-white/60 bg-white text-black group-hover:bg-white group-hover:text-black"
                            : isSel
                              ? "bg-primary text-white border-primary"
                              : "border-border text-muted-foreground group-hover:border-primary group-hover:bg-primary group-hover:text-white"
                    }`}
                  >
                    {letter}
                  </span>
                  {opt}
                </span>
                {showCorrect && <CheckCircle2 className="w-6 h-6 text-[oklch(0.55_0.18_145)]" />}
                {showWrong && <XCircle className="w-6 h-6 text-destructive" />}
              </button>
            );
          })}
        </div>
      </div>

      {isCorrect && (
        <div className="mt-4 card-pop p-4 flex items-center gap-3 text-base font-bold pop-in" style={{ background: "linear-gradient(135deg, oklch(0.95 0.12 145), oklch(0.92 0.14 195))" }}>
          <PartyPopper className="w-6 h-6 text-[oklch(0.5_0.18_145)] bounce-soft" />
          <span className="text-foreground">
            Mandou bem! <span className="text-[oklch(0.45_0.18_145)]">+{lastAwarded} {lastAwarded === 1 ? "ponto" : "pontos"}</span> na sua conta!
          </span>
        </div>
      )}
      {isWrong && (
        <div className="mt-4 bg-destructive/10 border-2 border-destructive rounded-2xl p-4 pop-in">
          <div className="flex items-center gap-2 text-destructive font-bold text-base mb-2">
            <XCircle className="w-5 h-5" />
            {selected === "__timeout__" ? "Tempo esgotado! · 0 pontos" : "Resposta incorreta · 0 pontos"}
          </div>

          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-semibold">A resposta certa: </span>
            <span className="text-foreground">{quiz.correct}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <span className="text-foreground font-semibold">Explicação: </span>{quiz.explanation}
          </p>
        </div>
      )}

      {locked && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={onContinue}
            className="btn-fun px-6 py-3 text-sm flex items-center gap-2"
          >
            {hasNext ? "Próxima pergunta" : "Concluir sessão"} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function SummaryModal({ level, sessionId, onClose }: { level: LevelKey; sessionId: string; onClose: () => void }) {
  const session = contentDatabase[level]?.[sessionId];
  if (!session) return null;
  return (
    <div className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card-pop max-w-2xl w-full p-6 md:p-8 max-h-[85vh] overflow-auto pop-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-2">
              <BookOpen className="w-3.5 h-3.5" /> Resumo
            </div>
            <h3 className="text-2xl font-display font-bold">Sub-sessão {sessionId}</h3>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full border-2 border-border bg-card grid place-items-center hover:border-primary hover:text-primary transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-accent-foreground mb-4">{cleanTitle(session.title)}</h4>
        <ul className="space-y-3">
          {session.flashcards.map((f, i) => (
            <li key={i} className="bg-secondary/50 rounded-2xl p-4 text-sm md:text-base leading-relaxed border-l-4 border-primary">
              <span className="text-primary font-bold">#{String(i + 1).padStart(2, "0")}</span>
              <span className="text-foreground"> · </span>
              <span className="text-foreground" dangerouslySetInnerHTML={{ __html: f }} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="mb-5 px-4 py-2 rounded-full border-2 border-border bg-card text-foreground font-bold text-sm hover:border-primary hover:text-primary transition flex items-center gap-2 shadow-sm"
    >
      <ChevronLeft className="w-4 h-4" /> {label}
    </button>
  );
}

const TRAIL_ICONS = [Server, Database, Cloud, Cpu, GitBranch, Terminal, Rocket, Zap, Layers];

function SessionTrail({ player, onStartSession, onBack, onOpenSummary }: { player: Player; onStartSession: (id: string) => void; onBack: () => void; onOpenSummary?: (level: LevelKey, id: string) => void }) {
  const level = player.current_level as LevelKey;
  const ids = sessionOrder[level] ?? [];

  if (ids.length === 0) {
    return (
      <div className="pop-in">
        <BackButton onClick={onBack} label="Voltar às fases" />
        <EmptySession />
      </div>
    );
  }

  const states = ids.map((id, i) => {
    const s = contentDatabase[level]?.[id];
    return {
      id,
      session: s,
      done: s ? sessionCompleted(s, player) : false,
      unlocked: moduleUnlocked(level, i, player),
    };
  });
  let currentIdx = states.findIndex((st) => !st.done && st.unlocked);
  if (currentIdx === -1) currentIdx = states.length - 1;
  const doneCount = states.filter((st) => st.done).length;

  return (
    <div className="pop-in">
      <BackButton onClick={onBack} label="Voltar às fases" />
      <SectionHeader
        kicker="Sua trilha de aprendizado"
        title={`Fase: ${levelMeta[level]?.name ?? "Fase"}`}
        sub={`Siga a trilha do início ao fim · ${doneCount} de ${ids.length} módulos concluídos`}
      />

      {/* Start flag */}
      <div className="flex justify-center mb-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold text-sm shadow-md" style={{ background: "var(--gradient-mint)" }}>
          <Flag className="w-4 h-4" /> Início
        </div>
      </div>

      <div className="relative mx-auto max-w-2xl py-4">
        {/* Central trail line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1.5 -translate-x-1/2 rounded-full trail-line" />

        <div className="relative flex flex-col gap-8">
          {states.map((st, i) => {
            const side = i % 2 === 0 ? "start" : "end";
            const locked = !st.unlocked;
            const isCurrent = i === currentIdx;
            const Tech = TRAIL_ICONS[i % TRAIL_ICONS.length];
            const bg = st.done
              ? "var(--gradient-mint)"
              : locked
                ? undefined
                : "var(--gradient-button)";
            return (
              <div key={st.id} className={`relative flex ${side === "start" ? "justify-start" : "justify-end"}`}>
                {/* decorative tech icon on the opposite side */}
                <div className={`hidden md:flex absolute top-1/2 -translate-y-1/2 ${side === "start" ? "right-6" : "left-6"} opacity-25`}>
                  <Tech className="w-10 h-10 text-primary spin-slow" />
                </div>

                <div className="relative w-[78%] md:w-[46%]">
                  {isCurrent && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                      <div className="px-3 py-1 rounded-full text-white text-[11px] font-bold shadow-md bounce-soft flex items-center gap-1.5" style={{ background: "var(--gradient-fun)" }}>
                        <Monitor className="w-3.5 h-3.5" /> Você está aqui
                      </div>
                    </div>
                  )}
                  <button
                    disabled={locked}
                    onClick={() => onStartSession(st.id)}
                    className={`w-full text-left rounded-3xl p-5 border-2 transition-all flex items-center gap-4 ${
                      locked
                        ? "bg-muted/60 border-dashed border-border opacity-70 cursor-not-allowed"
                        : isCurrent
                          ? "bg-card border-primary shadow-lg glow-blue hover:-translate-y-1"
                          : "card-pop border-transparent hover:-translate-y-1"
                    }`}
                  >
                    <div
                      className={`w-14 h-14 shrink-0 rounded-2xl grid place-items-center shadow-md ${locked ? "bg-muted text-muted-foreground" : "text-white hover-wiggle"}`}
                      style={locked ? undefined : { background: bg }}
                    >
                      {locked ? <Lock className="w-6 h-6" /> : st.done ? <CircleCheck className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-full">Módulo {st.id}</span>
                      <h3 className="text-base md:text-lg font-display font-bold tracking-tight mt-1 truncate">
                        {st.session ? cleanTitle(st.session.title) : "Em breve"}
                      </h3>
                      <p className="text-xs font-bold mt-1">
                        {locked ? (
                          <span className="text-muted-foreground flex items-center gap-1"><Lock className="w-3 h-3" /> Conclua o anterior</span>
                        ) : st.done ? (
                          <span className="text-[oklch(0.45_0.18_145)] flex items-center gap-1"><CircleCheck className="w-3 h-3" /> Concluído</span>
                        ) : (
                          <span className="text-primary flex items-center gap-1"><Play className="w-3 h-3" /> Jogar agora</span>
                        )}
                        {st.done && onOpenSummary && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onOpenSummary(level, st.id); }}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                          >
                            <BookOpen className="w-3 h-3" /> Ver resumo
                          </button>
                        )}
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Finish trophy */}
      <div className="flex justify-center mt-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold text-sm shadow-md" style={{ background: "var(--gradient-warn)", color: "oklch(0.22 0.08 30)" }}>
          <Trophy className="w-4 h-4" /> Fim da fase
        </div>
      </div>
    </div>
  );
}

function ModuleSummary({ player, onContinue, onOpenSummary }: { player: Player; onContinue: () => void; onOpenSummary?: (level: LevelKey, id: string) => void }) {
  const level = player.current_level as LevelKey;
  const session = contentDatabase[level]?.[player.current_session];
  if (!session) return <EmptySession />;

  const completedSummaries = (["junior", "pleno", "senior"] as LevelKey[]).flatMap((lvl) =>
    (sessionOrder[lvl] ?? [])
      .map((id) => ({ level: lvl, id, session: contentDatabase[lvl]?.[id] }))
      .filter((x) => x.session && sessionCompleted(x.session, player) && !(x.level === level && x.id === player.current_session)),
  );

  return (
    <div className="pop-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl grid place-items-center text-white shadow-md bounce-soft" style={{ background: "var(--gradient-fun)" }}>
          <Trophy className="w-7 h-7" />
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-2">
          <BookOpen className="w-3.5 h-3.5" /> Resumo do módulo {player.current_session}
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">{cleanTitle(session.title)}</h2>
        <p className="text-muted-foreground mt-2 text-sm">Revise os flashcards deste módulo antes de seguir.</p>
      </div>

      <ul className="space-y-3 max-w-3xl mx-auto">
        {session.flashcards.map((f, i) => (
          <li key={i} className="flashcard-blue p-4 md:p-5 text-sm md:text-base leading-relaxed">
            <span className="text-primary font-bold mr-1">#{String(i + 1).padStart(2, "0")}</span>
            <span className="text-foreground" dangerouslySetInnerHTML={{ __html: f }} />
          </li>
        ))}
      </ul>

      {completedSummaries.length > 0 && onOpenSummary && (
        <div className="mt-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl grid place-items-center text-white shadow-md" style={{ background: "var(--gradient-warn)" }}>
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-base">Outros resumos concluídos</p>
              <p className="text-muted-foreground text-xs">Revise flashcards de outras fases.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {completedSummaries.map(({ level: lvl, id, session: s }) => (
              <button
                key={`${lvl}-${id}`}
                onClick={() => onOpenSummary(lvl, id)}
                className="card-pop p-3 flex items-center justify-between gap-2 text-left hover:-translate-y-0.5 transition"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-full">
                    {levelMeta[lvl]?.name} · {id}
                  </span>
                  <p className="font-bold text-sm mt-1 truncate">{cleanTitle(s!.title)}</p>
                </div>
                <span className="btn-fun px-3 py-1.5 text-[10px] flex items-center gap-1 shrink-0">
                  <BookOpen className="w-3 h-3" /> Ver
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button onClick={onContinue} className="btn-fun px-7 py-3 text-sm flex items-center gap-2 shimmer">
          Voltar à trilha <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


function EmptySession() {
  return (
    <div className="card-pop p-10 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl grid place-items-center text-white shadow-md" style={{ background: "var(--gradient-button)" }}>
        <Sparkles className="w-7 h-7 bounce-soft" />
      </div>
      <h3 className="text-2xl font-display font-bold">Módulo em construção</h3>
      <p className="text-muted-foreground mt-2 text-base">Continue evoluindo nas outras fases enquanto preparamos essa!</p>
    </div>
  );
}
