import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { siwe } from "better-auth/plugins";
import { generateRandomString } from "better-auth/crypto";
import { verifyMessage, createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { nextCookies } from "better-auth/next-js";
import { authSchema } from "@/db/schema";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: authSchema,
  }),
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
