import { Task, TaskStatus } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getTasks: () => request<Task[]>("/tasks"),

  getTask: (id: number) => request<Task>(`/tasks/${id}`),

  createTask: (data: { title: string; description?: string; status?: TaskStatus }) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(data) }),

  updateTask: (
    id: number,
    data: Partial<{ title: string; description?: string; status?: TaskStatus }>,
  ) => request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  deleteTask: (id: number) => request<Task>(`/tasks/${id}`, { method: "DELETE" }),
};
