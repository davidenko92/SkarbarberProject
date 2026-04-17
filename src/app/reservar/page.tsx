import Image from "next/image";

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 pt-8 pb-6 border-b border-zinc-800">
        <Image
          src="/Logo.jpeg"
          alt="Skarbarber"
          width={80}
          height={80}
          className="rounded-full"
        />
        <h1 className="text-xl font-bold">Skarbarber</h1>
        <p className="text-zinc-400 text-sm">Reserva tu cita</p>
      </div>

      {/* Booking flow placeholder */}
      <div className="p-4 space-y-6">
        <p className="text-zinc-400 text-center">
          Flujo de reservas en construcci&oacute;n.
        </p>
      </div>
    </div>
  );
}
