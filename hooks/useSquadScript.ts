import { useEffect, useState } from "react";

const SQUAD_SCRIPT_URL = "https://checkout.squadco.com/widget/squad.min.js";

export function useSquadScript(): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (document.querySelector(`script[src="${SQUAD_SCRIPT_URL}"]`)) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = SQUAD_SCRIPT_URL;
    script.async = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Squad payment script");
    };
    document.body.appendChild(script);
  }, []);

  return loaded;
}
