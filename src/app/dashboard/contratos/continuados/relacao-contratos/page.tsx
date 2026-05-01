"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";

export default function Page() {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    status: "",
    contrato: "",
    empresa: "",
    objeto: "",
    gestor: "",
    fiscaisTecnicos: "",
    fiscalAdm: "",
    processo: "",
    ocorreuReajuste: "",
    valorMensal: "",
    vencimento: "",
    mesAnoReajuste: "",
    valorAposReajuste: "",
    observacao: "",
  });

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    setForm({
      status: "",
      contrato: "",
      empresa: "",
      objeto: "",
      gestor: "",
      fiscaisTecnicos: "",
      fiscalAdm: "",
      processo: "",
      ocorreuReajuste: "",
      valorMensal: "",
      vencimento: "",
      mesAnoReajuste: "",
      valorAposReajuste: "",
      observacao: "",
    });
    setOpen(false);
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Card principal */}
      <div className="flex flex-col flex-1 min-h-0 rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Header do card */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-base font-semibold">Relação de Contratos</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <HugeiconsIcon
                  icon={Add01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
                Novo Contrato
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[1200px] h-[500px] flex flex-col">
              <DialogHeader className="shrink-0">
                <DialogTitle>Novo Contrato</DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-4 py-2">
                  {/* STATUS */}
                  <div className="flex flex-col gap-1.5">
                    <Label>Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) => handleChange("status", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                        <SelectItem value="Vencido">Vencido</SelectItem>
                        <SelectItem value="Em análise">Em análise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* CONTRATO */}
                  <div className="flex flex-col gap-1.5">
                    <Label>Contrato</Label>
                    <Input
                      placeholder="Nº do contrato"
                      value={form.contrato}
                      onChange={(e) => handleChange("contrato", e.target.value)}
                    />
                  </div>

                  {/* EMPRESA CONTRATADA */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <Label>Empresa Contratada</Label>
                    <Input
                      placeholder="Nome da empresa"
                      value={form.empresa}
                      onChange={(e) => handleChange("empresa", e.target.value)}
                    />
                  </div>

                  {/* OBJETO */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <Label>Objeto</Label>
                    <Textarea
                      placeholder="Descrição do objeto do contrato"
                      value={form.objeto}
                      onChange={(e) => handleChange("objeto", e.target.value)}
                      rows={2}
                    />
                  </div>

                  {/* GESTOR */}
                  <div className="flex flex-col gap-1.5">
                    <Label>Gestor</Label>
                    <Input
                      placeholder="Nome do gestor"
                      value={form.gestor}
                      onChange={(e) => handleChange("gestor", e.target.value)}
                    />
                  </div>

                  {/* FISCAL ADM */}
                  <div className="flex flex-col gap-1.5">
                    <Label>Fiscal Adm</Label>
                    <Input
                      placeholder="Nome do fiscal administrativo"
                      value={form.fiscalAdm}
                      onChange={(e) =>
                        handleChange("fiscalAdm", e.target.value)
                      }
                    />
                  </div>

                  {/* FISCAIS TÉCNICOS */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <Label>Fiscais Técnicos</Label>
                    <Input
                      placeholder="Nomes dos fiscais técnicos (separados por vírgula)"
                      value={form.fiscaisTecnicos}
                      onChange={(e) =>
                        handleChange("fiscaisTecnicos", e.target.value)
                      }
                    />
                  </div>

                  {/* PROCESSO */}
                  <div className="flex flex-col gap-1.5">
                    <Label>Processo</Label>
                    <Input
                      placeholder="Nº do processo"
                      value={form.processo}
                      onChange={(e) => handleChange("processo", e.target.value)}
                    />
                  </div>

                  {/* OCORREU REAJUSTE/RPTC */}
                  <div className="flex flex-col gap-1.5">
                    <Label>Ocorreu Reajuste / RPTC no Ano?</Label>
                    <Select
                      value={form.ocorreuReajuste}
                      onValueChange={(v) => handleChange("ocorreuReajuste", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sim">Sim</SelectItem>
                        <SelectItem value="Não">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* VALOR MENSAL */}
                  <div className="flex flex-col gap-1.5">
                    <Label>Valor Mensal (R$)</Label>
                    <Input
                      placeholder="0,00"
                      value={form.valorMensal}
                      onChange={(e) =>
                        handleChange("valorMensal", e.target.value)
                      }
                    />
                  </div>

                  {/* VENCIMENTO DO CONTRATO */}
                  <div className="flex flex-col gap-1.5">
                    <Label>Vencimento do Contrato</Label>
                    <Input
                      type="date"
                      value={form.vencimento}
                      onChange={(e) =>
                        handleChange("vencimento", e.target.value)
                      }
                    />
                  </div>

                  {/* MÊS/ANO DO REAJUSTE */}
                  <div className="flex flex-col gap-1.5">
                    <Label>Mês/Ano do Reajuste / RPTC</Label>
                    <Input
                      type="month"
                      value={form.mesAnoReajuste}
                      onChange={(e) =>
                        handleChange("mesAnoReajuste", e.target.value)
                      }
                    />
                  </div>

                  {/* VALOR APÓS REAJUSTE */}
                  <div className="flex flex-col gap-1.5">
                    <Label>Valor Mensal Após Reajuste (R$)</Label>
                    <Input
                      placeholder="0,00"
                      value={form.valorAposReajuste}
                      onChange={(e) =>
                        handleChange("valorAposReajuste", e.target.value)
                      }
                    />
                  </div>

                  {/* OBSERVAÇÃO */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <Label>Observação</Label>
                    <Textarea
                      placeholder="Observações adicionais"
                      value={form.observacao}
                      onChange={(e) =>
                        handleChange("observacao", e.target.value)
                      }
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="shrink-0">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

      </div>
    </div>
  );
}
