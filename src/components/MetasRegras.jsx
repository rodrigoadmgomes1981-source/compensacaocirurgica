import { useState } from 'react'
import { lerInteiro, novoId, rotulo } from '../utils.js'
import { CampoValor } from './ui.jsx'

export default function MetasRegras({ mes, travado, atualizarMes, onUsarComoPadrao }) {
  const [confirmarEsp, setConfirmarEsp] = useState(null)
  const L = travado

  const naEsp = (eId, fn) => atualizarMes((m) => fn(m.especialidades.find((x) => x.id === eId), m))

  return (
    <>
      <div className="intro">
        <p className="howto">
          As metas, valores e regras abaixo valem para <b>{rotulo(mes.id)}</b>. As regras de cada especialidade são
          aplicadas na ordem numerada: a regra 1 usa o excedente primeiro, a 2 usa o que sobrou, e assim por diante.
        </p>
        {!L && <button onClick={onUsarComoPadrao}>Usar este quadro nos próximos meses</button>}
      </div>

      {mes.especialidades.map((e) => (
        <section className="card" key={e.id}>
          <div className="card-h end">
            <label className="field grow">
              <span className="eyebrow">Especialidade</span>
              <input type="text" className="name" value={e.nome} disabled={L}
                onChange={(ev) => naEsp(e.id, (x) => { x.nome = ev.target.value })} />
            </label>
            <label className="field">
              <span className="eyebrow">Repasse contratado (R$)</span>
              <CampoValor className="cell wide" valor={e.repasseFixo} disabled={L}
                onSalvar={(n) => naEsp(e.id, (x) => { x.repasseFixo = n || 0 })} />
            </label>
            {!L && (confirmarEsp === e.id ? (
              <span className="confirm">
                Excluir {e.nome} deste mês?
                <button className="danger" onClick={() => {
                  atualizarMes((m) => { m.especialidades = m.especialidades.filter((x) => x.id !== e.id); if (m.realizado) delete m.realizado[e.id] })
                  setConfirmarEsp(null)
                }}>Excluir</button>
                <button onClick={() => setConfirmarEsp(null)}>Cancelar</button>
              </span>
            ) : <button className="ghost danger" onClick={() => setConfirmarEsp(e.id)}>Excluir especialidade</button>)}
          </div>

          <div className="card-b">
            <div className="cols wide">
              <div className="scroll">
                <div className="sec-title">Cirurgias e metas</div>
                <table>
                  <thead><tr><th>Cirurgia</th><th className="n">Meta</th><th className="n">Valor unit. (R$)</th><th /></tr></thead>
                  <tbody>
                    {e.procedimentos.map((p) => (
                      <tr key={p.id}>
                        <td><input type="text" className="name" value={p.nome} disabled={L} aria-label="Nome da cirurgia"
                          onChange={(ev) => naEsp(e.id, (x) => { x.procedimentos.find((y) => y.id === p.id).nome = ev.target.value })} /></td>
                        <td className="n"><input type="text" inputMode="numeric" className="cell" value={p.meta ?? ''} disabled={L} aria-label={`Meta ${p.nome}`}
                          onChange={(ev) => naEsp(e.id, (x) => { x.procedimentos.find((y) => y.id === p.id).meta = lerInteiro(ev.target.value) || 0 })} /></td>
                        <td className="n"><CampoValor className="cell wide" placeholder="não informado" valor={p.valor} disabled={L} aria-label={`Valor ${p.nome}`}
                          onSalvar={(n) => naEsp(e.id, (x) => { x.procedimentos.find((y) => y.id === p.id).valor = n })} /></td>
                        <td className="n">{!L && (
                          <button className="ghost danger icon" aria-label={`Remover ${p.nome}`} onClick={() => naEsp(e.id, (x, m) => {
                            x.procedimentos = x.procedimentos.filter((y) => y.id !== p.id)
                            x.regras.forEach((r) => { r.origem = r.origem.filter((y) => y !== p.id); r.destino = r.destino.filter((y) => y !== p.id) })
                            if (m.realizado?.[e.id]) delete m.realizado[e.id][p.id]
                          })}>×</button>
                        )}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!L && <button className="mt" onClick={() => naEsp(e.id, (x) => { x.procedimentos.push({ id: novoId(), nome: 'Nova cirurgia', meta: 0, valor: null }) })}>Adicionar cirurgia</button>}
              </div>

              <div>
                <div className="sec-title">Regras de compensação (ordem de aplicação)</div>
                <div className="rules">
                  {(e.regras || []).length === 0 && <p className="muted">Nenhuma regra. Faltas viram desconto direto.</p>}
                  {(e.regras || []).map((r, i) => <Regra key={r.id} e={e} r={r} i={i} L={L} naEsp={naEsp} />)}
                </div>
                {!L && <button className="mt" onClick={() => naEsp(e.id, (x) => { x.regras = x.regras || []; x.regras.push({ id: novoId(), origem: [], qtdOrigem: 1, destino: [], qtdDestino: 1, obs: '' }) })}>Adicionar regra</button>}
              </div>
            </div>
          </div>
        </section>
      ))}

      {!L && (
        <div><button onClick={() => atualizarMes((m) => { m.especialidades.push({ id: novoId(), nome: 'Nova especialidade', repasseFixo: 0, procedimentos: [], regras: [] }) })}>
          Adicionar especialidade
        </button></div>
      )}
    </>
  )
}

function Regra({ e, r, i, L, naEsp }) {
  const muda = (fn) => naEsp(e.id, (x) => fn(x.regras.find((y) => y.id === r.id), x))
  const chips = (lado) => e.procedimentos.map((p) => (
    <button key={p.id} className="chip" aria-pressed={(r[lado] || []).includes(p.id)} disabled={L}
      onClick={() => muda((rr) => { rr[lado] = rr[lado].includes(p.id) ? rr[lado].filter((y) => y !== p.id) : [...rr[lado], p.id] })}>
      {p.nome}
    </button>
  ))
  const mover = (d) => naEsp(e.id, (x) => {
    const j = i + d
    if (j < 0 || j >= x.regras.length) return
    ;[x.regras[i], x.regras[j]] = [x.regras[j], x.regras[i]]
  })
  return (
    <div className="rule">
      <span className="ord">{i + 1}</span>
      <div className="body">
        <div className="line">
          <input className="cell tiny" type="text" inputMode="numeric" value={r.qtdOrigem} disabled={L} aria-label="Quantidade de origem"
            onChange={(ev) => muda((rr) => { rr.qtdOrigem = lerInteiro(ev.target.value) || 1 })} />
          <span className="muted">excedente(s) de</span>
        </div>
        <div className="line">{chips('origem')}</div>
        <div className="line">
          <span className="muted">compensam</span>
          <input className="cell tiny" type="text" inputMode="numeric" value={r.qtdDestino} disabled={L} aria-label="Quantidade compensada"
            onChange={(ev) => muda((rr) => { rr.qtdDestino = lerInteiro(ev.target.value) || 1 })} />
          <span className="muted">falta(s) de</span>
        </div>
        <div className="line">{chips('destino')}</div>
        <input type="text" value={r.obs || ''} placeholder="Observação (ex.: mesmo peso)" disabled={L}
          onChange={(ev) => muda((rr) => { rr.obs = ev.target.value })} />
      </div>
      {!L && (
        <div className="acts">
          <button className="icon" disabled={i === 0} onClick={() => mover(-1)} aria-label="Subir regra">↑</button>
          <button className="icon" disabled={i === e.regras.length - 1} onClick={() => mover(1)} aria-label="Descer regra">↓</button>
          <button className="icon danger" onClick={() => naEsp(e.id, (x) => { x.regras = x.regras.filter((y) => y.id !== r.id) })} aria-label="Excluir regra">×</button>
        </div>
      )}
    </div>
  )
}
