import { calcular } from '../engine.js'
import { brl, hora, lerInteiro, rotulo } from '../utils.js'
import { Dif } from './ui.jsx'

// O realizado digitado fica em rascunho até ser salvo:
// - "Salvar <especialidade>" grava só aquela especialidade;
// - "Salvar todo o lançamento" grava todas de uma vez.
// A aba "Extras e descontos" considera apenas o que já foi salvo.
export default function Lancamento({
  mes, travado, rascunho, setRascunho, sujas, onSalvarEsp, onSalvarTudo,
  irPara, confirmarLimpar, setConfirmar,
}) {
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
    setRascunho((r) => {
      const dados = { ...r.dados, [eId]: { ...(r.dados[eId] || {}) } }
      const n = lerInteiro(valor)
      if (n === null) delete dados[eId][pId]
      else dados[eId][pId] = n
      return { ...r, dados }
    })
  }

  const qtdSujas = sujas.size
  const salvoGeral = mes.salvoGeralEm

  return (
    <>
      <div className="intro">
        <p className="howto">
          Preencha a quantidade realizada de cada cirurgia em {rotulo(mes.id)} e clique em <b>Salvar</b> na especialidade,
          ou em <b>Salvar todo o lançamento</b> ao final. A prévia de cada cartão é recalculada na hora.
        </p>
        {!travado && (confirmarLimpar ? (
          <span className="confirm">
            Apagar todo o realizado digitado em {rotulo(mes.id)}? (Só é gravado depois de salvar.)
            <button className="danger" onClick={() => { setRascunho((r) => ({ ...r, dados: {} })); setConfirmar(null) }}>Apagar</button>
            <button onClick={() => setConfirmar(null)}>Cancelar</button>
          </span>
        ) : (
          <button className="ghost" onClick={() => setConfirmar('limpar')}>Limpar realizado</button>
        ))}
      </div>

      <div className="grid">
        {mes.especialidades.map((e) => {
          const re = rascunho.dados[e.id] || {}
          const c = calcular(e, re)
          const faltas = c.descontos.reduce((s, x) => s + x.qtd, 0)
          const suja = sujas.has(e.id)
          const salvoEm = mes.salvoEm?.[e.id]
          return (
            <section className={`card ${suja ? 'suja' : ''}`} key={e.id}>
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
                            onKeyDown={(ev) => { if (ev.key === 'Enter' && suja) onSalvarEsp(e.id) }}
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
              <div className="card-save">
                <span className={`save-state ${suja ? 'pend' : 'ok'}`}>
                  {suja ? 'Alterações não salvas' : salvoEm ? `Salvo em ${hora(salvoEm)}` : 'Nenhum lançamento salvo'}
                </span>
                {!travado && (
                  <button className={suja ? 'primary' : ''} disabled={!suja} onClick={() => onSalvarEsp(e.id)}>
                    Salvar {e.nome}
                  </button>
                )}
              </div>
            </section>
          )
        })}
      </div>

      {!travado && (
        <div className={`save-bar ${qtdSujas ? 'pend' : ''}`}>
          <div className="save-bar-in">
            <span>
              {qtdSujas
                ? <><b>{qtdSujas}</b> {qtdSujas === 1 ? 'especialidade com alterações não salvas' : 'especialidades com alterações não salvas'}</>
                : salvoGeral ? `Todo o lançamento salvo em ${hora(salvoGeral)}` : 'Tudo salvo'}
            </span>
            <button className="primary" onClick={onSalvarTudo} disabled={!qtdSujas && !!salvoGeral}>
              Salvar todo o lançamento
            </button>
          </div>
        </div>
      )}
    </>
  )
}
