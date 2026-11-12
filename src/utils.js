export const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

export const brl = (n) =>
  n === null || n === undefined ? '—' : Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const dec = (n) =>
  n === null || n === undefined || n === '' ? '' : Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const rotulo = (id) => {
  const [y, m] = String(id).split('-')
  return `${MESES[Number(m) - 1] || m}/${y}`
}

export const hora = (iso) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''

// Compara o realizado de uma especialidade ignorando campos vazios.
export function mesmoRealizado(a = {}, b = {}) {
  const limpa = (o) => Object.entries(o || {}).filter(([, v]) => v !== null && v !== undefined && v !== '')
  const ea = limpa(a)
  const eb = limpa(b)
  if (ea.length !== eb.length) return false
  return ea.every(([k, v]) => Number(b[k]) === Number(v))
}

export const novoId =() => Math.random().toString(36).slice(2, 8)
export const clone = (o) => JSON.parse(JSON.stringify(o))

export function proximoMes(id) {
  let [y, m] = id.split('-').map(Number)
  m += 1
  if (m > 12) { m = 1; y += 1 }
  return `${y}-${String(m).padStart(2, '0')}`
}

// Aceita "1.318,32", "1318,32" ou "1318.32"
export function lerValor(v) {
  let s = String(v).trim()
  if (s === '') return null
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
  const n = Number(s.replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : null
}

export function lerInteiro(v) {
  const s = String(v).replace(/\D/g, '')
  return s === '' ? null : parseInt(s, 10)
}

export function baixarArquivo(nome, conteudo, tipo) {
  const blob = new Blob([conteudo], { type: tipo })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
