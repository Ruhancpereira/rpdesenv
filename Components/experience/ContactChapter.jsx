import { useState } from "react";
import { toast } from "sonner";
import { contactInfo } from "@/lib/site-content";

const initialForm = { name: "", email: "", phone: "", message: "" };

export default function ContactChapter() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus("sending");
    await new Promise((resolve) => setTimeout(resolve, 700));
    setStatus("sent");
    toast.success("Mensagem recebida. Vamos retornar pelo e-mail informado.");
    setForm(initialForm);
    setTimeout(() => setStatus("idle"), 2500);
  };

  return (
    <section id="contact" className="scroll-mt-24 px-5 py-24 sm:px-8">
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#D6E6FF]">Suporte</p>
          <h2 className="font-display mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
            Canal público da RP Sistemas
          </h2>
          <p className="mt-5 max-w-md text-[#E7EEF8]/78">
            Dúvida sobre um aplicativo, suporte a um sistema em uso ou um projeto novo. Este é o contato da organização.
          </p>

          <ul className="mt-10 space-y-4">
            {contactInfo.map((item) => (
              <li key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="mt-1 block text-lg text-white hover:text-[#D6E6FF]">
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-1 text-lg">{item.value}</p>
                )}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={onSubmit} className="rounded-[32px] border border-white/10 bg-[#041833]/70 p-6 sm:p-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm text-[#D6E6FF]/80">
              Nome
              <input
                required
                value={form.name}
                onChange={update("name")}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none ring-[#D6E6FF] placeholder:text-white/30 focus:ring-2"
                placeholder="Seu nome"
              />
            </label>
            <label className="block text-sm text-[#D6E6FF]/80">
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={update("email")}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none ring-[#D6E6FF] placeholder:text-white/30 focus:ring-2"
                placeholder="seu@email.com"
              />
            </label>
          </div>
          <label className="mt-5 block text-sm text-[#D6E6FF]/80">
            Telefone
            <input
              value={form.phone}
              onChange={update("phone")}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none ring-[#D6E6FF] placeholder:text-white/30 focus:ring-2"
              placeholder="(48) 99999-9999"
            />
          </label>
          <label className="mt-5 block text-sm text-[#D6E6FF]/80">
            Mensagem
            <textarea
              required
              value={form.message}
              onChange={update("message")}
              className="mt-2 min-h-[150px] w-full resize-y rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none ring-[#D6E6FF] placeholder:text-white/30 focus:ring-2"
              placeholder="Conte o sistema, o aplicativo ou o suporte que você precisa."
            />
          </label>
          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-6 w-full rounded-full bg-white py-3.5 text-sm font-medium text-[#072A5E] transition hover:bg-[#D6E6FF] disabled:opacity-60"
          >
            {status === "sending" ? "Enviando..." : status === "sent" ? "Mensagem enviada" : "Enviar mensagem"}
          </button>
        </form>
      </div>
    </section>
  );
}
