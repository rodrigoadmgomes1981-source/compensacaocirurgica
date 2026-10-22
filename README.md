# Compensação Cirúrgica

Sistema para lançar o realizado mensal de cirurgias por especialidade e calcular, a partir do quadro de metas, as compensações, os **extras a pagar** e os **descontos a aplicar**.

## Como usar
1. Ao abrir, escolha na janela o **mês que deseja avaliar** (use ‹ › para mudar o ano). Um mês sem lançamento abre com o quadro atual de cirurgias e metas e com o **realizado em branco**.
2. Em **Lançamento do realizado**, preencha a quantidade feita de cada cirurgia.
3. Em **Extras e descontos**, veja o fechamento geral, o passo a passo das compensações por especialidade e o repasse final. Dá para baixar a planilha (CSV) e fechar o mês (trava os números).
4. Em **Metas e regras**, ajuste metas, valores unitários, repasse contratado e as regras de equivalência daquele mês. “Usar este quadro nos próximos meses” torna o quadro o padrão dos meses novos.

## Regra de cálculo
- Diferença = realizado − meta.
- As regras rodam na ordem numerada: “A excedentes de [origem] compensam B faltas de [destino]”, usando só o excedente que ainda sobra.
- Falta que sobra → desconto (qtd × valor unitário). Excedente que sobra → extra (qtd × valor unitário).
- Repasse = contratado + extras − descontos.

O quadro inicial (`src/seed.js`) reproduz o documento de Setembro/2026. `npm test` confere o motor contra os números daquele documento (repasse total R$ 268.802,72).

## Rodar e publicar
```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera dist/
```
Na Vercel: importe o repositório do GitHub; o preset Vite é detectado automaticamente.

## Dados
Ficam salvos no navegador (localStorage). Use **Exportar backup** com frequência e **Importar backup** para levar os dados a outro computador. Cada pessoa/navegador tem sua própria cópia.
