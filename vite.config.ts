import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Local dev only: mimics api/tmdb.js so `npm run dev` works without Vercel.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ""); // reads TMDB_KEY from .env
  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api/tmdb": {
          target: "https://api.themoviedb.org",
          changeOrigin: true,
          rewrite: (p: string) => {
            const u = new URL(p, "http://localhost");
            const path = u.searchParams.get("path") ?? "";
            u.searchParams.delete("path");
            u.searchParams.set("api_key", env.TMDB_KEY ?? "");
            return `/3${path}?${u.searchParams.toString()}`;
          },
        },
      },
    },
  };
});
