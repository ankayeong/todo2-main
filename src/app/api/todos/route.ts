import { NextResponse } from "next/server";
import Todo from "@/lib/models/Todo";
import { connectMongo } from "@/lib/mongo";

function getDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function POST(request: Request) {
  try {
    await connectMongo();

    const { userId, title, description, createdAt } = await request.json();

    if (!userId || !title) {
      return NextResponse.json(
        { error: "userId와 title은 필수입니다." },
        { status: 400 }
      );
    }

    const dateStr = createdAt || getDateString(new Date());

    const todo = await Todo.create({
      userId,
      title,
      description: description || "",
      completed: false,
      createdAt: dateStr,
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error("할 일 생성 중 오류", error);
    return NextResponse.json(
      { error: "할 일을 생성하는 데 실패했습니다." },
      { status: 500 }
    );
  }
}