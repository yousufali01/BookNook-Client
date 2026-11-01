import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

import { db } from "@/lib/mongodb";

export const auth = betterAuth({
  database: mongodbAdapter(db),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  // Origin allowlist: same is used for the social login redirect origins
  trustedOrigins: ["http://localhost:3000", "https://booknook-client-psi.vercel.app"],

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  plugins: [
    jwt({
      jwt: {
        definePayload: ({ user }) => ({
          id: user.id,
          email: user.email,
          name: user.name,
        }),
      },
    }),
  ],
});
