import Image from "next/image";
import { Check } from "lucide-react";

import { AUTH_BRANDING } from "@/lib/auth-branding";

export function AuthBrandPanel() {
  return (
    <section className="relative hidden overflow-hidden bg-[#4B3022] lg:flex lg:h-screen">
      {/* Decorative shapes */}
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#6F4E37]/60" />

      <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-[#2F1D14]/60" />

      <div className="absolute right-20 top-24 h-24 w-24 rounded-full border border-[#D8BFA8]/20" />

      <div className="absolute bottom-32 left-20 h-16 w-16 rounded-full border border-[#D8BFA8]/10" />

      <div className="relative z-10 flex h-full w-full flex-col justify-between p-10 xl:p-12">
        {/* Logo */}
        <div>
          <div className="flex h-28 w-28 items-center justify-center rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <Image
              src={AUTH_BRANDING.logo}
              alt={AUTH_BRANDING.name}
              width={90}
              height={90}
              priority
              className="h-auto w-[150px]"
            />
          </div>
        </div>

        {/* Brand message */}
        <div className="max-w-xl">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D9BFA8]">
            {AUTH_BRANDING.tagline}
          </p>

          <h1 className="max-w-lg text-5xl font-semibold leading-[1.04] tracking-[-0.04em] text-[#FFF9F3]">
            Run your coffee business with less friction.
          </h1>

          <p className="mt-5 max-w-md text-sm leading-6 text-[#E4D6CA]">
            {AUTH_BRANDING.description}
          </p>

          <div className="mt-7 space-y-2.5">
            {[
              "Manage your workspace from one place",
              "Organize products and branches",
              "Keep your daily operations flowing",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-xs text-[#E4D6CA]"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8D684E]">
                  <Check className="h-3 w-3 text-white" />
                </span>

                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-[11px] text-[#BBA493]">
          © {new Date().getFullYear()} {AUTH_BRANDING.name}. All rights
          reserved.
        </div>
      </div>
    </section>
  );
}
