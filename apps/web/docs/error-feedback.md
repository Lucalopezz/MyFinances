# Mensagens públicas e validação de formulários

Toda falha deve explicar em português o que aconteceu e a ação possível, sem
culpar o usuário por falhas do sistema. Esta política vale para novos fluxos e
para a manutenção dos existentes. A implementação desta rodada cobre cadastro
e login (#20 e #21); não representa uma migração de todas as actions do projeto.

- Validação de entrada: indicar o campo e a regra concreta, como “O nome deve ter
  pelo menos 3 caracteres”. Usar Zod no formulário, feedback durante a edição
  (a cada alteração no cadastro; após interação no login), bloquear envio
  inválido e repetir a validação no servidor.
- Erro de negócio: preservar a orientação pública da API, como “E-mail já
  cadastrado”. Usar erro junto ao campo quando houver identificação confiável;
  caso contrário, manter um alerta visível no formulário.
- Autenticação: no login, “E-mail ou senha inválidos” sem revelar a existência da
  conta. Em operações privadas, orientar a entrar novamente se a sessão expirou.
- Permissão e excesso de tentativas: explicar a restrição ou pedir para aguardar.
- Falha interna, rede ou resposta inesperada: usar mensagem da operação e próxima
  ação, como “Não foi possível criar sua conta agora. Tente novamente.” Não
  apresentar erro interno como se fosse um campo preenchido incorretamente.

Falhas esperadas de uma Server Action chamada pelo browser devem retornar um
resultado serializável (`ok`, `message`, erros por campo quando disponíveis).
Lançar um `Error` com texto amigável não garante que esse texto chegue ao client:
o Next.js pode substituí-lo pela mensagem de produção sobre Server Components.
Exceções inesperadas no client recebem um fallback controlado; nunca renderizar
`error.message` bruto de framework/transporte.

Não exibir stack, digest, SQL, detalhes de Prisma/MongoDB, URL interna, tokens,
cookies, credenciais ou payloads financeiros. Em `5xx`, ignorar o texto do body
e usar somente o fallback público da operação. Em `4xx`, consumir mensagens de
validação/negócio públicas e substituir respostas técnicas por orientação segura.
O helper `api-error.ts` normaliza esses erros; seus logs incluem contexto/status,
sem corpo da resposta nem os dados preenchidos.

Preservar valores após falha, impedir envio duplicado enquanto pendente e navegar
somente depois da confirmação de sucesso. Associar mensagens por `aria-describedby`
e `aria-invalid`; usar `role="alert"` no erro geral. Toast pode complementar o
alerta, mas não deve ser a única forma de ler uma falha do formulário.

Testar os limites dos campos, o bloqueio antes da requisição, a fronteira real da
action com a API simulada, conflitos, `401`, `5xx`, erro de rede e resposta inválida.
Cobrir a integração entre resultado da action, hook e formulário. Testes isolados
que apenas lançam uma mensagem em um mock não verificam sua serialização pelo Next.
