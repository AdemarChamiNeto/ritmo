import { useRef, useState } from "react";
import { BackupError, exportBackup, importBackup } from "../domain/backup";
import { fmtDate, todayISO } from "../domain/dates";
import { num } from "../domain/format";
import ConfigForm from "../forms/ConfigForm";
import { useAppDispatch, useAppSelector } from "../store";
import { dataCleared, dataReplaced } from "../store/dataSlice";

export default function Settings() {
  const dispatch = useAppDispatch();
  const data = useAppSelector((s) => s.data);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const count = data.doses.length + data.weights.length + data.symptoms.length + data.meals.length;

  function download() {
    const blob = new Blob([exportBackup(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href: url, download: `ritmo-backup-${todayISO()}.json` }).click();
    URL.revokeObjectURL(url);
    setMsg({ ok: true, text: "Backup baixado. Guarde o arquivo num lugar seguro (e-mail, Drive...)." });
  }

  async function restore(file: File) {
    try {
      const imported = importBackup(await file.text());
      dispatch(dataReplaced(imported));
      setMsg({ ok: true, text: `Backup restaurado: ${imported.doses.length} doses, ${imported.weights.length} pesos, ${imported.meals.length} refeições.` });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof BackupError ? e.message : "Não consegui ler esse arquivo." });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <section className="view">
      <h1 className="page-title">Ajustes</h1>

      <div className="card">
        <h2>Tratamento</h2>
        {data.config ? (
          <p style={{ margin: "0 0 12px" }}>
            {data.config.medication} · {num(data.config.dose, 2)} mg ·{" "}
            {data.config.frequencyDays === 1 ? "diária" : data.config.frequencyDays === 7 ? "semanal" : `a cada ${data.config.frequencyDays} dias`}
            <br /><span className="cap">última dose informada: {fmtDate(data.config.lastDoseDate)}</span>
          </p>
        ) : <p className="hint" style={{ marginTop: 0 }}>Nenhum tratamento configurado.</p>}
        <button className="btn btn-ghost" onClick={() => setOpen(true)}>{data.config ? "Editar" : "Configurar"}</button>
      </div>

      <div className="card">
        <h2>Backup</h2>
        <p className="hint" style={{ marginTop: 0 }}>
          Seus dados ficam só neste aparelho ({count} registros). Se você limpar o navegador ou trocar de celular, eles se perdem —
          baixe um backup de vez em quando.
        </p>
        <div className="btn-row mt">
          <button className="btn btn-primary" onClick={download}>Baixar backup</button>
          <button className="btn btn-outline" onClick={() => fileRef.current?.click()}>Restaurar backup</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden aria-label="Arquivo de backup"
            onChange={(e) => e.target.files?.[0] && restore(e.target.files[0])} />
        </div>
        <p className="hint">Também aceita os dados da versão antiga (arquivo HTML).</p>
        {msg && <p className={msg.ok ? "hint" : "form-error"} role="status">{msg.text}</p>}
      </div>

      <div className="card">
        <h2>Apagar tudo</h2>
        <p className="hint" style={{ marginTop: 0 }}>Remove todos os registros deste aparelho. Não dá para desfazer.</p>
        {confirmClear ? (
          <div className="btn-row mt">
            <button className="btn btn-danger" onClick={() => { dispatch(dataCleared()); setConfirmClear(false); setMsg({ ok: true, text: "Dados apagados." }); }}>Sim, apagar tudo</button>
            <button className="btn btn-outline" onClick={() => setConfirmClear(false)}>Cancelar</button>
          </div>
        ) : <button className="btn btn-danger mt" onClick={() => setConfirmClear(true)}>Apagar dados</button>}
      </div>

      <p className="hint" style={{ textAlign: "center" }}>
        O Ritmo é uma ferramenta de registro pessoal e não substitui orientação médica.
      </p>
      <ConfigForm open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
