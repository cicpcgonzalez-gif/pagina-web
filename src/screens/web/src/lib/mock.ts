import type { Raffle, SystemStatus } from "./types";

export const mockRaffles: Raffle[] = [
  {
    id: "r1",
    title: "Moto urbana 150cc",
    price: 5,
    ticketsAvailable: 120,
    ticketsTotal: 500,
    drawDate: "2025-12-30",
    status: "activa",
  },
  {
    id: "r2",
    title: "iPhone 16 Pro",
    price: 10,
    ticketsAvailable: 40,
    ticketsTotal: 400,
    drawDate: "2026-01-10",
    status: "activa",
  },
  {
    id: "r3",
    title: "Viaje Cancún 5 noches",
    price: 8,
    ticketsAvailable: 0,
    ticketsTotal: 300,
    drawDate: "2025-12-20",
    status: "cerrada",
  },
];

export const mockStatus: SystemStatus[] = [
  {
    service: "API principal",
    state: "operativo",
    detail: "Latencia estable y sin errores reportados.",
  },
  {
    service: "Pasarela de pagos",
    state: "degradado",
    detail: "Intermitencia leve en callbacks; reintentos automáticos habilitados.",
  },
  {
    service: "Validación de boletos",
    state: "operativo",
    detail: "Registros sincronizados cada 60s.",
  },
];
