export type Raffle = {
  id: string;
  title: string;
  price: number;
  ticketsAvailable: number;
  ticketsTotal: number;
  drawDate: string;
  endDate?: string;
  digits?: number;
  minTickets?: number;
  status: "activa" | "cerrada" | "pausada";
  description?: string;
  isSoldOut?: boolean;
  instantWins?: Array<number | string> | string;
  reactionCounts?: { LIKE?: number; HEART?: number };
  myReaction?: "LIKE" | "HEART" | null;
  stats?: { total?: number; sold?: number; remaining?: number };
  style?: { bannerImage?: string; gallery?: string[]; themeColor?: string };
  user?: {
    id?: string | number;
    name?: string | null;
    avatar?: string;
    securityId?: string | null;
    publicId?: string;
    identityVerified?: boolean;
    isBoosted?: boolean;
    boostEndsAt?: string;
  };
};

export type SystemStatus = {
  service: string;
  state: "operativo" | "degradado" | "caido";
  detail: string;
};

export type UserProfile = {
  id?: string;
  publicId?: string;
  securityId?: string | null;
  email?: string;
  phone?: string;
  address?: string;
  cedula?: string;
  state?: string;
  role?: string;
  name?: string;
  bio?: string;
  avatar?: string;
  avatarUrl?: string;
  balance?: number;
  socials?: {
    instagram?: string;
    whatsapp?: string;
    tiktok?: string;
    telegram?: string;
    links?: Array<{ label: string; url: string }>;
  };
  verified?: boolean;
  identityVerified?: boolean;
  referrals?: Array<{ name?: string; createdAt?: string; verified?: boolean }>; 
  referralCode?: string;
};

export type UserTicket = {
  id?: string | number;
  number?: number;
  digits?: number;
  serial?: string;
  serialNumber?: string;
  code?: string;
  raffleId?: string | number;
  raffle?: { id?: string | number };
  raffleTitle?: string;
  status?: string;
  state?: string;
  createdAt?: string;
  via?: string;
};

export type MyRaffle = {
  id?: string | number;
  raffleId?: string | number;
  raffle?: {
    id?: string | number;
    title?: string;
    description?: string;
    digits?: number;
    stats?: { progress?: number };
  };
  numbers?: Array<number | string> | number | string;
  isWinner?: boolean;
  status?: string;
  serialNumber?: string;
  user?: { firstName?: string; lastName?: string; name?: string };
};

export type WalletMovement = {
  id?: string | number;
  type?: string;
  amount?: number;
  status?: string;
  createdAt?: string;
  reference?: string;
};

export type PaymentDetails = {
  raffle?: { id?: string | number; title?: string };
  paymentMethods?: string[];
  bankDetails?: Record<string, unknown> | null;
  seller?: {
    id?: string | number;
    publicId?: string;
    name?: string | null;
    email?: string;
    avatar?: string;
    identityVerified?: boolean;
    securityIdLast8?: string | null;
  } | null;
};

export type AdminTicket = {
  id?: string | number;
  number?: number;
  serialNumber?: string;
  status?: string;
  createdAt?: string;
  raffleId?: string | number;
  raffleTitle?: string;
  user?: {
    id?: string | number;
    publicId?: string;
    email?: string;
    name?: string;
    phone?: string;
    cedula?: string;
  };
  seller?: {
    id?: string | number;
    publicId?: string;
    name?: string | null;
    email?: string;
    avatar?: string;
    securityIdLast8?: string | null;
  };
};

export type PaymentReceipt = {
  id?: string | number;
  raffleId?: string | number;
  raffleTitle?: string;
  status?: string;
  reference?: string;
  amount?: number;
  total?: number;
  price?: number;
  quantity?: number;
  createdAt?: string;
};

export type Winner = {
  id?: string | number;
  user?: { name?: string; avatar?: string };
  prize?: string;
  raffle?: { title?: string };
  photoUrl?: string;
  testimonial?: string;
  drawDate?: string;
};

export type ModuleConfig = {
  user?: Record<string, boolean>;
  admin?: Record<string, boolean>;
  superadmin?: Record<string, boolean>;
};
