"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Coffee,
  Home,
  MoreHorizontal,
  Package,
  ShoppingCart,
  Users,
  Utensils,
} from "lucide-react";

const navigation = [
  {
    label: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    label: "Menu",
    href: "/menu",
    icon: Coffee,
  },
  {
    label: "Tables",
    href: "/tables",
    icon: Utensils,
  },
  {
    label: "Bookings",
    href: "/reservations",
    icon: CalendarDays,
  },
  {
    label: "More",
    href: "#",
    icon: MoreHorizontal,
  },
];

const moreItems = [
  {
    label: "Inventory",
    href: "/inventory",
    icon: Package,
  },
  {
    label: "Queue",
    href: "/queue",
    icon: Users,
  },
  {
    label: "Staff",
    href: "/staff",
    icon: ClipboardList,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
];

export function CommandNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop */}
      <div className="sticky top-[100px] z-30 hidden px-4 sm:px-6 xl:block xl:px-8">
        <div className="mx-auto max-w-fit">
          <nav
            className="
            flex items-center gap-0.5
            rounded-2xl
            border border-[#E8DED2]
            bg-[#F7F1EA]
            p-1
            shadow-[0_4px_14px_rgba(70,45,25,0.05)]
            "
          >
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              if (item.label === "More") {
                return (
                  <div key={item.label} className="group relative">
                    <button
                      type="button"
                      className="
                        flex items-center gap-2
                        rounded-xl px-3.5 py-2.5
                        text-sm font-medium text-[#74685D]
                        transition-all duration-200
                        hover:bg-[#F4EEE7]
                        hover:text-[#2B2118]
                      "
                    >
                      <Icon className="h-4 w-4" />
                      <span>More</span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>

                    <div
                      className="
                        invisible absolute right-0 top-full mt-2
                        w-48 translate-y-1 opacity-0
                        rounded-2xl
                        border border-[#E8DED2]
                        bg-[#FFFDF9]
                        p-2
                        shadow-[0_18px_50px_rgba(70,45,25,0.12)]
                        transition-all duration-150
                        group-hover:visible
                        group-hover:translate-y-0
                        group-hover:opacity-100
                      "
                    >
                      {moreItems.map((more) => {
                        const MoreIcon = more.icon;
                        const moreActive = isActive(more.href);

                        return (
                          <Link
                            key={more.href}
                            href={more.href}
                            className={`
                              flex items-center gap-3
                              rounded-xl px-3 py-2.5
                              text-sm font-medium
                              transition-colors
                              ${
                                moreActive
                                  ? "bg-[#6F4E37] text-white"
                                  : "text-[#62574D] hover:bg-[#F4EEE7]"
                              }
                            `}
                          >
                            <MoreIcon className="h-4 w-4" />
                            {more.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group relative flex items-center gap-2
                    rounded-xl px-3.5 py-2.5
                    text-sm font-medium
                    transition-all duration-200
                    ${
                      active
                        ? "bg-[#6F4E37] text-white shadow-[0_6px_18px_rgba(111,78,55,0.22)]"
                        : "text-[#74685D] hover:bg-[#F4EEE7] hover:text-[#2B2118]"
                    }
                  `}
                >
                  <Icon className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile */}
      <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 xl:hidden">
        <nav
          className="
            mx-auto flex max-w-md items-center justify-around
            rounded-2xl
            border border-[#E8DED2]
            bg-[#FFFDF9]/95
            p-2
            shadow-[0_15px_45px_rgba(70,45,25,0.16)]
            backdrop-blur-xl
          "
        >
          {navigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex min-w-[58px] flex-col items-center
                  gap-1 rounded-xl px-2 py-2
                  text-[10px] font-medium
                  transition-all duration-200
                  ${active ? "bg-[#6F4E37] text-white" : "text-[#796D62]"}
                `}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
