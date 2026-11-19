import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { getFirestore, doc, getDocFromServer } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

export const ADMIN_EMAIL = 'julia.sggomes@gmail.com';
export const VALID_CATS = ['clinicas', 'restaurantes', 'escritorios', 'empresas'];
export const CHUNK_SIZE = 480000;
export const MAX_CHUNKS = 30;

export const FALLBACK_FIREBASE_CONFIG = {
  projectId: 'calcium-sensor-m41j7',
  appId: '1:553931277009:web:1d429070cf67c1fd437bf0',
  apiKey: 'AIzaSyDIMYeA8kVbSglU1CLLVHNqsgqX1JUmZu0',
  authDomain: 'calcium-sensor-m41j7.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-portifolio-51501e6a-b317-4947-b808-fc1793f33b21',
  storageBucket: 'calcium-sensor-m41j7.firebasestorage.app',
  messagingSenderId: '553931277009'
};

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write'
};

export async function loadFirebaseConfig() {
  try {
    const res = await fetch('/firebase-applet-config.json', { cache: 'no-store' });
    if (res.ok) {
      const cfg = await res.json();
      if (cfg && cfg.projectId && cfg.apiKey) return cfg;
    }
  } catch (e) {}
  return FALLBACK_FIREBASE_CONFIG;
}

export async function initPortfolioFirebase() {
  const firebaseConfig = await loadFirebaseConfig();
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });

  async function testConnection() {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error('Please check your Firebase configuration.');
      }
    }
  }
  testConnection();

  function handleFirestoreError(error, operationType, path) {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid || null,
        email: auth.currentUser?.email || null,
        emailVerified: auth.currentUser?.emailVerified ?? null,
        isAnonymous: auth.currentUser?.isAnonymous ?? null,
        tenantId: auth.currentUser?.tenantId || null,
        providerInfo: auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }

  return { firebaseConfig, app, db, auth, googleProvider, handleFirestoreError };
}

