import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/User";
import { connectMongo } from "@/lib/mongo";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await connectMongo();

    const { id } = await context.params;

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { message: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("사용자 조회 중 오류", error);
    return NextResponse.json(
      { message: "사용자 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
