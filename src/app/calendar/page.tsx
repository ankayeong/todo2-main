"use client";

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

export default function CalendarPage() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [monthlyTasks, setMonthlyTasks] = useState<
    Record<string, { total: number; completed: number }>
  >({});

  const [tasks, setTasks] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const getDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const selectDateString = getDateString(selectedDate);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let d = 1; d <= lastDateOfMonth; d++) days.push(d);

  const sortTodosByDate = (items: Todo[]) =>
    [...items].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  // 이번 달 데이터 불러오기
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;

    fetch(`/api/todos/${userId}`)
      .then((res) => res.json())
      .then((all: Todo[]) => {
        const map: Record<string, { total: number; completed: number }> = {};

        (Array.isArray(all) ? all : []).forEach((t) => {
          const date = t.createdAt;
          if (!date) return;

          const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
          if (date.startsWith(monthStr)) {
            if (!map[date]) {
              map[date] = { total: 0, completed: 0 };
            }
            map[date].total += 1;
            if (t.completed) map[date].completed += 1;
          }
        });

        setMonthlyTasks(map);
      })
      .catch(() => setMonthlyTasks({}));
  }, [isLoaded, isSignedIn, userId, viewDate, year, month]);

  // 선택한 날짜의 todo 불러오기
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;

    fetch(`/api/todos/by-date?userId=${userId}&date=${selectDateString}`)
      .then((res) => res.json())
      .then((data: Todo[]) => setTasks(sortTodosByDate(data ?? [])))
      .catch(() => setTasks([]));
  }, [isLoaded, isSignedIn, selectedDate, userId]);

  // CRUD 처리 

  const addTask = () => {
    if (!input.trim() || !userId) return;

    fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        title: input.trim(),
        description: "",
        createdAt: selectDateString,
      }),
    })
      .then((res) => res.json())
      .then((newTodo: Todo) => {
        setTasks((prev) => [newTodo, ...prev]);

        setMonthlyTasks((prev) => ({
          ...prev,
          [selectDateString]: {
            total: (prev[selectDateString]?.total || 0) + 1,
            completed: prev[selectDateString]?.completed || 0,
          },
        }));

        setInput("");
      });
  };

  const removeTask = (id: string) => {
    const removed = tasks.find((t) => t._id === id);
    const dateStr = removed?.createdAt;

    fetch(`/api/todos/${id}`, { method: "DELETE" }).then(() => {
      setTasks((prev) => prev.filter((t) => t._id !== id));

      if (dateStr) {
        setMonthlyTasks((prev) => ({
          ...prev,
          [dateStr]: {
            total: Math.max((prev[dateStr]?.total || 1) - 1, 0),
            completed: prev[dateStr]?.completed || 0,
          },
        }));
      }
    });
  };

  const toggleCompleted = (task: Todo, completed: boolean) => {
    fetch(`/api/todos/${task._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    }).then(() => {
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, completed } : t))
      );
    });
  };

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
      });
  };


  if (!isLoaded) return <p>Loading...</p>;
  if (!isSignedIn) {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center px-4">
      <div className="w-full max-w-4xl py-10">

        {/* 헤더 */}
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-s font-medium text-slate-500 mb-3">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            이번 달 할 일 확인
          </div>

          <div className="flex items-end justify-between">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              캘린더
            </h1>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewDate(new Date(year, month - 1, 1))}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-100"
              >
                ◀
              </button>
              <p className="text-lg font-semibold text-slate-700">
                {year}년 {month + 1}월
              </p>
              <button
                onClick={() => setViewDate(new Date(year, month + 1, 1))}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-100"
              >
                ▶
              </button>
            </div>
          </div>
        </header>

        {/* 메인 */}
        <main className="flex flex-col md:flex-row gap-10">

          {/* 달력 */}
          <div className="w-full md:w-1/2 bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          
            <div className="grid grid-cols-7 text-center text-sm font-medium text-slate-500 mb-2">
              {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => {
                const dateStr =
                  day &&
                  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                const info = dateStr ? monthlyTasks[dateStr] : null;

                // 모두 완료한 날짜인지
                const allDone =
                  info?.total !== undefined &&
                  info.total > 0 &&
                  info.total === info.completed;

                // 오늘 날짜인지
                const today = new Date();
                const isToday =
                  day === today.getDate() &&
                  month === today.getMonth() &&
                  year === today.getFullYear();

                // 선택된 날짜인지
                const isSelected = dateStr === selectDateString;

                return (
                  <button
                    key={idx}
                    disabled={!day}
                    onClick={() => day && setSelectedDate(new Date(year, month, day))}
                    className={`
                      h-14 flex flex-col justify-center items-center rounded-xl 
                      text-sm transition

                      ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white hover:bg-slate-100"
                      }

                      ${
                        allDone
                          ? "border-2 border-blue-500"
                          : "border border-slate-200"
                      }
                    `}
                  >
                    <span
                      className={`
                        font-medium 
                        ${
                          isSelected
                            ? "text-white"
                            : isToday
                            ? "text-blue-500"
                            : "text-slate-700"
                        }
                      `}
                    >
                      {day ?? ""}
                    </span>

                    {info?.total !== undefined && info.total > 0 && (
                      <span
                        className={`text-xs ${
                          isSelected ? "text-blue-100" : "text-blue-500"
                        }`}
                      >
                        ● {info.total}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/*오른쪽 투두*/}
          <div className="w-full md:w-1/2">

            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              {selectedDate.toLocaleDateString()}
            </h2>

            {/* 입력창 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                <span className="material-symbols-outlined text-slate-400 mr-2">edit</span>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder="할 일을 입력하세요"
                  className="flex-1 bg-transparent outline-none text-sm text-slate-700"
                />
              </div>
              <button
                onClick={addTask}
                className="rounded-2xl bg-blue-600 text-white px-4 py-3 text-sm font-semibold shadow-sm hover:bg-blue-700 transition"
              >
                추가
              </button>
            </div>

            {/* 리스트 */}
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => toggleCompleted(task, e.target.checked)}
                    className="h-5 w-5"
                  />

                  {editingId === task._id ? (
                    <>
                      <input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 px-2 py-1"
                      />
                      <button
                        onClick={() => saveEditing(task)}
                        className="text-sm text-blue-600 px-2 py-1"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingText("");
                        }}
                        className="text-sm text-slate-500 px-2 py-1"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <p
                        className={`flex-1 text-sm ${
                          task.completed ? "line-through text-slate-400" : "text-slate-800"
                        }`}
                      >
                        {task.title}
                      </p>
                      <button
                        onClick={() => {
                          setEditingId(task._id);
                          setEditingText(task.title);
                        }}
                        className="text-sm text-slate-500"
                      >
                        수정
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => removeTask(task._id)}
                    className="text-sm text-slate-400 hover:text-red-500"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
