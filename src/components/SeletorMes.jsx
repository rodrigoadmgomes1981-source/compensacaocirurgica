import { useEffect, useRef, useState } from 'react'
import { MESES, rotulo } from '../utils.js'
import { temLancamento } from '../storage.js'

// Janela para escolher a competência (mês/ano) a avaliar.
export default function SeletorMes({ meses, atual, onEscolher, onFechar }) {
  const hoje = new Date()
  const anoInicial = atual ? Number(atual.slice(0, 4)) : hoje.getFullYear()
  const [ano, setAno] = useState(anoInicial)
  const caixa = useRef(null)

  useEffect(() => {
    caixa.current?.focus()
    const esc = (e) => { if (e.key === 'Escape' && onFechar) onFechar() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onFechar])

  const anteriores = Object.keys(meses).sort().reverse()

  function situacao(id) {
    const m = meses[id]
    if (!m) return { txt: 'Sem lançamento', cls: 'vazio' }
    if (m.status === 'fechado') return { txt: 'Fechado', cls: 'closed' }
    if (temLancamento(m)) return { txt: 'Em lançamento', cls: 'open' }
    return { txt: 'Aberto, em branco', cls: 'open' }
  }

  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && onFechar) onFechar() }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="tituloSeletor" tabIndex={-1} ref={caixa}>
        <div className="modal-h">
          <div>
            <span className="eyebrow">Competência</span>
            <h2 id="tituloSeletor">Qual mês você quer avaliar?</h2>
          </div>
          {onFechar && <button className="ghost" onClick={onFechar} aria-label="Fechar">✕</button>}
        </div>

        <div className="ano-ctl">
          <button className="icon" onClick={() => setAno(ano - 1)} aria-label="Ano anterior">‹</button>
          <span className="ano num">{ano}</span>
          <button className="icon" onClick={() => setAno(ano + 1)} aria-label="Próximo ano">›</button>
        </div>

        <div className="meses-grid">
          {MESES.map((nome, i) => {
            const id = `${ano}-${String(i + 1).padStart(2, '0')}`
            const s = situacao(id)
            return (
              <button key={id} className={`mes-btn ${id === atual ? 'sel' : ''}`} onClick={() => onEscolher(id)}>
                <span className="mes-nome">{nome}</span>
                <span className={`mes-sit ${s.cls}`}>{s.txt}</span>
              </button>
            )
          })}
        </div>

        <p className="howto">
          Um mês sem lançamento abre com o quadro atual de cirurgias e metas e com o realizado em branco para preenchimento.
        </p>

        {anteriores.length > 0 && (
          <div>
            <div className="sec-title">Meses já abertos</div>
            <div className="chips-row">
              {anteriores.map((id) => (
                <button key={id} className="chip" aria-pressed={id === atual} onClick={() => onEscolher(id)}>{rotulo(id)}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
