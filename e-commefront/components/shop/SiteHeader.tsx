"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Heart, ShoppingBag, UserRound } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCart } from "@/store/cartSlice";
import { fetchFavorites } from "@/store/favoriteSlice";
import { logoutUser } from "@/store/authSlice";
import { PushNotificationsToggle } from "@/components/shop/PushNotificationsToggle";
import { CustomerNotificationBell } from "@/components/shop/CustomerNotificationBell";

export function SiteHeader() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const cart = useAppSelector((state) => state.cart.cart);
  const favoriteCount = useAppSelector(
    (state) => state.favorites.productIds.length,
  );
  // The header badge counts distinct products; quantities stay visible in the cart.
  const cartCount = cart?.items.length ?? 0;

  useEffect(() => {
    if (user) {
      void dispatch(fetchCart());
      void dispatch(fetchFavorites());
    }
  }, [dispatch, user]);

  return (
    <header id="storefront-header" className="sticky top-0 z-40 border-b border-stone-200 bg-[#fffdf9]/95 backdrop-blur">
      <div className="site-container flex items-center justify-between gap-4 py-4">
        <Link
          href="/"
          className="text-xl font-black tracking-[0.2em] text-stone-900"
        >
          NAYA<span className="text-[#a45a3d]">.</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-stone-600 md:flex">
          <Link href="/" className="transition hover:text-[#a45a3d]">
            Accueil
          </Link>
          <Link href="/shop" className="transition hover:text-[#a45a3d]">
            Boutique
          </Link>
          <Link href="/contact" className="transition hover:text-[#a45a3d]">
            Contact
          </Link>
          {user?.is_admin && (
            <Link href="/dashboard" className="transition hover:text-[#a45a3d]">
              Administration
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 text-stone-700">
          {user && !user.is_admin && <CustomerNotificationBell />}
          <Link
            href={user ? "/favorites" : "/auth"}
            aria-label="Mes favoris"
            className="relative rounded-full p-2 transition hover:bg-[#f2eee7] hover:text-[#a45a3d]"
          >
            <Heart size={19} />
            {favoriteCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-[#a45a3d] text-[10px] text-white">
                {favoriteCount}
              </span>
            )}
          </Link>
          <Link
            href={user ? "/cart" : "/auth"}
            data-cart-target
            aria-label="Mon panier"
            className="relative rounded-full p-2 transition hover:bg-[#f2eee7] hover:text-[#a45a3d]"
          >
            <ShoppingBag size={19} />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-[#a45a3d] text-[10px] text-white">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="group relative">
              <button
                aria-label="Menu du compte"
                className="rounded-full p-2 hover:bg-[#f2eee7] hover:text-[#a45a3d]"
              >
                <UserRound size={19} />
              </button>
              <div className="invisible absolute right-0 top-full w-52 rounded-xl border border-stone-200 bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <p className="truncate px-3 py-2 text-xs text-stone-500">
                  {user.email}
                </p>
                <PushNotificationsToggle />

                <Link
                  href="/account/orders"
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
                >
                  Mes commandes
                </Link>

                <Link
                  href="/account"
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
                >
                  Mon compte
                </Link>

                <button
                  onClick={() => void dispatch(logoutUser())}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/auth"
              className="ml-1 rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#344536]"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
      <div className="border-t border-stone-100 md:hidden">
        <nav className="site-container flex gap-6 overflow-x-auto py-2 text-xs font-semibold text-stone-600">
          <Link href="/">Accueil</Link>
          <Link href="/shop">Boutique</Link>
          <Link href="/contact">Contact</Link>
          {user?.is_admin && <Link href="/dashboard">Administration</Link>}
        </nav>
      </div>
    </header>
  );
}