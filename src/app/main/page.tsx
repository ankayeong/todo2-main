'use client';

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface Todo {
  _id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt?: string;
}

export default function MainPage() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // YYYY-MM-DD
  const getDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const today = new Date();
  const todayKey = getDateString(today);
  const todayString = today.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  });

  const sortTodosByDate = (items: Todo[]) =>
    [...items].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  // 오늘 날짜의 투두만 불러오기
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;

    fetch(`/api/todos/by-date?userId=${userId}&date=${todayKey}`)
      .then(async (res) => {
        if (!res.ok) {
          const message = await res.text();
          throw new Error(message || "오늘의 할 일을 불러오는 데 실패했습니다.");
        }
        return res.json();
      })
      .then((data: Todo[]) => setTasks(sortTodosByDate(Array.isArray(data) ? data : [])))
      .catch((err) => {
        console.error("Error fetching todos:", err);
        setTasks([]);
      });
  }, [isLoaded, isSignedIn, todayKey, userId]);

  // 로딩 화면
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-xl font-semibold text-slate-700">Loading...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    window.location.href = "/";
    return null;
  }

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;

  const addTask = () => {
    const title = input.trim();
    if (!title || !userId) return;

    fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        title,
        description: "",
        createdAt: todayKey,
      }),
    })
      .then((res) => res.json())
      .then((newTodo: Todo) => {
        setTasks((prev) => sortTodosByDate([newTodo, ...prev]));
        setInput("");
      })
      .catch((err) => console.error("Error creating todo:", err));
  };


  // 삭제
  const removeTask = (id: string) => {
    fetch(`/api/todos/${id}`, { method: "DELETE" })
      .then(() => setTasks((prev) => prev.filter((t) => t._id !== id)))
      .catch((err) => console.error("Error deleting todo:", err));
  };

  // 체크 변경
  const toggleCompleted = (task: Todo, completed: boolean) => {
    fetch(`/api/todos/${task._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    })
      .then(() =>
        setTasks((prev) =>
          prev.map((t) => (t._id === task._id ? { ...t, completed } : t))
        )
      )
      .catch((err) => console.error("Error updating todo:", err));
  };

  // 제목 수정 저장
  const saveEditing = (task: Todo) => {
    if (!editingText.trim()) return;

    fetch(`/api/todos/${task._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editingText.trim() }),
    })
      .then((res) => res.json())
      .then((updated: Todo) => {
        setTasks((prev) =>
          prev.map((t) => (t._id === updated._id ? updated : t))
        );
        setEditingId(null);
        setEditingText("");
      })
      .catch((err) => console.error("Error editing todo:", err));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center px-4">
      <div className="w-full max-w-3xl py-10">
        {/* 상단 헤더 */}
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-s font-medium text-slate-500 mb-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            오늘 하루를 정리해보세요
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-slate-900">
                오늘 할 일
              </h1>
              <p className="mt-1 text-s text-slate-500">{todayString}</p>
            </div>

            <div className="flex items-center gap-2 text-xs md:text-sm">
              <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm">
                전체 {totalCount}개
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-600 text-white shadow-sm">
                완료 {completedCount}개
              </span>
            </div>
          </div>
        </header>

        {/* 입력 영역 */}
        <section className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-slate-900/80 transition">
              <span className="material-symbols-outlined text-slate-400 mr-2 text-xl">
                edit
              </span>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="할 일을 입력하고 Enter 또는 추가 버튼을 눌러보세요"
                className="flex-1 bg-transparent outline-none text-sm md:text-base text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={addTask}
              type="button"
              className="shrink-0 rounded-2xl bg-blue-600 text-white px-5 py-3 text-sm md:text-base font-semibold shadow-sm hover:bg-blue-800 transition"
            >
              추가
            </button>
          </div>
        </section>

        {/* 리스트 영역 */}
        <section>
          {tasks.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center text-slate-400 text-sm">
              아직 등록된 할 일이 없어요.
              <br />
              위 입력창에 오늘 해야 할 일을 적어보세요.
            </div>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="group flex items-center gap-3 rounded-2xl bg-white px-4 py-3 border border-slate-200 shadow-sm transition hover:border-slate-400 hover:shadow-md"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => toggleCompleted(task, e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />

                  {editingId === task._id ? (
                    <>
                      <input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm md:text-base text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900/70"
                      />
                      <button
                        onClick={() => saveEditing(task)}
                        className="text-xs md:text-sm text-slate-900 font-medium px-2 py-1 rounded-lg hover:bg-slate-100"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingText("");
                        }}
                        className="text-xs md:text-sm text-slate-400 px-2 py-1 rounded-lg hover:bg-slate-100"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <p
                        className={`flex-1 text-sm md:text-base leading-snug ${
                          task.completed
                            ? "line-through text-slate-400"
                            : "text-slate-900"
                        }`}
                      >
                        {task.title}
                      </p>
                      <button
                        onClick={() => {
                          setEditingId(task._id);
                          setEditingText(task.title);
                        }}
                        className="text-xs md:text-sm text-slate-400 hover:text-slate-900 font-medium px-2 py-1 rounded-lg hover:bg-slate-50"
                      >
                        수정
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => removeTask(task._id)}
                    className="text-xs md:text-sm text-slate-300 hover:text-red-500 px-1 py-1 rounded-lg"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
