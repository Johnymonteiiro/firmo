"use client";

import * as React from "react";

/**
 * Arrumação de uma grade de cards — que ordem têm e quais ficam escondidos —
 * lembrada por navegador.
 *
 * É preferência de exibição, não dado do domínio: cada pessoa organiza os
 * cards como prefere e não há por que gravar isso no banco nem impor a
 * arrumação de uma pessoa às outras.
 *
 * Lido por `useSyncExternalStore` — no servidor devolve `null` (arrumação
 * natural) e no cliente lê o `localStorage`, o que evita tanto o descompasso
 * de hidratação quanto um `setState` dentro de efeito.
 */

const ORDER_EVENT = "firmo:order-changed";

/** `storage` só dispara em outras abas; o evento local cobre esta. */
function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(ORDER_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(ORDER_EVENT, callback);
  };
}

function readOrder(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

/**
 * Reconcilia a ordem guardada com a lista atual: o que já foi ordenado vem
 * primeiro, na ordem escolhida, e o que apareceu depois (um perfil novo, um
 * módulo novo do catálogo) entra no fim, em vez de sumir.
 */
export function applyOrder(ids: string[], order: string[]): string[] {
  const present = new Set(ids);
  const known = order.filter((id) => present.has(id));
  const seen = new Set(known);
  return [...known, ...ids.filter((id) => !seen.has(id))];
}

export function useOrderedIds(
  storageKey: string,
  ids: string[],
): [string[], (next: string[]) => void] {
  const getSnapshot = React.useCallback(() => {
    try {
      return window.localStorage.getItem(storageKey);
    } catch {
      // Navegação privada ou storage bloqueado: segue na ordem natural.
      return null;
    }
  }, [storageKey]);

  const raw = React.useSyncExternalStore(subscribe, getSnapshot, () => null);

  const ordered = React.useMemo(
    () => applyOrder(ids, readOrder(raw)),
    [ids, raw],
  );

  const setOrder = React.useCallback(
    (next: string[]) => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        window.dispatchEvent(new Event(ORDER_EVENT));
      } catch {
        // Sem storage a ordem não persiste; a tela segue funcionando.
      }
    },
    [storageKey],
  );

  return [ordered, setOrder];
}

/**
 * Cards que a pessoa escolheu não exibir, lembrados por navegador.
 *
 * É da mesma natureza da ordem — arrumação, não permissão. O que a sessão
 * pode ver continua sendo decidido no backend: esconder um card aqui não
 * revela nem oculta nada que a resposta já não tivesse trazido.
 *
 * Guarda os ocultos (e não os visíveis) de propósito: assim um card novo
 * nasce visível, em vez de sumir para quem já mexeu na lista.
 */
export function useHiddenIds(
  storageKey: string,
): [Set<string>, (id: string, hidden: boolean) => void, () => void] {
  const getSnapshot = React.useCallback(() => {
    try {
      return window.localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  }, [storageKey]);

  const raw = React.useSyncExternalStore(subscribe, getSnapshot, () => null);

  const hidden = React.useMemo(() => new Set(readOrder(raw)), [raw]);

  const write = React.useCallback(
    (next: Set<string>) => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify([...next]));
        window.dispatchEvent(new Event(ORDER_EVENT));
      } catch {
        // Sem storage a escolha não persiste; a tela segue funcionando.
      }
    },
    [storageKey],
  );

  const setHidden = React.useCallback(
    (id: string, value: boolean) => {
      const next = new Set(hidden);
      if (value) next.add(id);
      else next.delete(id);
      write(next);
    },
    [hidden, write],
  );

  const showAll = React.useCallback(() => write(new Set()), [write]);

  return [hidden, setHidden, showAll];
}
