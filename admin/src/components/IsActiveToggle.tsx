"use client";

interface Props {
  isActive: boolean;
  onToggle: () => void;
  className?: string;
  activeLabel?: string;
  inactiveLabel?: string;
  inverse?: boolean;
}

export default function IsActiveToggle({
  isActive,
  onToggle,
  className = "",
  activeLabel,
  inactiveLabel,
  inverse = false
}: Props) {

  const showLabels = activeLabel || inactiveLabel;
  const displayLabel = isActive ? activeLabel : inactiveLabel;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className="relative inline-flex items-center rounded-full transition-all duration-300 ease-in-out active:scale-95 cursor-pointer"
        style={{
          width: showLabels ? "auto" : "52px",
          minWidth: "52px",
          height: "26px",
          padding: showLabels ? "0 8px" : "0 4px",

          background: isActive
            ? "#0c756f"
            : "#efeadb",

          boxShadow: `
              inset 2px 2px 5px rgba(0,0,0,0.15),
              inset -2px -2px 5px rgba(255,255,255,0.7)
            `
        }}
        aria-label={`Toggle ${isActive ? "on" : "off"}`}
      >
        {/* Knob */}
        <span
          className="absolute rounded-full transition-all duration-300 ease-in-out"
          style={{
            width: "20px",
            height: "20px",
            left: isActive
              ? (showLabels ? "calc(100% - 26px)" : "28px")
              : "4px",

            background: isActive ? "#efeadb" : "#0c756f",
          }}
        />

        {/* Label */}
        {showLabels && displayLabel && (
          <span
            className="text-xs font-medium relative z-10 px-2 transition-all duration-300"
            style={{
              color: isActive ? "#0c756f" : "#6b7280",
              marginLeft: isActive ? "0" : "26px",
              marginRight: isActive ? "26px" : "0",
            }}
          >
            {displayLabel}
          </span>
        )}
      </button>
    </div>
  );
}