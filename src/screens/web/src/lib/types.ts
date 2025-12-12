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

export type UserProfile = {
  email?: string;
  phone?: string;
  role?: string;
  name?: string;
};

export type UserTicket = {
  id?: string | number;
  serial?: string;
  code?: string;
  raffleId?: string | number;
  raffle?: { id?: string | number };
  status?: string;
  state?: string;
};
