import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  ChevronRight,
  Target,
  TrendingUp,
  Sparkles,
  Zap,
  Clock,
  BookOpen,
  Award,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  BrainCircuit,
  Activity
} from 'lucide-react';

interface DashboardHomeProps {
  onStartExam: () => void;
  onOpenPractice: (topicName: string) => void;
  serverHealthy: boolean;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  onStartExam,
  onOpenPractice,
  serverHealthy,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'full' | 'sectional'>('all');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-9 select-none font-sans transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. HERO COMMAND STATION                                                  */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0E121B] border border-slate-200/80 dark:border-white/[0.08] shadow-xl shadow-slate-900/5 dark:shadow-black/40 p-6 sm:p-9">
        {/* Specular overhead light reflection */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 dark:via-amber-400/30 to-transparent pointer-events-none" />
        
        {/* Ambient atmospheric aura */}
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-gradient-to-tr from-violet-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono font-semibold tracking-wide mb-3.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span>IIM CAT 2026 • Standalone Standardized Simulation</span>
            </div>

            {/* Display Title with Sheen */}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Candidate Diagnostic &{' '}
              <span className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 dark:from-amber-400 dark:via-amber-200 dark:to-yellow-400 bg-clip-text text-transparent">
                Testing Portal
              </span>
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Official 120-minute, 3-section computer-based test (CBT) simulator with authoritative server timing, authentic TCS iON question navigation, and deterministic SymPy mathematical validation.
            </p>
          </div>

          {/* Quick Action Button Cluster */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[260px]">
            <button
              onClick={onStartExam}
              className="relative group overflow-hidden px-6 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Launch CAT Benchmark Mock</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onOpenPractice('VARC')}
              className="px-5 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-amber-500" />
              <span>Adaptive Sectional Remediation</span>
            </button>
          </div>
        </div>

        {/* Examination Telemetry Ribbon */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="space-y-0.5">
            <span className="text-slate-400 dark:text-slate-400 font-medium block text-[11px] uppercase tracking-wider font-mono">Format</span>
            <strong className="text-slate-800 dark:text-slate-100 text-sm font-bold tracking-tight">66 Questions • 120 Mins</strong>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-400 dark:text-slate-400 font-medium block text-[11px] uppercase tracking-wider font-mono">Sectional Split</span>
            <strong className="text-slate-800 dark:text-slate-100 text-sm font-bold tracking-tight">40m VARC • 40m DILR • 40m QA</strong>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-400 dark:text-slate-400 font-medium block text-[11px] uppercase tracking-wider font-mono">Scoring Rubric</span>
            <strong className="text-slate-800 dark:text-slate-100 text-sm font-bold tracking-tight">+3.0 MCQ / -1.0 Pen / 0 TITA</strong>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-400 dark:text-slate-400 font-medium block text-[11px] uppercase tracking-wider font-mono">Math Engine</span>
            <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center space-x-1 tracking-tight">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% SymPy Verified</span>
            </strong>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THREE-CARD PRECISION TELEMETRY HUD                                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Target Percentile Goal */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0E121B] border border-slate-200/80 dark:border-white/[0.08] shadow-md p-6 flex flex-col justify-between group hover:border-amber-500/30 transition-all duration-200">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-bold flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-amber-500" />
                <span>Percentile Target</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                IIM A/B/C Cutoff
              </span>
            </div>

            <div className="mt-4 flex items-baseline space-x-2">
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
                99.4<span className="text-2xl text-amber-500">+</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Percentile Norm</span>
            </div>

            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Requires ~92 net raw marks (~32 VARC, ~26 DILR, ~34 QA) under standard 66Q calibration.
            </p>

            {/* Visual target progress gauge */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Estimated Raw Mark Target</span>
                <strong className="text-slate-800 dark:text-slate-200 font-mono">92 / 198</strong>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden p-0.5">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400" style={{ width: '76%' }} />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/[0.06] text-[11px] text-slate-500 dark:text-slate-400 flex justify-between items-center">
            <span>Historical Mock Mean: <strong className="text-slate-800 dark:text-slate-200">76.2</strong></span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold font-mono text-[10px]">
              +6.5 vs baseline
            </span>
          </div>
        </div>

        {/* Card 2: Precision vs Pacing */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0E121B] border border-slate-200/80 dark:border-white/[0.08] shadow-md p-6 flex flex-col justify-between group hover:border-emerald-500/30 transition-all duration-200">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-bold flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>Precision & Pacing</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                81.4% Accuracy
              </span>
            </div>

            <div className="mt-4 flex items-baseline space-x-2">
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
                1.82
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Min / Answered Q</span>
            </div>

            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Sufficient time buffer to solve 2 complete DILR caselets (8-10 questions) and prioritize high-yield QA items.
            </p>

            {/* Pacing Gauge */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Sectional Attempt Ratio</span>
                <strong className="text-slate-800 dark:text-slate-200 font-mono">16.2 Qs / 40 min</strong>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden p-0.5">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: '81%' }} />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/[0.06] text-[11px] text-slate-500 dark:text-slate-400 flex justify-between items-center">
            <span>Optimal Attempt Band</span>
            <strong className="text-slate-800 dark:text-slate-200 font-semibold">15–18 Qs / Section</strong>
          </div>
        </div>

        {/* Card 3: Deterministic Formal Verification */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0E121B] border border-slate-200/80 dark:border-white/[0.08] shadow-md p-6 flex flex-col justify-between group hover:border-indigo-500/30 transition-all duration-200">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-bold flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Deterministic AI</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold">
                Zero Hallucination
              </span>
            </div>

            <div className="mt-4 flex items-baseline space-x-2">
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
                100%
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Formal Math Verification</span>
            </div>

            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Every math item is parsed into AST expressions and verified using SymPy in an isolated Python sandbox.
            </p>

            {/* AST Sandboxed Integrity */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>AST Parser Strictness</span>
                <strong className="text-indigo-600 dark:text-indigo-400 font-mono">Sandboxed Exec</strong>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden p-0.5">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/[0.06] text-[11px] text-slate-500 dark:text-slate-400 flex justify-between items-center">
            <span>LLM Wrapper Defense</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Viva Proof Ready</span>
            </strong>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SECTIONAL PROFICIENCY & CURRICULUM MASTERY HUB                         */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Sectional Proficiency & Curriculum Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Calibrated against CAT historical question weightages and psychometric distractor taxonomies.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/[0.06] hidden sm:inline-block">
            Rubric: +3 / -1 / 0
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. VARC Section Hub */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0E121B] border border-slate-200/80 dark:border-white/[0.08] shadow-md p-6 flex flex-col justify-between group hover:border-violet-500/30 transition-all duration-200">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                  Section 1 • Verbal
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-300 font-bold border border-violet-500/20">
                  24 Qs • 40 Min
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3">
                Verbal Ability & Reading Comp
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                4 Reading Comprehension Passages (~16 MCQs) across Philosophy, Sociology, Economics + Verbal Ability (Para-Jumbles, Summary, Odd Sentence).
              </p>

              {/* Progress Meters */}
              <div className="mt-5 space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                    <span>RC Inference & Primary Purpose:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">78%</strong>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                    <span>TITA Para-Jumbles (No Negative):</span>
                    <strong className="text-amber-500 font-mono">62%</strong>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '62%' }} />
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Distractor Trap Avoidance</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">High Precision</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenPractice('VARC')}
              className="mt-6 pt-3.5 border-t border-slate-100 dark:border-white/[0.06] text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 flex items-center justify-between group/btn transition-colors cursor-pointer"
            >
              <span>Practice VARC Adaptive Drills</span>
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* 2. DILR Section Hub */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0E121B] border border-slate-200/80 dark:border-white/[0.08] shadow-md p-6 flex flex-col justify-between group hover:border-cyan-500/30 transition-all duration-200">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                  Section 2 • Logic
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-bold border border-cyan-500/20">
                  20 Qs • 40 Min
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3">
                Data Interpretation & Reasoning
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                4 Caselets (Matrix arrangement, Truth-Tellers/Liars, Round-robin Tournaments, Missing Data Tables, Venn Diagrams).
              </p>

              {/* Progress Meters */}
              <div className="mt-5 space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                    <span>Matrix Arrangements & Clues:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">85%</strong>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                    <span>Games & Tournaments (Points):</span>
                    <strong className="text-rose-500 font-mono">45%</strong>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Pacing Bottleneck Alert</span>
                  <span className="font-semibold text-rose-500">3.8 min / Q on Tournaments</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenPractice('DILR')}
              className="mt-6 pt-3.5 border-t border-slate-100 dark:border-white/[0.06] text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center justify-between group/btn transition-colors cursor-pointer"
            >
              <span>Practice DILR Caselet Sets</span>
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* 3. QA Section Hub */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0E121B] border border-slate-200/80 dark:border-white/[0.08] shadow-md p-6 flex flex-col justify-between group hover:border-emerald-500/30 transition-all duration-200">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Section 3 • Quant
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-bold border border-emerald-500/20">
                  22 Qs • 40 Min
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3">
                Quantitative Ability
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Arithmetic (~35%), Algebra (~30%), Geometry (~15%), Number Systems (~10%), Modern Math (~10%).
              </p>

              {/* Progress Meters */}
              <div className="mt-5 space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                    <span>Arithmetic (TSD, Work, Mixtures):</span>
                    <strong className="text-slate-900 dark:text-white font-mono">82%</strong>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: '82%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                    <span>Algebra (Modulus & Quadratics):</span>
                    <strong className="text-slate-900 dark:text-white font-mono">74%</strong>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full" style={{ width: '74%' }} />
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Number Systems Traps</span>
                  <span className="font-semibold text-amber-500">Modular Cyclicity Focus</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenPractice('QA')}
              className="mt-6 pt-3.5 border-t border-slate-100 dark:border-white/[0.06] text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-between group/btn transition-colors cursor-pointer"
            >
              <span>Practice QA Math Drills</span>
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. STANDARDIZED COMPUTER-BASED TEST SERIES (CBT TERMINAL)                */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0E121B] border border-slate-200/80 dark:border-white/[0.08] shadow-xl shadow-slate-900/5 dark:shadow-black/40">
        {/* Specular overhead light */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        <div className="p-6 sm:p-7 border-b border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Standardized Computer-Based Test Series (CBT)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Strictly adheres to official CAT sectional timers, TCS iON question navigation, and scoring rubrics.
            </p>
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-white/[0.04] p-1 rounded-xl border border-slate-200/60 dark:border-white/[0.06] text-xs font-semibold">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-150 ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-[#151A26] text-slate-900 dark:text-white shadow-xs dark:shadow-specular'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Tests
            </button>
            <button
              onClick={() => setActiveFilter('full')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-150 ${
                activeFilter === 'full'
                  ? 'bg-white dark:bg-[#151A26] text-slate-900 dark:text-white shadow-xs dark:shadow-specular'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Full Mocks (66Q)
            </button>
            <button
              onClick={() => setActiveFilter('sectional')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-150 ${
                activeFilter === 'sectional'
                  ? 'bg-white dark:bg-[#151A26] text-slate-900 dark:text-white shadow-xs dark:shadow-specular'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sectionals (40m)
            </button>
          </div>
        </div>

        {/* Assessment Card Rows (Replacing Plain Generic Table) */}
        <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
          {/* Mock Test Row 1 */}
          <div className="p-5 sm:p-6 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center space-x-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
                  CAT 2026: Benchmark National Mock 01
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold">
                  Slot 1
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calibrated against official IIM Bangalore paper patterns • 24 VARC (4 RCs) • 20 DILR (4 Sets) • 22 QA Items.
              </p>
              
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 font-mono">
                  66 Questions
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 font-mono flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>120 Mins (40m/sec)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>100% SymPy Verified</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end space-x-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Difficulty Level: Standard (L3)
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-400 font-mono">
                  IIM A/B/C Benchmark
                </div>
              </div>

              <button
                onClick={onStartExam}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all duration-150 active:scale-95 cursor-pointer flex items-center space-x-1.5"
              >
                <span>Take Exam</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mock Test Row 2 */}
          <div className="p-5 sm:p-6 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center space-x-2.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
                  CAT 2026: Advanced Diagnostic Mock 02
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-mono font-bold">
                  Slot 2
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-concept constraint puzzles • Advanced Modulus & Inequalities • Games & Tournament scoring matrix.
              </p>
              
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 font-mono">
                  66 Questions
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 font-mono flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>120 Mins (40m/sec)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 font-mono">
                  Calibrated Benchmark
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end space-x-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Difficulty Level: Hard (L4)
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-400 font-mono">
                  High Constraint Density
                </div>
              </div>

              <button
                onClick={onStartExam}
                className="px-5 py-2.5 rounded-xl font-semibold text-xs border border-slate-300 dark:border-white/[0.1] bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-800 dark:text-slate-100 transition-all duration-150 active:scale-95 cursor-pointer flex items-center space-x-1.5 shadow-xs"
              >
                <span>Take Exam</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
