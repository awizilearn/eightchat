import { getAuth } from "firebase-admin/auth";
import { initializeAdminApp } from "@/firebase/admin-app";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  const app = initializeAdminApp();
  const auth = getAuth(app);

  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  try {
    const sessionCookie = await auth.createSessionCookie(token, { expiresIn });
    cookies().set("__session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating session cookie:", error);
    return NextResponse.json({ success: false }, { status: 401 });
  }
}
