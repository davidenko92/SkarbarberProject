import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Skarbarber — Panel",
    short_name: "Skarbarber",
    description:
      "Gestión de citas y agenda de Skarbarber (Alcalá de Henares).",
    start_url: "/panel",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    lang: "es",
    categories: ["business", "productivity", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Agenda de hoy",
        short_name: "Agenda",
        url: "/panel",
        description: "Ver las citas del día",
      },
      {
        name: "Métricas",
        short_name: "Stats",
        url: "/panel/metricas",
        description: "KPIs del negocio",
      },
    ],
  };
}