export const DEFAULT_SITE_CONTENT = {
  id: 'main',
  brandName: 'Júlia Siqueira',
  preCadastroLabel: 'Pré-cadastro cliente',
  hero: {
    kicker: 'UI/UX · Acessibilidade Digital · Automação',
    title: 'Interfaces *acessíveis* e UI/UX estratégico para negócios que querem ser encontrados e escolhidos.',
    lead: 'Projeto sites claros, rápidos e inclusivos — com leitura confortável em qualquer tela, navegação intuitiva e automações de WhatsApp e Instagram que facilitam o caminho do seu cliente.',
    ctaText: 'Conversar sobre meu projeto',
    ctaMsg: 'Olá, Júlia! Vim pelo seu portfólio e quero conversar sobre meu projeto.',
    secondaryText: 'Explorar projetos ↓',
    proofs: [
      'Foco em UI/UX e usabilidade',
      'Acessibilidade e contraste',
      'Mobile-first real'
    ],
    flowTitle: 'Experiência pensada para o usuário real',
    flowSteps: [
      { title: 'Encontra você no Google', desc: 'Estrutura semântica e buscas locais' },
      { title: 'Navega sem barreiras', desc: 'UI/UX claro, acessível e responsivo' },
      { title: 'Chama no WhatsApp com facilidade', desc: 'Triagem automática e imediata' },
      { title: 'Agenda ou fecha sem fricção', desc: 'Lembretes e confirmações automáticas' }
    ]
  },
  projectsSection: {
    kicker: 'Portfólio Selecionado',
    title: 'Projetos com foco em *UI/UX e acessibilidade*'
  },
  automationsSection: {
    title: 'Soluções de automação inteligente',
    ctaText: 'Não sabe por onde começar? Me conte como é o seu atendimento hoje e eu indico o que automatizar primeiro.',
    ctaButtonText: 'Quero automatizar minha operação',
    ctaMsg: 'Olá, Júlia! Quero automatizar a minha operação. Pode me ajudar?',
    groups: [
      {
        id: 'atendimento',
        label: 'Atendimento e agendamento',
        items: [
          {
            icon: 'chat',
            title: 'Atendimento e triagem inteligente 24h',
            desc: 'Seu WhatsApp responde dúvidas de catálogo e horários a qualquer hora e só chama um atendente quando o caso realmente precisa de uma pessoa.',
            tag: 'Clínicas, escritórios, e-commerces e comércios locais'
          },
          {
            icon: 'calendar',
            title: 'Agendamentos e lembretes automáticos',
            desc: 'O cliente escolhe o melhor horário em um link e recebe confirmação e lembretes. Menos faltas na agenda e nenhum tempo perdido marcando compromisso manualmente.',
            tag: 'Consultórios, salões de beleza, consultorias e eventos'
          },
          {
            icon: 'star',
            title: 'Coleta de avaliações no Google',
            desc: 'Depois de cada serviço ou compra, o cliente recebe uma mensagem pedindo avaliação no Google Meu Negócio. Mais avaliações, mais relevância nas buscas locais.',
            tag: 'Clínicas, restaurantes, lojas físicas e comércios de bairro'
          }
        ]
      },
      {
        id: 'vendas',
        label: 'Vendas e captação',
        items: [
          {
            icon: 'cart',
            title: 'Recuperação de vendas e carrinho',
            desc: 'O fluxo identifica orçamentos parados no WhatsApp e compras não finalizadas e envia lembretes automáticos para resgatar o cliente, sem esforço da sua equipe.',
            tag: 'Lojas online, infoprodutores e vendas consultivas'
          },
          {
            icon: 'insta',
            title: 'Captação e entrega automática em redes sociais',
            desc: 'Quando alguém comenta uma palavra-chave no post ou Reels (ex: “QUERO”), o link do produto ou da página chega automaticamente no direct. O comentário vira venda.',
            tag: 'Criadores, marcas e profissionais autônomos'
          },
          {
            icon: 'search',
            title: 'Prospecção B2B ativa',
            desc: 'O sistema mapeia empresas e tomadores de decisão dentro do seu perfil ideal e organiza os dados para contato, mantendo o time comercial sempre com novos nomes para abordar.',
            tag: 'Empresas B2B, consultorias e agências'
          },
          {
            icon: 'forward',
            title: 'Repasse automático para WhatsApp e CRM',
            desc: 'Quando alguém preenche um formulário no site ou anúncio, os dados chegam na hora no WhatsApp do vendedor e na planilha de controle. Contato rápido, venda que não esfria.',
            tag: 'Imobiliárias, corretores, escritórios e tráfego pago'
          }
        ]
      },
      {
        id: 'gestao',
        label: 'Gestão e financeiro',
        items: [
          {
            icon: 'invoice',
            title: 'Conciliação fiscal e leitura de notas',
            desc: 'O sistema lê as notas recebidas por e-mail, extrai os dados para planilhas ou sistemas e deixa tudo pronto para o contador. Fim do trabalho de baixar e conferir uma a uma.',
            tag: 'Oficinas, restaurantes, pequenas indústrias e serviços'
          },
          {
            icon: 'card',
            title: 'Cobrança e notificações financeiras',
            desc: 'Seus clientes são avisados por WhatsApp e e-mail sobre boletos, links de pagamento ou assinaturas, antes e depois do vencimento. Menos inadimplência, sem cobrança manual.',
            tag: 'Serviços recorrentes, academias, escolas e agências'
          }
        ]
      }
    ]
  },
  differentialsSection: {
    title: 'Por que unir site próprio e automação',
    subtitle: 'Um site bonito sozinho não atende. Uma automação sem site forte não convence. A estrutura completa faz as duas coisas trabalharem juntas.',
    items: [
      { title: 'Carregamento instantâneo', desc: 'Design 100% mobile-first, leve e rápido. Quem busca pelo celular não espera e chega à sua oferta antes de desistir.' },
      { title: 'Posicionamento no Google em BH', desc: 'Estrutura pensada para buscas locais, para que clientes da sua região encontrem você antes dos concorrentes.' },
      { title: 'Operação integrada', desc: 'Site, Instagram e WhatsApp funcionando juntos, do primeiro contato até a venda, sem retrabalho.' },
      { title: 'Entrega ágil, domínio oficial', desc: 'Seu projeto no ar em poucos dias, com o domínio oficial da sua marca e testes assistidos na publicação.' }
    ]
  },
  aboutSection: {
    kicker: 'Sobre mim',
    title: 'Leitura real do consumidor aplicada ao seu site',
    paragraphs: [
      'Sou a **Júlia**, de Belo Horizonte. Na minha rotina analítica com grandes marcas, como **Lojas Renner, Youcom e 99**, analiso o que o público fala, sente e busca sobre essas empresas: monitoramento de percepção de marca, comportamento do consumidor e inteligência de dados.',
      'Aplico essa mesma leitura para criar sites que respondem exatamente ao que o cliente local procura. O texto, a ordem das informações e o caminho até o contato partem de como as pessoas realmente pesquisam e decidem, não de achismo.',
      'Tenho facilidade natural para criar **soluções práticas e personalizadas** e tirar projetos do papel. Junto **UI/UX, código limpo e automação** para resolver o que trava a operação do seu negócio, do primeiro contato ao pós-venda.'
    ],
    pillars: [
      { title: 'Percepção e comportamento', desc: 'Leitura de dados reais sobre o que o público diz e procura, aplicada a cada decisão de design e de texto.' },
      { title: 'Solução sob medida', desc: 'Nada de modelo pronto: cada projeto nasce do seu negócio, do seu público e da sua rotina.' },
      { title: 'Código limpo e leve', desc: 'HTML, CSS e JavaScript enxutos, responsivos e rápidos em qualquer celular.' }
    ]
  },
  brandsSection: {
    label: 'Experiência analítica com grandes marcas',
    subs: ['Moda e varejo', 'Moda jovem e tendência', 'Mobilidade e food']
  },
  processSection: {
    title: 'Como funciona',
    subtitle: 'Um processo curto e sem burocracia, com você acompanhando cada etapa.',
    steps: [
      { title: 'Diagnóstico rápido e alinhamento', desc: 'Entendo seu negócio, seu público e onde o atendimento e as vendas travam hoje. Definimos juntos o que entra no projeto.' },
      { title: 'Desenvolvimento do site e/ou fluxos', desc: 'Desenho e construo o site e as automações combinadas, com você validando o que importa antes de ir ao ar.' },
      { title: 'Publicação oficial e testes assistidos', desc: 'Publico no domínio da sua marca e acompanho os primeiros usos reais para garantir que tudo funcione.' }
    ]
  },
  contactSection: {
    diagTitle: 'Quer saber onde seu negócio perde clientes?',
    diagText: 'Faço um diagnóstico gratuito da presença digital e do atendimento da sua empresa e mostro o que dá para melhorar primeiro, sem compromisso.',
    diagButtonText: 'Quero meu diagnóstico gratuito',
    diagMsg: 'Olá, Júlia! Quero o diagnóstico gratuito da presença digital e do atendimento da minha empresa.',
    diagNote: 'Resposta direto pelo WhatsApp',
    whatsapp: '5531988950652',
    whatsappDisplay: '(31) 98895-0652',
    email: 'julia.sggomes@gmail.com',
    linkedinUrl: 'https://www.linkedin.com/in/j%C3%BAlia-siqueira-29ab152a6/',
    linkedinName: 'Júlia Siqueira',
    footerLeft: 'Júlia Siqueira · Sites e automação em Belo Horizonte',
    footerRight: 'Design estratégico e código limpo.'
  }
};

