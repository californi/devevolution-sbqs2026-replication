import { createFileRoute } from "@tanstack/react-router";
import DevEvolutionGame from "@/components/DevEvolutionGame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DevEvolution: O Jogo das Métricas 🚀" },
      { name: "description", content: "Aprenda métricas de software de forma divertida. Evolua de Júnior a Sênior!" },
    ],
  }),
  component: DevEvolutionGame,
});
