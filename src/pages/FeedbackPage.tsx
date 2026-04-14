import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle, ChevronDown } from "lucide-react";
import { routes } from "@/data/mockData";

const quickProblems = [
  "Ônibus não passou",
  "Superlotado",
  "Muito atrasado",
  "Parada sem cobertura",
  "Motorista imprudente",
  "Balsa parada sem aviso",
  "Informação errada no app",
  "Sugestão de melhoria",
];

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [details, setDetails] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleProblem = (p: string) =>
    setSelectedProblems((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );

  const canSubmit = selectedProblems.length > 0 || details.trim().length > 0;

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="animate-fade-in text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-foreground" />
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight mb-2">Obrigado!</h1>
          <p className="text-muted-foreground text-sm mb-8 max-w-[260px] mx-auto">
            Seu feedback foi enviado. Vamos analisar e melhorar o serviço.
          </p>
          <button onClick={() => navigate("/home")} className="btn-primary max-w-xs mx-auto">
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pt-4 pb-10">
      <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform mb-6">
        <ArrowLeft size={20} />
      </button>

      <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">Enviar feedback</h1>
      <p className="text-muted-foreground mb-6 text-sm">Sua opinião melhora o transporte público</p>

      {/* Linha relacionada */}
      <div className="mb-6">
        <p className="section-title">Linha relacionada (opcional)</p>
        <div className="relative">
          <select
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="input-uber appearance-none pr-10 bg-card"
          >
            <option value="">Selecione uma linha...</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Problema rápido (RF6.2) */}
      <div className="mb-6">
        <p className="section-title">O que aconteceu?</p>
        <div className="flex flex-wrap gap-2">
          {quickProblems.map((problem) => (
            <button
              key={problem}
              onClick={() => toggleProblem(problem)}
              className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-150 ${
                selectedProblems.includes(problem)
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground"
              }`}
            >
              {problem}
            </button>
          ))}
        </div>
      </div>

      {/* Detalhes (RF6.3) */}
      <div className="mb-6">
        <p className="section-title">Detalhes ou sugestão</p>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Conte mais sobre o que aconteceu ou sua sugestão de melhoria..."
          rows={4}
          className="input-uber resize-none"
        />
      </div>

      <button
        onClick={() => setSubmitted(true)}
        disabled={!canSubmit}
        className={`btn-primary flex items-center justify-center gap-2 ${!canSubmit ? "opacity-30" : ""}`}
      >
        <Send size={18} /> Enviar feedback
      </button>
    </div>
  );
};

export default FeedbackPage;
