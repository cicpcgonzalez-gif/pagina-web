export type Raffle = {
  id: string;
  title: string;
  price: number;
  ticketsAvailable: number;
  ticketsTotal: number;
  drawDate: string;
  status: "activa" | "cerrada" | "pausada";
};

export type SystemStatus = {
  service: string;
  state: "operativo" | "degradado" | "caido";
  detail: string;
};
