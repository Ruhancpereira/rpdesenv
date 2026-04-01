import { useState } from "react";
import { useRouter } from "next/router";

const usersDemo = [
  "admin@agrosys.com.br",
  "coordenador@agrosys.com.br",
  "gerente@agrosys.com.br",
  "consultor@agrosys.com.br",
  "cs@agrosys.com.br",
  "diretoria@agrosys.com.br",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@agrosys.com.br");
  const [password, setPassword] = useState("agrosys123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Falha no login.");
      }

      const redirect = router.query.redirect || "/dashboard/executivo";
      router.push(redirect);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
        <h1 className="text-2xl font-semibold text-emerald-400">Agrosys Ops</h1>
        <p className="mt-2 text-sm text-slate-400">
          Gestão da operação de implantação para agronegócio
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm text-slate-300">E-mail</label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Senha</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-red-800/70 bg-red-900/20 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400">
          <p className="mb-2 font-medium text-slate-300">Usuários demo</p>
          <ul className="space-y-1">
            {usersDemo.map((user) => (
              <li key={user}>{user}</li>
            ))}
          </ul>
          <p className="mt-2 text-slate-500">Senha padrão: agrosys123</p>
        </div>
      </div>
    </div>
  );
}
