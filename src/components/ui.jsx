import { useEffect, useState } from 'react'
import { dec, lerValor } from '../utils.js'

export function Dif({ v }) {
  const cls = v < 0 ? 'neg' : v > 0 ? 'pos' : 'zero'
  return <span className={`d ${cls}`}>{v > 0 ? '+' : ''}{v}</span>
}

// Campo de valor em reais: aceita "1.318,32" e só grava ao sair do campo.
export function CampoValor({ valor, onSalvar, ...props }) {
  const [txt, setTxt] = useState(dec(valor))
  useEffect(() => { setTxt(dec(valor)) }, [valor])
  return (
    <input
      type="text" inputMode="decimal" value={txt} {...props}
      onChange={(e) => setTxt(e.target.value)}
      onBlur={() => { const n = lerValor(txt); onSalvar(n); setTxt(dec(n)) }}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
    />
  )
}
