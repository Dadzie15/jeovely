import { api } from "@/lib/api"

/**
 * The user object every auth endpoint returns (server: safeUserSelect).
 * `createdAt` arrives as an ISO-8601 string after JSON serialisation.
 */
export interface User {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  createdAt: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

/**
 * Typed calls to /api/auth/*. The session itself lives in an HttpOnly cookie
 * that the browser sends automatically (the client uses credentials: "include");
 * JavaScript never sees or stores a token.
 */
export const authApi = {
  register: (input: RegisterInput) => api.post<{ user: User }>("/auth/register", input).then((d) => d.user),
  login: (input: LoginInput) => api.post<{ user: User }>("/auth/login", input).then((d) => d.user),
  me: (signal?: AbortSignal) => api.get<{ user: User }>("/auth/me", { signal }).then((d) => d.user),
  logout: () => api.post<{ signedOut: true }>("/auth/logout").then(() => undefined),
}
