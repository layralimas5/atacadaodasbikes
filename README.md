# Atacadão das Bikes Camburi — site + painel

E-commerce premium e focado em conversão para o **Atacadão das Bikes Camburi**
(Vitória/ES), com painel administrativo para gerenciar produtos, estoque,
vendas e o conteúdo do site.

Construído por **Layra Lima**.

## Stack

- **React 19 + TypeScript** (strict) + **Vite**
- **Tailwind CSS v4** (design tokens em `src/index.css`)
- **Framer Motion** (animações + parallax do banner)
- **React Router** (loja + área administrativa)
- Persistência em **localStorage** (protótipo) — arquitetada para migrar ao Supabase

## Rodando

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + build de produção (dist/)
npm run preview  # serve o build
```

## Estrutura

```
src/
  components/   # UI, layout, seções da home, carrinho
  context/      # StoreContext (dados+admin) e CartContext
  data/seed.ts  # categorias, produtos e infos da loja (placeholders)
  lib/          # tipos, persistência, formatação, WhatsApp
  pages/        # Home, Catálogo, Produto
  pages/admin/  # Login, Dashboard, Produtos, Estoque, Vendas, Conteúdo
```

## Painel administrativo

Acesse pelo botão **Admin** (canto superior) ou em `/admin`.

- **Senha padrão:** `atacadao123` (troque em *Conteúdo do site → Segurança*)
- Gerencia produtos (CRUD), estoque, vendas e todos os textos/contato do site
- Os dados ficam no navegador (localStorage). "Restaurar dados de exemplo"
  volta tudo ao estado inicial.

## ⚠️ Antes de publicar

Os dados de contato são **placeholders**. No painel (*Conteúdo do site →
Contato*) preencha WhatsApp, telefone, endereço e horário reais e marque
"Dados de contato confirmados" para remover o aviso amarelo.

As fotos dos produtos são do Unsplash (exemplo) — troque pelas reais no
cadastro de cada produto.

## Migrar para Supabase (próximo passo)

A UI nunca acessa o storage direto: tudo passa por `src/lib/storage.ts` e
`src/context/StoreContext.tsx`. Para produção real basta:

1. Criar projeto no Supabase (tabelas `products`, `sales`, `store_info`)
2. Reimplementar `read`/`write` (ou os métodos do `StoreContext`) com chamadas
   ao Supabase + RLS
3. Trocar a autenticação do protótipo por **Supabase Auth**

Nenhum componente da interface precisa mudar.
