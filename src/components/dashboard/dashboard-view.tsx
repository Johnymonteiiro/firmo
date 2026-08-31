"use client";

import * as React from "react";

import { BillingMonthlyChart } from "@/components/dashboard/billing-monthly-chart";
import { BudgetByContractChart } from "@/components/dashboard/budget-by-contract-chart";
import { DashboardKpis } from "@/components/dashboard/dashboard-kpis";
import {
  ExpiringContractsCard,
  LowBalanceCard,
  TopContractsCard,
  UsersCard,
} from "@/components/dashboard/dashboard-lists";
import { DueBucketsChart } from "@/components/dashboard/due-buckets-chart";
import { NonContinuousChart } from "@/components/dashboard/non-continuous-chart";
import {
  SortableGrid,
  SortableItem,
  type SortableRenderProps,
} from "@/components/dnd/sortable-grid";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useHiddenIds, useOrderedIds } from "@/hooks/use-ordered-ids";
import { budgetYearOptions } from "@/lib/budget";
import { useDashboard } from "@/lib/dashboard";
import { HugeiconsIcon } from "@hugeicons/react";
import { DashboardSquareSettingIcon } from "@hugeicons/core-free-icons";

/** Ordem e ocultos são preferência de quem usa — ficam no navegador. */
const ORDER_KEY = "firmo:dashboard-cards-order";
const HIDDEN_KEY = "firmo:dashboard-cards-hidden";

type Handle = SortableRenderProps["handle"];
type DashboardCard = {
  id: string;
  /** Nome no menu de exibição — o mesmo título que o card mostra. */
  label: string;
  render: (handle: Handle) => React.ReactNode;
};

