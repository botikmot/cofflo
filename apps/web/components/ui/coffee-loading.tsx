import Image from "next/image";

type CoffeeLoadingProps = {
  message?: string;
  className?: string;
};

export function CoffeeLoading({
  message = "Preparing good things",
  className = "",
}: CoffeeLoadingProps) {
  return (
    <div
      className={`
        fixed inset-0 z-[9999]
        flex min-h-dvh w-full
        items-center justify-center
        overflow-hidden
        bg-[#F8F1E5]
        px-6 py-10
        ${className}
      `}
    >
      {/* Decorative background circles */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[#E6D2BC]/40" />

      <div className="pointer-events-none absolute -bottom-20 -right-16 h-48 w-48 rounded-full bg-[#E6D2BC]/30" />

      {/* Floating decorative dots */}
      <div className="absolute left-[28%] top-[22%] h-2 w-2 rounded-full bg-[#B99576]/50 motion-safe:animate-pulse" />

      <div
        className="absolute right-[27%] top-[30%] h-1.5 w-1.5 rounded-full bg-[#8D684E]/40 motion-safe:animate-bounce"
        style={{ animationDelay: "300ms" }}
      />

      <div
        className="absolute bottom-[24%] left-[32%] h-1.5 w-1.5 rounded-full bg-[#B99576]/40 motion-safe:animate-pulse"
        style={{ animationDelay: "600ms" }}
      />

      {/* Main loading content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Animated logo */}
        <div className="relative flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-dashed border-[#B99576]/70 motion-safe:animate-[spin_10s_linear_infinite]" />

          <div
            className="absolute inset-2 rounded-full border border-[#D3B99F]/60 motion-safe:animate-ping"
            style={{ animationDuration: "2.5s" }}
          />

          <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden motion-safe:animate-[coffee-float_3s_ease-in-out_infinite]">
            <Image
              src="/images/coffee-cup.png"
              alt="Loading Cofflo"
              width={62}
              height={62}
              priority
              className="h-auto w-[62px] object-contain"
            />
          </div>
        </div>

        {/* Message */}
        <p className="mt-6 text-sm font-semibold tracking-[-0.01em] text-[#4F392B]">
          {message}
        </p>

        {/* Loading dots */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8B6348] motion-safe:animate-bounce" />

          <span
            className="h-1.5 w-1.5 rounded-full bg-[#8B6348] motion-safe:animate-bounce"
            style={{ animationDelay: "150ms" }}
          />

          <span
            className="h-1.5 w-1.5 rounded-full bg-[#8B6348] motion-safe:animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>

        {/* Subtitle */}
        <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.18em] text-[#AA9280]">
          Please wait a moment
        </p>
      </div>
    </div>
  );
}
