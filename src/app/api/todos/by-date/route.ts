import { NextResponse } from "next/server";
import Todo from "@/lib/models/Todo";
import { connectMongo } from "@/lib/mongo";

export async function GET(request: Request) {
  try {
    await connectMongo();

    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
		const date = url.searchParams.get("date");

    if (!userId || !date) {
      return NextResponse.json(
        { error: "userId와 date 쿼리 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    const todos = await Todo.find({ userId, createdAt: date }).sort({ createdAt: -1 });

    return NextResponse.json(todos);
  } catch (error) {
    console.error("특정 날짜 할 일 조회 중 오류", error);
    return NextResponse.json(
      { error: "할 일 목록을 불러오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}