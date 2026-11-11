import { NextResponse }      from "next/server";
import { supabaseAdmin }    from "@/lib/supabase";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(request) {
  const url   = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const base  = process.env.NEXTAUTH_URL ?? url.origin;
  const fail  = NextResponse.redirect(`${base}/fr/auth/signin?verified=0`);

  if (!/^[a-f0-9]{64}$/.test(token)) return fail;

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, email, name, verify_expires")
    .eq("verify_token", token)
    .maybeSingle();

  if (!user || !user.verify_expires || new Date(user.verify_expires) < new Date()) return fail;

  const { error } = await supabaseAdmin
    .from("users")
    .update({ email_verified: true, verify_token: null, verify_expires: null })
    .eq("id", user.id);

  if (error) {
    console.error("[verify] update error:", error);
    return fail;
  }

  sendWelcomeEmail({ email: user.email, name: user.name }).catch(() => {});
  return NextResponse.redirect(`${base}/fr/auth/signin?verified=1`);
}
