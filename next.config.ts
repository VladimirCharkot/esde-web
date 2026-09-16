import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Permite acceder al dev server desde otros dispositivos de la misma red (ej. celular)
  allowedDevOrigins: ["192.168.0.217"],
};

export default nextConfig;
