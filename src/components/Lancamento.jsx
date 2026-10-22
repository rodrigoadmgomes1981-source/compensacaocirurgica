import { calcular } from '../engine.js'
import { brl, lerInteiro, rotulo } from '../utils.js'
import { Dif } from './ui.jsx'

export default function Lancamento({ mes, travado, atualizarMes, irPara, confirmarLimpar, setConfirmar }) {
  if (!mes.especialidades.length) {
    return (
      <div className="card empty">
        <h2>Nenhuma especialidade neste mês</h2>
        <p className="howto">Cadastre especialidades, cirurgias e metas em “Metas e regras”.</p>
        <button onClick={() => irPara('cfg')}>Ir para Metas e regras</button>
      </div>
    )
  }

  function setReal(eId, pId, valor) {
    atualizarMes((m) => {
      m.realizado = m.realizado || {}
      m.realizado[eId] = m.realizado[eId] || {}
      const n = lerInteiro(valor)
      if (n === null) delete m.realizado[eId][pId]
      else m.realizado[eId][pId] = n
    })
  }

  return (
    <>
      <div className="intro">
        <p className="howto">
          Preencha a quantidade realizada de cada cirurgia em {rotulo(mes.id)}. A diferença e o resultado da compensação
          são recalculados na hora. Veja o detalhamento na aba “Extras e descontos”.
        </p>
        {!travado && (confirmarLimpar ? (
          <span className="confirm">
            Apagar todo o realizado de {rotulo(mes.id)}?
            <button className="danger" onClick={() => { atualizarMes((m) => { m.realizado = {} }); setConfirmar(null) }}>Apagar</button>
            <button onClick={() => setConfirmar(null)}>Cancelar</button>
          </span>
        ) : (
          <button className="ghost" onClick={() => setConfirmar('limpar')}>Limpar realizado</button>
        ))}
      </div>
      <div className="grid">
        {mes.especialidades.map((e) => {
          const re = mes.realizado?.[e.id] || {}
          const c = calcular(e, re)
          const faltas = c.descontos.reduce((s, x) => s + x.qtd, 0)
          return (
            <section className="card" key={e.id}>
              <div className="card-h">
                <h2>{e.nome}</h2>
                {faltas > 0
                  ? <span className="pill neg">{faltas} sem compensação</span>
                  : <span className="pill pos">Meta coberta</span>}
              </div>
              <div className="card-b scroll">
                <table>
                  <thead>
                    <tr><th>Cirurgia</th><th className="n">Meta</th><th className="n">Realizado</th><th className="n">Diferença</th></tr>
                  </thead>
                  <tbody>
                    {c.procs.map((p) => (
                      <tr key={p.id}>
                        <td>{p.nome}</td>
                        <td className="n">{p.meta}</td>
                        <td className="n">
                          <input
                            className="cell" type="text" inputMode="numeric" placeholder="0"
                            id={`r-${e.id}-${p.id}`} aria-label={`Realizado ${p.nome}`}
                            value={re[p.id] ?? ''} disabled={travado}
                            onChange={(ev) => setReal(e.id, p.id, ev.target.value)}
                          />
                        </td>
                        <td className="n"><Dif v={p.diff} /></td>
                      </tr>
                    ))}
                    <tr className="tot">
                      <td>Total</td><td className="n">{c.metaTot}</td><td className="n">{c.realTot}</td>
                      <td className="n"><Dif v={c.realTot - c.metaTot} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="card-f">
                <span>Compensadas <b>{c.compensadas}</b></span>
                <span>Extras <b className="pos-text">{brl(c.totExtra)}</b></span>
                <span>Descontos <b className="neg-text">{brl(c.totDesc)}</b></span>
                <span>Repasse <b>{brl(c.repasse)}</b></span>
              </div>
            </section>
          )
        })}
      </div>
    </>
  )
}
