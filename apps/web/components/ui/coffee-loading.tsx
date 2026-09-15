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
        flex min-h-[280px]
        items-center justify-center
        rounded-[28px]
        bg-[#F8F1E5]
        ${className}
      `}
    >
      <div className="text-xl font-bold">Loading...</div>
      {/* <Image
        src="/images/coffee_preparing_loading.gif"
        alt=""
        width={420}
        height={315}
        priority
        unoptimized
        className="h-auto w-[280px] max-w-full object-contain"
      /> */}
    </div>
  );
}
