import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Phone, Shield, Lock,
  Eye, EyeOff, AlertCircle, Check,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const maskPhone = (v: string): string => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, "Celular inválido")
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, "Formato: (82) 99999-0000"),
});

const passwordSchema = z
  .object({
    password: z.string().min(4, "Senha deve ter ao menos 4 dígitos"),
    confirm: z.string().min(4, "Confirme sua senha"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

type PhoneForm = z.infer<typeof phoneSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const MOCK_CODE = "123456";
const RESEND_DELAY = 60;

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? (
    <div className="flex items-center gap-1.5 mt-1.5">
      <AlertCircle size={12} className="text-destructive shrink-0" />
      <p className="text-xs text-destructive">{msg}</p>
    </div>
  ) : null;

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

type Step = "phone" | "code" | "password" | "done";
const STEPS: Step[] = ["phone", "code", "password"];

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep]           = useState<Step>("phone");
  const [phone, setPhone]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [codeError, setCodeError] = useState("");
  const [countdown, setCountdown] = useState(RESEND_DELAY);
  const [canResend, setCanResend] = useState(false);
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);

  const [otp, setOtp] = useState(Array(6).fill(""));
  const otpRefs       = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step !== "code") return;
    setCountdown(RESEND_DELAY);
    setCanResend(false);
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(t); setCanResend(true); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [step]);

  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) });
  const pwForm    = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onSendCode = async (data: PhoneForm) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setPhone(data.phone);
    setOtp(Array(6).fill(""));
    setCodeError("");
    setStep("code");
    setLoading(false);
    setTimeout(() => otpRefs.current[0]?.focus(), 120);
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const onVerifyCode = async () => {
    const code = otp.join("");
    if (code.length < 6) { setCodeError("Digite todos os 6 dígitos"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    if (code !== MOCK_CODE) {
      setCodeError("Código incorreto. Tente novamente.");
      setLoading(false);
      return;
    }
    setCodeError("");
    setStep("password");
    setLoading(false);
  };

  const onResend = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setOtp(Array(6).fill(""));
    setCodeError("");
    setCanResend(false);
    setCountdown(RESEND_DELAY);
    setLoading(false);
    setTimeout(() => otpRefs.current[0]?.focus(), 120);
  };

  const onResetPassword = async (data: PasswordForm) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setStep("done");
    setLoading(false);
  };

  const goBack = () => {
    if (step === "phone")    navigate(-1);
    if (step === "code")     setStep("phone");
    if (step === "password") setStep("code");
  };

  const maskedPhone = phone.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");
  const stepIndex   = STEPS.indexOf(step as "phone" | "code" | "password");

  if (step === "done") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-6">
          <Check size={40} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-2">Senha redefinida!</h2>
        <p className="text-muted-foreground text-sm mb-8 max-w-[240px] leading-relaxed">
          Sua nova senha foi salva com sucesso. Faça login para continuar.
        </p>
        <button onClick={() => navigate("/entrar")} className="btn-primary max-w-xs">
          Fazer login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pt-4">
      <button
        onClick={goBack}
        className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform mb-8"
        aria-label="Voltar"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="flex gap-1.5 mb-8">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              stepIndex >= i ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {step === "phone" && (
        <div className="animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Phone size={22} className="text-primary" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">
            Esqueci a senha
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Informe o celular cadastrado e enviaremos um código de verificação.
          </p>

          <form onSubmit={phoneForm.handleSubmit(onSendCode)} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Celular
              </label>
              <input
                {...(() => { const r = phoneForm.register("phone"); return { ...r, onChange: (e: React.ChangeEvent<HTMLInputElement>) => { e.target.value = maskPhone(e.target.value); r.onChange(e); } }; })()}
                id="forgot-phone"
                type="tel"
                inputMode="numeric"
                placeholder="(82) 99999-0000"
                className={`input-uber ${phoneForm.formState.errors.phone ? "ring-2 ring-destructive/40" : ""}`}
              />
              <FieldError msg={phoneForm.formState.errors.phone?.message} />
            </div>

            <button
              type="submit"
              id="send-code-btn"
              disabled={loading}
              className={`btn-primary flex items-center justify-center gap-2 ${loading ? "opacity-60" : ""}`}
            >
              {loading ? <><Spinner /> Enviando...</> : "Enviar código"}
            </button>
          </form>
        </div>
      )}

      {step === "code" && (
        <div className="animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield size={22} className="text-primary" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">
            Verificação
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Enviamos um código de 6 dígitos para{" "}
            <span className="font-bold text-foreground">{maskedPhone}</span>.
          </p>

          <div className="flex gap-3 mb-2 justify-center" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { otpRefs.current[i] = el; }}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className={`w-12 h-14 text-center text-xl font-black rounded-xl bg-muted border-2 transition-all
                  focus:outline-none focus:border-primary
                  ${digit ? "border-primary/50" : "border-transparent"}
                  ${codeError ? "border-destructive/40" : ""}
                `}
              />
            ))}
          </div>
          <FieldError msg={codeError} />

          <button
            id="verify-code-btn"
            onClick={onVerifyCode}
            disabled={loading}
            className={`btn-primary mt-6 flex items-center justify-center gap-2 ${loading ? "opacity-60" : ""}`}
          >
            {loading ? <><Spinner /> Verificando...</> : "Verificar código"}
          </button>

          <div className="flex items-center justify-center mt-5 gap-1.5 text-sm">
            <span className="text-muted-foreground">Não recebeu?</span>
            {canResend ? (
              <button
                onClick={onResend}
                disabled={loading}
                className="text-primary font-bold active:opacity-60 transition-opacity"
              >
                Reenviar código
              </button>
            ) : (
              <span className="text-muted-foreground font-semibold">
                Reenviar em {countdown}s
              </span>
            )}
          </div>

          <p className="text-center text-[11px] text-muted-foreground/40 mt-8">
            Código de teste: <span className="font-bold">123456</span>
          </p>
        </div>
      )}

      {step === "password" && (
        <div className="animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock size={22} className="text-primary" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">
            Nova senha
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Escolha uma senha segura para sua conta.
          </p>

          <form onSubmit={pwForm.handleSubmit(onResetPassword)} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Nova senha
              </label>
              <div className="relative">
                <input
                  {...pwForm.register("password")}
                  id="new-password"
                  type={showPw ? "text" : "password"}
                  placeholder="Mínimo 4 dígitos"
                  className={`input-uber pr-12 ${pwForm.formState.errors.password ? "ring-2 ring-destructive/40" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <FieldError msg={pwForm.formState.errors.password?.message} />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  {...pwForm.register("confirm")}
                  id="confirm-password"
                  type={showCf ? "text" : "password"}
                  placeholder="Repita a senha"
                  className={`input-uber pr-12 ${pwForm.formState.errors.confirm ? "ring-2 ring-destructive/40" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowCf(!showCf)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showCf ? "Ocultar confirmação" : "Mostrar confirmação"}
                >
                  {showCf ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <FieldError msg={pwForm.formState.errors.confirm?.message} />
            </div>

            <button
              type="submit"
              id="reset-password-btn"
              disabled={loading}
              className={`btn-primary mt-2 flex items-center justify-center gap-2 ${loading ? "opacity-60" : ""}`}
            >
              {loading ? <><Spinner /> Salvando...</> : "Redefinir senha"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
