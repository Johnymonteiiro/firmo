"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ChangePasswordDialog } from "@/components/auth/change-password-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { UserProfileBadges } from "@/components/users/user-profile-badge"
import { useLogout, useSession } from "@/lib/auth"
import { useUser } from "@/lib/users"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UnfoldMoreIcon,
  UserIcon,
  LockPasswordIcon,
  LogoutIcon,
} from "@hugeicons/core-free-icons"

const initialsOf = (name: string): string =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

/**
 * Usuário da sessão. O `/auth/me` devolve só identidade e permissões — o
 * token não carrega nome nem e-mail de propósito —, então o cadastro vem de
 * `/users/:id`.
 */
export function NavUser() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { data: session } = useSession()
  const { data: user } = useUser(session?.userId ?? null)
  const logout = useLogout()
  const [changePasswordOpen, setChangePasswordOpen] = React.useState(false)

  if (!session) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Skeleton className="h-12 w-full" />
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const name = user?.name ?? "Carregando…"
  const email = user?.email ?? ""

  function onLogout() {
    logout.mutate(undefined, {
      // Mesmo se a chamada falhar, o cliente sai: os cookies podem já ter
      // expirado, e manter a pessoa presa na tela seria pior.
      onSettled: () => router.replace("/login"),
    })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {initialsOf(name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs">{email}</span>
              </div>
              <HugeiconsIcon
                icon={UnfoldMoreIcon}
                strokeWidth={2}
                className="ml-auto size-4"
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {initialsOf(name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 gap-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{name}</span>
                  <UserProfileBadges profiles={session.profiles} />
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/usuarios/${session.userId}`)
              }
            >
              <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
              Meu perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
              <HugeiconsIcon icon={LockPasswordIcon} strokeWidth={2} />
              Alterar senha
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} disabled={logout.isPending}>
              <HugeiconsIcon icon={LogoutIcon} strokeWidth={2} />
              {logout.isPending ? "Saindo…" : "Sair"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ChangePasswordDialog
          open={changePasswordOpen}
          onOpenChange={setChangePasswordOpen}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
