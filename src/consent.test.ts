import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** O módulo lê os IDs na importação: cada teste importa de novo com o ambiente que quiser. */
async function load(env: Record<string, string>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  return import("./consent");
}

const scripts = () => [...document.head.querySelectorAll("script")].map((s) => s.src);
const banner = () => document.querySelector('[aria-label="Aviso de cookies"]');

beforeEach(() => {
  localStorage.clear();
  document.head.innerHTML = "";
  document.body.innerHTML = "";
});
afterEach(() => vi.unstubAllEnvs());

describe("consentimento (LGPD)", () => {
  it("sem IDs configurados não mostra aviso nem carrega nada", async () => {
    const { initConsent } = await load({ VITE_GA_ID: "", VITE_CLARITY_ID: "" });
    initConsent("/privacidade.html");
    expect(banner()).toBeNull();
    expect(scripts()).toEqual([]);
  });

  it("com ID, mostra o aviso e não carrega nada antes da resposta", async () => {
    const { initConsent } = await load({ VITE_GA_ID: "G-TESTE123", VITE_CLARITY_ID: "abc123" });
    initConsent("/privacidade.html");
    expect(banner()).not.toBeNull();
    expect(banner()!.querySelector("a")!.getAttribute("href")).toBe("/privacidade.html");
    expect(scripts()).toEqual([]);
  });

  it("recusar: nada é carregado e a escolha é lembrada", async () => {
    const { initConsent } = await load({ VITE_GA_ID: "G-TESTE123" });
    initConsent("/privacidade.html");
    (banner()!.querySelector('[data-c="denied"]') as HTMLButtonElement).click();
    expect(banner()).toBeNull();
    expect(scripts()).toEqual([]);
    initConsent("/privacidade.html"); // próxima visita
    expect(banner()).toBeNull();
  });

  it("aceitar: carrega só o GA, e na próxima visita carrega sem perguntar", async () => {
    const { initConsent, resetConsent } = await load({ VITE_GA_ID: "G-TESTE123", VITE_CLARITY_ID: "abc123" });
    initConsent("/privacidade.html");
    (banner()!.querySelector('[data-c="granted"]') as HTMLButtonElement).click();
    expect(scripts().some((s) => s.includes("googletagmanager.com/gtag/js?id=G-TESTE123"))).toBe(true);
    // Clarity desligado de propósito: grava a sessão, e a tela do Ritmo tem dados de saúde
    expect(scripts().some((s) => s.includes("clarity.ms"))).toBe(false);
    expect(localStorage.getItem("consent-analytics")).toBe("granted");
    resetConsent();
    expect(localStorage.getItem("consent-analytics")).toBeNull();
  });

  it("só com o ID do Clarity, nada aparece (o Ritmo não usa Clarity)", async () => {
    const { initConsent } = await load({ VITE_GA_ID: "", VITE_CLARITY_ID: "abc123" });
    initConsent("/privacidade.html");
    expect(banner()).toBeNull();
    expect(scripts()).toEqual([]);
  });
});
