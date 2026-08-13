"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const COOKIE_NAME = "dms_session"
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8 // 8 hours

export async function loginAction(formData: FormData) {
  const password = formData.get("password")

  if (password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin/login?error=1")
  }

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  })

  redirect("/admin")
}
