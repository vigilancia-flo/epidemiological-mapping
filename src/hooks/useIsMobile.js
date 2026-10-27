import { useEffect, useState } from "react";

/**
 * Retorna true quando a viewport é menor que `breakpoint`.
 * Usa matchMedia (só dispara no cruzamento do threshold — bem mais
 * leve que ouvir todo `resize`).
 */
export function useIsMobile(breakpoint = 768) {
  const query = `(max-width: ${breakpoint - 1}px)`; // <768px ⇔ max-width:767px

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setIsMobile(e.matches);

    // Sincroniza caso o breakpoint tenha mudado entre renders
    setIsMobile(mql.matches);

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return isMobile;
}
