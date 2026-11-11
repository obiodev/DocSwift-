import GoogleProvider      from "next-auth/providers/google";
import CredentialsProvider  from "next-auth/providers/credentials";
import bcrypt               from "bcryptjs";
import { supabaseAdmin, isPro } from "./supabase.js";

// Warn at startup — will crash at first auth request if missing in production
if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === "production") {
  console.error("[auth] FATAL: NEXTAUTH_SECRET environment variable must be set in production");
}

const providers = [];

// ── Google OAuth ──────────────────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// ── Email / Password ──────────────────────────────────────────────────────
providers.push(
  CredentialsProvider({
    id:   "credentials",
    name: "Email & Mot de passe",
    credentials: {
      email:    { label: "Email",           type: "email"    },
      password: { label: "Mot de passe",    type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const email = credentials.email.toLowerCase().trim();

      const { data: user } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (!user?.password_hash) return null; // user not found or Google-only account

      const valid = await bcrypt.compare(credentials.password, user.password_hash);
      if (!valid) return null;

      // Email ownership must be proven before a password account can log in
      // (prevents pre-registration takeover of someone else's email).
      if (user.email_verified === false) throw new Error("EMAIL_NOT_VERIFIED");

      return {
        id:    user.id,
        email: user.email,
        name:  user.name,
        image: user.avatar_url ?? null,
      };
    },
  })
);

export const authOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET ?? (process.env.NODE_ENV !== "production" ? "dev-secret-not-for-prod" : undefined),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/fr/auth/signin",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Auto-create user row for Google OAuth accounts
      if (account?.provider === "google" && user?.email && supabaseAdmin) {
        const email = user.email.toLowerCase();
        const { data: existing } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", email)
          .maybeSingle();

        if (!existing) {
          await supabaseAdmin.from("users").insert({
            email,
            name:      user.name  ?? null,
            avatar_url: user.image ?? null,
            provider:  "google",
            email_verified: true,
          });
        } else if (existing.email_verified === false) {
          // An unverified password account was created for this email by someone
          // who never proved ownership. Google just did: drop that password.
          await supabaseAdmin.from("users").update({
            password_hash: null,
            verify_token: null,
            verify_expires: null,
            email_verified: true,
            provider: "google",
          }).eq("id", existing.id);
        }
      }
      return true;
    },
    async jwt({ token, account }) {
      if (account?.provider) token.provider = account.provider;
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token?.provider) session.user.provider = token.provider;
      if (session?.user?.email) {
        try {
          session.user.isPro = await isPro(session.user.email);
        } catch {
          session.user.isPro = false;
        }
      }
      return session;
    },
  },
};
