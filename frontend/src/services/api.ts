import axios from 'axios';
import { TestSession, PaletteState } from '../types/exam';

const API_BASE_URL = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ExamInfo {
  code: string;
  name: string;
  total_duration_minutes: number;
  total_questions: number;
  sections: {
    code: string;
    name: string;
    sequence_order: number;
    duration_minutes: number;
    target_question_count: number;
  }[];
}

export const examApi = {
  // Check backend server status
  async checkHealth() {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // List all available exams
  async listExams(): Promise<ExamInfo[]> {
    const res = await apiClient.get<ExamInfo[]>('/exams/');
    return res.data;
  },

  // Synthesize a full fresh 66-question AI CAT Mock Exam
  async generateAiMock(customTitle?: string): Promise<{
    status: string;
    exam_code: string;
    exam_name: string;
    total_questions: number;
    sections: { VARC: number; DILR: number; QA: number };
  }> {
    const res = await apiClient.post('/exams/generate-ai-mock', {
      custom_title: customTitle,
    });
    return res.data;
  },

  // Start a new test attempt
  async startTest(userId: string, examCode: string): Promise<TestSession> {
    const res = await apiClient.post<TestSession>('/tests/start', {
      user_id: userId,
      exam_code: examCode,
      mode: 'MOCK_EXAM',
    });
    return res.data;
  },

  // Auto-save a candidate response
  async saveResponse(
    attemptId: string,
    questionId: string,
    selectedOptionId: string | null,
    titaText: string | null,
    paletteState: PaletteState,
    timeDeltaSeconds: number
  ) {
    const res = await apiClient.post(`/tests/${attemptId}/save-response`, {
      question_id: questionId,
      selected_option_id: selectedOptionId,
      tita_answer_text: titaText,
      palette_state: paletteState,
      time_spent_delta_seconds: timeDeltaSeconds,
    });
    return res.data;
  },

  // Final exam submission and scoring
  async finishExam(attemptId: string) {
    const res = await apiClient.post(`/tests/${attemptId}/finish`);
    return res.data;
  },

  // Fetch analytics for a user
  async getUserAnalytics(userId: string) {
    const res = await apiClient.get(`/analytics/users/${userId}`);
    return res.data;
  },

  // Generate a live question via Gemini AI with SymPy verification
  async generateLiveQuestion(params: {
    section_code: string;
    topic_name?: string;
    subtopic_code?: string;
    difficulty_level?: number;
    question_type?: string;
  }) {
    const res = await apiClient.post('/questions/generate-live', params);
    return res.data;
  },
};
