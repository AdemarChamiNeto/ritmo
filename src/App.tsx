import { useEffect, useState } from "react";
import { icons } from "./components/icons";
import { fmtToday } from "./domain/dates";
import ConfigForm from "./forms/ConfigForm";
import { useToday } from "./useToday";
import { useAppDispatch, useAppSelector } from "./store";
import { tabChanged, type Tab } from "./store/uiSlice";
import Doses from "./views/Doses";
import Home from "./views/Home";
import Nutrition from "./views/Nutrition";
import ReportView, { PrintReport } from "./views/ReportView";
import Settings from "./views/Settings";
import Symptoms from "./views/Symptoms";
import Water from "./views/Water";
import Weight from "./views/Weight";

const TABS: { id: Exclude<Tab, "ajustes">; label: string }[] = [
  { id: "inicio", label: "Início" },
  { id: "doses", label: "Doses" },
  { id: "peso", label: "Peso" },
  { id: "sintomas", label: "Sintomas" },
  { id: "agua", label: "Água" },
  { id: "nutricao", label: "Nutrição" },
  { id: "relatorio", label: "Relatório" },
];

const VIEWS: Record<Tab, () => JSX.Element> = {
  inicio: Home, doses: Doses, peso: Weight, sintomas: Symptoms, agua: Water, nutricao: Nutrition, relatorio: ReportView, ajustes: Settings,
};

export default function App() {
  const dispatch = useAppDispatch();
  const tab = useAppSelector((s) => s.ui.tab);
  useToday(); // re-renderiza na virada do dia (data do topo)
  const hasConfig = useAppSelector((s) => s.data.config !== null);
  const [onboarding, setOnboarding] = useState(!hasConfig);
  const View = VIEWS[tab];
  const go = (t: Tab) => { dispatch(tabChanged(t)); window.scrollTo({ top: 0 }); };

  useEffect(() => { document.title = `Ritmo — ${TABS.find((t) => t.id === tab)?.label ?? "Ajustes"}`; }, [tab]);

  return (
    <div className="app">
      <header className="topbar">
        <p className="brand"><span className="dot" aria-hidden="true" />Ritmo</p>
        <div className="topbar-right">
          <span className="date-today">{fmtToday()}</span>
          <button className="icon-btn" aria-label="Ajustes e backup" aria-current={tab === "ajustes" ? "page" : undefined} onClick={() => go("ajustes")}>
            {icons.ajustes}
          </button>
        </div>
      </header>

      <main key={tab}><View /></main>

      <nav className="tabbar" aria-label="Seções">
        {TABS.map((t) => (
          <button key={t.id} className="tab-btn" aria-current={tab === t.id ? "page" : undefined} onClick={() => go(t.id)}>
            {icons[t.id]}
            {t.label}
          </button>
        ))}
      </nav>

      <PrintReport />
      <ConfigForm open={onboarding} onClose={() => setOnboarding(false)} />
    </div>
  );
}
