import type { SquadConfig, SquadInstance } from "./types/squad";

declare global {
  interface Window {
    squad: new (config: SquadConfig) => SquadInstance;
  }
}
