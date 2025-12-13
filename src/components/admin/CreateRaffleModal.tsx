"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { adminCreateRaffle } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateRaffleModal() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [totalTickets, setTotalTickets] = useState<number | "">("");
  const [status, setStatus] = useState("UPCOMING");
  const [drawDate, setDrawDate] = useState("");
  const [flyer, setFlyer] = useState<File | null>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("Creando rifa...");

    try {
      const payload = {
        title: name,
        description,
        price,
        status,
        drawDate: drawDate ? new Date(drawDate).toISOString() : undefined,
        totalTickets: totalTickets === "" ? undefined : Number(totalTickets),
        flyer,
        images,
      };
      const result = await adminCreateRaffle(payload);
      const createdName = (result as any)?.title || (result as any)?.name || name;
      const createdId = (result as any)?.id ? ` ID: ${(result as any).id}` : "";
      setMessage(`Rifa "${createdName}" creada con éxito.${createdId}`);
      setName("");
      setDescription("");
      setPrice(0);
      setTotalTickets("");
      setStatus("UPCOMING");
      setDrawDate("");
      setFlyer(null);
      setImages(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error desconocido.";
      setMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Crear rifa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Rifa</DialogTitle>
          <DialogDescription>
            Completa los detalles para la nueva rifa. Haz clic en guardar cuando termines.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">
              Nombre
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3 p-2 border rounded-md"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="description" className="text-right">
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3 p-2 border rounded-md"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="price" className="text-right">
              Precio
            </label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="col-span-3 p-2 border rounded-md"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="totalTickets" className="text-right">
              Boletos totales
            </label>
            <input
              id="totalTickets"
              type="number"
              value={totalTickets}
              onChange={(e) => setTotalTickets(e.target.value === "" ? "" : Number(e.target.value))}
              className="col-span-3 p-2 border rounded-md"
              min={1}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="drawDate" className="text-right">
              Fecha Sorteo
            </label>
            <input
              id="drawDate"
              type="datetime-local"
              value={drawDate}
              onChange={(e) => setDrawDate(e.target.value)}
              className="col-span-3 p-2 border rounded-md"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="status" className="text-right">
              Estado
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="col-span-3 p-2 border rounded-md"
            >
              <option value="UPCOMING">Próximamente</option>
              <option value="ACTIVE">Activa</option>
              <option value="FINISHED">Finalizada</option>
              <option value="CANCELLED">Cancelada</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="flyer" className="text-right">
              Flyer
            </label>
            <input
              id="flyer"
              type="file"
              accept="image/*"
              onChange={(e) => setFlyer(e.target.files ? e.target.files[0] : null)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="images" className="text-right">
              Galería
            </label>
            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImages(e.target.files)}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>{submitting ? "Guardando..." : "Guardar Rifa"}</Button>
          </DialogFooter>
        </form>
        {message && <p className="text-sm text-center text-gray-600 mt-2">{message}</p>}
      </DialogContent>
    </Dialog>
  );
}