function formatCalculatedAt(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

/**
 * Painel geral. Cada bloco aparece conforme a resposta traz o dado — e a
 * resposta só traz o que a sessão pode ver. Não há `useCan` aqui: a ausência
 * da chave é o gate, e é o único que não diverge do backend.
 */
export function DashboardView() {
  const years = React.useMemo(() => budgetYearOptions(), []);
  const [year, setYear] = React.useState(() => new Date().getFullYear());

  const { data, isLoading, isError, error } = useDashboard(year);

  // Gráficos e listas moram na mesma grade: os dois são cards de 2 colunas, e
  // deixar a pessoa misturar é mais útil do que separar por tipo. Um card só
  // entra quando a resposta trouxe o dado — ou seja, quando a sessão pode vê-lo.
  const cards = React.useMemo<DashboardCard[]>(() => {
    if (!data) return [];
    const list: DashboardCard[] = [];

    if (data.monthly.length > 0) {
      list.push({
        id: "faturamento-mensal",
        label: "Faturamento por competência",
        render: (handle) => (
          <BillingMonthlyChart
            monthly={data.monthly}
            year={data.year}
            handle={handle}
          />
        ),
      });
    }
    if (data.commitments) {
      const commitments = data.commitments;
      list.push({
        id: "orcamento-por-contrato",
        label: "Orçamento liberado e saldo por contrato",
        render: (handle) => (
          <BudgetByContractChart
            byContract={commitments.byContract}
            handle={handle}
          />
        ),
      });
    }
    if (data.contracts) {
      const contracts = data.contracts;
      list.push({
        id: "vencimentos-por-faixa",
        label: "Vencimentos por faixa",
        render: (handle) => (
          <DueBucketsChart
            byDueBucket={contracts.byDueBucket}
            handle={handle}
          />
        ),
      });
    }
    if (data.nonContinuous) {
      const nonContinuous = data.nonContinuous;
      list.push({
        id: "nao-continuados",
        label: "Não continuados por exercício",
        render: (handle) => (
          <NonContinuousChart nonContinuous={nonContinuous} handle={handle} />
        ),
      });
    }
    if (data.contracts) {
      const contracts = data.contracts;
      list.push(
        {
          id: "contratos-a-vencer",
          label: "Contratos a vencer",
          render: (handle) => (
            <ExpiringContractsCard contracts={contracts} handle={handle} />
          ),
        },
        {
          id: "maiores-contratos",
          label: "Maiores contratos",
          render: (handle) => (
            <TopContractsCard contracts={contracts} handle={handle} />
          ),
        },
      );
    }
    if (data.commitments) {
      const commitments = data.commitments;
      list.push({
        id: "empenhos-consumidos",
        label: "Empenhos mais consumidos",
        render: (handle) => (
          <LowBalanceCard commitments={commitments} handle={handle} />
        ),
      });
    }
    if (data.users) {
      const users = data.users;
      list.push({
        id: "usuarios",
        label: "Usuários",
        render: (handle) => <UsersCard users={users} handle={handle} />,
      });
    }

    return list;
  }, [data]);

  const cardIds = React.useMemo(() => cards.map((card) => card.id), [cards]);
  const [ordered, setOrder] = useOrderedIds(ORDER_KEY, cardIds);
  const [hidden, setHidden, showAllCards] = useHiddenIds(HIDDEN_KEY);
  const cardsById = React.useMemo(
    () => new Map(cards.map((card) => [card.id, card])),
    [cards],
  );

  const visible = React.useMemo(
    () => ordered.filter((id) => !hidden.has(id)),
    [ordered, hidden],
  );

  // O arrasto só enxerga os cards à vista, mas a ordem gravada é a completa:
  // cada oculto fica na casa em que estava e volta para lá quando reexibido.
  const handleReorder = React.useCallback(
    (next: string[]) => {
      const queue = [...next];
      setOrder(
        ordered.map((id) => (hidden.has(id) ? id : (queue.shift() ?? id))),
      );
    },
    [ordered, hidden, setOrder],
  );

  const hiddenCount = React.useMemo(
    () => cardIds.filter((id) => hidden.has(id)).length,
    [cardIds, hidden],
  );

  // O early return fica DEPOIS dos hooks: React exige que a ordem de
  // chamada não mude entre renders, e um return antes deles quebraria
  // isso na primeira falha de rede.
  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error
          ? error.message
          : "Não foi possível carregar o painel."}
      </p>
    );
  }

  const nothingToShow =
    data &&
    !data.contracts &&
    !data.commitments &&
    !data.nonContinuous &&
    !data.users &&
    data.monthly.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <Label htmlFor="dashboard-year" className="text-muted-foreground">
            Exercício
          </Label>
          <Select
            value={String(year)}
            onValueChange={(value) => setYear(Number(value))}
          >
            <SelectTrigger id="dashboard-year" className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-0 items-center gap-3">
          {data ? (
            <p className="min-w-0 text-xs text-muted-foreground">
              Números calculados em {formatCalculatedAt(data.calculatedAt)} — o
              painel é derivado de contratos, empenhos e faturamentos.
            </p>
          ) : null}

          {cards.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0">
                  <HugeiconsIcon
                    icon={DashboardSquareSettingIcon}
                    strokeWidth={1.6}
                  />
                  Cards
                  {hiddenCount > 0 ? (
                    <span className="text-muted-foreground tabular-nums">
                      {cards.length - hiddenCount}/{cards.length}
                    </span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-medium">
                  Exibir cards
                </DropdownMenuLabel>
                {cards.map((card) => (
                  <DropdownMenuCheckboxItem
                    key={card.id}
                    checked={!hidden.has(card.id)}
                    // Sem isto o menu fecha a cada clique, e escolher três
                    // cards viraria abrir o menu três vezes.
                    onSelect={(event) => event.preventDefault()}
                    onCheckedChange={(checked) => setHidden(card.id, !checked)}
                  >
                    {card.label}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={hiddenCount === 0}
                  onSelect={() => showAllCards()}
                >
                  Exibir todos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      {nothingToShow ? (
        <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Seu perfil não tem acesso a nenhum indicador do painel.
        </p>
      ) : null}

      {/* A fileira de indicadores fica fora da grade ordenável: são a leitura
          de abertura do painel, e a ordem deles é a hierarquia da informação,
          não preferência de arrumação. */}
      <DashboardKpis data={data} isLoading={isLoading} />

      {isLoading && !data ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      ) : null}

      {cards.length > 0 && visible.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Todos os cards estão ocultos — reexiba pelo menu{" "}
          <span className="text-foreground">Cards</span>.
        </p>
      ) : null}

      {/* Sem `items-start`: os cards de uma linha esticam até a mesma altura,
          e aí todo vão da grade é o mesmo `gap`. */}
      <SortableGrid
        ids={visible}
        onReorder={handleReorder}
        className="grid gap-4 xl:grid-cols-2"
      >
        {visible.map((id) => {
          const card = cardsById.get(id);
          if (!card) return null;
          return (
            <SortableItem key={id} id={id}>
              {({ handle }) => card.render(handle)}
            </SortableItem>
          );
        })}
      </SortableGrid>
    </div>
  );
}
