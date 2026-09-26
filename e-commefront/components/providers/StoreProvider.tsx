"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";

import { RouteMetadata } from "@/components/seo/RouteMetadata";
import { getAccessToken } from "@/config/config";
import { fetchCurrentUser } from "@/store/authSlice";
import { makeStore, type AppStore } from "@/store/store";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState<AppStore>(makeStore);

  useEffect(() => {
    if (getAccessToken()) {
      void store.dispatch(fetchCurrentUser());
    }
  }, [store]);

  return (
    <Provider store={store}>
      <RouteMetadata />
      {children}
    </Provider>
  );
}
