const ACCESS_TOKEN_KEY = 'qingsong.accessToken';
const PROFILE_KEY = 'qingsong.profile';
const ASSISTANT_POSITION_KEY = 'qingsong.assistantPosition';
const ASSISTANT_SESSION_KEY = 'qingsong.assistantSessionId';

export const storage = {
  getAccessToken(): string | null {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken(token: string) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clearAccessToken() {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
  getProfile<T>() {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  setProfile(profile: unknown) {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },
  clearProfile() {
    window.localStorage.removeItem(PROFILE_KEY);
  },
  getAssistantPosition<T>() {
    const raw = window.localStorage.getItem(ASSISTANT_POSITION_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  setAssistantPosition(position: unknown) {
    window.localStorage.setItem(ASSISTANT_POSITION_KEY, JSON.stringify(position));
  },
  getAssistantSessionId() {
    return window.localStorage.getItem(ASSISTANT_SESSION_KEY);
  },
  setAssistantSessionId(sessionId: string) {
    window.localStorage.setItem(ASSISTANT_SESSION_KEY, sessionId);
  },
  clearAssistantSessionId() {
    window.localStorage.removeItem(ASSISTANT_SESSION_KEY);
  },
  clearAuth() {
    this.clearAccessToken();
    this.clearProfile();
  },
};
