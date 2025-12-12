"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  const [status, setStatus] = useState("UPCOMING");
  const [drawDate, setDrawDate] = useState("");
  const [flyer, setFlyer] = useState<File | null>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Creando rifa...");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", String(price));
    formData.append("status", status);
    formData.append("drawDate", new Date(drawDate).toISOString());

    if (flyer) {
      formData.append("flyer", flyer);
    }

    if (images) {
      for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
      }
    }

    try {
      const response = await fetch("/api/admin/raffles", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Error al crear la rifa.");
      }

      setMessage(`Rifa "${result.name}" creada con éxito. ID: ${result.id}`);
      // Aquí se podría cerrar el modal y refrescar la lista de rifas
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error desconocido.";
      setMessage(msg);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Crear Rifa</Button>
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
              onChange={(e) => setFlyer(e.target.files ? e.target.files[0] : null)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="images" className="text-right">
              Imágenes
            </label>
            <input
              id="images"
              type="file"
              multiple
              onChange={(e) => setImages(e.target.files)}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Guardar Rifa</Button>
          </DialogFooter>
        </form>
        {message && <p className="text-sm text-center text-gray-600 mt-2">{message}</p>}
      </DialogContent>
    </Dialog>
  );
}
