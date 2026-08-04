import { useState, useMemo, useEffect, useRef } from 'react';
import {
  GraduationCap,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Calculator,
  Award,
  Activity,
  Lock,
  Facebook,
  Github,
  Linkedin,
  Mail,
  Heart,
} from 'lucide-react';

const TOTAL_ASSIGNMENTS = 10;
const PASS_MARK_LOW = 30; // A1-A8: 30/60 (50%)
const PASS_MARK_HIGH = 42; // A9-A10: 42/60 (70%)
const MAX_MARK = 60;
const REQUIRED_TOTAL = 480;
const REQUIRED_AVG = 48;

type Status = 'ELIGIBLE' | 'ON TRACK' | 'AT RISK' | 'INELIGIBLE';

const passMarkFor = (i: number) => (i >= 8 ? PASS_MARK_HIGH : PASS_MARK_LOW);

function useAnimatedNumber(value: number, duration = 500) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = null;
    let raf = 0;
    const from = fromRef.current;
    const delta = value - from;

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const t = Math.min((now - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + delta * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return display;
}

function StatusBadge({ status }: { status: Status }) {
  const config: Record<Status, { color: string; bg: string; icon: typeof CheckCircle2 }> = {
    ELIGIBLE: { color: '#10B981', bg: 'rgba(16,185,129,0.15)', icon: CheckCircle2 },
    'ON TRACK': { color: '#00F0FF', bg: 'rgba(0,240,255,0.15)', icon: TrendingUp },
    'AT RISK': { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', icon: AlertTriangle },
    INELIGIBLE: { color: '#EF4444', bg: 'rgba(239,68,68,0.15)', icon: XCircle },
  };
  const c = config[status];
  const Icon = c.icon;
  return (
    <div
      className="animate-pulse-glow inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-display text-sm font-semibold tracking-wide"
      style={{
        color: c.color,
        backgroundColor: c.bg,
        border: `1px solid ${c.color}55`,
        // @ts-expect-error custom prop for keyframe
        '--glow-color': `${c.color}66`,
      }}
    >
      <Icon size={18} strokeWidth={2.5} />
      {status}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  delay,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  sub?: string;
  accent: string;
  delay: number;
}) {
  return (
    <div
      className="glass animate-fade-up rounded-2xl p-4 sm:p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>
      <div className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

function AssignmentInput({
  index,
  value,
  onChange,
  delay,
  locked,
  isNext,
}: {
  index: number;
  value: number | '';
  onChange: (v: number | '') => void;
  delay: number;
  locked: boolean;
  isNext: boolean;
}) {
  const pass = passMarkFor(index);
  const filled = value !== '' && value !== null;
  const num = typeof value === 'number' ? value : 0;
  const passed = filled && num >= pass;
  const failed = filled && num < pass;
  const overMax = filled && num > MAX_MARK;

  const borderClass = locked
    ? 'border-slate-800/60'
    : overMax
      ? 'border-red-500'
      : failed
        ? 'border-red-500/70'
        : passed
          ? 'border-emerald-500/70'
          : isNext
            ? 'border-cyan-electric/70'
            : 'border-slate-700/60';

  const [shaking, setShaking] = useState(false);
  const prevFailed = useRef(false);
  useEffect(() => {
    if ((failed || overMax) && !prevFailed.current) {
      setShaking(true);
      const t = setTimeout(() => setShaking(false), 400);
      return () => clearTimeout(t);
    }
    prevFailed.current = failed || overMax;
  }, [failed, overMax]);

  return (
    <div
      className={`glass animate-fade-up rounded-xl p-3 transition-all duration-300 ${borderClass} ${shaking ? 'animate-shake' : ''} ${locked ? 'opacity-45' : ''} ${isNext && !filled ? 'animate-pulse-glow' : ''}`}
      style={{
        animationDelay: `${delay}ms`,
        borderWidth: '1.5px',
        ...(isNext && !filled ? ({ '--glow-color': 'rgba(0,240,255,0.4)' } as React.CSSProperties) : {}),
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-display text-sm font-semibold text-slate-200">
          A{index + 1}
          {locked && <Lock size={11} className="text-slate-500" />}
        </span>
        <div className="flex flex-col items-end leading-tight">
          <span className="text-[10px] font-medium text-slate-500">
            Pass: {pass}/{MAX_MARK}
          </span>
          <span className="text-[9px] text-slate-600">Max: {MAX_MARK}</span>
        </div>
      </div>
      <div className="relative">
        <input
          type="number"
          min={0}
          max={MAX_MARK}
          inputMode="numeric"
          disabled={locked}
          value={locked ? '' : value}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '') return onChange('');
            const n = Math.max(0, Math.min(MAX_MARK, Number(v)));
            onChange(n);
          }}
          placeholder={locked ? '—' : '0'}
          className={`h-12 w-full rounded-lg bg-slate-950/60 px-3 text-center font-display text-lg font-semibold text-white outline-none transition-all placeholder:text-slate-600 focus:ring-2 ${
            locked
              ? 'cursor-not-allowed text-slate-600'
              : overMax
                ? 'focus:ring-red-500/50'
                : failed
                  ? 'focus:ring-red-500/40'
                  : 'focus:ring-cyan-electric/50'
          }`}
        />
        {!locked && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
            /{MAX_MARK}
          </span>
        )}
        {locked && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600">
            <Lock size={14} />
          </span>
        )}
      </div>
      <div className="mt-2 flex h-4 items-center justify-center">
        {filled && !overMax && (
          passed ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <CheckCircle2 size={12} /> Passed
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-medium text-red-400">
              <XCircle size={12} /> Below pass
            </span>
          )
        )}
        {overMax && (
          <span className="text-[11px] font-medium text-red-400">Max is {MAX_MARK}</span>
        )}
        {locked && (
          <span className="text-[10px] text-slate-600">Locked</span>
        )}
      </div>
    </div>
  );
}

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://www.facebook.com/share/1D8NFWYYBV/', Icon: Facebook, color: '#1877F2' },
  { label: 'GitHub', href: 'https://github.com/Saidulhimu', Icon: Github, color: '#A742FF' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/md-saidul-islam-a6a942414/', Icon: Linkedin, color: '#00F0FF' },
  { label: 'Email', href: 'mailto:saidulhimuu@gmail.com', Icon: Mail, color: '#EF4444' },
] as const;

