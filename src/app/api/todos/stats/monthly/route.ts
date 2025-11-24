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

    const stats = await Todo.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { $substr: ["$createdAt", 0, 7] },
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$completed", true] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          total: 1,
          completed: 1,
          completionRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              {
                $round: [
                  { $multiply: [{ $divide: ["$completed", "$total"] }, 100] },
                  1,
                ],
              },
            ],
          },
        },
      },
      { $sort: { month: 1 } },
    ]);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("월별 통계 조회 중 오류", error);
    return NextResponse.json(
      { error: "월별 통계를 불러오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}