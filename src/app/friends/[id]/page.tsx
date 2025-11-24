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
  // Next.js 15: unwrap params
  const { id } = React.use(params);

  const { isLoaded, isSignedIn, userId } = useAuth();

  const [friend, setFriend] = useState<FriendDetail | null>(null);
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let d = 1; d <= lastDateOfMonth; d++) days.push(d);

  const getDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const sortTodosByDate = (items: Todo[]) =>
    [...items].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  // 친구 정보 불러오기
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;

    setLoading(true);

    fetch(`/api/friends/${id}?userId=${userId}`)
      .then(async (res) => {
        if (!res.ok) {
          const message = await res.text();
          throw new Error(message || "친구 정보를 불러오지 못했습니다.");
        }
        return res.json();
      })
      .then((data: FriendDetail) => {
        setFriend(data);
      })
      .catch((err) => {
        console.error(err);
        setFriend(null);
      })
      .finally(() => setLoading(false));
  }, [isLoaded, isSignedIn, userId, id]); //params.id 대신 id 사용

  // 해당 날짜의 친구 Todo 불러오기
  useEffect(() => {
    if (!friend) return;

    const dateStr = getDateString(selectedDate);

    fetch(`/api/todos/by-date?userId=${friend.friendId}&date=${dateStr}`)
      .then(async (res) => {
        if (!res.ok) {
          const message = await res.text();
          throw new Error(message || "친구 할 일을 불러오지 못했습니다.");
        }
        return res.json();
      })
      .then((data: Todo[]) => setTasks(sortTodosByDate(Array.isArray(data) ? data : [])))
      .catch((err) => {
        console.error("친구 투두 불러오기 실패:", err);
        setTasks([]);
      });
  }, [friend, selectedDate]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!isSignedIn || !userId) {
    window.location.href = "/";
    return null;
  }

  if (!friend) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500 text-sm">친구 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center px-4">
      <div className="w-full max-w-5xl py-10 flex flex-col md:flex-row gap-10">
        
        {/* 왼쪽: 달력 */}
        <section className="w-full md:w-1/2">
          <header className="mb-6">
            <p className="text-xs text-slate-400 mb-1">Friend&apos;s Calendar</p>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {friend.friendName}님의 캘린더
            </h1>
            <p className="text-[11px] text-slate-400 mt-1">
              친구 ID: {friend.friendId}
            </p>
          </header>

          <div className="flex items-center justify-between mb-4 py-2">
            <button
              onClick={handlePrevMonth}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-200 text-slate-700"
            >
              ◀
            </button>
            <p className="text-base font-bold text-slate-900">
              {year}년 {month + 1}월
            </p>
            <button
              onClick={handleNextMonth}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-200 text-slate-700"
            >
              ▶
            </button>
          </div>

          {/* 요일 */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 mb-2">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          {/* 날짜 */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              const isToday =
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

              const isSelected =
                day === selectedDate.getDate() &&
                month === selectedDate.getMonth() &&
                year === selectedDate.getFullYear();

              return (
                <button
                  key={idx}
                  className={`h-10 flex items-center justify-center rounded-xl text-sm
                    ${isToday ? "text-blue-500 font-semibold" : "text-slate-700"}
                    ${
                      isSelected
                        ? "bg-slate-200 border border-slate-300"
                        : "bg-white border border-slate-200"
                    }
                    ${!day ? "bg-transparent border-none" : ""}`}
                  onClick={() =>
                    day && setSelectedDate(new Date(year, month, day))
                  }
                  disabled={!day}
                >
                  {day || ""}
                </button>
              );
            })}
          </div>
        </section>

        {/* 오른쪽: 할 일 */}
        <section className="w-full md:w-1/2">
          <p className="text-lg font-bold text-slate-900 mb-2 text-center md:text-left">
            {selectedDate.toLocaleDateString()} 할 일
          </p>

          {tasks.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center text-slate-400 text-sm">
              이 날에는 등록된 할 일이 없어요.
            </div>
          ) : (
            <ul className="space-y-3 max-h-[520px] overflow-y-auto pr-1 mt-4">
              {tasks.map((task) => (
                <li
                  key={task._id}
                  className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 border border-slate-200 shadow-sm"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    readOnly
                    className="h-5 w-5 rounded border-slate-300 text-slate-900"
                  />
                  <p
                    className={`flex-1 text-sm md:text-base leading-snug ${
                      task.completed
                        ? "line-through text-slate-400"
                        : "text-slate-900"
                    }`}
                  >
                    {task.title}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
