"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

// Mock de datos de rifa mientras no haya API real
type RaffleDetail = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  ticketsSold: number;
  totalTickets: number;
};

const mockRaffle: RaffleDetail = {
  id: "1",
  name: "Gran Rifa de Navidad",
  description: "Participa para ganar un increíble auto 0km. ¡No te quedes fuera!",
  price: 10,
  image: "https://via.placeholder.com/600x400.png?text=Auto+0km",
  ticketsSold: 1250,
  totalTickets: 5000,
};

export default function RaffleDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [raffle, setRaffle] = useState<RaffleDetail | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchRaffle = async () => {
        setLoading(true);
        try {
          // Descomentar cuando la API esté lista
          // const data = await getRaffle(id);
          // setRaffle(data);
          setRaffle(mockRaffle); // Usar mock por ahora
        } catch (error) {
          console.error("Error fetching raffle:", error);
          setRaffle(null);
        } finally {
          setLoading(false);
        }
      };
      fetchRaffle();
    }
  }, [id]);

  const handlePurchase = () => {
    // Lógica para añadir al carrito o proceder al pago
    alert(`Has añadido ${quantity} boleto(s) para "${raffle.name}".`);
    // Aquí iría la lógica para redirigir al checkout o abrir un modal de pago
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <p>Cargando detalles de la rifa...</p>
      </main>
    );
  }

  if (!raffle) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Rifa no encontrada</h1>
        <p>
          No pudimos encontrar los detalles para esta rifa. Por favor, vuelve a
          la lista de rifas.
        </p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Image
            src={raffle.image}
            alt={raffle.name}
            width={600}
            height={400}
            className="h-auto w-full rounded-lg shadow-lg"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-4">{raffle.name}</h1>
          <p className="text-gray-600 mb-6">{raffle.description}</p>

          <div className="mb-6">
            <span className="text-3xl font-bold text-indigo-600">
              ${raffle.price}
            </span>
            <span className="text-gray-500 ml-2">por boleto</span>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500">
              {raffle.ticketsSold} / {raffle.totalTickets} boletos vendidos
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{
                  width: `${(raffle.ticketsSold / raffle.totalTickets) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <label htmlFor="quantity" className="font-medium">
              Cantidad:
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 rounded-md border border-gray-300 px-3 py-2 text-center"
            />
          </div>

          <Button onClick={handlePurchase} size="lg">
            Comprar Boletos
          </Button>
        </div>
      </div>
    </main>
  );
}
