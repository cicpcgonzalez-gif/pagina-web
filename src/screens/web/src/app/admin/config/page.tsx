"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchModules } from "@/lib/api";
import { getUserRole } from "@/lib/session";
import type { ModuleConfig } from "@/lib/types";

export default function AdminConfigPage() {
  const [brand, setBrand] = useState({ name: "Megarifas", primary: "#3b82f6", secondary: "#22d3ee", logo: "", banner: "" });
  const [smtp, setSmtp] = useState({ host: "smtp.example.com", port: 587, user: "notifs@example.com", sender: "Megarifas" });
  const [company, setCompany] = useState({ name: "Megarifas LLC", rif: "J-12345678-9", address: "Caracas", phone: "+58" });
  const [bank, setBank] = useState({ bank: "Banco Ejemplo", account: "0102-1234-5678-9012", holder: "Megarifas" });
  const [payments, setPayments] = useState({ provider: "Stripe", webhook: "https://example.com/webhook" });
  const [limits, setLimits] = useState({ maxTickets: 100, maxRaffles: 10 });
  const [message, setMessage] = useState<string | null>(null);
  const [modulesConfig, setModulesConfig] = useState<ModuleConfig | null>(null);
  const [modulesError, setModulesError] = useState<string | null>(null);
  const [loadingModules, setLoadingModules] = useState(true);

  const role = getUserRole()?.toLowerCase();
  const isSuper = role === "superadmin";

  useEffect(() => {
    let mounted = true;
    fetchModules()
      .then((data) => {
        if (!mounted) return;
        setModulesConfig(data || null);
      })
      .catch((err) => {
        if (!mounted) return;
        setModulesError(err instanceof Error ? err.message : "No se pudieron cargar módulos");
      })
      .finally(() => {
        if (mounted) setLoadingModules(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const brandingEnabled = useMemo(() => {
    if (!modulesConfig) return true;
    return isSuper ? modulesConfig.superadmin?.branding !== false : modulesConfig.admin?.style !== false;
  }, [modulesConfig, isSuper]);

  const smtpEnabled = useMemo(() => {
    if (!modulesConfig) return true;
    return isSuper ? modulesConfig.superadmin?.smtp !== false : modulesConfig.admin?.support !== false;
  }, [modulesConfig, isSuper]);

  const companyEnabled = useMemo(() => {
    if (!modulesConfig) return true;
    return modulesConfig.admin?.company !== false;
  }, [modulesConfig]);

  const bankEnabled = useMemo(() => {
    if (!modulesConfig) return true;
    return modulesConfig.admin?.bank !== false;
  }, [modulesConfig]);

  const saveAll = () => {
    setMessage("Configuración guardada (mock local). Ajusta para API real.");
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <h1 className="text-3xl font-bold">Parámetros del sistema</h1>
      <p className="mt-2 text-white/80">Branding, SMTP, empresa y límites.</p>
      {loadingModules && <p className="mt-2 text-xs text-white/60">Cargando módulos…</p>}
      {modulesError && <p className="mt-2 text-xs text-red-200">{modulesError}</p>}

      <div className="mt-6 grid gap-4">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Branding</h2>
            {!brandingEnabled && <span className="text-xs text-red-200">Módulo desactivado</span>}
          </div>
          {brandingEnabled ? (
            <div className="mt-3 grid gap-3 text-sm text-white/80">
              <label className="grid gap-1">
                <span>Nombre</span>
                <input
                  value={brand.name}
                  onChange={(e) => setBrand((prev) => ({ ...prev, name: e.target.value }))}
                  className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                />
              </label>
              <label className="grid gap-1">
                <span>Color primario</span>
                <input
                  value={brand.primary}
                  onChange={(e) => setBrand((prev) => ({ ...prev, primary: e.target.value }))}
                  className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                />
              </label>
              <label className="grid gap-1">
                <span>Color secundario</span>
                <input
                  value={brand.secondary}
                  onChange={(e) => setBrand((prev) => ({ ...prev, secondary: e.target.value }))}
                  className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                />
              </label>
              <label className="grid gap-1">
                <span>Logo URL</span>
                <input
                  value={brand.logo}
                  onChange={(e) => setBrand((prev) => ({ ...prev, logo: e.target.value }))}
                  className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                  placeholder="https://...logo.png"
                />
              </label>
              <label className="grid gap-1">
                <span>Banner URL</span>
                <input
                  value={brand.banner}
                  onChange={(e) => setBrand((prev) => ({ ...prev, banner: e.target.value }))}
                  className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                  placeholder="https://...banner.jpg"
                />
              </label>
            </div>
          ) : (
            <p className="mt-2 text-sm text-white/70">Activa branding para ajustar logo y colores.</p>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">SMTP / Notificaciones</h2>
            {!smtpEnabled && <span className="text-xs text-red-200">Módulo desactivado</span>}
          </div>
          {smtpEnabled ? (
            <div className="mt-3 grid gap-3 text-sm text-white/80">
              <label className="grid gap-1">
                <span>Host</span>
                <input
                  value={smtp.host}
                  onChange={(e) => setSmtp((prev) => ({ ...prev, host: e.target.value }))}
                  className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                />
              </label>
              <label className="grid gap-1">
                <span>Puerto</span>
                <input
                  type="number"
                  value={smtp.port}
                  onChange={(e) => setSmtp((prev) => ({ ...prev, port: Number(e.target.value) }))}
                  className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                />
              </label>
              <label className="grid gap-1">
                <span>Usuario</span>
                <input
                  value={smtp.user}
                  onChange={(e) => setSmtp((prev) => ({ ...prev, user: e.target.value }))}
                  className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                />
              </label>
              <label className="grid gap-1">
                <span>Remitente</span>
                <input
                  value={smtp.sender}
                  onChange={(e) => setSmtp((prev) => ({ ...prev, sender: e.target.value }))}
                  className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                />
              </label>
            </div>
          ) : (
            <p className="mt-2 text-sm text-white/70">Activa SMTP para configurar correos.</p>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Datos de empresa</h2>
            {!companyEnabled && <span className="text-xs text-red-200">Módulo desactivado</span>}
          </div>
          {companyEnabled ? (
            <div className="mt-3 grid gap-3 text-sm text-white/80">
              <label className="grid gap-1">
                <span>Razón social</span>
                <input
                  value={company.name}
                  onChange={(e) => setCompany((prev) => ({ ...prev, name: e.target.value }))}
                  className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                />
              </label>
              <label className="grid gap-1">
                <span>RIF / Identificador</span>
                <input
                  value={company.rif}
                  onChange={(e) => setCompany((prev) => ({ ...prev, rif: e.target.value }))}
                  className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                />
              </label>
              <label className="grid gap-1">
                <span>Dirección</span>
                <input
                  value={company.address}
                  onChange={(e) => setCompany((prev) => ({ ...prev, address: e.target.value }))}
                  className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                />
              </label>
              <label className="grid gap-1">
                <span>Teléfono</span>
                <input
                  value={company.phone}
                  onChange={(e) => setCompany((prev) => ({ ...prev, phone: e.target.value }))}
                  className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                />
              </label>
            </div>
          ) : (
            <p className="mt-2 text-sm text-white/70">Activa empresa para mostrar datos públicos.</p>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Bancos / cobros</h2>
            {!bankEnabled && <span className="text-xs text-red-200">Módulo desactivado</span>}
          </div>
          {bankEnabled ? (
            <div className="mt-3 grid gap-3 text-sm text-white/80">
              <label className="grid gap-1">
                <span>Banco</span>
                <input
                  value={bank.bank}
                  onChange={(e) => setBank((prev) => ({ ...prev, bank: e.target.value }))}
                  className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                />
              </label>
              <label className="grid gap-1">
                <span>Cuenta</span>
                <input
                  value={bank.account}
                  onChange={(e) => setBank((prev) => ({ ...prev, account: e.target.value }))}
                  className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                />
              </label>
              <label className="grid gap-1">
                <span>Titular</span>
                <input
                  value={bank.holder}
                  onChange={(e) => setBank((prev) => ({ ...prev, holder: e.target.value }))}
                  className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                />
              </label>
            </div>
          ) : (
            <p className="mt-2 text-sm text-white/70">Activa bancos para publicar medios de cobro.</p>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30">
          <h2 className="text-lg font-semibold text-white">Pasarelas</h2>
          <div className="mt-3 grid gap-3 text-sm text-white/80">
            <label className="grid gap-1">
              <span>Proveedor</span>
              <input
                value={payments.provider}
                onChange={(e) => setPayments((prev) => ({ ...prev, provider: e.target.value }))}
                className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
              />
            </label>
            <label className="grid gap-1">
              <span>Webhook</span>
              <input
                value={payments.webhook}
                onChange={(e) => setPayments((prev) => ({ ...prev, webhook: e.target.value }))}
                className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30">
          <h2 className="text-lg font-semibold text-white">Límites</h2>
          <div className="mt-3 grid gap-3 text-sm text-white/80">
            <label className="grid gap-1">
              <span>Máx. rifas activas</span>
              <input
                type="number"
                value={limits.maxRaffles}
                onChange={(e) => setLimits((prev) => ({ ...prev, maxRaffles: Number(e.target.value) }))}
                className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
              />
            </label>
            <label className="grid gap-1">
              <span>Máx. boletos por compra</span>
              <input
                type="number"
                value={limits.maxTickets}
                onChange={(e) => setLimits((prev) => ({ ...prev, maxTickets: Number(e.target.value) }))}
                className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
              />
            </label>
          </div>
        </section>
      </div>

      <button
        onClick={saveAll}
        className="mt-6 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-black/30 transition hover:-translate-y-[1px]"
      >
        Guardar
      </button>

      {message && <p className="mt-3 text-sm text-white/85">{message}</p>}
    </main>
  );
}
