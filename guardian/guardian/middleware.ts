import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Protect everything except the auth routes
    '/((?!sign-in|sign-up|_next|static|favicon.ico|api|public).*)',
  ],
}; 