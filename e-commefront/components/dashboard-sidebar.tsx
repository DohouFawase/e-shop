"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  CirclePlus,
  House,
  LogOut,
  Mail,
  Package,
  ShoppingCart,
  Star,
  Store,
  Tags,
  UsersRound,
  UserRound,
} from "lucide-react";
import { logoutUser } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const mainMenu = [
  { label: "Tableau de bord", href: "/dashboard", icon: House },
  {
    label: "Commandes",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  { label: "Messages de contact", href: "/dashboard/contact-messages", icon: Mail },
  { label: "Clients", href: "/dashboard/customers", icon: UsersRound },
  { label: "Catégories", href: "/dashboard/categories", icon: Tags },
  { label: "Mon profil", href: "/dashboard/profile", icon: UserRound },
];

const productMenu = [
  { label: "Ajouter un produit", href: "/dashboard/products/new", icon: CirclePlus },
  { label: "Liste des produits", href: "/dashboard/products", icon: Package },
  { label: "Avis produits", href: "/dashboard/reviews", icon: Star },
];

type MenuItem = {
  label: string;
  href: string;
  icon: typeof House;
};

function MenuGroup({ title, items }: { title: string; items: MenuItem[] }) {
  const pathname = usePathname();
  return (
    <section className="mb-7">
      <h2 className="mb-3 px-2.5 text-[14px] font-normal leading-5 text-[#687386]">
        {title}
      </h2>
      <ul className="space-y-1">
        {items.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(`${href}/`));
          return (
          <li key={label}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex h-10.5 items-center gap-2.5 rounded-[6px] px-4 text-[16px] leading-5 transition-colors ${
                active
                  ? "bg-[#697180] font-medium text-white"
                  : "text-[#687386] hover:bg-slate-100"
              }`}
            >
              <Icon
                aria-hidden="true"
                className="size-4.75 shrink-0"
                strokeWidth={1.8}
              />
              <span className="truncate">{label}</span>
            </Link>
          </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Dashboard sidebar matching the supplied 260px-wide reference. */
export function DashboardSidebar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const displayName = user?.first_name || user?.email || "Mon compte";
  const email = user?.email || "";
  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex h-screen w-[260px] shrink-0 flex-col overflow-y-auto border-r border-[#edf0f2] bg-white px-3.5 pb-4 pt-6 text-[#263344]">
      <nav aria-label="Menu du tableau de bord" className="flex-1">
        <MenuGroup title="Menu principal" items={mainMenu} />
        <MenuGroup title="Produits" items={productMenu} />
      </nav>

      <div className="mt-auto">
        <div className="mb-4.25 flex h-12 items-center gap-3 px-1">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e3e8ec] text-[13px] font-semibold text-[#354256] ring-1 ring-[#d9dee3]">
            <span aria-label={`Avatar de ${displayName}`}>{displayName.trim().charAt(0).toLocaleUpperCase("fr-FR")}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold leading-5">
              {displayName}
            </p>
            <p className="truncate text-[14px] leading-5 text-[#777]">
              {email}
            </p>
          </div>
          <button
            type="button"
            aria-label="Se déconnecter"
            className="text-[#687386]"
            onClick={() => void dispatch(logoutUser())}
          >
            <LogOut className="size-4.25" strokeWidth={1.8} />
          </button>
        </div>

        <Link
          href="/"
          className="flex h-12.75 items-center gap-2.5 rounded-[8px] border border-[#e8ebee] bg-white px-5 text-[14px] font-medium text-[#183b42] shadow-[0_1px_2px_rgba(16,24,40,0.08)] hover:bg-slate-50"
        >
          <Store className="size-4.75" strokeWidth={1.8} />
          <span className="flex-1">Ma boutique</span>
          <ArrowUpRight
            className="size-4.25 text-[#687386]"
            strokeWidth={1.8}
          />
        </Link>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
