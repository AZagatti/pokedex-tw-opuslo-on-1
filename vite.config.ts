import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

const dev = process.argv.includes("dev");
const base = dev ? "" : (process.env.BASE_PATH ?? "");

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      adapter: adapter({ fallback: "index.html" }),
      compilerOptions: {
        runes: ({ filename }) =>
          filename.split(/[/\\]/u).includes("node_modules") ? undefined : true,
      },
      paths: {
        base: base as "" | `/${string}`,
      },
      prerender: {
        handleHttpError: "warn",
      },
    }),
  ],
  test: {
    projects: [
      {
        extends: "./vite.config.ts",
        test: {
          environment: "jsdom",
          include: ["src/**/*.{test,spec}.{js,ts}"],
          name: "unit",
        },
      },
    ],
  },
});
