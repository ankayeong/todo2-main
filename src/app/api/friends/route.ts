import { NextResponse } from "next/server";
import Friend from "@/lib/models/Friend";
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

    const friends = await Friend.find({
      status: "accepted",
      $or: [{ requesterId: userId }, { recipientId: userId }],
    }).sort({ updatedAt: -1 });

    const normalized = friends.map((doc) => {
      const isRequester = doc.requesterId === userId;
      return {
        _id: doc._id,
        friendId: isRequester ? doc.recipientId : doc.requesterId,
        friendName: isRequester ? doc.recipientName : doc.requesterName,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    });

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("친구 목록 조회 중 오류", error);
    return NextResponse.json(
      { error: "친구 목록을 불러오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}