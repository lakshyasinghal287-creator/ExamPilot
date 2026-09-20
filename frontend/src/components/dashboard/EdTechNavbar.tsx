import React from 'react';
import { Sun, Moon, ShieldCheck, Cpu, LayoutDashboard, FileText, ChevronRight } from 'lucide-react';

interface EdTechNavbarProps {
  activeView: 'dashboard' | 'exam' | 'scorecard';
  serverHealthy: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNavigate: (view: 'dashboard' | 'exam' | 'scorecard') => void;
}

export const EdTechNavbar: React.FC<EdTechNavbarProps> = ({
  activeView,
  serverHealthy,
  theme,
  onToggleTheme,
  onNavigate,
}) => {
  return (
    <nav className="sticky top-0 z-50 transition-colors duration-200 bg-white/80 dark:bg-[#08090E]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Institution / Brand Identity */}
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-3.5 cursor-pointer select-none group"
          >
            <div className="relative">
              {/* Outer glow bloom */}
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 dark:from-amber-400/25 dark:to-yellow-400/25 blur-sm group-hover:blur-md transition-all duration-300 opacity-80" />
              {/* Monogram emblem */}
              <div className="relative h-10 w-10 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 dark:from-[#151A26] dark:to-[#0E121B] border border-amber-500/30 text-amber-400 flex items-center justify-center font-sans font-black text-base shadow-md shadow-black/40">
                EP
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                  ExamPilot
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  CAT 2026
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-normal hidden sm:block">
                National Aptitude Assessment & Analytics System
              </div>
            </div>
          </div>

          {/* Center Navigation Segment */}
          <div className="flex items-center space-x-1.5 bg-slate-100/80 dark:bg-white/[0.04] p-1 rounded-xl border border-slate-200/60 dark:border-white/[0.06]">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 flex items-center space-x-1.5 cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-white dark:bg-[#151A26] text-slate-900 dark:text-white shadow-xs dark:shadow-specular border border-slate-200/80 dark:border-white/[0.1]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/[0.03]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Candidate Portal</span>
            </button>

            {activeView === 'scorecard' && (
              <button
                onClick={() => onNavigate('scorecard')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#151A26] text-slate-900 dark:text-white shadow-xs dark:shadow-specular border border-slate-200/80 dark:border-white/[0.1] flex items-center space-x-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>Diagnostic Report</span>
              </button>
            )}
          </div>

          {/* Right Status Group: Engine Radar + Candidate + Theme Switch */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Engine Status Pulse */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] text-[11px] text-slate-600 dark:text-slate-400">
              <span className="relative flex h-2 w-2">
                {serverHealthy && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${serverHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              </span>
              <span className="font-mono font-medium">
                {serverHealthy ? 'SymPy Engine Online' : 'Engine Disconnected'}
              </span>
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-white/[0.04] hover:bg-slate-200/70 dark:hover:bg-white/[0.08] border border-slate-200/60 dark:border-white/[0.06] transition-all duration-150 cursor-pointer shadow-xs active:scale-95"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Candidate Identity Chip */}
            <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-200 dark:border-white/[0.08]">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-300/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs shadow-xs">
                A
              </div>
              <div className="text-left hidden lg:block">
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-tight">
                  Aarav Sharma
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-400 font-mono">
                  Reg: 26CAT9041
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
