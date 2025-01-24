import CredentialsProvider from "next-auth/providers/credentials";
import { userSignIn } from "../../api";

export const options = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      async authorize(credentials) {
        //Check if the user exists.
        try {
          const user = await userSignIn({
            identifier: credentials.identifier,
            password: credentials.password,
          });
          console.log("user", user);
          // console.log("at options line 14", user);
          if (user.responseStatus === "OK" && user.responseData?.jwt && user?.responseData?.role==="authenticated") {
            return user;
          } else {
            // throw new Error(user?.responseStatus || user?.error.message);
          }
        } catch (error) {
          const errorMessage = error.message || "Invalid credentials";
          throw new Error(errorMessage);
        }
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user, role, account, profile }) {
      return { ...token, ...user };
    },

    async session({ session, user, token }) {
      session.token = token?.responseData?.jwt;
      session.user = {
        id: token?.responseData?.id,
        email: token?.responseData?.email,
        username: token?.responseData?.username,
      };
      session.role = token?.responseData?.role;
      session.hubs = token?.responseData?.hubs;

      return session;
    },
  },

  pages: {
    signIn: "/login",
    signOut: "/login",
  },
};
