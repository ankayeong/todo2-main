import { NextRequest, NextResponse } from "next/server";
import Friend from "@/lib/models/Friend";
import { connectMongo } from "@/lib/mongo";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongo();

    const url = new URL(request.url); // ⬅⬅⬅ 중요!!!
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId 쿼리 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    const { id } = await context.params;
    const doc = await Friend.findById(id)

    if (!doc || doc.status !== "accepted") {
      return NextResponse.json(
        { error: "Friend document not found" },
        { status: 404 }
      );
    }

    if (doc.requesterId !== userId && doc.recipientId !== userId) {
      return NextResponse.json(
        { error: "이 친구 관계에 속한 유저가 아닙니다." },
        { status: 403 }
      );
    }

    const isRequester = doc.requesterId === userId;
    const normalized = {
      _id: doc._id,
      friendId: isRequester ? doc.recipientId : doc.requesterId,
      friendName: isRequester ? doc.recipientName : doc.requesterName,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("친구 상세 조회 중 오류", error);
    return NextResponse.json(
      { error: "친구 상세 정보를 불러오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}