import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const LogoIcon = ({ size = 80 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="20" fill="#f5f0ea"/>
    <path d="M16 32 Q28 22 40 30 Q52 38 64 28" stroke="#E8621A" strokeWidth="4.5" strokeLinecap="round"/>
    <path d="M16 44 Q28 34 40 42 Q52 50 64 40" stroke="#E8621A" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.55"/>
    <path d="M16 56 Q28 46 40 54 Q52 62 64 52" stroke="#E8621A" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.25"/>
    <circle cx="64" cy="28" r="5.5" fill="#1a7a6e"/>
  </svg>
);

const LogoFull = () => (
  <div className="flex flex-col items-center gap-3">
    <LogoIcon size={88} />
    <div className="text-center">
      <p className="text-3xl font-black text-[#f5f0ea] tracking-tight leading-none">
        Vambora
      </p>
      <p className="text-xs font-bold tracking-[0.3em] text-[#E8621A] uppercase mt-1">
        Penedo
      </p>
    </div>
  </div>
);

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#13110e]">
      {/* decoração de fundo — ondas sutis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" fill="none">
          <path d="M-40 500 Q80 460 160 490 Q240 520 320 480 Q400 440 460 470" stroke="#E8621A" strokeWidth="60" strokeOpacity="0.04" strokeLinecap="round"/>
          <path d="M-40 580 Q80 540 160 570 Q240 600 320 560 Q400 520 460 550" stroke="#E8621A" strokeWidth="50" strokeOpacity="0.03" strokeLinecap="round"/>
          <path d="M-40 660 Q80 620 160 650 Q240 680 320 640 Q400 600 460 630" stroke="#E8621A" strokeWidth="40" strokeOpacity="0.025" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-6">
        <div className="animate-fade-in">
          <LogoFull />
          <p className="text-[#6b6058] text-sm text-center mt-6 max-w-[220px] mx-auto leading-relaxed">
            Ônibus, vans e barcos na palma da mão.
          </p>
        </div>
      </div>

      <div className="relative px-6 pb-12 flex flex-col gap-3">
        <button
          onClick={() => navigate("/criar-conta")}
          className="w-full py-4 rounded-xl bg-primary text-white font-bold text-base
                     active:scale-[0.97] transition-all duration-150 flex items-center justify-center gap-2"
        >
          Criar conta
          <ArrowRight size={18} />
        </button>
        <button
          onClick={() => navigate("/entrar")}
          className="w-full py-4 rounded-xl font-bold text-base text-[#c0b8b0]
                     active:scale-[0.97] transition-all duration-150"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          Entrar
        </button>
        <button
          onClick={() => navigate("/home")}
          className="text-[#4a4540] font-medium text-sm py-2 text-center"
        >
          Continuar sem conta
        </button>
      </div>
    </div>
  );
};

export default Welcome;
