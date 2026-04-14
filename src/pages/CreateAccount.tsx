import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";

const schema = z.object({
  name: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  phone: z
    .string()
    .min(10, "Celular inválido")
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, "Formato: (82) 99999-0000"),
  password: z.string().min(4, "Senha deve ter ao menos 4 dígitos"),
});

type FormData = z.infer<typeof schema>;

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? (
    <div className="flex items-center gap-1.5 mt-1.5">
      <AlertCircle size={12} className="text-destructive shrink-0" />
      <p className="text-xs text-destructive">{msg}</p>
    </div>
  ) : null;

const CreateAccount = () => {
  const navigate = useNavigate();
  const { setUser } = useAppStore();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setUser({ name: data.name, phone: data.phone, loggedIn: true });
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background px-4 pt-4">
      <button
        onClick={() => navigate(-1)}
        className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform mb-8"
      >
        <ArrowLeft size={20} />
      </button>

      <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">Criar conta</h1>
      <p className="text-muted-foreground text-sm mb-8">Rápido e simples</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Nome</label>
          <input
            {...register("name")}
            type="text"
            placeholder="Seu nome completo"
            className={`input-uber ${errors.name ? "ring-2 ring-destructive/40" : ""}`}
          />
          <FieldError msg={errors.name?.message} />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Celular</label>
          <input
            {...register("phone")}
            type="tel"
            placeholder="(82) 99999-0000"
            className={`input-uber ${errors.phone ? "ring-2 ring-destructive/40" : ""}`}
          />
          <FieldError msg={errors.phone?.message} />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Senha</label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPw ? "text" : "password"}
              placeholder="Mínimo 4 dígitos"
              className={`input-uber pr-12 ${errors.password ? "ring-2 ring-destructive/40" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <FieldError msg={errors.password?.message} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`btn-primary mt-2 flex items-center justify-center gap-2 ${loading ? "opacity-60" : ""}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Criando conta...
            </>
          ) : "Criar conta"}
        </button>
      </form>
    </div>
  );
};

export default CreateAccount;
