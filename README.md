# Dashboard de Vendas

Dashboard em Next.js conectado diretamente ao Supabase, lendo dados
agregados de vendas (mês, vendedores, produtos e clientes).

## Rodando localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.local.example` para `.env.local` (já vem preenchido com as
   credenciais do seu projeto Supabase).
3. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse `http://localhost:3000`.

## Deploy na Vercel

1. Suba este projeto para um repositório no seu GitHub.
2. Na Vercel, clique em **New Project** e importe o repositório.
3. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (os valores estão em `.env.local.example`)
4. Clique em **Deploy**. A cada novo push no repositório, a Vercel gera um
   novo deploy automaticamente.

## Estrutura de dados

O dashboard lê de 5 views criadas no Supabase (todas com leitura pública
via RLS, apenas SELECT):

- `vw_vendas_mensal` — total vendido, pedidos e clientes ativos por mês
- `vw_top_vendedores` — total vendido por vendedor
- `vw_top_produtos` — total vendido e quantidade por produto
- `vw_top_fabricantes` — total vendido por fabricante
- `vw_top_clientes` — total vendido e pedidos por cliente

Essas views agregam a tabela `ft_Vendas_8011` (~590 mil linhas), então o
dashboard nunca precisa buscar os dados linha a linha — só os totais já
prontos.

## Próximos passos sugeridos

- Adicionar filtro por fabricante (a view `vw_top_fabricantes` já existe)
- Paginação/exportação da tabela de clientes
- Autenticação, caso o painel deixe de ser só para testes
