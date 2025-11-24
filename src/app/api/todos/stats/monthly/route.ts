import { NextResponse } from "next/server";
import Todo from "@/lib/models/Todo";
import { connectMongo } from "@/lib/mongo";

export async function GET(request: Request) {
  try {
    await connectMongo();

    const url = new URL(request.url);
		const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId 쿼리 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    const todos = await Todo.find({ userId });

    const monthly: Record<string, { total: number; completed: number }> = {};

    todos.forEach((todo) => {
      const date = new Date(todo.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthly[key]) {
        monthly[key] = { total: 0, completed: 0 };
      }

      monthly[key].total += 1;
      if (todo.completed) monthly[key].completed += 1;
    });

    const result = Object.entries(monthly).map(([month, data]) => ({
      month,
      total: data.total,
      completed: data.completed,
      completionRate: data.total
        ? Math.round((data.completed / data.total) * 100)
        : 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("월별 통계 계산 중 오류", error);
    return NextResponse.json(
      { error: "월별 통계를 불러오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}