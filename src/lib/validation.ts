import { z } from "zod"

/**
 * Validadores compartilhados que espelham os formatos + ranges de ano do
 * backend (value objects). Os ranges são dinâmicos: ano atual (+1 conforme o
 * campo), avaliados na carga do módulo.
 */
const THIS_YEAR = new Date().getFullYear()
const MAX_YEAR = THIS_YEAR + 1 // SNE, SIAFI, solicitação, período, contrato
const MAX_YEAR_PROCESS = THIS_YEAR // processo: sem +1

const RE = {
  sne: /^\d{9}$/, // {ano}{seq:5d}
  siafi: /^\d{4}NE\d{6}$/,
  process: /^\d{5}\.\d{6}\/\d{4}-\d{2}$/,
  contract: /^\d+\/\d{4}$/,
  period: /^\d{4}-(0[1-9]|1[0-2])$/,
  decimal: /^\d+(\.\d{1,2})?$/,
}

const prefixYear = (v: string) => Number(v.slice(0, 4))
const yearAfterSlash = (v: string) => Number(v.split("/")[1]?.slice(0, 4))
const numberBeforeSlash = (v: string) => Number(v.split("/")[0])

// ---------- obrigatórios ----------

/** SNE / Solicitação de pagamento: 9 dígitos `{ano}{seq:5d}` + range de ano. */
export function sneSchema(label = "SNE", minYear = 1990) {
  return z
    .string()
    .regex(RE.sne, `${label}: formato esperado {ano}{seq} (ex.: 202600408).`)
    .refine(
      (v) => prefixYear(v) >= minYear && prefixYear(v) <= MAX_YEAR,
      `${label}: ano inválido — esperado entre ${minYear} e ${MAX_YEAR}.`
    )
}

export function siafiSchema() {
  return z
    .string()
    .regex(RE.siafi, "SIAFI: formato esperado 2026NE000177.")
    .refine(
      (v) => prefixYear(v) >= 1990 && prefixYear(v) <= MAX_YEAR,
      `SIAFI: ano inválido — esperado entre 1990 e ${MAX_YEAR}.`
    )
}

export function processSchema() {
  return z
    .string()
    .regex(RE.process, "Processo: formato esperado 23080.003729/2026-38.")
    .refine(
      (v) => yearAfterSlash(v) >= 1990 && yearAfterSlash(v) <= MAX_YEAR_PROCESS,
      `Processo: ano inválido — esperado entre 1990 e ${MAX_YEAR_PROCESS}.`
    )
}

export function contractNumberSchema() {
  return z
    .string()
    .regex(RE.contract, "Formato esperado: 97/2023.")
    .refine((v) => numberBeforeSlash(v) > 0, "O número deve ser maior que zero.")
    .refine(
      (v) => yearAfterSlash(v) >= 2000 && yearAfterSlash(v) <= MAX_YEAR,
      `Ano inválido — esperado entre 2000 e ${MAX_YEAR}.`
    )
}

export function periodSchema() {
  return z
    .string()
    .regex(RE.period, "Competência: formato esperado AAAA-MM.")
    .refine(
      (v) => prefixYear(v) >= 2000 && prefixYear(v) <= MAX_YEAR,
      `Competência: ano inválido — esperado entre 2000 e ${MAX_YEAR}.`
    )
}

export function decimalSchema(message = "Informe um valor válido") {
  return z.string().regex(RE.decimal, message)
}

// ---------- opcionais (válido só quando preenchido) ----------

export function optionalSne(label = "SNE", minYear = 1990) {
  return z
    .string()
    .refine(
      (v) =>
        v === "" ||
        (RE.sne.test(v) &&
          prefixYear(v) >= minYear &&
          prefixYear(v) <= MAX_YEAR),
      `${label}: formato {ano}{seq} e ano entre ${minYear} e ${MAX_YEAR}.`
    )
}

export function optionalProcess() {
  return z
    .string()
    .refine(
      (v) =>
        v === "" ||
        (RE.process.test(v) &&
          yearAfterSlash(v) >= 1990 &&
          yearAfterSlash(v) <= MAX_YEAR_PROCESS),
      `Processo: formato 23080.003729/2026-38 e ano entre 1990 e ${MAX_YEAR_PROCESS}.`
    )
}

export function optionalDecimal(message = "Informe um valor válido") {
  return z.string().refine((v) => v === "" || RE.decimal.test(v), message)
}
