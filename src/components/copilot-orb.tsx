"use client";

type OrbStatus = "disconnected" | "connecting" | "connected";

interface CopilotOrbProps {
  status: OrbStatus;
  isSpeaking?: boolean;
  className?: string;
}

export function CopilotOrb({ status, isSpeaking = false, className = "" }: CopilotOrbProps) {
  const isActive = status === "connected" && isSpeaking;
  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer glow ring */}
      <div
        className={`absolute rounded-full transition-all duration-1000 ${
          isActive
            ? "size-44 bg-blue-500/10 animate-pulse"
            : isConnected
              ? "size-40 bg-blue-500/5"
              : isConnecting
                ? "size-40 bg-violet-500/5 animate-pulse"
                : "size-36 bg-muted/20"
        }`}
      />

      {/* Mid glow ring */}
      <div
        className={`absolute rounded-full transition-all duration-700 ${
          isActive
            ? "size-32 bg-blue-500/15"
            : isConnected
              ? "size-28 bg-blue-500/8"
              : isConnecting
                ? "size-28 bg-violet-500/10 animate-pulse"
                : "size-24 bg-muted/10"
        }`}
      />

      {/* Core orb */}
      <div
        className={`relative size-20 rounded-full shadow-2xl transition-all duration-500 ${
          isActive
            ? "shadow-blue-500/40 scale-110"
            : isConnected
              ? "shadow-blue-500/20"
              : isConnecting
                ? "shadow-violet-500/20 animate-pulse"
                : "shadow-none"
        }`}
        style={{
          background: isActive
            ? "radial-gradient(circle at 35% 35%, #60a5fa, #3b82f6 40%, #1e40af 80%, #1e3a5f)"
            : isConnected
              ? "radial-gradient(circle at 35% 35%, #93c5fd, #3b82f6 50%, #1e3a8a 85%, #172554)"
              : isConnecting
                ? "radial-gradient(circle at 35% 35%, #c4b5fd, #7c3aed 50%, #4c1d95 85%, #2e1065)"
                : "radial-gradient(circle at 35% 35%, hsl(var(--muted-foreground) / 0.3), hsl(var(--muted-foreground) / 0.15) 50%, hsl(var(--muted-foreground) / 0.08) 85%)",
        }}
      >
        {/* Specular highlight */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 40%, transparent 60%)",
          }}
        />
      </div>

      {/* Breathing ring for connected idle */}
      {isConnected && !isActive && (
        <div className="absolute size-24 rounded-full border border-blue-500/15 animate-[ping_3s_ease-in-out_infinite]" />
      )}

      {/* Active pulse rings */}
      {isActive && (
        <>
          <div className="absolute size-28 rounded-full border border-blue-400/20 animate-[ping_2s_ease-in-out_infinite]" />
          <div className="absolute size-36 rounded-full border border-blue-400/10 animate-[ping_2.5s_ease-in-out_infinite_0.5s]" />
        </>
      )}
    </div>
  );
}
