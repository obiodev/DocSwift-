import GoogleProvider      from "next-auth/providers/google";
import CredentialsProvider  from "next-auth/providers/credentials";
import bcrypt               from "bcryptjs";
import { supabaseAdmin, isPro } from "./supabase.js";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET environment variable must be set");
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
        .select("id, email, name, password_hash, avatar_url")
        .eq("email", email)
        .maybeSingle();

      if (!user?.password_hash) return null; // user not found or Google-only account

      const valid = await bcrypt.compare(credentials.password, user.password_hash);
      if (!valid) return null;

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
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/fr/auth/signin",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Auto-create user row for Google OAuth accounts
      if (account?.provider === "google" && user?.email && supabaseAdmin) {
        const { data: existing } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("email", user.email)
          .maybeSingle();

        if (!existing) {
          await supabaseAdmin.from("users").insert({
            email:     user.email,
            name:      user.name  ?? null,
            avatar_url: user.image ?? null,
            provider:  "google",
          });
        }
      }
      return true;
    },
    async session({ session }) {
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
