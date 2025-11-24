import { NextResponse } from "next/server";
import Friend from "@/lib/models/Friend";
import { connectMongo } from "@/lib/mongo";

export async function POST(request: Request) {
  try {
    await connectMongo();

    const { requesterId, requesterName, recipientId, recipientName } =
      await request.json();

    if (!requesterId || !requesterName || !recipientId || !recipientName) {
      return NextResponse.json(
        {
          error:
            "requesterId, requesterName, recipientId, recipientName 는 모두 필수입니다.",
        },
        { status: 400 }
      );
    }

    if (requesterId === recipientId) {
      return NextResponse.json(
        { error: "자기 자신에게 친구 요청을 보낼 수 없습니다." },
        { status: 400 }
      );
    }

    const existing = await Friend.findOne({
      status: { $in: ["pending", "accepted"] },
      $or: [
        { requesterId, recipientId },
        { requesterId: recipientId, recipientId: requesterId },
      ],
    });

    if (existing) {
      const message =
        existing.status === "accepted"
          ? "이미 친구로 연결되어 있습니다."
          : "이미 대기 중인 친구 요청이 있습니다.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const requestDoc = await Friend.create({
      requesterId,
      requesterName,
      recipientId,
      recipientName,
      status: "pending",
    });

    return NextResponse.json(requestDoc, { status: 201 });
  } catch (error) {
    console.error("친구 요청 생성 중 오류", error);
    return NextResponse.json(
      { error: "친구 요청을 생성하는 데 실패했습니다." },
      { status: 500 }
    );
  }
}

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

    const requests = await Friend.find({
      status: "pending",
      $or: [{ requesterId: userId }, { recipientId: userId }],
    }).sort({ createdAt: -1 });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("대기 중인 친구 요청 조회 중 오류", error);
    return NextResponse.json(
      { error: "친구 요청을 불러오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}