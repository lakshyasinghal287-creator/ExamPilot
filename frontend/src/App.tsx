import { useState, useEffect, useRef } from 'react';
import { EdTechNavbar } from './components/dashboard/EdTechNavbar';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { ScorecardView } from './components/dashboard/ScorecardView';
import { CatHeader } from './components/exam/CatHeader';
import { CatPalette } from './components/exam/CatPalette';
import { CatQuestionPane } from './components/exam/CatQuestionPane';
import { CatCalculator } from './components/exam/CatCalculator';
import { examApi } from './services/api';
import { TestSession, ClientQuestion, PaletteState } from './types/exam';

export function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'exam' | 'scorecard'>('dashboard');
  const [serverHealthy, setServerHealthy] = useState<boolean>(false);
  const [candidateName] = useState<string>('Aarav Sharma');

  // Theme State (Light vs Dark Mode)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('exampilot_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('exampilot_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Active Exam Session State
  const [session, setSession] = useState<TestSession | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [titaText, setTitaText] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(2400); // 40 minutes per section
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [scorecardData, setScorecardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  const timerRef = useRef<any>(null);

  // Check backend server health at startup
  useEffect(() => {
    examApi
      .checkHealth()
      .then(() => setServerHealthy(true))
      .catch(() => setServerHealthy(false));
  }, []);

  // Handle Section Timeout (40 minutes expires for a section in real CAT)
  const handleSectionTimeout = () => {
    if (!session || !session.all_sections) return;
    const currentCode = session.active_section.code;

    if (currentCode === 'VARC') {
      alert('Time has expired for Section 1 (VARC). Your responses are locked under CAT CBT rules. Transitioning to Section 2 (DILR).');
      setCompletedSections((prev) => [...prev, 'VARC']);
      const dilrSec = session.all_sections.find((s) => s.code === 'DILR');
      if (dilrSec) {
        setSession({ ...session, active_section: dilrSec });
        setCurrentQIndex(0);
        setSelectedOptionId(dilrSec.questions[0]?.selected_option_id ?? null);
        setTitaText(dilrSec.questions[0]?.tita_answer_text ?? '');
        setTimeRemaining(dilrSec.duration_seconds || 2400);
      }
    } else if (currentCode === 'DILR') {
      alert('Time has expired for Section 2 (DILR). Your responses are locked under CAT CBT rules. Transitioning to Section 3 (QA).');
      setCompletedSections((prev) => [...prev, 'DILR']);
      const qaSec = session.all_sections.find((s) => s.code === 'QA');
      if (qaSec) {
        setSession({ ...session, active_section: qaSec });
        setCurrentQIndex(0);
        setSelectedOptionId(qaSec.questions[0]?.selected_option_id ?? null);
        setTitaText(qaSec.questions[0]?.tita_answer_text ?? '');
        setTimeRemaining(qaSec.duration_seconds || 2400);
      }
    } else {
      alert('Time has expired for Section 3 (QA). Submitting your CAT examination now.');
      handleSubmitExam();
    }
  };

  // Section Countdown Timer (40 minutes per section)
  useEffect(() => {
    if (activeView === 'exam' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSectionTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [activeView, timeRemaining, session]);

  // Sync selected options when switching question
  const currentQuestion: ClientQuestion | undefined = session?.active_section.questions[currentQIndex];

  useEffect(() => {
    if (currentQuestion) {
      setSelectedOptionId(currentQuestion.selected_option_id ?? null);
      setTitaText(currentQuestion.tita_answer_text ?? '');
    }
  }, [currentQIndex, currentQuestion]);

  // Launch Full CAT Mock
  const handleStartExam = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setCompletedSections([]);
    try {
      // In production/demo, use default user ID from seed or fresh ID
      const newSession = await examApi.startTest('seed-student-user-id', 'CAT-2026');
      setSession(newSession);
      setCurrentQIndex(0);
      setTimeRemaining(newSession.active_section.duration_seconds || 2400);
      setActiveView('exam');
    } catch (err: any) {
      console.error('Failed to start exam:', err);
      setErrorMessage(err?.response?.data?.detail || 'Could not connect to test engine backend. Ensure FastAPI server is running on :8000.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to update local question state in palette and sync all_sections
  const updateQuestionState = (state: PaletteState, optionId: string | null, textVal: string | null) => {
    if (!session) return;
    const updated = [...session.active_section.questions];
    updated[currentQIndex] = {
      ...updated[currentQIndex],
      palette_state: state,
      selected_option_id: optionId,
      tita_answer_text: textVal,
      time_spent_seconds: updated[currentQIndex].time_spent_seconds + 5,
    };

    const updatedAllSections = session.all_sections
      ? session.all_sections.map((sec) =>
          sec.code === session.active_section.code
            ? { ...sec, questions: updated }
            : sec
        )
      : undefined;

    setSession({
      ...session,
      active_section: {
        ...session.active_section,
        questions: updated,
      },
      all_sections: updatedAllSections,
    });

    // Auto-save to server asynchronously
    if (currentQuestion) {
      examApi.saveResponse(
        session.test_attempt_id,
        currentQuestion.question_id,
        optionId,
        textVal,
        state,
        5
      ).catch((e) => console.warn('Background auto-save delayed:', e));
    }
  };

  // Action: Save & Next
  const handleSaveAndNext = () => {
    const hasAnswer = selectedOptionId !== null || titaText.trim() !== '';
    const newState: PaletteState = hasAnswer ? 'ANSWERED' : 'NOT_ANSWERED';
    updateQuestionState(newState, selectedOptionId, titaText);

    if (session && currentQIndex < session.active_section.questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    }
  };

  // Action: Clear Response
  const handleClearResponse = () => {
    setSelectedOptionId(null);
    setTitaText('');
    updateQuestionState('NOT_ANSWERED', null, null);
  };

  // Action: Mark for Review & Next
  const handleMarkForReviewAndNext = () => {
    const hasAnswer = selectedOptionId !== null || titaText.trim() !== '';
    const newState: PaletteState = hasAnswer ? 'ANSWERED_AND_MARKED' : 'MARKED_REVIEW';
    updateQuestionState(newState, selectedOptionId, titaText);

    if (session && currentQIndex < session.active_section.questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    }
  };

  // Action: Select Question from Palette
  const handleSelectQuestion = (index: number) => {
    if (currentQuestion && currentQuestion.palette_state === 'NOT_VISITED') {
      updateQuestionState('NOT_ANSWERED', selectedOptionId, titaText);
    }
    setCurrentQIndex(index);
  };

  // Action: Switch Section (CAT CBT Rules: Manual section jumping prohibited)
  const handleSelectSection = (sectionCode: string) => {
    if (!session) return;
    if (sectionCode === session.active_section.code) return;

    if (completedSections.includes(sectionCode)) {
      alert(`Section ${sectionCode} has already been submitted and locked. CAT CBT regulations prohibit returning to previous sections.`);
      return;
    }

    alert(`Section ${sectionCode} is currently locked. In the official CAT CBT, you cannot navigate between sections freely. You must complete and submit Section ${session.active_section.code} first.`);
  };

  // Action: Submit Section & Proceed to Next Section
  const handleSubmitSection = () => {
    if (!session || !session.all_sections) return;
    const currentCode = session.active_section.code;

    if (currentCode === 'VARC') {
      const confirmProceed = window.confirm(
        'Submit Section 1 (VARC)?\n\nUnder official CAT CBT guidelines, once Section 1 is submitted, it is permanently locked and you CANNOT return to it. Proceed to Section 2 (DILR)?'
      );
      if (!confirmProceed) return;

      setCompletedSections((prev) => [...prev, 'VARC']);
      const dilrSec = session.all_sections.find((s) => s.code === 'DILR');
      if (dilrSec) {
        setSession({
          ...session,
          active_section: dilrSec,
        });
        setCurrentQIndex(0);
        setSelectedOptionId(dilrSec.questions[0]?.selected_option_id ?? null);
        setTitaText(dilrSec.questions[0]?.tita_answer_text ?? '');
        setTimeRemaining(dilrSec.duration_seconds || 2400);
      }
    } else if (currentCode === 'DILR') {
      const confirmProceed = window.confirm(
        'Submit Section 2 (DILR)?\n\nUnder official CAT CBT guidelines, once Section 2 is submitted, it is permanently locked and you CANNOT return to it. Proceed to Section 3 (QA)?'
      );
      if (!confirmProceed) return;

      setCompletedSections((prev) => [...prev, 'DILR']);
      const qaSec = session.all_sections.find((s) => s.code === 'QA');
      if (qaSec) {
        setSession({
          ...session,
          active_section: qaSec,
        });
        setCurrentQIndex(0);
        setSelectedOptionId(qaSec.questions[0]?.selected_option_id ?? null);
        setTitaText(qaSec.questions[0]?.tita_answer_text ?? '');
        setTimeRemaining(qaSec.duration_seconds || 2400);
      }
    } else {
      handleSubmitExam();
    }
  };

  // Action: Submit Exam
  const handleSubmitExam = async () => {
    if (!session) return;
    const confirmSubmit = window.confirm('Are you sure you want to submit your CAT examination? All responses will be locked and evaluated.');
    if (!confirmSubmit) return;

    setIsLoading(true);
    try {
      const summary = await examApi.finishExam(session.test_attempt_id);
      setScorecardData(summary);
      setActiveView('scorecard');
    } catch (err: any) {
      console.error('Submission failed:', err);
      alert('Error calculating score: ' + (err?.response?.data?.detail || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  // If in Exam mode, render dedicated full-viewport TCS iON layout (ZERO black void)
  if (activeView === 'exam' && session) {
    return (
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#e6ebef] font-sans select-none">
        <CatHeader
          examName={session.exam_code ? `Common Admission Test (${session.exam_code})` : 'CAT 2026 Examination'}
          candidateName={candidateName}
          activeSectionCode={session.active_section.code}
          timeRemainingSeconds={timeRemaining}
          completedSections={completedSections}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onOpenQuestionPaper={() => alert('Question paper view: Opens complete section paper.')}
          onSelectSection={handleSelectSection}
        />

        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          <CatQuestionPane
            question={currentQuestion}
            selectedOptionId={selectedOptionId}
            titaText={titaText}
            onSelectOption={(optId) => setSelectedOptionId(optId)}
            onChangeTita={(val) => setTitaText(val)}
            onSaveAndNext={handleSaveAndNext}
            onClearResponse={handleClearResponse}
            onMarkForReviewAndNext={handleMarkForReviewAndNext}
          />

          <CatPalette
            questions={session.active_section.questions}
            currentQuestionIndex={currentQIndex}
            candidateName={candidateName}
            activeSectionCode={session.active_section.code}
            onSelectQuestion={handleSelectQuestion}
            onSubmitSection={handleSubmitSection}
            onSubmitExam={handleSubmitExam}
          />
        </div>

        <CatCalculator
          isOpen={isCalculatorOpen}
          onClose={() => setIsCalculatorOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <EdTechNavbar
        activeView={activeView}
        serverHealthy={serverHealthy}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigate={(v) => setActiveView(v)}
      />

      <div className="flex-1 flex flex-col relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-50">
            <div className="text-sm font-semibold text-indigo-600 animate-pulse">
              Communicating with CAT Exam Engine...
            </div>
          </div>
        )}
        {errorMessage && activeView === 'dashboard' && (
          <div className="max-w-5xl mx-auto px-4 mt-4 w-full">
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-between">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="text-rose-500 font-bold">×</button>
            </div>
          </div>
        )}

        {activeView === 'dashboard' && (
          <DashboardHome
            onStartExam={handleStartExam}
            onOpenPractice={() => alert('Practice drill selector: Select Section, Subtopic, and Target Difficulty.')}
            serverHealthy={serverHealthy}
          />
        )}

        {activeView === 'scorecard' && (
          <ScorecardView
            scorecardData={scorecardData}
            onBackToDashboard={() => setActiveView('dashboard')}
          />
        )}
      </div>
    </div>
  );
}

export default App;
