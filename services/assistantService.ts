import { storage } from '../lib/storage';
import type { AssistantMessage, AssistantSession } from '../types';
import { apiRequest } from './apiClient';

interface SessionCreateResponse {
  session: AssistantSession;
  messages: AssistantMessage[];
}

export async function ensureAssistantSession() {
  const existingId = storage.getAssistantSessionId();
  if (existingId) {
    try {
      const session = await apiRequest<AssistantSession>(`/api/v1/assistant/sessions/${existingId}`);
      const messages = await apiRequest<AssistantMessage[]>(`/api/v1/assistant/sessions/${existingId}/messages`);
      return { session, messages };
    } catch {
      storage.clearAssistantSessionId();
    }
  }

  const created = await apiRequest<SessionCreateResponse>('/api/v1/assistant/sessions', {
    method: 'POST',
  });
  storage.setAssistantSessionId(created.session.id);
  return created;
}

export function sendAssistantMessage(sessionId: string, content: string) {
  return apiRequest<AssistantMessage>(`/api/v1/assistant/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}
