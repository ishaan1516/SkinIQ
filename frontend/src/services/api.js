import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function getAuthToken() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error('Not authenticated');
  return data.session.access_token;
}

export const api = {
  async analyzeImage(file) {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/v1/analysis/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to analyze image');
    }

    return response.json();
  },

  async submitQA(analysisId, baseScores, qaResponses) {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}/api/v1/analysis/qa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        analysis_id: analysisId,
        answers: {
          base_scores: baseScores,
          qa_responses: qaResponses,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit QA');
    }

    return response.json();
  },

  async getProfile() {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}/api/v1/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch profile');
    }

    return response.json();
  },

  async getHistory() {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}/api/v1/profile/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch history');
    }

    return response.json();
  },

  async getCurrentUser() {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch user');
    }

    return response.json();
  },
};
