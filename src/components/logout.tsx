"use client";

import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function Logout() {
  const router = useRouter();
  const handleLogout = async () => {
    const { error } = await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
    if (error) {
      console.error(error);
    }
  };
  return (
    <Button variant="outline" size="icon" onClick={handleLogout}>
      Logout <LogOut className="h-4 w-4" />
    </Button>
  );
}
