import Image from "next/image";

type BrandLogoProps = {
  logoUrl?: string | null;
  businessName?: string | null;
  description?: string | null;
};

export function BrandLogo({
  logoUrl,
  businessName,
  description,
}: BrandLogoProps) {
  const name = businessName?.trim() || "Your Business";

  console.log("logoUrl:", logoUrl);

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={`${name} logo`}
            width={44}
            height={44}
            className="h-full w-full object-contain p-1.5"
          />
        ) : (
          <span className="text-sm font-semibold text-[#6F4E37]">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-tight text-[#2B2118]">
          {name}
        </p>

        <p className="truncate text-xs text-[#8C8175]">{description}</p>
      </div>
    </div>
  );
}
