import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DuoLedger - Smart Couple Expense & Settlement Tracker",
    short_name: "DuoLedger",
    description:
      "Aesthetic expense tracker and settlement ledger for dual-earning couples managing household, personal, and parents expenses.",
    start_url: "/",
    display: "standalone",
    background_color: "#090a0b",
    theme_color: "#18181b",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}

