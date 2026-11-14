# Revisão de validação e feedback das interações

Revisão estática de 14/11/2026, após as alterações locais de cadastro/login das
issues #20 e #21. Escopo: transações (criação, edição, duplicação e exclusão),
despesas fixas e pagamento, wishlist e reservas, cartões/compras/faturas/estornos,
calendário e recebimentos, orçamento, categorias/regras, conta, notificações,
importação e exportação. Esta revisão não executou esses fluxos em navegador
com build de produção e não constitui correção dos achados abaixo.

## Achados

### Alta: erros esperados ainda atravessam Server Actions como exceções

Transações, despesas fixas, wishlist, cartões, calendário, orçamento, categorias,
edição de conta, notificações e actions de exportação ainda lançam `Error` ou
`PublicApiError`. Os consumidores client-side leem `error.message` diretamente.
A normalização no servidor não evita a ocultação da mensagem pelo Next em
produção: o aviso de Server Components pode substituir inclusive erros de
negócio. A falha estrutural é a mesma encontrada no cadastro.

Exemplos: `src/actions/cards/cards.ts` e `src/components/cards/cards-content.tsx`;
`src/actions/transaction/create-transaction-action.ts` e
`src/hooks/queries/useTransactions.ts`; `src/actions/user/update-user-action.ts`
e `src/components/config/update-user-form/index.tsx`.

Correção necessária: resultados serializáveis nas fronteiras chamadas pelo
browser, com consumo explícito de sucesso/falha e fallbacks seguros para exceções
inesperadas. Preservar os contratos internos usados por Server Components e
não transformar uma falha retornada em toast de sucesso ou invalidação de cache.
Simplesmente filtrar o texto técnico no navegador esconderia o sintoma, mas
continuaria perdendo as orientações de negócio.

### Média: validações de formulários divergem da API

- Wishlist: `src/models/wishlist.model.ts` não aplica trim nem máximo de 120 no
  nome; a API exige ambos em `apps/api/src/modules/wishlist/dto/wishlist.dto.ts`.
  O schema de valor no front também não reproduz a restrição de centavos da API.
  Os atributos nativos do input não substituem uma validação explícita no schema.
- Despesas fixas: o schema local do diálogo não replica o teto de 999999999,
  centavos ou rejeição de vencimento passado do DTO da API. O front verifica
  basicamente valor mínimo e presença da data. Parte do feedback chega só após
  o POST e cai no problema de serialização acima.
- Cartões: os formulários já são controlados com useState, porém usam atributos
  HTML em vez de um resolver Zod no client. A regra da API “anuidade não pode
  exceder o limite” não é verificada antes do envio; faltam também os tetos
  monetários do contrato. Ser controlado por si só não resolve a validação.

### Média: feedback depende de toast em diversos formulários

Despesas fixas, edição de conta e mutações de orçamento exibem falhas de gravação
principalmente por toast. O modal de despesa fixa captura a rejeição sem manter
um alerta geral dentro do formulário. A wishlist de criação também não mantém
um erro geral próprio e deixa a Promise rejeitada sair do handler de submit.
Isso dificulta reler e corrigir a falha, mesmo quando o toast contém texto útil.

### Cobertura: mocks não comprovam comportamento do Next em produção

Testes que substituem uma Server Action por um mock rejeitado com texto amigável
não exercitam sua serialização real. É necessário incluir cenários com aplicação
Next real em produção e API de testes isolada: validação, conflito de negócio,
sessão inválida, indisponibilidade e resposta malformada, preservando os campos
e sem sucesso/navegação em rejeições. Não usar dados de produção ou de Preview
que compartilhe seu banco.

## Fluxos com proteção já encontrada

- Cadastro/login: alterações locais retornam falhas públicas como dados, mantêm
  o formulário e aplicam Zod. Cadastro usa Controller e valida a cada alteração.
- Importação: `src/actions/transaction/import-transactions.ts` já usa
  `ImportActionResult` e retorna falhas como dados, inclusive na validação do
  arquivo. Esse caminho evita o problema específico de exceções esperadas.
- Fronteira privada `src/app/(private)/error.tsx`: não renderiza error.message,
  oferece recuperação e não reenvia gravações. Sua orientação genérica é
  adequada para falhas inesperadas de renderização, sem resolver as mutações.

## Ordem de correção sugerida

1. Padronizar resultados nas mutações chamadas pelo client e atualizar seus
   consumidores juntos, com regressões em cada domínio.
2. Alinhar schemas aos contratos e adicionar feedback persistente nos formulários.
3. Validar os cenários em build de produção com ambiente descartável.

`register` do React Hook Form é válido e funciona com Zod. Não é necessário
converter todos os formulários para Controller para resolver os achados; o
controle de valor e o contrato de erros são responsabilidades distintas.
