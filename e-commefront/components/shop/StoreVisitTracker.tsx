"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { getAccessToken } from "@/config/config";
import { useAppSelector } from "@/store/hooks";
import { getVisitorId, visitorTrackingService } from "@/services/dashboard/visitorTracking";

export function StoreVisitTracker() {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const authStatus = useAppSelector((state) => state.auth.status);

  useEffect(() => {
    const hasToken = Boolean(getAccessToken());
    if (user?.is_admin) return;
    if (hasToken && (authStatus === "idle" || authStatus === "loading")) return;

    const visitorId = getVisitorId();
    if (!visitorId) return;
    void visitorTrackingService.trackPageView(visitorId, pathname).catch(() => {
      // Le suivi ne doit jamais bloquer la navigation dans la boutique.
    });
  }, [authStatus, pathname, user]);

  return null;
}