function clampStr(val, max, fallback = '') {
  const s = typeof val === 'string' ? val.trim() : String(val ?? '').trim();
  const out = s || fallback;
  return out.slice(0, max);
}

function clampTitleDescList(arr, fallbackArr, maxItems) {
  const src = Array.isArray(arr) && arr.length ? arr : fallbackArr;
  return src.slice(0, maxItems).map((it, idx) => {
    const fb = fallbackArr[idx] || { title: 'Item', desc: '' };
    return {
      title: clampStr(it?.title, 200, fb.title),
      desc: clampStr(it?.desc, 800, fb.desc)
    };
  });
}

export function sanitizeSiteContent(raw) {
  const d = DEFAULT_SITE_CONTENT;
  const r = raw && typeof raw === 'object' ? raw : {};
  const h = r.hero && typeof r.hero === 'object' ? r.hero : {};
  const p = r.projectsSection && typeof r.projectsSection === 'object' ? r.projectsSection : {};
  const a = r.automationsSection && typeof r.automationsSection === 'object' ? r.automationsSection : {};
  const diff = r.differentialsSection && typeof r.differentialsSection === 'object' ? r.differentialsSection : {};
  const ab = r.aboutSection && typeof r.aboutSection === 'object' ? r.aboutSection : {};
  const br = r.brandsSection && typeof r.brandsSection === 'object' ? r.brandsSection : {};
  const pr = r.processSection && typeof r.processSection === 'object' ? r.processSection : {};
  const ct = r.contactSection && typeof r.contactSection === 'object' ? r.contactSection : {};

  const proofsSrc = Array.isArray(h.proofs) && h.proofs.length ? h.proofs : d.hero.proofs;
  const groupsSrc = Array.isArray(a.groups) && a.groups.length ? a.groups : d.automationsSection.groups;
  const paraSrc = Array.isArray(ab.paragraphs) && ab.paragraphs.length ? ab.paragraphs : d.aboutSection.paragraphs;
  const subsSrc = Array.isArray(br.subs) && br.subs.length ? br.subs : d.brandsSection.subs;

  return {
    id: 'main',
    brandName: clampStr(r.brandName, 100, d.brandName),
    preCadastroLabel: clampStr(r.preCadastroLabel, 80, d.preCadastroLabel),
    hero: {
      kicker: clampStr(h.kicker, 200, d.hero.kicker),
      title: clampStr(h.title, 400, d.hero.title),
      lead: clampStr(h.lead, 1200, d.hero.lead),
      ctaText: clampStr(h.ctaText, 120, d.hero.ctaText),
      ctaMsg: clampStr(h.ctaMsg, 500, d.hero.ctaMsg),
      secondaryText: clampStr(h.secondaryText, 120, d.hero.secondaryText),
      proofs: proofsSrc.slice(0, 6).map(x => clampStr(x, 160)).filter(Boolean),
      flowTitle: clampStr(h.flowTitle, 200, d.hero.flowTitle),
      flowSteps: clampTitleDescList(h.flowSteps, d.hero.flowSteps, 6)
    },
    projectsSection: {
      kicker: clampStr(p.kicker, 160, d.projectsSection.kicker),
      title: clampStr(p.title, 300, d.projectsSection.title)
    },
    automationsSection: {
      title: clampStr(a.title, 300, d.automationsSection.title),
      ctaText: clampStr(a.ctaText, 500, d.automationsSection.ctaText),
      ctaButtonText: clampStr(a.ctaButtonText, 120, d.automationsSection.ctaButtonText),
      ctaMsg: clampStr(a.ctaMsg, 500, d.automationsSection.ctaMsg),
      groups: groupsSrc.slice(0, 6).map((g, gi) => {
        const fbG = d.automationsSection.groups[gi] || { id: 'grupo-' + (gi + 1), label: 'Grupo', items: [] };
        const itemsSrc = Array.isArray(g?.items) ? g.items : fbG.items;
        return {
          id: clampStr(g?.id, 64, fbG.id).replace(/[^a-zA-Z0-9_\-]/g, '-') || ('grupo-' + (gi + 1)),
          label: clampStr(g?.label, 120, fbG.label),
          items: itemsSrc.slice(0, 12).map(it => ({
            icon: clampStr(it?.icon, 32, 'chat'),
            title: clampStr(it?.title, 200, 'Automação'),
            desc: clampStr(it?.desc, 800, ''),
            tag: clampStr(it?.tag, 200, '')
          }))
        };
      })
    },
    differentialsSection: {
      title: clampStr(diff.title, 300, d.differentialsSection.title),
      subtitle: clampStr(diff.subtitle, 800, d.differentialsSection.subtitle),
      items: clampTitleDescList(diff.items, d.differentialsSection.items, 8)
    },
    aboutSection: {
      kicker: clampStr(ab.kicker, 160, d.aboutSection.kicker),
      title: clampStr(ab.title, 300, d.aboutSection.title),
      paragraphs: paraSrc.slice(0, 8).map(x => clampStr(x, 2000)).filter(Boolean),
      pillars: clampTitleDescList(ab.pillars, d.aboutSection.pillars, 6)
    },
    brandsSection: {
      label: clampStr(br.label, 200, d.brandsSection.label),
      subs: subsSrc.slice(0, 6).map(x => clampStr(x, 120))
    },
    processSection: {
      title: clampStr(pr.title, 300, d.processSection.title),
      subtitle: clampStr(pr.subtitle, 600, d.processSection.subtitle),
      steps: clampTitleDescList(pr.steps, d.processSection.steps, 6)
    },
    contactSection: {
      diagTitle: clampStr(ct.diagTitle, 300, d.contactSection.diagTitle),
      diagText: clampStr(ct.diagText, 800, d.contactSection.diagText),
      diagButtonText: clampStr(ct.diagButtonText, 120, d.contactSection.diagButtonText),
      diagMsg: clampStr(ct.diagMsg, 500, d.contactSection.diagMsg),
      diagNote: clampStr(ct.diagNote, 160, d.contactSection.diagNote),
      whatsapp: clampStr(ct.whatsapp, 32, d.contactSection.whatsapp).replace(/[^\d]/g, '') || d.contactSection.whatsapp,
      whatsappDisplay: clampStr(ct.whatsappDisplay, 40, d.contactSection.whatsappDisplay),
      email: clampStr(ct.email, 200, d.contactSection.email),
      linkedinUrl: clampStr(ct.linkedinUrl, 300, d.contactSection.linkedinUrl),
      linkedinName: clampStr(ct.linkedinName, 120, d.contactSection.linkedinName),
      footerLeft: clampStr(ct.footerLeft, 200, d.contactSection.footerLeft),
      footerRight: clampStr(ct.footerRight, 200, d.contactSection.footerRight)
    }
  };
}

