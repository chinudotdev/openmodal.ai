import { db } from "@/db";
import { authSchema } from "@/db/schema";
import { sendEmailVerification } from "@/emails";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { generateRandomString } from "better-auth/crypto";
import { nextCookies } from "better-auth/next-js";
import { siwe } from "better-auth/plugins";
import { createPublicClient, http, verifyMessage } from "viem";
import { mainnet } from "viem/chains";

export const auth = betterAuth({
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmailVerification({ to: user.email, url });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    siwe({
      domain: "openmodal.ai",
      emailDomainName: "openmodal.ai",
      anonymous: true,
      getNonce: async () => {
        // Implement your nonce generation logic here
        return generateRandomString(32);
      },
      verifyMessage: async ({ message, signature, address }) => {
        try {
          // Verify the signature using viem (recommended)
          const isValid = await verifyMessage({
            address: address as `0x${string}`,
            message,
            signature: signature as `0x${string}`,
          });
          return isValid;
        } catch (error) {
          console.error("SIWE verification failed:", error);
          return false;
        }
      },
      ensLookup: async ({ walletAddress }) => {
        // Optional: Implement ENS lookup for user names and avatars
        try {
          // Optional: lookup ENS name and avatar using viem
          // You can use viem's ENS utilities here
          const client = createPublicClient({
            chain: mainnet,
            transport: http(),
          });
          const ensName = await client.getEnsName({
            address: walletAddress as `0x${string}`,
          });
          const ensAvatar = ensName
            ? await client.getEnsAvatar({
                name: ensName,
              })
            : null;
          return {
            name: ensName || walletAddress,
            avatar: ensAvatar || "",
          };
        } catch {
          return {
            name: walletAddress,
            avatar: "",
          };
        }
      },
    }),
    nextCookies(),
  ],
});
