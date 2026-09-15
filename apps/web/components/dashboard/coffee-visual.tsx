export function CoffeeVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative h-full min-h-[220px] w-full overflow-hidden"
    >
      {/* Warm ambient glow */}
      <div className="coffee-glow" />

      {/* Aroma / fog */}
      <div className="coffee-aroma coffee-aroma-1" />
      <div className="coffee-aroma coffee-aroma-2" />
      <div className="coffee-aroma coffee-aroma-3" />

      {/* Cup shadow */}
      <div className="coffee-shadow" />

      {/* Cup */}
      <div className="coffee-cup">
        <div className="coffee-cup-body">
          <div className="coffee-surface" />
        </div>

        <div className="coffee-handle" />

        <div className="coffee-saucer" />
      </div>
    </div>
  );
}
