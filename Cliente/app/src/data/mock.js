export const projects = [
  {
    id: 1,
    name: 'MPLA Oficial',
    presenceScore: 88,
    newMentions: 63,
    total: 3847,
    industry: 'Partido Politico',
    keywords: ['MPLA', 'Movimento Popular de Libertacao de Angola', 'mpla.ao'],
  },
  {
    id: 2,
    name: 'Agenda Politica 2026',
    presenceScore: 79,
    newMentions: 96,
    total: 4216,
    industry: 'Comunicacao Politica',
    keywords: ['Agenda Politica 2026', 'Congresso MPLA', 'Joao Lourenco'],
  },
  {
    id: 3,
    name: 'Mobilizacao Nacional',
    presenceScore: 72,
    newMentions: 34,
    total: 2198,
    industry: 'Organizacao Territorial',
    keywords: ['JMPLA', 'OMA', 'militantes MPLA', 'comites de accao'],
  },
]

export const mentionsFeed = [
  {
    id: 1, projectId: 1,
    source: 'rss', author: 'Jornal de Angola', avatar: 'JA',
    content: 'MPLA destaca prioridades de desenvolvimento nacional e reforca a mobilizacao das estruturas de base em Luanda.',
    sentiment: 'positive', score: 0.82, reach: 95000, engagement: 1203,
    publishedAt: '2026-06-05T10:00:00Z', url: 'https://jornaldeangola.ao/mpla',
    topics: ['MPLA', 'desenvolvimento', 'Luanda'],
  },
  {
    id: 2, projectId: 1,
    source: 'facebook', author: 'Novo Jornal', avatar: 'NJ',
    content: 'Dirigentes do MPLA analisam a agenda politica e defendem maior proximidade com comunidades locais.',
    sentiment: 'positive', score: 0.71, reach: 52000, engagement: 890,
    publishedAt: '2026-06-05T09:15:00Z', url: 'https://novojornal.ao/mpla-agenda',
    topics: ['agenda politica', 'comunidades', 'dirigentes'],
  },
  {
    id: 3, projectId: 2,
    source: 'twitter', author: '@angola_cidadao', avatar: 'AC',
    content: 'O debate politico em Angola precisa de propostas concretas. O MPLA tem apresentado a sua visao, mas a populacao quer resultados mensuraveis.',
    sentiment: 'neutral', score: 0.05, reach: 8400, engagement: 234,
    publishedAt: '2026-06-05T08:40:00Z', url: 'https://twitter.com/angola_cidadao/status/123',
    topics: ['debate politico', 'Angola', 'resultados'],
  },
  {
    id: 4, projectId: 2,
    source: 'instagram', author: '@politica_angola', avatar: 'PA',
    content: 'JMPLA promove encontro com jovens sobre emprego, cidadania e participacao politica nas provincias.',
    sentiment: 'positive', score: 0.68, reach: 31000, engagement: 1540,
    publishedAt: '2026-06-04T18:00:00Z', url: 'https://instagram.com/p/exemplo4',
    topics: ['JMPLA', 'juventude', 'emprego'],
  },
  {
    id: 5, projectId: 1,
    source: 'rss', author: 'VOA Portugues', avatar: 'VP',
    content: 'Analistas avaliam a estrategia de comunicacao do MPLA antes do proximo congresso ordinario do partido.',
    sentiment: 'mixed', score: 0.18, reach: 60000, engagement: 445,
    publishedAt: '2026-06-04T15:30:00Z', url: 'https://voaportugues.com/mpla-congresso',
    topics: ['congresso', 'comunicacao', 'analise'],
  },
  {
    id: 6, projectId: 3,
    source: 'facebook', author: 'Expansao Online', avatar: 'EX',
    content: 'MPLA e UNITA intensificam a presenca publica com discursos centrados em economia, juventude e governacao local.',
    sentiment: 'neutral', score: 0.10, reach: 38000, engagement: 672,
    publishedAt: '2026-06-04T12:00:00Z', url: 'https://expansao.co.ao/partidos',
    topics: ['MPLA', 'UNITA', 'economia'],
  },
  {
    id: 7, projectId: 2,
    source: 'tiktok', author: '@jovens_angola', avatar: 'JO',
    content: 'Jovens comentam as propostas da JMPLA para formacao, empreendedorismo e participacao civica.',
    sentiment: 'positive', score: 0.80, reach: 87000, engagement: 5200,
    publishedAt: '2026-06-03T20:00:00Z', url: 'https://tiktok.com/@jovens_angola',
    topics: ['juventude', 'JMPLA', 'empreendedorismo'],
  },
  {
    id: 8, projectId: 1,
    source: 'google_reviews', author: 'Cidadao Luanda', avatar: 'CL',
    content: 'Participei numa actividade local do MPLA. A organizacao foi boa, mas faltou mais espaco para perguntas dos moradores.',
    sentiment: 'mixed', score: 0.12, reach: 200, engagement: 3,
    publishedAt: '2026-06-03T10:00:00Z', url: 'https://maps.google.com/mpla',
    topics: ['actividade local', 'organizacao', 'moradores'],
  },
]

