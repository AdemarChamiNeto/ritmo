import { useEffect, useState } from "react";
import { todayISO } from "./domain/dates";

/** Data de hoje que se atualiza sozinha na virada do dia (app aberto a noite toda). */
export function useToday() {
  const [today, setToday] = useState(todayISO);
  useEffect(() => {
    const t = setInterval(() => setToday(todayISO()), 60_000);
    const onVisible = () => document.visibilityState === "visible" && setToday(todayISO());
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", onVisible); };
  }, []);
  return today;
}
