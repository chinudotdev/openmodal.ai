"use client";

import { createContext, type ReactNode, useContext } from "react";
import { authClient } from "@/lib/auth-client";

export interface SessionUser {
  onboardingCompleted: boolean;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined;
}

interface SessionContextType {
  session: {
    user: SessionUser;
  } | null;
  isLoading: boolean;
  user: SessionUser | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  let user: SessionUser | null = null;

  if (!session) {
    user = null;
  } else {
    user = session.user;
  }

  const value: SessionContextType = {
    session: user ? { user } : null,
    isLoading: isPending,
    user,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
