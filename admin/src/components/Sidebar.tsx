"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  CreditCard,
  ShoppingBag,
  Megaphone,
  LogOut,
} from "lucide-react";
import { authService } from "../lib/services/auth.service";
import Image from "next/image";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Хянах самбар", icon: LayoutDashboard },
  { href: "/dashboard/courses", label: "Курс", icon: GraduationCap },
  { href: "/dashboard/lessons", label: "Хичээл", icon: BookOpen },
  { href: "/dashboard/payments", label: "Төлбөр", icon: CreditCard },
  { href: "/dashboard/merch", label: "Бүтээгдэхүүн", icon: ShoppingBag },
  { href: "/dashboard/announcements", label: "Мэдээлэл", icon: Megaphone },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    router.push("/");
  };

  return (
    <aside
      className="w-60 shrink-0 flex flex-col h-screen sticky top-0"
      style={{
        backgroundColor: "#0c756f",
        backdropFilter: "blur(12px)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.06)",
        borderRight: "1px solid rgba(255,255,255,0.7)",
      }}
    >
      {/* Brand */}
      <div className="px-6 py-6 shrink-0 flex justify-center items-center">
        <Image style={{ width: "50px", height: "50px" }} src="/tse2.webp" alt="Logo" width={100} height={50} />
        <Image style={{ width: "50px", height: "50px" }} src="/tse2.webp" alt="Logo" width={100} height={50} />
        <Image style={{ width: "50px", height: "50px" }} src="/tse2.webp" alt="Logo" width={100} height={50} />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-2 cursor-pointer transition-all"
                style={
                  isActive
                    ? {
                      background: "linear-gradient(145deg, #ffe6a7, #fdcf6f)",
                      boxShadow: `
              inset 2px 2px 4px rgba(255,255,255,0.5),
              inset -2px -2px 4px rgba(0,0,0,0.1)
            `,
                      color: "#000201",
                    }
                    : {
                      color: "#ffffff",
                    }
                }
              >
                <Icon
                  size={22}
                  strokeWidth={2}
                  className={`${isActive ? "text-yellow-600" : "text-white"
                    } transition-colors`}
                />

                <span
                  className={`text-sm ${isActive
                    ? "font-semibold text-green-900"
                    : "font-medium text-white"
                    }`}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6 shrink-0">
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-white cursor-pointer"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Гарах</span>
        </motion.button>
      </div>
    </aside>
  );
}
