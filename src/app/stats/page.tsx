"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface MonthlyStat {
  month: string;        // "2025-01"
  total: number;
  completed: number;
  completionRate: number;
}

export default function StatsPage() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [data, setData] = useState<MonthlyStat[]>([]);
  const [loading, setLoading] = useState(true);

  // 클릭된 월 데이터 저장
  const [selectedMonth, setSelectedMonth] = useState<MonthlyStat | null>(null);

  // 월별 통계 가져오기
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;

    fetch(`/api/todos/stats/monthly?userId=${userId}`)
      .then(async (res) => {
        if (!res.ok) {
          const message = await res.text();
          throw new Error(message || "월별 통계를 불러오지 못했습니다.");
        }
        return res.json();
      })
      .then((stats: MonthlyStat[]) => {
        setData(Array.isArray(stats) ? stats : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("통계 조회 실패:", err);
        setData([]);
        setLoading(false);
      });
  }, [isLoaded, isSignedIn, userId]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-slate-600">통계를 불러오는 중...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center px-4 py-10">
      <div className="w-full max-w-4xl">

        {/* 헤더 */}
        <header className="mb-6">
          <h2 className="text-3xl font-extrabold text-slate-900">
            📊 월별 할 일 통계
          </h2>
          <p className="text-slate-500 mt-1">
            그래프를 클릭하면 해당 월의 상세 정보를 확인할 수 있어요.
          </p>
        </header>

        {/* 그래프 */}
        <div className="w-full h-80 bg-white rounded-2xl shadow-md p-6 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis unit="%" tick={{ fontSize: 12 }} />

              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  backgroundColor: "white",
                  border: "1px solid #eee",
                }}
              />

              {/*바 클릭 이벤트*/}
              <Bar
                dataKey="completionRate"
                fill="#4F46E5"
                radius={[6, 6, 0, 0]}
                onClick={(data) => {
                  const item = data as unknown as MonthlyStat;
                  setSelectedMonth(item);
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 상세 정보 */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          {selectedMonth ? (
            <>
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                📅 {selectedMonth.month} 통계 요약
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                  <p className="text-sm text-slate-500">총 할 일</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedMonth.total}개
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                  <p className="text-sm text-slate-500">완료된 할 일</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedMonth.completed}개
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                  <p className="text-sm text-slate-500">완료율</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {selectedMonth.completionRate}%
                  </p>
                </div>

              </div>
            </>
          ) : (
            <p className="text-center text-slate-400">
              위 그래프에서 보고 싶은 월을 클릭하세요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
