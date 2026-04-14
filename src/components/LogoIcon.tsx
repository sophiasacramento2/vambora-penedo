interface Props {
  size?: number;
  /** "color" usa fundo areia (para fundos escuros), "dark" usa fundo escuro (para fundos claros) */
  variant?: "color" | "dark" | "flat";
}

const LogoIcon = ({ size = 40, variant = "color" }: Props) => {
  const bg =
    variant === "color" ? "#f5f0ea" :
    variant === "dark"  ? "#1a1410" :
    "transparent";

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {variant !== "flat" && <rect width="80" height="80" rx="20" fill={bg}/>}
      <path d="M16 32 Q28 22 40 30 Q52 38 64 28"
        stroke="#E8621A" strokeWidth="4.5" strokeLinecap="round"/>
      <path d="M16 44 Q28 34 40 42 Q52 50 64 40"
        stroke="#E8621A" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.55"/>
      <path d="M16 56 Q28 46 40 54 Q52 62 64 52"
        stroke="#E8621A" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.25"/>
      <circle cx="64" cy="28" r="5.5" fill="#1a7a6e"/>
    </svg>
  );
};

export default LogoIcon;
