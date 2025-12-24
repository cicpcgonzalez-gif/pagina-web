export default function WalletPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1c] via-[#0d1425] to-[#1a1f3a] text-white">
      {/* Header con navegación */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10"
        style={{
          background: "linear-gradient(135deg, rgba(10, 14, 28, 0.95) 0%, rgba(13, 20, 37, 0.95) 100%)",
          boxShadow: "0 8px 32px rgba(255, 119, 0, 0.15)",
        }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">MEGA RIFAS</h1>
          <div className="flex gap-3">
            <a
              href="/login"
              className="px-6 py-2 rounded-full font-semibold transition-all"
              style={{
                background: "linear-gradient(135deg, #ff7700 0%, #ff9500 100%)",
                boxShadow: "0 4px 20px rgba(255, 119, 0, 0.4)",
              }}
            >
              Iniciar Sesión
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Card principal de Wallet */}
        <div
          className="rounded-3xl p-6 mb-6"
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Wallet</h2>
              <p className="text-gray-400 text-sm">Saldo disponible</p>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Actualizar
            </button>
          </div>

          <div className="text-6xl font-black mb-8" style={{ color: "#fbbf24" }}>
            Bs. 12000.00
          </div>

          <div className="flex gap-4 mb-6">
            <button
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                color: "#000",
                boxShadow: "0 8px 24px rgba(251, 191, 36, 0.4)",
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              Recargar
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
              Retirar
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div
              className="p-4 rounded-xl"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <p className="text-gray-400 text-sm mb-1">Ingresos</p>
              <p className="text-2xl font-bold" style={{ color: "#fbbf24" }}>
                Bs. 0
              </p>
            </div>
            <div
              className="p-4 rounded-xl"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <p className="text-gray-400 text-sm mb-1">Gastos</p>
              <p className="text-2xl font-bold" style={{ color: "#ff7700" }}>
                Bs. 0
              </p>
            </div>
            <div
              className="p-4 rounded-xl"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <p className="text-gray-400 text-sm mb-1">Tickets</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>

        {/* Sección Movimientos */}
        <div
          className="rounded-3xl p-6 mb-6"
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          }}
        >
          <h3 className="text-xl font-bold mb-4">Movimientos</h3>
          <div className="space-y-3">
            {[
              { fecha: "23/12/2025", monto: "Bs. 6000.00" },
              { fecha: "22/12/2025", monto: "Bs. 5000.00" },
              { fecha: "22/12/2025", monto: "Bs. 2500.00" },
            ].map((mov, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.02]"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div>
                  <p className="font-semibold">Movimiento</p>
                  <p className="text-gray-400 text-sm">{mov.fecha}</p>
                </div>
                <p className="text-xl font-bold" style={{ color: "#fbbf24" }}>
                  {mov.monto}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Historial de Pagos */}
        <div
          className="rounded-3xl p-6"
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          }}
        >
          <h3 className="text-xl font-bold mb-4">Historial de Pagos</h3>
          <div className="space-y-3">
            {[
              {
                num: "17",
                fecha: "23/12/2025",
                metodo: "Zelle",
                ref: "1234",
                monto: "Bs. 6000.00",
                status: "APPROVED",
              },
              {
                num: "16",
                fecha: "22/12/2025",
                metodo: "Zelle",
                ref: "5678",
                monto: "Bs. 5000.00",
                status: "APPROVED",
              },
            ].map((pago, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl transition-all hover:scale-[1.02]"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-2xl font-bold">{pago.num}</p>
                    <p className="text-gray-400 text-sm">
                      {pago.fecha} - {pago.metodo}
                    </p>
                    <p className="text-gray-400 text-sm">Ref: {pago.ref}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold mb-2" style={{ color: "#fbbf24" }}>
                      {pago.monto}
                    </p>
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: "rgba(16, 185, 129, 0.2)",
                        color: "#10b981",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      {pago.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Navegación inferior */}
      <nav
        className="fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t border-white/10"
        style={{
          background: "linear-gradient(180deg, rgba(10, 14, 28, 0.95) 0%, rgba(13, 20, 37, 0.98) 100%)",
          boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            {[
              {
                name: "Rifas",
                icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
                href: "/rifas",
              },
              {
                name: "Tickets",
                icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
                href: "/tickets",
              },
              {
                name: "Wallet",
                icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
                href: "/wallet",
                active: true,
              },
              {
                name: "Ganadores",
                icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
                href: "/ganadores",
              },
              {
                name: "Perfil",
                icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                href: "/perfil",
              },
              {
                name: "Admin",
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                href: "/admin",
              },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex flex-col items-center gap-1 transition-all hover:scale-110"
                style={{ color: item.active ? "#a855f7" : "#9ca3af" }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="text-xs font-medium">{item.name}</span>
              </a>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
