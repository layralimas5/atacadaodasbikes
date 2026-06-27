import type { Category, Product, StoreInfo } from '@/lib/types'

/** Foto otimizada do Unsplash. Se falhar, o SmartImage cai no placeholder. */
function unsplash(id: string, w = 1000): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`
}

export const PLACEHOLDER_IMAGE = '/placeholder-bike.svg'

// Imagens REAIS das bikes (salvar em public/img/bikes/ com estes nomes).
const BIKE = {
  x50: '/img/bikes/x50.webp',
  v12: '/img/bikes/v12.webp',
  v8mini: '/img/bikes/v8-mini-ultra.webp',
  h9: '/img/bikes/h9.webp',
}

// Fotos locais (fundo de estúdio) usadas como capa fotográfica das categorias.
const PHOTO = {
  a: '/img/ebike-hero.jpg',
  b: '/img/ebike-3.jpg',
  c: '/img/hero-poster.jpg',
}

const IMG = {
  bateria: unsplash('1593941707882-a5bba14938c7'),
  acessorios: unsplash('1557803056-4d8d8d8d8d8d'),
}

export const CATEGORIES: Category[] = [
  {
    slug: 'fat',
    name: 'Fat Bike Elétrica',
    short: 'Pneu largo',
    description: 'Pneus KENDA 20×4, motor potente e suspensão. Asfalto, areia, terra — vai em tudo.',
    image: PHOTO.b,
  },
  {
    slug: 'retro',
    name: 'Retrô / Urbana',
    short: 'Estilo moped',
    description: 'Visual retrô estilo moped, banco confortável e potência pra rodar a cidade com estilo.',
    image: PHOTO.a,
  },
  {
    slug: 'duplo',
    name: 'Banco Duplo',
    short: '2 lugares',
    description: 'Bancos longos pra levar carona. Robustez e potência de sobra pra dois.',
    image: PHOTO.c,
  },
  {
    slug: 'baterias',
    name: 'Baterias & Carregadores',
    short: 'Energia',
    description: 'Baterias de lítio, carregadores e upgrades de autonomia.',
    image: IMG.bateria,
  },
  {
    slug: 'acessorios',
    name: 'Acessórios',
    short: 'Equipe-se',
    description: 'Capacetes, cadeados, suportes e displays pra sua e-bike.',
    image: IMG.acessorios,
  },
]

const BASE_PRODUCTS: Product[] = [
  {
    id: 'p-x50',
    name: 'X50',
    category: 'retro',
    brand: 'Fat Bike Elétrica',
    price: 6490,
    compareAtPrice: 7990,
    stock: 6,
    image: BIKE.x50,
    description:
      'E-bike fat com visual retrô estilo moped que para o trânsito. Banco largo e confortável, pneus KENDA 20×4 e acabamento premium. Motor de 1000W, freios a disco e autonomia pra rodar a cidade inteira sem recarregar.',
    specs: { motor: '1000W', battery: '48V 20Ah', range: 'até 80 km', speed: '45 km/h' },
    featured: true,
    active: true,
  },
  {
    id: 'p-v12-ultra',
    name: 'V12 Ultra',
    category: 'duplo',
    brand: 'Top de linha',
    price: 9990,
    compareAtPrice: 11990,
    stock: 3,
    image: BIKE.v12,
    description:
      'A top de linha da loja. Banco duplo pra levar carona, suspensão completa e opção de bateria dupla pra autonomia gigante. Até 1500W de pico — encara qualquer ladeira com folga.',
    specs: { motor: '1000W (1500W pico)', battery: '48V dupla', range: 'até 120 km', speed: '45 km/h' },
    featured: true,
    active: true,
  },
  {
    id: 'p-v8-mini-ultra',
    name: 'V8 Mini Ultra',
    category: 'duplo',
    brand: 'Banco duplo',
    price: 7990,
    compareAtPrice: 9490,
    stock: 5,
    image: BIKE.v8mini,
    description:
      'A versão compacta de banco duplo. Robusta, ágil e estilosa — pneus fat, suspensão e potência pra encarar asfalto e terra com um passageiro na garupa.',
    specs: { motor: '1000W', battery: '48V 20Ah', range: 'até 70 km', speed: '40 km/h' },
    featured: true,
    active: true,
  },
  {
    id: 'p-h9',
    name: 'H9',
    category: 'fat',
    brand: 'Fat Bike Elétrica',
    price: 6990,
    compareAtPrice: 8490,
    stock: 8,
    image: BIKE.h9,
    description:
      'A fat bike queridinha. Pneus KENDA 20×4, câmbio Shimano de 7 marchas, freios a disco hidráulicos e bagageiro traseiro. Versátil pra cidade, praia e trilha, com display multifunção.',
    specs: { motor: '1000W', battery: '48V 15Ah', range: 'até 80 km', speed: '45 km/h' },
    featured: true,
    active: true,
  },
  {
    id: 'p-bateria-48v',
    name: 'Bateria de Lítio 48V 20Ah',
    category: 'baterias',
    brand: 'Energia',
    price: 1990,
    compareAtPrice: 2390,
    stock: 20,
    image: IMG.bateria,
    description:
      'Dobre a autonomia da sua e-bike com uma bateria reserva ou upgrade. Células de lítio premium com BMS de proteção.',
    specs: { battery: '48V 20Ah', range: '+80 km por carga' },
    featured: false,
    active: true,
  },
  {
    id: 'p-capacete-smart',
    name: 'Capacete Smart com LED',
    category: 'acessorios',
    brand: 'Equipe-se',
    price: 299,
    compareAtPrice: 399,
    stock: 25,
    image: IMG.acessorios,
    description:
      'Capacete com luz de freio em LED e sinalização traseira. Segurança e estilo pra quem anda à noite.',
    featured: false,
    active: true,
  },
]

/**
 * Catálogo final = produtos base duplicados para "encher" a vitrine e o cliente
 * visualizar a loja populada. As cópias recebem IDs únicos (a 1ª volta mantém o
 * ID original). Para voltar ao catálogo enxuto, troque DUPLICACOES para 1.
 */
const DUPLICACOES = 4

function expandirCatalogo(base: Product[], vezes: number): Product[] {
  const out: Product[] = []
  for (let v = 0; v < vezes; v++) {
    for (const p of base) {
      out.push(v === 0 ? p : { ...p, id: `${p.id}-${v}` })
    }
  }
  return out
}

export const PRODUCTS: Product[] = expandirCatalogo(BASE_PRODUCTS, DUPLICACOES)

export const STORE_INFO: StoreInfo = {
  name: 'Atacadão das Bikes Camburi',
  tagline: 'A maior vitrine de bikes elétricas de Vitória',
  whatsapp: '',
  whatsappUrl: 'https://api.whatsapp.com/message/FTR7HAI3JFSZD1?autoload=1&app_absent=0&utm_source=ig',
  whatsappLabel: 'Chamar no WhatsApp',
  phone: '',
  email: 'contato@atacadaodasbikescamburi.com.br',
  instagram: 'atacadaodasbikes_camburi',
  address: 'Av. Armando Duarte Rabello, 192 — Jardim Camburi, Vitória/ES, 29075-920',
  city: 'Vitória / ES',
  hours: 'Seg a Sáb, 9h às 18h',
  heroTitle: 'Lançamento: a nova era elétrica',
  heroSubtitle:
    'Chegue mais longe com menos esforço. Tecnologia, conforto e autonomia pra se mover pela cidade — com preço de atacadão, em Camburi.',
  heroImage: '/img/hero-poster.jpg',
  // Coloque o vídeo em public/video/ e aponte aqui (ex.: '/video/hero.mp4'),
  // ou edite pelo painel (Conteúdo do site → Vídeo do banner).
  heroVideo: '/video/hero.mp4',
  shippingNote: 'Retirada em Camburi ou entrega na Grande Vitória, com a bike montada e carregada.',
  contactConfirmed: true,
}