export const sentimentTimeline = [
  { date: '28 Mai', positive: 52, negative: 8,  neutral: 32 },
  { date: '29 Mai', positive: 58, negative: 10, neutral: 28 },
  { date: '30 Mai', positive: 61, negative: 7,  neutral: 38 },
  { date: '31 Mai', positive: 55, negative: 12, neutral: 30 },
  { date: '01 Jun', positive: 70, negative: 6,  neutral: 42 },
  { date: '02 Jun', positive: 65, negative: 9,  neutral: 35 },
  { date: '03 Jun', positive: 78, negative: 5,  neutral: 45 },
  { date: '04 Jun', positive: 72, negative: 7,  neutral: 38 },
  { date: '05 Jun', positive: 82, negative: 5,  neutral: 48 },
]

export const mentionVolume = [
  { date: '28 Mai', mentions: 104 },
  { date: '29 Mai', mentions: 118 },
  { date: '30 Mai', mentions: 151 },
  { date: '31 Mai', mentions: 128 },
  { date: '01 Jun', mentions: 175 },
  { date: '02 Jun', mentions: 162 },
  { date: '03 Jun', mentions: 198 },
  { date: '04 Jun', mentions: 182 },
  { date: '05 Jun', mentions: 233 },
]

export const sourceBreakdown = [
  { name: 'Imprensa (RSS)', value: 38, color: '#CC0000' },
  { name: 'Facebook',       value: 24, color: '#1877F2' },
  { name: 'Twitter/X',      value: 16, color: '#111111' },
  { name: 'Instagram',      value: 12, color: '#C13584' },
  { name: 'TikTok',         value: 6,  color: '#444444' },
  { name: 'Google Reviews', value: 4,  color: '#B8960C' },
]

export const topInfluencers = [
  { name: 'Jornal de Angola', followers: 120000, mentions: 18, sentiment: 'positive', platform: 'rss' },
  { name: 'MPLA Oficial',     followers: 98000,  mentions: 15, sentiment: 'positive', platform: 'facebook' },
  { name: 'Novo Jornal',      followers: 68000,  mentions: 9,  sentiment: 'positive', platform: 'facebook' },
  { name: '@angola_cidadao',  followers: 42000,  mentions: 7,  sentiment: 'neutral',  platform: 'twitter' },
  { name: 'Expansao Online',  followers: 38000,  mentions: 6,  sentiment: 'positive', platform: 'facebook' },
]

export const competitorData = [
  { name: 'MPLA',    mentions: 3140, positive: 62, negative: 14, reach: 5200000, score: 88 },
  { name: 'UNITA',   mentions: 1876, positive: 54, negative: 18, reach: 3800000, score: 75 },
  { name: 'FNLA',    mentions: 432,  positive: 61, negative: 10, reach: 980000,  score: 68 },
  { name: 'CASA-CE', mentions: 318,  positive: 49, negative: 22, reach: 720000,  score: 58 },
]

