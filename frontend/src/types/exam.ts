export type PaletteState = 
  | 'NOT_VISITED' 
  | 'NOT_ANSWERED' 
  | 'ANSWERED' 
  | 'MARKED_REVIEW' 
  | 'ANSWERED_AND_MARKED';

export type QuestionType = 'MCQ' | 'TITA';

export interface QuestionOption {
  option_id: string;
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface ClientQuestion {
  question_id: string;
  sequence_number: number;
  question_type: QuestionType;
  question_text: string;
  options: QuestionOption[];
  palette_state: PaletteState;
  selected_option_id?: string | null;
  tita_answer_text?: string | null;
  time_spent_seconds: number;
}

export interface SectionPayload {
  code: string;
  name: string;
  duration_seconds: number;
  time_remaining_seconds: number;
  questions: ClientQuestion[];
}

export interface TestSession {
  test_attempt_id: string;
  exam_code: string;
  started_at: string;
  active_section: SectionPayload;
  all_sections?: SectionPayload[];
}

export interface ScorecardSummary {
  total_score: number;
  max_possible_score: number;
  total_questions: number;
  total_attempted: number;
  total_correct: number;
  total_incorrect: number;
  total_unattempted: number;
  overall_accuracy_percentage: number;
  sectional_scores: Record<string, number>;
}
