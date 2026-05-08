import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AppRouter } from "@/router";
import "@fontsource-variable/geist";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 2,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontSize: "14px",
            borderRadius: "18px",
            padding: "14px 16px",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
            background: "rgba(255, 255, 255, 0.96)",
            color: "#0f172a",
          },
        }}
      />
    </QueryClientProvider>
  </StrictMode>,
);
