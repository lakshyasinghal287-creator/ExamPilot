import axios from 'axios';
import { TestSession, PaletteState } from '../types/exam';

const API_BASE_URL = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const examApi = {
  // Check backend server status
  async checkHealth() {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Start a new test attempt
  async startTest(userId: string, examCode: string = 'CAT-2026'): Promise<TestSession> {
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
};
