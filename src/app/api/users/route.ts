import { NextResponse } from "next/server";
import User from "@/lib/models/User";
import { connectMongo } from "@/lib/mongo";

export async function POST(request: Request) {
  try {
    await connectMongo();

    const body = await request.json();
    const user = await User.create(body);

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("사용자 생성 중 오류", error);
    return NextResponse.json(
      { message: "사용자 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}