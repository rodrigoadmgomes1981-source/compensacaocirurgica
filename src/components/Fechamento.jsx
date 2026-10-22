import { calcularMes, round2 } from '../engine.js'
import { brl, rotulo, baixarArquivo } from '../utils.js'
import { Dif } from './ui.jsx'

const Lista = ({ itens }) => itens.map((x, i) => (
  <span key={x.p.id}>{i > 0 && ' + '}<b className="num">{x.n}</b> {x.p.nome}</span>
))

export default function Fechamento({ mes, onAlternarStatus }) {
  const { linhas, totais: T } = calcularMes(mes)
  const faltandoValor = linhas.filter((x) => x.c.semValor.length)

  function baixarCSV() {
    const f = (n) => (n === null || n === undefined ? '' : String(n).replace('.', ','))
    const q = (s) => (typeof s === 'number' ? String(s) : `"${String(s).replace(/"/g, '""')}"`)
    const rows = [['Competência', 'Especialidade', 'Cirurgia', 'Meta', 'Realizado', 'Diferença', 'Usadas na compensação',
      'Faltas cobertas', 'Falta final (desconto)', 'Excedente final (extra)', 'Valor unitário', 'Desconto R$', 'Extra R$']]
    const resumo = [['Especialidade', 'Meta', 'Realizado', 'Compensadas', 'Contratado', 'Extras', 'Descontos', 'Repasse final']]
    for (const { e, c } of linhas) {
      for (const p of c.procs) {
        rows.push([rotulo(mes.id), e.nome, p.nome, p.meta, p.real, p.diff, p.usado, p.coberto, p.def, p.exc, f(p.valor),
          p.valor === null ? '' : f(round2(p.def * p.valor)), p.valor === null ? '' : f(round2(p.exc * p.valor))])
      }
      resumo.push([e.nome, c.metaTot, c.realTot, c.compensadas, f(c.fixo), f(c.totExtra), f(c.totDesc), f(c.repasse)])
    }
    resumo.push(['TOTAL', T.meta, T.real, T.comp, f(T.fixo), f(T.extras), f(T.descontos), f(T.repasse)])
    const csv = '﻿' + [...rows, [], ['RESUMO'], ...resumo].map((r) => r.map(q).join(';')).join('\r\n')
    baixarArquivo(`compensacao-cirurgica-${mes.id}.csv`, csv, 'text/csv;charset=utf-8')
  }

  return (
    <>
      {T.real === 0 && (
        <div className="banner warn">O realizado de {rotulo(mes.id)} ainda está em branco. Preencha na aba “Lançamento do realizado”.</div>
      )}
      {faltandoValor.length > 0 && (
        <div className="banner warn">
          <span>
            <b>Valor unitário não cadastrado</b> para cirurgias que geram desconto ou extra:{' '}
            {faltandoValor.map((x) => `${x.e.nome} (${x.c.semValor.join(', ')})`).join('; ')}.
            Essas linhas entram como R$ 0,00 até o valor ser informado em “Metas e regras”.
          </span>
        </div>
      )}

      <div className="kpis">
        <div className="kpi"><div className="eyebrow">Repasse final</div><div className="v">{brl(T.repasse)}</div><div className="muted small">Contratado {brl(T.fixo)}</div></div>
        <div className="kpi pos"><div className="eyebrow">Extras a pagar</div><div className="v">+ {brl(T.extras)}</div></div>
        <div className="kpi neg"><div className="eyebrow">Descontos a aplicar</div><div className="v">− {brl(T.descontos)}</div></div>
        <div className="kpi"><div className="eyebrow">Cirurgias</div><div className="v">{T.real} / {T.meta}</div><div className="muted small">{T.comp} faltas compensadas</div></div>
      </div>

      <section className="card">
        <div className="card-h">
          <h2>Fechamento geral · {rotulo(mes.id)}</h2>
          <button onClick={baixarCSV}>Baixar planilha (CSV)</button>
          <button onClick={onAlternarStatus}>{mes.status === 'fechado' ? 'Reabrir mês' : 'Fechar mês'}</button>
        </div>
        <div className="card-b scroll">
          <table>
            <thead><tr>
              <th>Especialidade</th><th className="n">Meta</th><th className="n">Realizado</th><th className="n">Compensadas</th>
              <th className="n">Contratado</th><th className="n">Extras</th><th className="n">Descontos</th><th className="n">Repasse final</th>
            </tr></thead>
            <tbody>
              {linhas.map(({ e, c }) => (
                <tr key={e.id}>
                  <td><a href={`#esp-${e.id}`}>{e.nome}</a></td>
                  <td className="n">{c.metaTot}</td><td className="n">{c.realTot}</td><td className="n">{c.compensadas}</td>
                  <td className="n">{brl(c.fixo)}</td>
                  <td className="n pos-text">{brl(c.totExtra)}</td>
                  <td className="n neg-text">{brl(c.totDesc)}</td>
                  <td className="n"><b>{brl(c.repasse)}</b></td>
                </tr>
              ))}
              <tr className="tot">
                <td>Total</td><td className="n">{T.meta}</td><td className="n">{T.real}</td><td className="n">{T.comp}</td>
                <td className="n">{brl(T.fixo)}</td><td className="n">{brl(T.extras)}</td><td className="n">{brl(T.descontos)}</td><td className="n">{brl(T.repasse)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {linhas.map(({ e, c }) => <Especialidade key={e.id} e={e} c={c} />)}

      <p className="howto">
        Ordem aplicada: as regras de cada especialidade rodam de cima para baixo, usando só o excedente que ainda sobra.
        O que continuar faltando gera desconto pelo valor unitário; o que continuar sobrando gera extra.
        Antes de efetivar descontos e repasses, os critérios financeiros e as equivalências precisam estar formalmente aprovados.
      </p>
    </>
  )
}

function Especialidade({ e, c }) {
  const semFaltas = !c.procs.some((p) => p.defBruto > 0)
  const linhas = [
    ...c.descontos.map((x) => ({ t: 'Desconto', x, cls: 'neg' })),
    ...c.extras.map((x) => ({ t: 'Extra', x, cls: 'pos' })),
  ]
  return (
    <section className="card" id={`esp-${e.id}`}>
      <div className="card-h">
        <h2>{e.nome}</h2>
        <span className="muted num">Meta {c.metaTot} · Realizado {c.realTot}</span>
      </div>
      <div className="card-b">
        <div className="cols">
          <div className="scroll">
            <div className="sec-title">Conferência</div>
            <table>
              <thead><tr>
                <th>Cirurgia</th><th className="n">Meta</th><th className="n">Real.</th><th className="n">Dif.</th>
                <th className="n">Usadas</th><th className="n">Cobertas</th><th className="n">Saldo</th>
              </tr></thead>
              <tbody>
                {c.procs.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nome}</td><td className="n">{p.meta}</td><td className="n">{p.real}</td>
                    <td className="n"><Dif v={p.diff} /></td>
                    <td className="n">{p.usado || ''}</td><td className="n">{p.coberto || ''}</td>
                    <td className="n"><Dif v={p.exc - p.def} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <div className="sec-title">Passo a passo</div>
            <ol className="steps">
              {c.passos.map((p) => {
                const tag = <span className="muted"> ({p.a}:{p.b}{p.r.obs ? ` · ${p.r.obs}` : ''})</span>
                if (p.aplicada) return <li key={p.ri}>Usamos <Lista itens={p.usados} /> para compensar <Lista itens={p.cobertos} />{tag}</li>
                if (p.semFaltas || p.motivo === 'regra incompleta') return null
                return <li key={p.ri} className="skip">Regra {p.ri + 1} não aplicada: {p.motivo}{tag}</li>
              })}
              {semFaltas && <li>Nenhuma falta no mês: não há compensação a fazer.</li>}
              {c.descontos.length > 0 && (
                <li>Restam sem compensação: {c.descontos.map((x) => `${x.qtd} ${x.p.nome}`).join(', ')}. Viram desconto.</li>
              )}
              {c.extras.length > 0 && (
                <li>Sobram como extra: {c.extras.map((x) => `${x.qtd} ${x.p.nome}`).join(', ')}. Viram pagamento adicional.</li>
              )}
            </ol>
          </div>
        </div>

        <div className="sec-title" style={{ marginTop: 14 }}>Resultado</div>
        {linhas.length ? (
          <div className="scroll">
            <table>
              <thead><tr><th>Situação</th><th>Cirurgia</th><th className="n">Qtd.</th><th className="n">Valor unit.</th><th className="n">Valor</th></tr></thead>
              <tbody>
                {linhas.map(({ t, x, cls }) => (
                  <tr key={t + x.p.id}>
                    <td><span className={`pill ${cls}`}>{t}</span></td>
                    <td>{x.p.nome}</td>
                    <td className="n">{x.qtd}</td>
                    <td className="n">{x.p.valor === null ? <span className="pill warn">sem valor</span> : brl(x.p.valor)}</td>
                    <td className={`n ${cls}-text`}>{x.valor === null ? '—' : `${cls === 'neg' ? '− ' : '+ '}${brl(x.valor)}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="muted">Sem extras nem descontos.</p>}

        <div className="formula">
          Repasse: {brl(c.fixo)} + {brl(c.totExtra)} − {brl(c.totDesc)} = <b>{brl(c.repasse)}</b>
        </div>
      </div>
    </section>
  )
}
