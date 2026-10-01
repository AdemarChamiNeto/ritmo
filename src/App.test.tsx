import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";
import App from "./App";
import { todayISO } from "./domain/dates";
import { emptyData, type AppData } from "./domain/types";
import { makeStore } from "./store";

const configured: AppData = {
  ...emptyData(),
  config: { medication: "Mounjaro (tirzepatida)", dose: 5, frequencyDays: 7, lastDoseDate: todayISO() },
};

function setup(data = configured) {
  const store = makeStore(data, false);
  const user = userEvent.setup();
  render(<Provider store={store}><App /></Provider>);
  return { store, user };
}

describe("App", () => {
  it("abre a configuração no primeiro uso e fecha com Esc", async () => {
    const { user } = setup(emptyData());
    expect(screen.getByRole("dialog", { name: "Seu tratamento" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("mostra a próxima dose e navega pelas abas", async () => {
    const { user } = setup();
    expect(screen.getByText("Em 7 dias")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Doses/ }));
    expect(screen.getByRole("heading", { name: "Doses" })).toBeInTheDocument();
  });

  it("valida o peso em vez de fechar o modal em silêncio", async () => {
    const { user, store } = setup();
    await user.click(screen.getByRole("button", { name: "Registrar peso" }));
    const dialog = screen.getByRole("dialog", { name: "Registrar peso" });
    await user.click(within(dialog).getByRole("button", { name: "Salvar" }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("peso válido");

    await user.type(within(dialog).getByLabelText("Peso (kg)"), "92,4");
    await user.click(within(dialog).getByRole("button", { name: "Salvar" }));
    expect(store.getState().data.weights[0].weight).toBe(92.4);
    expect(within(screen.getByRole("main")).getByText("92,4 kg")).toBeInTheDocument();
  });

  it("remover pede confirmação", async () => {
    const { user, store } = setup({
      ...configured,
      doses: [{ id: "d1", date: todayISO(), amount: 5, site: "Coxa", notes: "" }],
    });
    await user.click(screen.getByRole("button", { name: /Doses/ }));
    await user.click(screen.getByRole("button", { name: /^Remover dose/ }));
    expect(store.getState().data.doses).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: /Confirmar remoção/ }));
    expect(store.getState().data.doses).toHaveLength(0);
  });

  it("copos de água funcionam pelo teclado (são botões)", async () => {
    const { user, store } = setup();
    const cups = screen.getAllByRole("button", { name: /^Copo/ });
    cups[2].focus();
    await user.keyboard("{Enter}");
    expect(store.getState().data.waterDaily[todayISO()]).toBe(750);
  });
});
