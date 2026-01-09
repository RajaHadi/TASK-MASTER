import { createAuthClient } from "better-auth/client";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, ""),

  // Enable JWT plugin for token-based authentication
  plugins: [
    jwtClient()
  ],
});

// Export auth methods
export const { signIn, signUp, signOut, useSession } = authClient;
