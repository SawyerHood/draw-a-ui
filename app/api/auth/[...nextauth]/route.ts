import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.NEXT_GOOGLE_CLIENT_SECRET ?? "",
    }),
    GitHubProvider({
        clientId: process.env.NEXT_GITHUB_CLIENT_ID ?? "",
        clientSecret: process.env.NEXT_GITHUB_CLIENT_SECRET ?? ""
    })
  ],
};

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