function Footer() {
  return (
    <footer className="mt-10">
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/40 backdrop-blur-xl">
        {/* Glowing gradient top border with ambient pulse */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-electric via-lavender-neon to-cyan-electric" />
        <div
          className="absolute -inset-x-20 -top-10 h-24 animate-blob-float-slow opacity-50 blur-2xl"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.35), rgba(167,66,255,0.35), transparent)' }}
        />

        <div className="relative flex flex-col items-center gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          {/* Left: Brand / Copyright */}
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-electric to-lavender-neon">
                <GraduationCap size={15} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display text-sm font-semibold text-slate-200">
                SCIC Tracker
              </span>
            </div>
            <p className="text-xs text-slate-400">
              © 2026 SCIC Eligibility Tracker • All rights reserved.
            </p>
          </div>

          {/* Center: Developer Credit */}
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <span>Developed with</span>
            <Heart size={13} className="text-rose-500" fill="currentColor" />
            <span>by</span>
            <span className="relative font-display text-sm font-semibold">
              <span className="gradient-title">Md Saidul Islam</span>
              <span
                className="absolute -bottom-0.5 left-0 h-px w-full"
                style={{
                  background: 'linear-gradient(90deg, #00F0FF, #A742FF)',
                  boxShadow: '0 0 8px rgba(0,240,255,0.6)',
                }}
              />
            </span>
          </div>

          {/* Right: Social Icons */}
          <div className="flex items-center gap-2.5">
            {SOCIAL_LINKS.map(({ label, href, Icon, color }) => (
              <a
                key={label}
                href={href}
                target={label === 'Email' ? undefined : '_blank'}
                rel="noopener noreferrer"
                aria-label={label}
                className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/60 text-white transition-all duration-300 hover:-translate-y-1 hover:scale-110 active:scale-95"
              >
                <span
                  className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ boxShadow: `0 0 18px 2px ${color}66`, border: `1px solid ${color}77` }}
                />
                <Icon
                  size={18}
                  className="relative z-10 text-slate-200 transition-colors duration-300 group-hover:text-white"
                />
                {/* Tooltip */}
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 scale-90 rounded-md bg-slate-950/90 px-2 py-1 text-[10px] font-medium text-slate-200 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                  {label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function ProgressBar({ value, max, accent }: { value: number; max: number; accent: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800/80">
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}, ${accent}cc)` }}
      />
    </div>
  );
}

export default function App() {
  const [marks, setMarks] = useState<(number | '')[]>(Array(TOTAL_ASSIGNMENTS).fill(''));

  const stats = useMemo(() => {
    const filled = marks.filter((m) => m !== '') as number[];
    const completed = filled.length;
    const total = filled.reduce((a, b) => a + b, 0);
    const remaining = TOTAL_ASSIGNMENTS - completed;
    const avg = completed > 0 ? total / completed : 0;

    let failures = 0;
    marks.forEach((m, i) => {
      if (m !== '' && m < passMarkFor(i)) failures++;
    });

    const neededTotal = Math.max(0, REQUIRED_TOTAL - total);
    const neededAvg = remaining > 0 ? neededTotal / remaining : 0;

    let status: Status;
    if (failures > 0) {
      status = completed === TOTAL_ASSIGNMENTS ? 'INELIGIBLE' : 'AT RISK';
    } else if (completed === TOTAL_ASSIGNMENTS) {
      status = total >= REQUIRED_TOTAL ? 'ELIGIBLE' : 'INELIGIBLE';
    } else {
      status = avg >= REQUIRED_AVG ? 'ON TRACK' : 'AT RISK';
    }

    return { completed, total, remaining, avg, failures, neededTotal, neededAvg, status };
  }, [marks]);

  const animatedTotal = useAnimatedNumber(stats.total, 400);
  const animatedAvg = useAnimatedNumber(stats.avg, 400);

  const reset = () => setMarks(Array(TOTAL_ASSIGNMENTS).fill(''));

  // Sequential unlock: an assignment is unlocked if all previous ones are filled.
  const unlockedUpTo = useMemo(() => {
    let count = 0;
    for (let i = 0; i < marks.length; i++) {
      if (marks[i] !== '') count = i + 1;
      else break;
    }
    return count;
  }, [marks]);

  const handleChange = (i: number, v: number | '') => {
    setMarks((prev) => {
      const next = [...prev];
      next[i] = v;
      // If clearing a mark, lock all subsequent inputs by clearing them.
      if (v === '') {
        for (let j = i + 1; j < next.length; j++) next[j] = '';
      }
      return next;
    });
  };

  const accent =
    stats.status === 'ELIGIBLE'
      ? '#10B981'
      : stats.status === 'ON TRACK'
        ? '#00F0FF'
        : stats.status === 'AT RISK'
          ? '#F59E0B'
          : '#EF4444';

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="animate-blob-float absolute -left-20 top-10 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #A742FF, transparent 70%)' }}
        />
        <div
          className="animate-blob-float-slow absolute right-0 top-1/3 h-80 w-80 rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #00F0FF, transparent 70%)' }}
        />
        <div
          className="animate-blob-float absolute bottom-0 left-1/3 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #10B981, transparent 70%)' }}
        />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
        {/* Header */}
        <header className="animate-fade-up flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-electric to-lavender-neon shadow-lg shadow-cyan-electric/20">
              <GraduationCap size={26} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold gradient-title sm:text-2xl">
                SCIC Eligibility Tracker
              </h1>
              <p className="text-xs text-slate-400 sm:text-sm">
                Track your assignment marks & eligibility
              </p>
            </div>
          </div>
          <button
            onClick={reset}
            className="active:scale-95 transition-transform inline-flex h-11 items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/50 px-4 text-sm font-medium text-slate-300 hover:border-cyan-electric/50 hover:text-cyan-electric"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </header>

        {/* Status Banner */}
        <section
          className="glass animate-fade-up mt-6 rounded-3xl p-5 sm:mt-8 sm:p-7"
          style={{ animationDelay: '80ms' }}
        >
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Current Status
              </p>
              <div className="mt-2">
                <StatusBadge status={stats.status} />
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-xs text-slate-400">Overall Average</p>
              <p className="font-display text-3xl font-bold text-white sm:text-4xl">
                {animatedAvg.toFixed(1)}
                <span className="text-lg text-slate-500">/{MAX_MARK}</span>
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-slate-400">
                <span>Total Progress</span>
                <span>
                  {stats.total} / {REQUIRED_TOTAL} required
                </span>
              </div>
              <ProgressBar value={stats.total} max={REQUIRED_TOTAL} accent={accent} />
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-4">
          <StatCard
            icon={Activity}
            label="Completed"
            value={`${stats.completed} / ${TOTAL_ASSIGNMENTS}`}
            sub="Assignments filled"
            accent="#00F0FF"
            delay={140}
          />
          <StatCard
            icon={Calculator}
            label="Total Marks"
            value={animatedTotal.toFixed(0)}
            sub={`of ${REQUIRED_TOTAL} required`}
            accent="#A742FF"
            delay={200}
          />
          <StatCard
            icon={Target}
            label="Needed Average"
            value={stats.remaining > 0 ? stats.neededAvg.toFixed(1) : '—'}
            sub={`across ${stats.remaining} remaining`}
            accent="#10B981"
            delay={260}
          />
          <StatCard
            icon={stats.failures > 0 ? AlertTriangle : Award}
            label="Failed"
            value={`${stats.failures}`}
            sub={stats.failures > 0 ? 'Below pass mark' : 'All passing'}
            accent={stats.failures > 0 ? '#EF4444' : '#10B981'}
            delay={320}
          />
        </section>

        {/* Main grid: inputs + analytics */}
        <div className="mt-5 grid grid-cols-1 gap-5 sm:mt-6 lg:grid-cols-2 lg:gap-6">
          {/* Marks Input */}
          <section
            className="glass animate-fade-up rounded-3xl p-5 sm:p-6"
            style={{ animationDelay: '360ms' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
                <Sparkles size={18} className="text-cyan-electric" />
                Assignment Marks
              </h2>
              <span className="text-xs text-slate-400">10 assignments · max 60 each</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {marks.map((m, i) => (
                <AssignmentInput
                  key={i}
                  index={i}
                  value={m}
                  onChange={(v) => handleChange(i, v)}
                  delay={380 + i * 40}
                  locked={i > unlockedUpTo}
                  isNext={i === unlockedUpTo}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-electric" /> A1–A8: pass 30/60 (50%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-lavender-neon" /> A9–A10: pass 42/60 (70%)
              </span>
            </div>
          </section>

          {/* Detailed Analytics */}
          <section
            className="glass animate-fade-up rounded-3xl p-5 sm:p-6"
            style={{ animationDelay: '420ms' }}
          >
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-white">
              <TrendingUp size={18} className="text-lavender-neon" />
              Detailed Analytics
            </h2>

            {/* Eligibility rule breakdown */}
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-950/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">
                    Average requirement
                  </span>
                  <span
                    className="font-display text-sm font-semibold"
                    style={{ color: stats.avg >= REQUIRED_AVG ? '#10B981' : '#F59E0B' }}
                  >
                    {stats.avg >= REQUIRED_AVG ? 'Met' : 'Below 48'}
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={stats.avg} max={MAX_MARK} accent="#00F0FF" />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  Need ≥ {REQUIRED_AVG} avg ({REQUIRED_TOTAL}/{MAX_MARK * TOTAL_ASSIGNMENTS} total)
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">
                    Individual passes
                  </span>
                  <span
                    className="font-display text-sm font-semibold"
                    style={{ color: stats.failures === 0 ? '#10B981' : '#EF4444' }}
                  >
                    {stats.completed - stats.failures}/{stats.completed} passed
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  Every assignment must meet its pass mark.
                </p>
              </div>

              {/* Per-assignment mini bars */}
              <div className="rounded-2xl bg-slate-950/40 p-4">
                <p className="mb-3 text-sm font-medium text-slate-300">
                  Per-assignment breakdown
                </p>
                <div className="space-y-2">
                  {marks.map((m, i) => {
                    const filled = m !== '';
                    const num = typeof m === 'number' ? m : 0;
                    const pass = passMarkFor(i);
                    const ok = filled && num >= pass;
                    const fail = filled && num < pass;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-7 font-display text-xs font-semibold text-slate-400">
                          A{i + 1}
                        </span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(num / MAX_MARK) * 100}%`,
                              background: fail
                                ? '#EF4444'
                                : ok
                                  ? '#10B981'
                                  : '#475569',
                            }}
                          />
                        </div>
                        <span
                          className="w-12 text-right font-display text-xs font-medium"
                          style={{
                            color: fail ? '#EF4444' : ok ? '#10B981' : '#64748b',
                          }}
                        >
                          {filled ? `${num}` : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Needed average callout */}
              {stats.remaining > 0 && (
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background:
                      stats.neededAvg > MAX_MARK
                        ? 'rgba(239,68,68,0.12)'
                        : stats.neededAvg > REQUIRED_AVG
                          ? 'rgba(245,158,11,0.12)'
                          : 'rgba(16,185,129,0.12)',
                    border: `1px solid ${
                      stats.neededAvg > MAX_MARK
                        ? '#EF444455'
                        : stats.neededAvg > REQUIRED_AVG
                          ? '#F59E0B55'
                          : '#10B98155'
                    }`,
                  }}
                >
                  <p className="text-sm font-medium text-slate-200">
                    {stats.neededAvg > MAX_MARK ? (
                      <>Nearly impossible — you'd need &gt;60 avg in remaining assignments.</>
                    ) : (
                      <>
                        Score{' '}
                        <span className="font-display font-bold" style={{ color: accent }}>
                          {stats.neededAvg.toFixed(1)}
                        </span>{' '}
                        avg in each of the {stats.remaining} remaining assignment
                        {stats.remaining > 1 ? 's' : ''} to qualify.
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </div>
  );
}
