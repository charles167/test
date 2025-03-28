import { authMiddleware } from "@clerk/nextjs"; // ✅ Use authMiddleware instead of clerkMiddleware

export default authMiddleware({
  publicRoutes: ["/"], // Define routes that don't require authentication
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Ensure authentication is applied for API routes
    "/(api|trpc)(.*)",
  ],
};
