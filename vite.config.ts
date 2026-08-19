import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/* The two entries each SPA-fallback their own paths, but Vite's built-in
   dev/preview server only knows the root index.html — a deep link like
   /blog/<slug> with no static file (dev) would fall to the main site and
   normalize to the root. Rewrite /blog/* to the blog entry, matching what
   the prerendered statics serve in production. */
function blogFallbackMiddleware() {
  return (req: { url?: string }, _res: unknown, next: () => void) => {
    const url = (req.url ?? "").split("?")[0];
    if (url === "/blog" || url.startsWith("/blog/")) {
      req.url = "/blog/index.html";
    }
    next();
  };
}

/* configureServer / configurePreviewServer are plugin hooks, not top-level
   config keys — hence the inline plugin. */
function blogEntryFallbackPlugin() {
  return {
    name: "blog-entry-fallback",
    configureServer(server: { middlewares: { use: (m: unknown) => void } }) {
      server.middlewares.use(blogFallbackMiddleware());
    },
    configurePreviewServer(server: {
      middlewares: { use: (m: unknown) => void };
    }) {
      server.middlewares.use(blogFallbackMiddleware());
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss(), blogEntryFallbackPlugin()],
  build: {
    // Modern browsers only (es2022): smaller output, no legacy transforms.
    target: "es2022",
    rollupOptions: {
      // Two independent SPA entries: the main site at / and the light blog
      // sub-site at /blog/. Each gets its own index.html + app bundle; both
      // deploy together inside one dist/ (GitHub Pages serves /blog/ as a
      // subdirectory).
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        blog: fileURLToPath(new URL("./blog/index.html", import.meta.url)),
      },
      output: {
        // Split heavy deps into stable vendor chunks so content updates
        // only re-download the small app chunk (cache-friendly on mobile).
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react") || id.includes("scheduler"))
            return "vendor-react";
          if (id.includes("gsap") || id.includes("lenis"))
            return "vendor-motion";
          return "vendor-misc";
        },
      },
    },
  },
  server: {
    // 允许通过 Tailscale Serve 远程访问（zennode.tail25e81f.ts.net）
    allowedHosts: ["zennode.tail25e81f.ts.net"],
  },
});
