const P = (d: string) => <path d={d} />;
export const icons = {
  inicio: <svg viewBox="0 0 24 24" aria-hidden="true">{P("M3 11l9-7 9 7")}{P("M5 10v10h14V10")}</svg>,
  doses: <svg viewBox="0 0 24 24" aria-hidden="true">{P("M18 2l4 4M17 7l3-3M19 9 8.7 19.3a2.4 2.4 0 0 1-3.4 0l-.6-.6a2.4 2.4 0 0 1 0-3.4L15 5M9 11l4 4M5 19l-3 3M14 4l6 6")}</svg>,
  peso: <svg viewBox="0 0 24 24" aria-hidden="true">{P("M4 20l2-14h12l2 14z")}{P("M12 10l2-2")}<circle cx="12" cy="11" r="2.5" /></svg>,
  sintomas: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" />{P("M9 10h.01M15 10h.01M8 15c1.2 1.2 2.6 1.8 4 1.8s2.8-.6 4-1.8")}</svg>,
  agua: <svg viewBox="0 0 24 24" aria-hidden="true">{P("M12 2s7 7.5 7 12a7 7 0 0 1-14 0c0-4.5 7-12 7-12z")}</svg>,
  nutricao: <svg viewBox="0 0 24 24" aria-hidden="true">{P("M5 3v8a3 3 0 0 0 3 3v7M5 3v6M8 3v6")}{P("M17 3c-1.7 0-3 2-3 5.5S15.3 12 17 12v9")}</svg>,
  relatorio: <svg viewBox="0 0 24 24" aria-hidden="true">{P("M6 2h9l5 5v15H6z")}{P("M14 2v6h6")}{P("M9 13h6M9 17h6")}</svg>,
  ajustes: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" />{P("M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z")}</svg>,
  prev: <svg viewBox="0 0 24 24" aria-hidden="true">{P("M15 18l-6-6 6-6")}</svg>,
  next: <svg viewBox="0 0 24 24" aria-hidden="true">{P("M9 18l6-6-6-6")}</svg>,
};
