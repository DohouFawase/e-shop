"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { getAccessToken } from "@/config/config";
import { useAppSelector } from "@/store/hooks";
import { StoreVisitTracker } from "@/components/shop/StoreVisitTracker";

export function StorefrontAccessGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const authStatus = useAppSelector((state) => state.auth.status);
  const [restoringSession, setRestoringSession] = useState(false);

  useEffect(() => {
    setRestoringSession(Boolean(getAccessToken()));
  }, []);

  useEffect(() => {
    if (user?.is_admin) {
      router.replace("/dashboard");
      return;
    }
    if (authStatus === "authenticated" || authStatus === "unauthenticated" || authStatus === "error") {
      setRestoringSession(false);
    }
  }, [authStatus, router, user]);

  if (user?.is_admin || (restoringSession && (authStatus === "idle" || authStatus === "loading"))) {
    return <main className="grid min-h-screen place-items-center text-sm text-slate-500">Redirection vers le tableau de bord…</main>;
  }

  return <>
    <StoreVisitTracker />
    {children}
  </>;
}
