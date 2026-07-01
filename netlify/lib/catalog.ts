// Snapshot do catálogo + dados da loja para o canal WhatsApp.
// O site envia o catálogo vivo no corpo da requisição; o WhatsApp não tem frontend,
// então usa esta cópia. Mantenha em sincronia com src/data/seed.ts.
// (Quando o catálogo virar banco — Supabase — os dois canais leem da mesma fonte.)

import type { BotProduct, BotStore } from './shared'

export const STORE: BotStore = {
  name: 'Atacadão das Bikes Camburi',
  tagline: 'A maior vitrine de bikes elétricas de Vitória',
  whatsappUrl:
    'https://api.whatsapp.com/message/FTR7HAI3JFSZD1?autoload=1&app_absent=0&utm_source=ig',
  email: 'contato@atacadaodasbikescamburi.com.br',
  instagram: 'atacadaodasbikes_camburi',
  address: 'Av. Armando Duarte Rabello, 192 — Jardim Camburi, Vitória/ES, 29075-920',
  city: 'Vitória / ES',
  hours: 'Seg a Sáb, 9h às 18h',
  shippingNote:
    'Retirada em Camburi ou entrega na Grande Vitória, com a bike montada e carregada.',
}

export const PRODUCTS: BotProduct[] = [
  {
    name: 'X50',
    category: 'Retrô / Urbana',
    brand: 'Fat Bike Elétrica',
    price: 6490,
    compareAtPrice: 7990,
    stock: 6,
    description:
      'E-bike fat com visual retrô estilo moped. Banco largo, pneus KENDA 20×4, acabamento premium.',
    specs: { motor: '1000W', battery: '48V 20Ah', range: 'até 80 km', speed: '45 km/h' },
    image: '/img/bikes/x50.webp',
  },
  {
    name: 'V12 Ultra',
    category: 'Banco Duplo',
    brand: 'Top de linha',
    price: 9990,
    compareAtPrice: 11990,
    stock: 3,
    description:
      'A top de linha. Banco duplo, suspensão completa e opção de bateria dupla. Até 1500W de pico.',
    specs: { motor: '1000W (1500W pico)', battery: '48V dupla', range: 'até 120 km', speed: '45 km/h' },
    image: '/img/bikes/v12.webp',
  },
  {
    name: 'V8 Mini Ultra',
    category: 'Banco Duplo',
    brand: 'Banco duplo',
    price: 7990,
    compareAtPrice: 9490,
    stock: 5,
    description:
      'Versão compacta de banco duplo. Robusta, ágil, pneus fat e suspensão. Asfalto e terra com passageiro.',
    specs: { motor: '1000W', battery: '48V 20Ah', range: 'até 70 km', speed: '40 km/h' },
    image: '/img/bikes/v8-mini-ultra.webp',
  },
  {
    name: 'H9',
    category: 'Fat Bike Elétrica',
    brand: 'Fat Bike Elétrica',
    price: 6990,
    compareAtPrice: 8490,
    stock: 8,
    description:
      'A fat bike queridinha. Pneus KENDA 20×4, Shimano 7 marchas, freios a disco hidráulicos, bagageiro.',
    specs: { motor: '1000W', battery: '48V 15Ah', range: 'até 80 km', speed: '45 km/h' },
    image: '/img/bikes/h9.webp',
  },
  {
    name: 'Bateria de Lítio 48V 20Ah',
    category: 'Baterias & Carregadores',
    brand: 'Energia',
    price: 1990,
    compareAtPrice: 2390,
    stock: 20,
    description: 'Bateria reserva/upgrade. Células de lítio premium com BMS de proteção.',
    specs: { battery: '48V 20Ah', range: '+80 km por carga' },
  },
  {
    name: 'Capacete Smart com LED',
    category: 'Acessórios',
    brand: 'Equipe-se',
    price: 299,
    compareAtPrice: 399,
    stock: 25,
    description: 'Capacete com luz de freio em LED e sinalização traseira. Segurança e estilo à noite.',
  },
]
