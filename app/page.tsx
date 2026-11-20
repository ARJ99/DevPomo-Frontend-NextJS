"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Task } from "@/lib/types";
import TaskCard from "@/components/task-card";
import SearchBar from "@/components/search-bar";

export default function Home() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [visibleTasks, setVisibleTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getTasks()
      .then((tasks) => {
        setAllTasks(tasks);
        setVisibleTasks(tasks);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const handleSearch = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setVisibleTasks(allTasks);
      return;
    }
    setVisibleTasks(
      allTasks.filter(
        (t) => t.title.toLowerCase().includes(q) || String(t.id) === q,
      ),
    );
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteTask(id);
      setAllTasks((prev) => prev.filter((t) => t.id !== id));
      setVisibleTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-r from-slate-300 to-slate-500 p-8">
      <main className="mx-auto max-w-7xl">
        <div className="rounded-3xl border bg-card/90 p-8 shadow-xl backdrop-blur">
          <h1 className="text-center text-4xl font-bold tracking-tight">
            DevPomo
          </h1>
          <SearchBar onSearch={handleSearch} />
          {error ? (
            <p className="mt-6 text-center text-sm text-destructive">{error}</p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visibleTasks.map((task) => (
                <TaskCard key={task.id} task={task} onDelete={handleDelete} />
              ))}
              {visibleTasks.length === 0 && (
                <p className="col-span-full mt-4 text-center text-sm text-muted-foreground">
                  No tasks found
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
