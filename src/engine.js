// Motor de compensação cirúrgica.
//
// Para cada especialidade:
// 1. Diferença = realizado − meta. Positivo = excedente; negativo = falta.
// 2. As regras rodam na ordem cadastrada. Cada regra diz:
//    "A excedentes de [origem] compensam B faltas de [destino]".
//    Ela usa só o excedente que ainda sobra depois das regras anteriores,
//    em blocos inteiros de A (um bloco cobre até B faltas).
// 3. O que continua faltando vira DESCONTO (qtd × valor unitário).
// 4. O que continua sobrando vira EXTRA (qtd × valor unitário).
// 5. Repasse = repasse contratado + extras − descontos.

export const round2 = (n) => Math.round(n * 100) / 100

export function calcular(esp, realizadoEsp = {}) {
  const procs = (esp.procedimentos || []).map((p, idx) => {
    const meta = Number(p.meta) || 0
    const real = Number(realizadoEsp?.[p.id]) || 0
    const valor = p.valor === null || p.valor === undefined || p.valor === '' ? null : Number(p.valor)
    return {
      id: p.id, nome: p.nome, valor, idx, meta, real,
      diff: real - meta,
      excBruto: Math.max(0, real - meta),
      defBruto: Math.max(0, meta - real),
      exc: Math.max(0, real - meta),
      def: Math.max(0, meta - real),
      usado: 0,
      coberto: 0,
    }
  })

  const passos = []
  ;(esp.regras || []).forEach((r, ri) => {
    const orig = procs.filter((p) => (r.origem || []).includes(p.id))
    const dest = procs.filter((p) => (r.destino || []).includes(p.id))
    const a = Math.max(1, Math.floor(Number(r.qtdOrigem) || 1))
    const b = Math.max(1, Math.floor(Number(r.qtdDestino) || 1))
    if (!orig.length || !dest.length) {
      passos.push({ ri, r, a, b, aplicada: false, motivo: 'regra incompleta' })
      return
    }
    const totE = orig.reduce((s, p) => s + p.exc, 0)
    const totD = dest.reduce((s, p) => s + p.def, 0)
    if (totD === 0) {
      passos.push({ ri, r, a, b, aplicada: false, semFaltas: true, motivo: 'sem faltas a compensar' })
      return
    }
    if (totE < a) {
      passos.push({
        ri, r, a, b, aplicada: false,
        motivo: totE === 0 ? 'sem excedentes disponíveis' : `excedente insuficiente (há ${totE}, precisa de ${a})`,
      })
      return
    }
    const k = Math.min(Math.floor(totE / a), Math.ceil(totD / b))
    let usar = k * a
    let cobrir = Math.min(k * b, totD)
    const usados = []
    const cobertos = []
    for (const p of orig) {
      const n = Math.min(p.exc, usar)
      if (n > 0) { p.exc -= n; p.usado += n; usar -= n; usados.push({ p, n }) }
    }
    for (const p of dest) {
      const n = Math.min(p.def, cobrir)
      if (n > 0) { p.def -= n; p.coberto += n; cobrir -= n; cobertos.push({ p, n }) }
    }
    passos.push({ ri, r, a, b, k, aplicada: true, usados, cobertos })
  })

  const descontos = procs.filter((p) => p.def > 0)
    .map((p) => ({ p, qtd: p.def, valor: p.valor === null ? null : round2(p.def * p.valor) }))
  const extras = procs.filter((p) => p.exc > 0)
    .map((p) => ({ p, qtd: p.exc, valor: p.valor === null ? null : round2(p.exc * p.valor) }))
  const totDesc = round2(descontos.reduce((s, x) => s + (x.valor || 0), 0))
  const totExtra = round2(extras.reduce((s, x) => s + (x.valor || 0), 0))
  const semValor = [...descontos, ...extras].filter((x) => x.valor === null).map((x) => x.p.nome)
  const fixo = Number(esp.repasseFixo) || 0

  return {
    procs, passos, descontos, extras, totDesc, totExtra, semValor, fixo,
    metaTot: procs.reduce((s, p) => s + p.meta, 0),
    realTot: procs.reduce((s, p) => s + p.real, 0),
    compensadas: procs.reduce((s, p) => s + p.coberto, 0),
    repasse: round2(fixo + totExtra - totDesc),
  }
}

export function calcularMes(mes) {
  const linhas = (mes?.especialidades || []).map((e) => ({ e, c: calcular(e, mes.realizado?.[e.id] || {}) }))
  const t = linhas.reduce((t, { c }) => ({
    meta: t.meta + c.metaTot, real: t.real + c.realTot, comp: t.comp + c.compensadas,
    extras: t.extras + c.totExtra, descontos: t.descontos + c.totDesc,
    fixo: t.fixo + c.fixo, repasse: t.repasse + c.repasse,
  }), { meta: 0, real: 0, comp: 0, extras: 0, descontos: 0, fixo: 0, repasse: 0 })
  for (const k of ['extras', 'descontos', 'fixo', 'repasse']) t[k] = round2(t[k])
  return { linhas, totais: t }
}
