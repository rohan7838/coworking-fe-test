import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getUserRoleandPermissions } from "./app/api/api";

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  async function middleware(req) {
    // console.log("middleware", req.nextauth.token.responseData.jwt);
    // const data = await getUserRoleandPermissions(req.nextauth.token.responseData.jwt);

    const role = req.nextauth.token?.responseData?.role;
    const pathname = req.nextUrl.pathname;

    // if (req.nextUrl.pathname.startsWith("/login") && role === "authenticated") {
    //   const url = new URL("/ia-hubs/customers", req.url);
    //   url.searchParams.set("callbackUrl", pathname);
    //   return NextResponse.redirect(url);
    // }
    if ( req.nextUrl.pathname.startsWith("/ia-hubs") && role !== "authenticated") {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        if (token) {
          return true;
        }
      },
    },
  }
);

export const config = { matcher: ["/", "/ia-hubs/:path*"] };
