import { NextRequest, NextResponse } from "next/server";
import Todo from "@/lib/models/Todo";
import { connectMongo } from "@/lib/mongo";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await connectMongo();

    const { title, completed } = await request.json();
    const updateData: Partial<{ title: string; completed: boolean }> = {};

    if (title !== undefined) updateData.title = title;
    if (completed !== undefined) updateData.completed = completed;

    const { id } = await context.params;

    const updatedTodo = await Todo.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error("할 일 업데이트 중 오류", error);
    return NextResponse.json(
      { error: "할 일을 수정하는 데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await connectMongo();

    const { id } = await context.params;

    const todos = await Todo.find({ userId: id }).sort({ createdAt: -1 });

    return NextResponse.json(todos);
  } catch (error) {
    console.error("할 일 조회 중 오류", error);
    return NextResponse.json(
      { error: "할 일 목록을 불러오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await connectMongo();

    const { id } = await context.params;

    await Todo.findByIdAndDelete(id);

    return NextResponse.json({ message: "Todo deleted" });
  } catch (error) {
    console.error("할 일 삭제 중 오류", error);
    return NextResponse.json(
      { error: "할 일을 삭제하는 데 실패했습니다." },
      { status: 500 }
    );
  }
}