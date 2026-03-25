import { useId } from "react";

interface ProductIconProps {
  gradientStart: string;
  gradientEnd: string;
  size?: number;
  className?: string;
  /** If true, outer glow uses a linear gradient; if false, uses a solid color for the glow */
  solidGlow?: string;
}

export function ProductIcon({
  gradientStart,
  gradientEnd,
  size = 28,
  className,
  solidGlow,
}: ProductIconProps) {
  const id = useId();
  const glowId = `glow-${id}`;
  const fillId = `fill-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer glow */}
      <g opacity="0.16">
        <path
          d="M25.4665 0.084H2.5426C1.1409 0.084 0.0045 1.2204 0.0045 2.6221V25.5461C0.0045 26.9478 1.1409 28.0841 2.5426 28.0841H25.4665C26.8682 28.0841 28.0045 26.9478 28.0045 25.5461V2.6221C28.0045 1.2204 26.8682 0.084 25.4665 0.084Z"
          fill={solidGlow || `url(#${glowId})`}
        />
      </g>
      {/* Main rounded square */}
      <path
        d="M23.5566 2.777H4.5056C3.5072 2.777 2.6978 3.5864 2.6978 4.5848V23.6358C2.6978 24.6342 3.5072 25.4436 4.5056 25.4436H23.5566C24.555 25.4436 25.3644 24.6342 25.3644 23.6358V4.5848C25.3644 3.5864 24.555 2.777 23.5566 2.777Z"
        fill={`url(#${fillId})`}
      />
      {/* Bottom highlight */}
      <g opacity="0.2">
        <path
          d="M25.3642 20.2787V23.8865C25.3642 24.885 24.5548 25.6944 23.5563 25.6944H4.5062C3.507 25.6944 2.6975 24.885 2.6975 23.8865V20.2787C2.6975 21.2771 3.507 22.0865 4.5062 22.0865H23.5563C24.5548 22.0865 25.3642 21.2771 25.3642 20.2787Z"
          fill="white"
        />
      </g>
      {/* Left parallelogram */}
      <path
        d="M10.898 12.8004L13.5607 11.1719C13.7224 11.0731 13.9244 11.1973 13.9244 11.3958V18.8409C13.9244 18.9333 13.878 19.0187 13.8027 19.0648L11.14 20.6933C10.9783 20.7922 10.7763 20.668 10.7763 20.4694V13.0243C10.7763 12.932 10.8228 12.8466 10.898 12.8004Z"
        fill="white"
      />
      {/* Right parallelogram */}
      <path
        d="M14.4808 8.9286L17.1435 7.3001C17.3052 7.2012 17.5072 7.3254 17.5072 7.524V14.9691C17.5072 15.0614 17.4607 15.1468 17.3855 15.193L14.7228 16.8215C14.5611 16.9204 14.3591 16.7962 14.3591 16.5976V9.1525C14.3591 9.0602 14.4056 8.9748 14.4808 8.9286Z"
        fill="white"
      />
      <defs>
        {!solidGlow && (
          <linearGradient
            id={glowId}
            x1="14.0045"
            y1="0.084"
            x2="14.0045"
            y2="28.084"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={gradientStart} />
            <stop offset="1" stopColor={gradientEnd} />
          </linearGradient>
        )}
        <linearGradient
          id={fillId}
          x1="14.031"
          y1="2.777"
          x2="14.031"
          y2="25.4436"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={gradientStart} />
          <stop offset="1" stopColor={gradientEnd} />
        </linearGradient>
      </defs>
    </svg>
  );
}
