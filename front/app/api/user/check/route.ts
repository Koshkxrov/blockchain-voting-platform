import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne(
      { email: session.user.email },
      {
        projection: {
          _id: 0,
          email: 1,
          subscription: 1,
        },
      }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      email: user.email,
      subscription: user.subscription,
      currentTime: new Date().toISOString(),
      subscriptionValid: user.subscription &&
        user.subscription.status === 'active' &&
        new Date(user.subscription.expiresAt) > new Date()
    });
  } catch (error) {
    console.error("Error checking user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
