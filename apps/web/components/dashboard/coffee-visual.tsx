"use client";

import { Sparkles } from "lucide-react";
import Image from "next/image";

import { CoffeeSteam } from "./coffee-steam";

export function CoffeeHeroVisual() {
  return (
    <div className="relative flex min-h-[200px] items-center justify-center overflow-visible sm:min-h-[200px] lg:min-h-[200px]">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="
          absolute left-1/2 top-1/2
          h-64 w-64
          -translate-x-1/2 -translate-y-1/2
          rounded-full
          bg-[#FFF9F0]/70
          blur-3xl
        "
      />

      {/* Decorative sparkle */}
      <Sparkles
        aria-hidden="true"
        className="
          absolute left-[13%] top-[25%]
          h-5 w-5
          text-[#B99576]
          motion-safe:animate-pulse
        "
      />

      <Sparkles
        aria-hidden="true"
        className="
          absolute right-[10%] bottom-[25%]
          h-4 w-4
          text-[#B99576]
          motion-safe:animate-pulse
        "
      />

      {/* Main orbital system */}
      <div className="relative flex h-[200px] w-[200px] items-center justify-center sm:h-[200px] sm:w-[200px] lg:h-[240px] lg:w-[240px]">
        {/* Outer ring */}
        <div
          aria-hidden="true"
          className="
            coffee-orbit-slow
            absolute inset-0
            rounded-full
            border border-[#CBAF91]/50
          "
        >
          <span className="absolute left-[18%] top-[8%] h-2 w-2 rounded-full bg-[#B99576]" />
          <span className="absolute bottom-[13%] right-[17%] h-2.5 w-2.5 rounded-full bg-[#8D684E]" />
        </div>

        {/* Dashed ring */}
        <div
          aria-hidden="true"
          className="
            coffee-orbit-reverse
            absolute inset-5
            rounded-full
            border border-dashed border-[#CBAF91]/70
          "
        >
          <span className="absolute right-[6%] top-[48%] h-2 w-2 rounded-full bg-[#D2B69A]" />
        </div>

        {/* Inner ring */}
        <div
          aria-hidden="true"
          className="
            absolute inset-12
            rounded-full
            border border-[#DCC5AD]/70
            bg-[#FFFDF9]/40
          "
        />

        {/* Cup container */}
        <div
          className="
            relative z-10
            flex h-46 w-46
            items-center justify-center
            rounded-full
            sm:h-40 sm:w-40
          "
        >
          {/* Animated steam */}
          <CoffeeSteam />
          <Image
            src="/images/coffee-glass.png"
            alt="coffe-glass"
            width={250}
            height={250}
            className="absolute left-[10px] top-[10px]"
          />
        </div>

        {/* Freshly brewed badge */}
        <div
          className="
            coffee-badge-float
            absolute
            bottom-[12%]
            left-[-75px]
            z-20
            flex
            items-center
            gap-2
            whitespace-nowrap
            rounded-full
            border
            border-[#E8D9C9]
            bg-[#FFFDF9]
            px-4
            py-2.5
            text-[11px]
            font-medium
            text-[#79604D]
            shadow-[0_8px_25px_rgba(91,61,39,0.08)]
            sm:left-[-90px]
            lg:left-[-115px]
          "
        >
          <span className="h-2 w-2 rounded-full bg-[#91AA82]" />
          Freshly brewed
        </div>

        {/* Flow badge */}
        <div
          className="
            coffee-badge-float-delayed
            absolute
            right-[-75px]
            top-[12%]
            z-20
            rounded-2xl
            border
            border-[#E8D9C9]
            bg-[#FFFDF9]
            px-4
            py-3
            shadow-[0_8px_25px_rgba(91,61,39,0.08)]
            sm:right-[-90px]
            lg:right-[-115px]
          "
        >
          <p
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-[#A18B78]
            "
          >
            Today
          </p>

          <p className="mt-1 whitespace-nowrap text-xs font-semibold text-[#4F392B]">
            Your flow matters
          </p>
        </div>
      </div>
    </div>
  );
}
