"use client"

import * as React from "react"

import { KpiCard, KpiGrid } from "@/components/kpi"
import { useUsers } from "@/lib/users"
import {
  UserGroupIcon,
  UserCheck01Icon,
  UserSettings01Icon,
  UserBlock01Icon,
} from "@hugeicons/core-free-icons"

/** KPIs da listagem de usuários — mesma query da tabela (React Query dedupe). */
export function UsersKpis() {
  const { data, isLoading } = useUsers(1, 100)
  const users = React.useMemo(() => data?.data ?? [], [data])

  const stats = React.useMemo(() => {
    let ativos = 0
    let inativos = 0
    let suspensos = 0
    let admins = 0
    for (const u of users) {
      if (u.status === "ATIVO") ativos += 1
      if (u.status === "INATIVO") inativos += 1
      if (u.status === "SUSPENSO") suspensos += 1
      // RF-C04: conta quem acumula o perfil, não quem só o tem.
      if (u.profiles.includes("ADMINISTRADOR") && u.status === "ATIVO")
        admins += 1
    }
    return { ativos, inativos, suspensos, admins }
  }, [users])

  return (
    <KpiGrid>
      <KpiCard
        label="Total de usuários"
        value={data?.total ?? 0}
        hint={`${stats.ativos} ativos · ${stats.inativos} inativos · ${stats.suspensos} suspensos`}
        icon={UserGroupIcon}
        isLoading={isLoading}
      />
      <KpiCard
        label="Ativos"
        value={stats.ativos}
        hint="Aptos a operar o sistema"
        icon={UserCheck01Icon}
        isLoading={isLoading}
      />
      <KpiCard
        label="Administradores ativos"
        value={stats.admins}
        hint={
          stats.admins <= 1
            ? "O último administrador ativo não pode ser desativado"
            : "Podem gerenciar usuários"
        }
        icon={UserSettings01Icon}
        tone={stats.admins <= 1 ? "warning" : "default"}
        isLoading={isLoading}
      />
      <KpiCard
        label="Sem acesso"
        value={stats.inativos + stats.suspensos}
        hint="Inativos e suspensos"
        icon={UserBlock01Icon}
        tone={stats.suspensos > 0 ? "warning" : "default"}
        isLoading={isLoading}
      />
    </KpiGrid>
  )
}
