"use client";

export function CoffeeSteam() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-4 left-1/2 z-20 h-20 w-24 -translate-x-1/2"
    >
      <svg
        viewBox="0 0 96 88"
        className="h-full w-full overflow-visible"
        fill="none"
      >
        {/* Left steam */}
        <path
          d="M29 78 C13 65 43 54 28 39 C17 28 34 19 32 7"
          pathLength="1"
          className="coffee-steam-line coffee-steam-line-one"
        />

        {/* Center steam */}
        <path
          d="M48 82 C30 66 61 52 47 36 C36 23 53 15 50 2"
          pathLength="1"
          className="coffee-steam-line coffee-steam-line-two"
        />

        {/* Right steam */}
        <path
          d="M67 78 C52 62 80 52 66 37 C57 26 73 17 70 7"
          pathLength="1"
          className="coffee-steam-line coffee-steam-line-three"
        />
      </svg>
    </div>
  );
}
