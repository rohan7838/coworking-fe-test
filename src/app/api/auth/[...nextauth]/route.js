import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { userSignIn } from "../../api";
import { options } from "./options";

const handler = NextAuth(options);

export { handler as GET, handler as POST };
