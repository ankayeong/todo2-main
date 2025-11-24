import { NextRequest, NextResponse } from "next/server";
import Friend from "@/lib/models/Friend";
import { connectMongo } from "@/lib/mongo";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await connectMongo();

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId 는 필수입니다." },
        { status: 400 }
      );
    }
    
    const { id } = await context.params;

    const requestDoc = await Friend.findOne({
      _id: id,
      status: "pending",
      $or: [{ recipientId: userId }, { requesterId: userId }],
    });

    if (!requestDoc) {
      return NextResponse.json(
        { error: "대기 중인 친구 요청을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    requestDoc.status = "rejected";
    await requestDoc.save();

    return NextResponse.json(requestDoc);
  } catch (error) {
    console.error("친구 요청 거절 중 오류", error);
    return NextResponse.json(
      { error: "친구 요청을 거절하는 데 실패했습니다." },
      { status: 500 }
    );
  }
}