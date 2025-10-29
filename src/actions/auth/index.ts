"use server";

import { auth } from "@/lib/auth";
import { APIError } from "better-auth";
import { headers } from "next/headers";

export async function signUpEmail(
  name: string,
  email: string,
  password: string
) {
  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
      headers: await headers(),
    });
    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof APIError) {
      switch (error.body?.code) {
        case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
          return {
            success: false,
            code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
          };
        default:
          return { success: false, code: "UNKNOWN_ERROR" };
      }
    }
    return {
      success: false,
      code: "UNKNOWN_ERROR",
    };
  }
}

export async function signInEmail(email: string, password: string) {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });
    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof APIError) {
      // Handle Better Auth specific error codes
      switch (error.body?.code) {
        case "INVALID_EMAIL_OR_PASSWORD":
          return { success: false, code: "INVALID_EMAIL_OR_PASSWORD" };
        case "USER_NOT_FOUND":
          return { success: false, code: "USER_NOT_FOUND" };
        case "INVALID_PASSWORD":
          return { success: false, code: "INVALID_PASSWORD" };
        case "EMAIL_NOT_VERIFIED":
          return { success: false, code: "EMAIL_NOT_VERIFIED" };
        case "ACCOUNT_LOCKED":
          return { success: false, code: "ACCOUNT_LOCKED" };
        default:
          return { success: false, code: "UNKNOWN_ERROR" };
      }
    }
    console.log(error);
    return { success: false, code: "UNKNOWN_ERROR" };
  }
}
