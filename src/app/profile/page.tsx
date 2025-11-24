"use client";

import Image from "next/image";
import { useUser } from "@clerk/nextjs";

export default function ProfilePage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center px-4 py-14">
      <div className="w-full max-w-lg">
        
        {/* 제목 */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-10 text-center tracking-tight">
          프로필
        </h1>

        {/* 프로필 카드 */}
        <div className="rounded-3xl p-8 bg-white shadow-[8px_8px_16px_rgba(0,0,0,0.12),_-8px_-8px_16px_rgba(255,255,255,0.9)] border border-slate-200">

          {/* 이미지 */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={user?.imageUrl || "/default-image.jpg"}
              alt="profile"
              className="h-36 w-36 rounded-full shadow-md border border-slate-200 object-cover"
            />
            <h2 className="text-2xl font-bold text-slate-900 mt-4">
              {user?.fullName || "No Name"}
            </h2>
          </div>

          {/* 구분선 */}
          <div className="h-px bg-slate-200 mb-6"></div>

          {/* 정보 카드 */}
          <div className="space-y-4">

            <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-100">
              <span className="text-slate-500 font-medium">이메일</span>
              <span className="text-slate-900">
                {user?.primaryEmailAddress?.emailAddress || "No Email"}
              </span>
            </div>

            <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-100">
              <span className="text-slate-500 font-medium">가입일</span>
              <span className="text-slate-900">
                {user?.createdAt?.toLocaleDateString("ko-KR")}
              </span>
            </div>

            <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-100">
              <span className="text-slate-500 font-medium">User ID</span>
              <span className="text-slate-900 text-sm">{user?.id}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