export function renderRichTextInto(el, rawText) {
  if (!el) return;
  el.textContent = '';
  const text = String(rawText ?? '');
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;
  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      el.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      const b = document.createElement('b');
      b.textContent = token.slice(2, -2);
      el.appendChild(b);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      const em = document.createElement('em');
      em.textContent = token.slice(1, -1);
      el.appendChild(em);
    }
    lastIndex = tokenRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    el.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
}

export function sanitizeProjectFields(item, orderIndex) {
  const cat = VALID_CATS.includes(item.cat) ? item.cat : 'empresas';
  return {
    id: String(item.id || ('proj-' + Date.now())).replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, 128),
    title: String(item.title || 'Projeto').trim().slice(0, 200) || 'Projeto',
    cat,
    tag: String(item.tag || 'Site sob medida').trim().slice(0, 120) || 'Site sob medida',
    desc: String(item.desc || 'Projeto personalizado.').trim().slice(0, 1500) || 'Projeto personalizado.',
    cover: String(item.cover || '').slice(0, 500000),
    order: Math.max(0, Math.min(10000, Number.isInteger(orderIndex) ? orderIndex : 0))
  };
}

export function splitHtmlChunks(htmlStr) {
  const src = String(htmlStr || ' ');
  const chunks = [];
  for (let i = 0; i < src.length; i += CHUNK_SIZE) {
    chunks.push(src.slice(i, i + CHUNK_SIZE));
  }
  if (!chunks.length) chunks.push(' ');
  if (chunks.length > MAX_CHUNKS) {
    throw new Error('O arquivo HTML excede o limite suportado de ' + Math.round((MAX_CHUNKS * CHUNK_SIZE) / 1000000) + ' MB.');
  }
  return chunks;
}

export function compressCoverImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const attempts = [
          { maxW: 1200, q: 0.84 },
          { maxW: 960, q: 0.72 },
          { maxW: 720, q: 0.6 },
          { maxW: 540, q: 0.5 }
        ];
        let out = '';
        for (const step of attempts) {
          const scale = img.width > step.maxW ? step.maxW / img.width : 1;
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          try {
            out = canvas.toDataURL('image/webp', step.q);
          } catch (e) {
            out = canvas.toDataURL('image/jpeg', step.q);
          }
          if (out.length <= 450000) break;
        }
        if (out.length > 500000) {
          const scale = img.width > 360 ? 360 / img.width : 1;
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          out = canvas.toDataURL('image/jpeg', 0.4);
        }
        resolve(out.length <= 500000 ? out : '');
      };
      img.onerror = () => {
        const raw = String(reader.result || '');
        resolve(raw.length <= 500000 ? raw : '');
      };
      img.src = reader.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}
