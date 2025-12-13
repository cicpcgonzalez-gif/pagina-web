import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

// Forzar runtime Node (no Edge) porque usamos fs
export const dynamic = "force-dynamic";

async function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

async function persistFile(file: File, prefix: string) {
  const uploadDir = await ensureUploadDir();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = path.extname(file.name) || "";
  const filename = `${prefix}-${randomUUID()}${ext}`;
  const filepath = path.join(uploadDir, filename);
  await fs.writeFile(filepath, buffer);
  return `/uploads/${filename}`;
}

type RafflePayload = {
  name: string;
  description: string;
  price: number;
  status: string;
  drawDate: Date;
  flyerUrl: string | null;
  imageUrls: string[];
};

// Placeholder para la lógica real de base de datos
async function createOrUpdateRaffle(data: RafflePayload) {
  console.log("Creando/actualizando rifa en la base de datos:", data);
  // Aquí iría la lógica con Prisma, Drizzle, etc.
  // Ejemplo: return await prisma.raffle.create({ data });
  return { id: "new-raffle-123", ...data };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString().trim() || "";
    const price = Number(formData.get("price"));
    const status = formData.get("status")?.toString().trim() || "UPCOMING";
    const drawDateStr = formData.get("drawDate")?.toString();
    const drawDate = drawDateStr ? new Date(drawDateStr) : null;

    if (!name || Number.isNaN(price) || !drawDate || Number.isNaN(drawDate.getTime())) {
      return NextResponse.json(
        { message: "Faltan campos requeridos (name, price, drawDate)." },
        { status: 400 },
      );
    }

    const flyer = formData.get("flyer");
    const images = formData.getAll("images");

    let flyerUrl: string | null = null;
    const imageUrls: string[] = [];

    if (flyer instanceof File && flyer.size > 0) {
      flyerUrl = await persistFile(flyer, "flyer");
    }

    for (const img of images) {
      if (img instanceof File && img.size > 0) {
        const url = await persistFile(img, "image");
        imageUrls.push(url);
      }
    }

    const payload = {
      name,
      description,
      price,
      status,
      drawDate,
      flyerUrl,
      imageUrls,
    };

    const newRaffle = await createOrUpdateRaffle(payload);

    return NextResponse.json(newRaffle, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ message }, { status: 500 });
  }
}
