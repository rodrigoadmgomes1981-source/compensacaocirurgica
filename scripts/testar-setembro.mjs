// Confere o motor com os números do documento de Setembro/2026.
// Uso: npm test
import { readFileSync } from 'node:fs'
import { QUADRO_PADRAO } from '../src/seed.js'
import { calcularMes } from '../src/engine.js'

const realizado = JSON.parse(readFileSync(new URL('./realizado-setembro.json', import.meta.url)))
const { linhas, totais } = calcularMes({ especialidades: QUADRO_PADRAO, realizado })
const esperado = {
  Urologia: [900, 11413.2, 29486.8], 'Cirurgia geral': [610, 7489.08, 47120.92], Ginecologia: [2715, 0, 42715],
  Ortopedia: [16530, 0, 61530], Otorrinolaringologia: [11250, 0, 41250], 'Cirurgia vascular': [0, 0, 46700],
}
let ok = true
for (const { e, c } of linhas) {
  const [ex, de, rep] = esperado[e.nome]
  const certo = c.totExtra === ex && c.totDesc === de && c.repasse === rep
  ok &&= certo
  console.log(`${certo ? 'OK ' : 'ERRO'} ${e.nome}: extras ${c.totExtra} | descontos ${c.totDesc} | repasse ${c.repasse}`)
}
console.log(`Total: extras ${totais.extras} | descontos ${totais.descontos} | repasse ${totais.repasse}`)
if (!ok || totais.repasse !== 268802.72) { console.error('Divergência em relação ao documento.'); process.exit(1) }
console.log('Todos os valores batem com o documento de Setembro/2026.')
