import { get, set } from "idb-keyval";
import { importBackup } from "../domain/backup";
import type { AppData } from "../domain/types";

const KEY = "ritmo-data-v2";
/** Chave usada pela versão antiga (arquivo HTML único). */
const LEGACY_KEY = "ritmo_treatment_data_v1";

/** Carrega do IndexedDB; se vazio, tenta migrar os dados da versão HTML antiga. */
export async function loadData(): Promise<AppData | undefined> {
  try {
    const saved = await get<AppData>(KEY);
    if (saved) return saved;
  } catch (e) {
    console.warn("[ritmo] não consegui ler o IndexedDB", e);
  }
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const migrated = importBackup(legacy);
      await saveData(migrated); // grava já no formato novo (a chave antiga fica intacta, por segurança)
      return migrated;
    }
  } catch (e) {
    console.warn("[ritmo] não consegui migrar os dados antigos", e);
  }
  return undefined;
}

export async function saveData(data: AppData) {
  try {
    await set(KEY, data);
  } catch (e) {
    console.warn("[ritmo] falha ao salvar", e);
  }
}