export const cneInfo = {
  nome: 'Movimento Popular de Libertacao de Angola',
  sigla: 'MPLA',
  presidente: 'Joao Manuel Goncalves Lourenco',
  vicePresidente: 'Mara Baptista Quiosa',
  secretarioGeral: 'Paulo Pombolo',
  sede: 'Av. Ho-Chi-Min, No. 34, Luanda, Angola',
  email: 'contacto@mpla.ao',
  telefone: '+244 222 620 500',
  website: 'mpla.ao',
  facebook: 'facebook.com/Mplaoficial',
  instagram: '@mplaoficial',
  missao: 'Defender a independencia, a soberania, a unidade nacional, a paz, a democracia e o desenvolvimento de Angola.',
  proximasEleicoes: 2027,
  proximoCongresso: '9.o Congresso do MPLA',
  logo: '/mpla-logo.svg',
  membros: '1.045.000 cartoes emitidos',
}

export const PROVINCIAS = [
  'Todas',
  'Luanda', 'Benguela', 'Huambo', 'Bié', 'Malanje',
  'Huíla', 'Cuanza Sul', 'Cuanza Norte', 'Uíge', 'Zaire',
  'Cabinda', 'Lunda Norte', 'Lunda Sul', 'Moxico',
  'Cuando Cubango', 'Cunene', 'Namibe', 'Bengo',
]

export const mentionsByProvincia = [
  { provincia: 'Luanda',        mentions: 1240, positive: 68, negative: 12 },
  { provincia: 'Benguela',      mentions: 387,  positive: 64, negative: 14 },
  { provincia: 'Huambo',        mentions: 298,  positive: 71, negative: 10 },
  { provincia: 'Bié',           mentions: 187,  positive: 59, negative: 18 },
  { provincia: 'Malanje',       mentions: 164,  positive: 62, negative: 15 },
  { provincia: 'Huíla',         mentions: 201,  positive: 66, negative: 11 },
  { provincia: 'Cuanza Sul',    mentions: 143,  positive: 60, negative: 17 },
  { provincia: 'Cuanza Norte',  mentions: 112,  positive: 58, negative: 19 },
  { provincia: 'Uíge',          mentions: 98,   positive: 63, negative: 13 },
  { provincia: 'Zaire',         mentions: 76,   positive: 55, negative: 22 },
  { provincia: 'Cabinda',       mentions: 89,   positive: 61, negative: 16 },
  { provincia: 'Lunda Norte',   mentions: 67,   positive: 57, negative: 20 },
  { provincia: 'Lunda Sul',     mentions: 54,   positive: 56, negative: 21 },
  { provincia: 'Moxico',        mentions: 48,   positive: 62, negative: 14 },
  { provincia: 'Cuando Cubango',mentions: 41,   positive: 65, negative: 12 },
  { provincia: 'Cunene',        mentions: 63,   positive: 60, negative: 16 },
  { provincia: 'Namibe',        mentions: 72,   positive: 67, negative: 11 },
  { provincia: 'Bengo',         mentions: 108,  positive: 70, negative: 10 },
]

export const recentNews = [
  { date: '05 Jun 2026', title: 'MPLA reforca mobilizacao nacional e proximidade com as comunidades.' },
  { date: '04 Jun 2026', title: 'Joao Lourenco orienta reuniao sobre prioridades da agenda politica 2026.' },
  { date: '02 Jun 2026', title: 'JMPLA promove debates sobre emprego, formacao e participacao civica.' },
  { date: '29 Mai 2026', title: 'OMA destaca papel das mulheres na vida politica e social de Angola.' },
  { date: '21 Mai 2026', title: 'Estruturas provinciais do MPLA avaliam comunicacao e organizacao de base.' },
]
