"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";

interface FriendListItem {
  _id: string;
  friendId: string;
  friendName: string;
  createdAt: string;
  updatedAt: string;
}

interface FriendRequestDoc {
  _id: string;
  requesterId: string;
  requesterName: string;
  recipientId: string;
  recipientName: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export default function FriendsPage() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const [friendCode, setFriendCode] = useState("");
  const [friendName, setFriendName] = useState("");
  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const [pending, setPending] = useState<FriendRequestDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const myName = user?.fullName || "사용자";

  const loadAll = useCallback(() => {
    if (!userId) return;
    setLoading(true);

    Promise.all([
      fetch(`/api/friends?userId=${userId}`).then((res) =>
        res.json()
      ),
      fetch(`/api/friends/requests?userId=${userId}`).then((res) => res.json()),
    ])
      .then(([friendsData, pendingData]) => {
        setFriends(Array.isArray(friendsData) ? friendsData : []);
        setPending(Array.isArray(pendingData) ? pendingData : []);
      })
      .catch((err) => {
        console.error("친구 데이터 불러오기 실패:", err);
      })
      .finally(() => setLoading(false));
   }, [userId]);

  // 초기 로드
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;
    loadAll();
  }, [isLoaded, isSignedIn, loadAll, userId]);

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

  // 친구 요청 보내기
  const sendRequest = () => {
    if (!friendCode.trim()) {
      alert("친구의 Clerk User ID를 입력해주세요.");
      return;
    }

    const body = {
      requesterId: userId,
      requesterName: myName,
      recipientId: friendCode.trim(),
      recipientName: friendName.trim() || friendCode.trim(),
    };

    fetch("/api/friends/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "친구 요청 실패");
          return;
        }
        // pending 목록 새로고침
        loadAll();
        setFriendCode("");
        setFriendName("");
      })
      .catch((err) => {
        console.error("친구 요청 실패:", err);
        alert("친구 요청 중 오류가 발생했습니다.");
      });
  };

  // 친구 요청 수락
  const acceptRequest = (reqId: string) => {
    fetch(`/api/friends/requests/${reqId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "요청 수락 실패");
          return;
        }
        loadAll();
      })
      .catch((err) => {
        console.error("친구 요청 수락 실패:", err);
        alert("수락 중 오류가 발생했습니다.");
      });
  };

  // 친구 요청 거절/취소
  const rejectRequest = (reqId: string) => {
    fetch(`/api/friends/requests/${reqId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "요청 거절/취소 실패");
          return;
        }
        loadAll();
      })
      .catch((err) => {
        console.error("친구 요청 거절/취소 실패:", err);
        alert("거절/취소 중 오류가 발생했습니다.");
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 flex justify-center">
      <div className="w-full max-w-3xl space-y-10">
        {/* 헤더 */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-1">
              친구 관리
            </h1>
            <p className="text-xs text-slate-400">
              내 친구 코드:{" "}
              <span className="font-mono bg-slate-100 px-2 py-1 rounded">
                {userId}
              </span>
            </p>
          </div>
        </header>

        {/* 친구 추가 섹션 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">친구 추가</h2>
          <p className="text-xs text-slate-400">
            친구에게 내 코드(<span className="font-mono">{userId}</span>)를
            알려주고, 상대 코드와 별명을 입력해 친구 요청을 보낼 수 있어요.
          </p>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
              <input
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value)}
                placeholder="친구 Clerk User ID (예: user_xxxxx)"
                className="flex-1 bg-transparent outline-none text-sm md:text-base text-slate-700"
              />
            </div>
            <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
              <input
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="친구 별명 (화면에 표시될 이름)"
                className="flex-1 bg-transparent outline-none text-sm md:text-base text-slate-700"
              />
            </div>
            <button
              onClick={sendRequest}
              className="md:w-auto w-full rounded-2xl bg-blue-600 text-white px-5 py-3 text-sm md:text-base font-semibold shadow hover:bg-blue-700 transition"
            >
              친구 요청
            </button>
          </div>
        </section>

        {/* 대기 중인 요청 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">
            대기 중인 친구 요청
          </h2>
          {pending.length === 0 ? (
            <p className="text-xs text-slate-400">
              현재 대기 중인 친구 요청이 없습니다.
            </p>
          ) : (
            <ul className="space-y-2">
              {pending.map((r) => {
                const isMine = r.requesterId === userId;

                return (
                  <li
                    key={r._id}
                    className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-800">
                        {isMine
                          ? `${r.recipientName}님에게 보낸 요청`
                          : `${r.requesterName}님의 친구 요청`}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1">
                        {isMine
                          ? `상대 ID: ${r.recipientId}`
                          : `상대 ID: ${r.requesterId}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isMine ? (
                        <button
                          onClick={() => rejectRequest(r._id)}
                          className="px-3 py-1 text-xs rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                        >
                          요청 취소
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => acceptRequest(r._id)}
                            className="px-3 py-1 text-xs rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
                          >
                            수락
                          </button>
                          <button
                            onClick={() => rejectRequest(r._id)}
                            className="px-3 py-1 text-xs rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                          >
                            거절
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* 친구 목록 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-800">내 친구 목록</h2>

          {friends.length === 0 ? (
            <p className="text-slate-400 text-sm">
              아직 친구가 없어요. 위에서 친구에게 요청을 보내보세요.
            </p>
          ) : (
            <ul className="space-y-3">
              {friends.map((f) => (
                <li
                  key={f._id}
                  className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow hover:border-slate-400 hover:shadow-md transition"
                >
                  <div className="flex flex-col flex-1">
                    <Link
                      href={`/friends/${f._id}`}
                      className="text-slate-800 font-medium hover:underline"
                    >
                      {f.friendName}
                    </Link>
                    <span className="text-[11px] text-slate-400 mt-1">
                      친구 ID: {f.friendId}
                    </span>
                  </div>

                  {/* 삭제는 나중에 구현해도 됨 */}
                  {/* <button ...>삭제</button> */}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
