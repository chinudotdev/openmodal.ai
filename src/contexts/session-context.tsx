"use client";

import { createContext, useContext, ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
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

  const user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? undefined,
      }
    : null;

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
