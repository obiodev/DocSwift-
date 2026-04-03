import GoogleProvider from "next-auth/providers/google";

const providers = [];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET ?? "changeme-in-production",
  callbacks: {
    async session({ session }) {
      if (session?.user?.email) {
        try {
          const { isPro } = await import("./supabase.js");
          session.user.isPro = await isPro(session.user.email);
        } catch {
          session.user.isPro = false;
        }
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
};
