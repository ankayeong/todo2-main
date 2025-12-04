"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface FriendDetail {
  _id: string;
  friendId: string;
  friendName: string;
}

interface Todo {
  _id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt?: string;
}

export default function FriendCalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { isLoaded, isSignedIn, userId } = useAuth();

  const [friend, setFriend] = useState<FriendDetail | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlyTasks, setMonthlyTasks] = useState<
    Record<string, { total: number; completed: number }>
  >({});
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

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

  const sortTodos = (items: Todo[]) =>
    [...items].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  //친구 정보 불러오기
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;

    setLoading(true);

    fetch(`/api/friends/${id}?userId=${userId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data: FriendDetail) => setFriend(data))
      .catch(() => setFriend(null))
      .finally(() => setLoading(false));
  }, [isLoaded, isSignedIn, userId, id]);

  //월별 투두 불러오기
  useEffect(() => {
    if (!friend) return;

    fetch(`/api/todos/${friend.friendId}`)
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
  }, [friend, viewDate, year, month]);

  //선택 날짜 투두 불러오기
  useEffect(() => {
    if (!friend) return;

    fetch(`/api/todos/by-date?userId=${friend.friendId}&date=${selectDateString}`)
      .then((res) => res.json())
      .then((data: Todo[]) => setTasks(sortTodos(Array.isArray(data) ? data : [])))
      .catch(() => setTasks([]));
  }, [friend, selectedDate]);

  if (!isLoaded || loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );

  if (!isSignedIn) {
    window.location.href = "/";
    return null;
  }

  if (!friend)
    return (
      <div className="flex items-center justify-center min-h-screen">
        친구 정보를 찾을 수 없습니다.
      </div>
    );

  //월 이동
  const handlePrev = () => setViewDate(new Date(year, month - 1, 1));
  const handleNext = () => setViewDate(new Date(year, month + 1, 1));

  
  return (
    <div className="min-h-screen bg-slate-50 flex justify-center px-4">
      <div className="w-full max-w-4xl py-10">

        {/* 헤더 */}
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-s text-slate-500 mb-3">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            {friend.friendName}님의 이번 달 일정
          </div>

          <div className="flex items-end justify-between">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              친구 캘린더
            </h1>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-100"
              >
                ◀
              </button>

              <p className="text-lg font-semibold">
                {year}년 {month + 1}월
              </p>

              <button
                onClick={handleNext}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-100"
              >
                ▶
              </button>
            </div>
          </div>
        </header>

        <main className="flex flex-col md:flex-row gap-10">

          {/* 달력 */}
          <div className="w-full md:w-1/2 bg-white border border-slate-200 rounded-2xl shadow-sm p-5">

            {/* 요일 */}
            <div className="grid grid-cols-7 text-center text-sm font-medium text-slate-500 mb-2">
              {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            {/* 날짜 */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => {
                const dateStr =
                  day &&
                  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                const info = dateStr ? monthlyTasks[dateStr] : null;
                const allDone =
                  info?.total !== undefined &&
                  info.total > 0 &&
                  info.total === info.completed;

                const isSelected = dateStr === selectDateString;

                const today = new Date();
                const isToday =
                  day === today.getDate() &&
                  month === today.getMonth() &&
                  year === today.getFullYear();

                return (
                  <button
                    key={idx}
                    disabled={!day}
                    onClick={() => day && setSelectedDate(new Date(year, month, day))}
                    className={`
                      h-14 flex flex-col justify-center items-center rounded-xl 
                      border text-sm transition

                      ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white hover:bg-slate-100"
                      }

                      ${allDone ? "border-3 border-blue-500" : "border border-slate-200"}
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
                        }`}>
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

          {/* 투두 */}
          <div className="w-full md:w-1/2">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              {selectedDate.toLocaleDateString()}
            </h2>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 py-10 text-center text-slate-400">
                  이 날짜에는 등록된 할 일이 없어요.
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 border border-slate-200 shadow-sm"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      readOnly
                      className="h-5 w-5"
                    />

                    <p
                      className={`flex-1 text-sm ${
                        task.completed
                          ? "line-through text-slate-400"
                          : "text-slate-800"
                      }`}
                    >
                      {task.title}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
