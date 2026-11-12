import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useBanco, validarBackup, novoMes } from './storage.js'
import { clone, rotulo, baixarArquivo, mesmoRealizado } from './utils.js'
import Lancamento from './components/Lancamento.jsx'
import Fechamento from './components/Fechamento.jsx'
import MetasRegras from './components/MetasRegras.jsx'
import SeletorMes from './components/SeletorMes.jsx'

const ABAS = [
  ['lanc', 'Lançamento do realizado'],
  ['fech', 'Extras e descontos'],
  ['cfg', 'Metas e regras'],
]

export default function App() {
  const { banco, setBanco, erro } = useBanco()
  const [mesId, setMesId] = useState(null)
  const [seletorAberto, setSeletorAberto] = useState(true)
  const [aba, setAba] = useState('lanc')
  const [aviso, setAviso] = useState('')
  const [confirmar, setConfirmar] = useState(null) // 'excluir' | 'limpar'
  const [trocaPendente, setTrocaPendente] = useState(null) // mês escolhido com rascunho não salvo
  // Rascunho do realizado do mês aberto: só vai para o banco ao clicar em Salvar.
  const [rascunho, setRascunho] = useState({ mesId: null, dados: {} })
  const inputImport = useRef(null)

  const mes = mesId ? banco.meses[mesId] : null
  const travado = !mes || mes.status === 'fechado'

  const sujas = useMemo(() => {
    const s = new Set()
    if (!mes || rascunho.mesId !== mes.id) return s
    for (const e of mes.especialidades) {
      if (!mesmoRealizado(rascunho.dados[e.id], mes.realizado?.[e.id])) s.add(e.id)
    }
    return s
  }, [mes, rascunho])
  const temPendencia = sujas.size > 0

  // Avisa o navegador ao fechar/recarregar a página com lançamentos não salvos.
  useEffect(() => {
    if (!temPendencia) return undefined
    const h = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [temPendencia])

  function abrirMes(id) {
    const existente = banco.meses[id]
    if (!existente) setBanco((b) => ({ ...b, meses: { ...b.meses, [id]: novoMes(id, b.quadro) } }))
    setRascunho({ mesId: id, dados: clone(existente?.realizado || {}) })
    setMesId(id)
    setSeletorAberto(false)
    setConfirmar(null)
    setTrocaPendente(null)
    setAba('lanc')
  }

  function escolherMes(id) {
    if (temPendencia && id !== mesId) {
      setSeletorAberto(false)
      setTrocaPendente(id)
      return
    }
    abrirMes(id)
  }

  function atualizarMes(fn) {
    setBanco((b) => {
      const n = clone(b)
      fn(n.meses[mesId])
      n.meses[mesId].atualizadoEm = new Date().toISOString()
      return n
    })
  }

  function salvarEspecialidade(eId) {
    const agora = new Date().toISOString()
    const nome = mes.especialidades.find((e) => e.id === eId)?.nome
    atualizarMes((m) => {
      m.realizado = m.realizado || {}
      m.realizado[eId] = clone(rascunho.dados[eId] || {})
      m.salvoEm = { ...(m.salvoEm || {}), [eId]: agora }
    })
    setAviso(`${nome} salvo.`)
  }

  function salvarTudo() {
    const agora = new Date().toISOString()
    atualizarMes((m) => {
      m.realizado = {}
      m.salvoEm = { ...(m.salvoEm || {}) }
      for (const e of m.especialidades) {
        m.realizado[e.id] = clone(rascunho.dados[e.id] || {})
        m.salvoEm[e.id] = agora
      }
      m.salvoGeralEm = agora
    })
    setAviso(`Todo o lançamento de ${rotulo(mesId)} foi salvo.`)
  }

  function trocarAba(k) {
    setAba(k)
  }

  function excluirMes() {
    setBanco((b) => {
      const n = clone(b)
      delete n.meses[mesId]
      return n
    })
    setMesId(null)
    setRascunho({ mesId: null, dados: {} })
    setConfirmar(null)
    setSeletorAberto(true)
  }

  function usarComoPadrao() {
    setBanco((b) => ({ ...b, quadro: clone(b.meses[mesId].especialidades) }))
    setAviso(`O quadro de ${rotulo(mesId)} passa a ser o padrão dos meses novos.`)
  }

  function exportarBackup() {
    const hoje = new Date().toISOString().slice(0, 10)
    baixarArquivo(`compensacao-cirurgica-backup-${hoje}.json`, JSON.stringify(banco, null, 2), 'application/json')
  }

  function importarBackup(ev) {
    const f = ev.target.files?.[0]
    ev.target.value = ''
    if (!f) return
    f.text().then((txt) => {
      try {
        const d = JSON.parse(txt)
        if (!validarBackup(d)) throw new Error()
        setBanco(d)
        setMesId(null)
        setRascunho({ mesId: null, dados: {} })
        setSeletorAberto(true)
        setAviso('Backup importado.')
      } catch {
        setAviso('Arquivo inválido. Escolha um backup exportado por este sistema.')
      }
    })
  }

  const fecharSeletor = useCallback(() => setSeletorAberto(false), [])

  return (
    <>
      <header className="top">
        <div className="wrap">
          <div className="top-row">
            <div className="brand">
              <span className="eyebrow">Fechamento de metas cirúrgicas</span>
              <h1>Compensação Cirúrgica</h1>
            </div>
            <div className="month-ctl">
              {mes && (
                <>
                  <span className="mes-atual">{rotulo(mes.id)}</span>
                  <span className={`pill ${mes.status === 'fechado' ? 'closed' : 'open'}`}>
                    {mes.status === 'fechado' ? 'Fechado' : 'Em lançamento'}
                  </span>
                </>
              )}
              <button className="primary" onClick={() => setSeletorAberto(true)}>{mes ? 'Trocar mês' : 'Selecionar mês'}</button>
              <button className="ghost" onClick={exportarBackup}>Exportar backup</button>
              <button className="ghost" onClick={() => inputImport.current?.click()}>Importar backup</button>
              <input ref={inputImport} type="file" accept="application/json,.json" hidden onChange={importarBackup} />
            </div>
          </div>
          {mes && (
            <nav className="tabs" role="tablist">
              {ABAS.map(([k, l]) => (
                <button key={k} role="tab" aria-selected={aba === k} onClick={() => trocarAba(k)}>
                  {l}{k === 'lanc' && temPendencia && <span className="dot" aria-label="alterações não salvas" />}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="wrap">
        {erro && <div className="banner err">{erro}</div>}

        {trocaPendente && (
          <div className="banner warn">
            <span>
              Há lançamentos não salvos em {rotulo(mesId)}. O que fazer antes de abrir {rotulo(trocaPendente)}?
            </span>
            <span className="confirm">
              <button className="primary" onClick={() => { salvarTudo(); abrirMes(trocaPendente) }}>Salvar e trocar</button>
              <button className="danger" onClick={() => abrirMes(trocaPendente)}>Descartar e trocar</button>
              <button onClick={() => setTrocaPendente(null)}>Cancelar</button>
            </span>
          </div>
        )}

        {aviso && (
          <div className="banner">
            <span>{aviso}</span>
            <button className="ghost" onClick={() => setAviso('')}>Ok</button>
          </div>
        )}

        {!mes && (
          <div className="card empty">
            <h2>Selecione o mês que deseja avaliar</h2>
            <p className="howto">O mês abre com o quadro atual de cirurgias e metas e com o realizado em branco para preenchimento.</p>
            <button className="primary" onClick={() => setSeletorAberto(true)}>Selecionar mês</button>
          </div>
        )}

        {mes && mes.status === 'fechado' && (
          <div className="banner">
            <span>{rotulo(mes.id)} está fechado. Os números ficam travados até o mês ser reaberto.</span>
            <button onClick={() => atualizarMes((m) => { m.status = 'aberto' })}>Reabrir mês</button>
          </div>
        )}

        {mes && aba !== 'lanc' && temPendencia && (
          <div className="banner warn">
            <span>
              {sujas.size === 1 ? 'Uma especialidade tem' : `${sujas.size} especialidades têm`} lançamentos não salvos.
              Os cálculos desta aba consideram só o que já foi salvo.
            </span>
            <span className="confirm">
              <button className="primary" onClick={salvarTudo}>Salvar todo o lançamento</button>
              <button onClick={() => setAba('lanc')}>Voltar ao lançamento</button>
            </span>
          </div>
        )}

        {mes && aba === 'lanc' && (
          <Lancamento
            mes={mes} travado={travado} rascunho={rascunho} setRascunho={setRascunho} sujas={sujas}
            onSalvarEsp={salvarEspecialidade} onSalvarTudo={salvarTudo}
            irPara={setAba} confirmarLimpar={confirmar === 'limpar'} setConfirmar={setConfirmar}
          />
        )}
        {mes && aba === 'fech' && (
          <Fechamento mes={mes} onAlternarStatus={() => atualizarMes((m) => { m.status = m.status === 'fechado' ? 'aberto' : 'fechado' })} />
        )}
        {mes && aba === 'cfg' && (
          <MetasRegras mes={mes} travado={travado} atualizarMes={atualizarMes} onUsarComoPadrao={usarComoPadrao} />
        )}

        {mes && (
          <div className="footer-acts">
            {confirmar === 'excluir' ? (
              <span className="confirm">
                Excluir {rotulo(mes.id)} e todo o realizado lançado?
                <button className="danger" onClick={excluirMes}>Excluir</button>
                <button onClick={() => setConfirmar(null)}>Cancelar</button>
              </span>
            ) : (
              <button className="ghost danger" onClick={() => setConfirmar('excluir')}>Excluir {rotulo(mes.id)}</button>
            )}
            <span className="muted small">Os dados ficam salvos neste navegador. Exporte um backup com frequência.</span>
          </div>
        )}
      </main>

      {seletorAberto && (
        <SeletorMes meses={banco.meses} atual={mesId} onEscolher={escolherMes} onFechar={mes ? fecharSeletor : null} />
      )}
    </>
  )
}
