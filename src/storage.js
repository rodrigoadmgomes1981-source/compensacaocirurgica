import { useEffect, useState } from 'react'
import { QUADRO_PADRAO } from './seed.js'
import { clone } from './utils.js'

// Os dados ficam no navegador (localStorage). Use "Exportar backup" para
// guardar uma cópia ou levar os dados para outro computador.
//
// Estrutura:
// {
//   quadro: [especialidades...]          → quadro padrão usado por meses novos
//   meses:  { "2026-10": { id, status, especialidades, realizado, atualizadoEm } }
// }
const CHAVE = 'compensacao-cirurgica:v2'

function carregar() {
  try {
    const raw = localStorage.getItem(CHAVE)
    if (raw) {
      const d = JSON.parse(raw)
      if (validarBackup(d)) return d
    }
  } catch { /* armazenamento indisponível */ }
  return { quadro: clone(QUADRO_PADRAO), meses: {} }
}

export function useBanco() {
  const [banco, setBanco] = useState(carregar)
  const [erro, setErro] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(banco))
      setErro('')
    } catch {
      setErro('Não foi possível salvar neste navegador. Exporte um backup para não perder os dados.')
    }
  }, [banco])

  return { banco, setBanco, erro }
}

export function validarBackup(d) {
  if (!d || typeof d !== 'object' || !Array.isArray(d.quadro) || !d.meses || typeof d.meses !== 'object') return false
  return Object.values(d.meses).every((m) => m && Array.isArray(m.especialidades))
}

// Um mês novo começa com o quadro padrão e o realizado em branco.
export function novoMes(id, quadro) {
  return { id, status: 'aberto', atualizadoEm: new Date().toISOString(), especialidades: clone(quadro), realizado: {} }
}

export function temLancamento(mes) {
  return Object.values(mes?.realizado || {}).some((e) => Object.keys(e || {}).length > 0)
}
