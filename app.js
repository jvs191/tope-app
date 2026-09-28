// Tope App — control de presupuesto de compras. Vanilla JS, sin dependencias.
'use strict';

const KEY = 'tope_session_v1';
const PREFS_KEY = 'tope_prefs_v1';

const LANG_NAMES = { 'pt-BR': 'Português (Brasil)', 'es-UY': 'Español (Uruguay)' };
const CUR_NAMES = {
  BRL: { flag: '🇧🇷', name: { 'pt-BR': 'Real brasileiro', 'es-UY': 'Real brasileño' } },
  UYU: { flag: '🇺🇾', name: { 'pt-BR': 'Peso uruguaio', 'es-UY': 'Peso uruguayo' } },
  USD: { flag: '🇺🇸', name: { 'pt-BR': 'Dólar americano', 'es-UY': 'Dólar estadounidense' } },
};
const CURRENCIES = [
  { code: 'BRL', symbol: 'R$', locale: 'pt-BR', factor: 1, quick: [100, 200, 500] },
  { code: 'UYU', symbol: '$U', locale: 'es-UY', factor: 8.5, quick: [1000, 2000, 5000] },
  { code: 'USD', symbol: 'US$', locale: 'en-US', factor: 0.2125, quick: [100, 300, 500] },
];

// Catálogo real (productos_demo_10.csv + Audífono de oído). Precio en centavos.
const CATALOG = [
  { code: '7891000100011', name: 'Leche Entera 1L', price: 8500, cat: 'Lácteos' },
  { code: '7891000100028', name: 'Yogur Natural 170g', price: 4900, cat: 'Lácteos' },
  { code: '7891000100035', name: 'Arroz Blanco 1kg', price: 7200, cat: 'Almacén' },
  { code: '7891000100042', name: 'Aceite de Girasol 900ml', price: 11500, cat: 'Almacén' },
  { code: '7891000100059', name: 'Fideos Tirabuzón 500g', price: 5800, cat: 'Almacén' },
  { code: '7891000100066', name: 'Detergente Líquido 500ml', price: 9600, cat: 'Limpieza' },
  { code: '7891000100073', name: 'Papel Higiénico 4 Rollos', price: 12800, cat: 'Higiene' },
  { code: '7891000100080', name: 'Galletas Chocolate 120g', price: 6400, cat: 'Snacks' },
  { code: '7891000100097', name: 'Refresco Cola 1.5L', price: 9900, cat: 'Bebidas' },
  { code: '7891000100103', name: 'Café Molido 250g', price: 14500, cat: 'Almacén' },
  { code: 'BFCQ23371', name: 'Audífono de oído', price: 8900, cat: 'Almacén' },
];
const TILES = {
  'Lácteos': ['#E3EEF9', '#2B5C8F'], 'Almacén': ['#F6EBD9', '#8A5A12'], 'Limpieza': ['#E3F2EC', '#236B55'],
  'Higiene': ['#EFE7F6', '#5B3E8F'], 'Snacks': ['#FDF0D9', '#B9740E'], 'Bebidas': ['#DFF3F3', '#146B6B'],
  'Manual': ['#ECEAE4', '#50535A'],
};
const PAL = {
  ok: { c: '#1A8F4C', bg: '#E4F4EA', label: { 'pt-BR': 'Margem suficiente', 'es-UY': 'Margen suficiente' } },
  warn: { c: '#D0690A', bg: '#FDEFDD', label: { 'pt-BR': 'Perto do limite', 'es-UY': 'Cerca del límite' } },
  limit: { c: '#D23A2E', bg: '#FBE7E5', label: { 'pt-BR': 'Orçamento atingido', 'es-UY': 'Presupuesto alcanzado' } },
};

// Comunicación comercial ("Aprovecha tu compra"). Contenido de DEMOSTRACIÓN —
// pensado para venir a futuro de un panel administrativo. Prioridad, vigencia
// y pantallas permitidas separadas del texto (bilingüe, en T[locale].ben).
const BENEFICIOS = [
  { id: 'promo', prioridad: 'alta', icono: '🔥', enlace: '#', activo: true, fechaInicio: null, fechaFin: null, screens: ['shop'] },
  { id: 'postcompra', prioridad: 'alta', icono: '🎁', enlace: '#', activo: true, fechaInicio: null, fechaFin: null, screens: ['summary'] },
  { id: 'app', prioridad: 'media', icono: '📱', enlace: '#', activo: true, fechaInicio: null, fechaFin: null, screens: ['shop', 'result', 'summary'] },
  { id: 'fidelidad', prioridad: 'media', icono: '⭐', enlace: '#', activo: true, fechaInicio: null, fechaFin: null, screens: ['shop', 'result', 'summary'] },
  { id: 'cupon', prioridad: 'media', icono: '🎟️', enlace: null, activo: true, fechaInicio: null, fechaFin: null, screens: ['summary'] },
  { id: 'registro', prioridad: 'media', icono: '🛍️', enlace: '#', activo: true, fechaInicio: null, fechaFin: null, screens: ['result', 'summary'] },
  { id: 'pagomixto', prioridad: 'informativa', icono: '🔄', enlace: '#', activo: true, fechaInicio: null, fechaFin: null, screens: ['shop', 'summary'] },
  { id: 'formaspago', prioridad: 'informativa', icono: '💳', enlace: null, activo: true, fechaInicio: null, fechaFin: null, screens: ['shop'] },
  { id: 'whatsapp', prioridad: 'informativa', icono: '📲', enlace: '#', activo: true, fechaInicio: null, fechaFin: null, screens: ['summary'] },
  { id: 'redes', prioridad: 'informativa', icono: '📢', enlace: '#', activo: true, fechaInicio: null, fechaFin: null, screens: ['summary'] },
];
const PRIORIDAD_PESO = { alta: 0, media: 1, informativa: 2 };

const T = {
  'pt-BR': {
    flag: '🇧🇷', short: 'PT', heroTitle: 'Compre dentro do seu orçamento', heroSub: 'Escaneie cada produto e veja em tempo real quanto ainda tem.',
    currencyLabel: 'Moeda', amountLabel: 'Quanto você quer gastar?', thresholdNote: t => `Vamos avisar quando restar ${t}% ou menos.`, startBtn: 'Começar compra',
    startErr: 'Informe seu orçamento para começar.',
    yourPurchase: 'Sua compra', finish: 'Finalizar', available: 'Disponível', budget: 'Orçamento', spent: 'Gasto', used: 'Usado',
    warnMsg: 'Atenção: você está perto de atingir seu orçamento.', limitMsg: 'Você atingiu seu orçamento.',
    cart: 'Carrinho', clearBtn: 'Limpar', clearConfirm: 'Limpar o carrinho?', no: 'Não', yesClear: 'Sim, limpar',
    emptyCart: 'Seu carrinho está vazio.', emptyCartSub: 'Escaneie seu primeiro produto.', perUnit: 'cada', remove: 'Remover', scanProduct: 'Escanear produto',
    unit: 'produto', units: 'produtos',
    testProducts: 'Produtos de teste', tapToSim: 'Toque em um para simular o escaneamento.', unknownCode: 'Código desconhecido',
    noRead: 'Não está lendo o código?', codePlaceholder: 'Digite o código', search: 'Buscar',
    camIdle: 'Aponte para o código de barras', camStarting: 'Ativando câmera…',
    camNoDetector: 'Este navegador não lê códigos: use a simulação ou digite o código', camDenied: 'Câmera não disponível: use a simulação ou digite o código',
    productFound: 'Produto encontrado', canAdd: 'Você pode adicionar', willRemain: r => `Vai restar ${r}`,
    exceedsBy: e => `Excede seu orçamento em ${e}`, availableColon: a => `Disponível: ${a}`, addBtn: 'Adicionar', cancel: 'Cancelar',
    insufficientTitle: 'Orçamento insuficiente', cantAdd: 'Você não pode adicionar este produto.',
    wouldExceed: e => `Sua compra excederia o orçamento em ${e}.`, costLabelSingle: 'Preço do produto', costLabelQty: n => `Custo (× ${n})`,
    availableBalance: 'Saldo disponível', excess: 'Excedente', notAdded: n => `${n} não foi adicionado. Seu total não mudou.`, continueBuying: 'Continuar comprando',
    notFoundTitle: 'Não encontramos este produto.', notFoundHint: 'Escaneie novamente ou cadastre manualmente com o preço da gôndola.',
    tryAgain: 'Tentar novamente', enterManually: 'Inserir manualmente', backToPurchase: 'Voltar à compra',
    manualEntry: 'Cadastro manual', name: 'Nome', namePlaceholder: 'Ex. Biscoitos', unitPrice: 'Preço unitário', quantity: 'Quantidade', addToCart: 'Adicionar ao carrinho',
    manualErrName: 'Digite o nome do produto.', manualErrPrice: 'Digite um preço válido.',
    purchaseFinished: 'Compra finalizada', totalSpent: 'Total gasto', remaining: 'Saldo restante', productCount: 'Quantidade de produtos', total: 'Total',
    newPurchaseBtn: 'Nova compra', backToCart: 'Voltar ao carrinho',
    added: n => `${n} adicionado`, cartCleared: 'Carrinho esvaziado', exampleLoaded: 'Exemplo carregado', exampleHint: 'Escaneie "Detergente" para ver a rejeição', undo: 'Desfazer',
    onboardTitle: 'Personalize sua compra', onboardSub: 'Configure antes de começar. Pode alterar depois.',
    settingsTitle: 'Ajustes', settingsSub: 'Altere suas preferências. Sua compra atual não é afetada.',
    langSection: 'Idioma', currencySection: 'Moeda de compra', alertSection: 'Alerta de saldo',
    soundSection: 'Sons do aplicativo', continueBtn: 'Continuar', saveBtn: 'Salvar', exitBtn: 'Saída',
    benefitsEyebrow: 'Aproveite sua compra',
    benefitsSection: 'Benefícios comerciais',
    benDemo: n => `Demonstração: aqui se abriria "${n}".`,
    ben: {
      promo: { title: 'Ofertas especiais', desc: 'Descubra as promoções disponíveis hoje na loja.', cta: 'Ver promoções' },
      postcompra: { title: 'Sua próxima compra pode ter prêmio!', desc: 'Conheça nosso programa de fidelidade.', cta: 'Saiba mais' },
      app: { title: 'Aproveite este benefício', desc: 'Baixe o app e descubra descontos exclusivos.', cta: 'Baixar app' },
      fidelidad: { title: 'Compre, acumule e aproveite', desc: 'Some pontos a cada compra e troque por benefícios.', cta: 'Conhecer programa' },
      cupon: { title: 'Tem um cupom?', desc: 'Use-o ao finalizar sua compra e aproveite seus benefícios.', cta: '' },
      registro: { title: 'Cadastre-se e ganhe benefícios exclusivos', desc: 'Crie sua conta e desbloqueie promoções especiais.', cta: 'Cadastrar-se' },
      pagomixto: { title: 'Não quer pagar tudo de uma vez?', desc: 'Consulte nossas opções de pagamento misto no caixa.', cta: 'Ver mais' },
      formaspago: { title: 'Pague como preferir', desc: 'Aceitamos diferentes formas de pagamento para sua comodidade.', cta: '' },
      whatsapp: { title: 'Precisa de ajuda?', desc: 'Fale conosco pelo WhatsApp, temos prazer em ajudar.', cta: 'Abrir WhatsApp' },
      redes: { title: 'Siga-nos nas redes', desc: 'Fique por dentro das nossas promoções e novidades.', cta: 'Seguir' },
    },
  },
  'es-UY': {
    flag: '🇺🇾', short: 'ES', heroTitle: 'Compra dentro de tu presupuesto', heroSub: 'Escanea cada producto y mira en tiempo real cuánto te queda.',
    currencyLabel: 'Moneda', amountLabel: '¿Cuánto quieres gastar?', thresholdNote: t => `Te avisaremos cuando te quede el ${t}% o menos.`, startBtn: 'Comenzar compra',
    startErr: 'Ingresa tu presupuesto para comenzar.',
    yourPurchase: 'Tu compra', finish: 'Finalizar', available: 'Disponible', budget: 'Presupuesto', spent: 'Gastado', used: 'Usado',
    warnMsg: 'Atención: estás cerca de alcanzar tu presupuesto.', limitMsg: 'Has alcanzado tu presupuesto.',
    cart: 'Carrito', clearBtn: 'Vaciar', clearConfirm: '¿Vaciar el carrito?', no: 'No', yesClear: 'Sí, vaciar',
    emptyCart: 'Tu carrito está vacío.', emptyCartSub: 'Escanea tu primer producto.', perUnit: 'c/u', remove: 'Quitar', scanProduct: 'Escanear producto',
    unit: 'producto', units: 'productos',
    testProducts: 'Productos de prueba', tapToSim: 'Toca uno para simular el escaneo.', unknownCode: 'Código desconocido',
    noRead: '¿No lee el código?', codePlaceholder: 'Escribe el código', search: 'Buscar',
    camIdle: 'Apunta al código de barras', camStarting: 'Activando cámara…',
    camNoDetector: 'Este navegador no lee códigos: usa la simulación o escribe el código', camDenied: 'Cámara no disponible: usa la simulación o escribe el código',
    productFound: 'Producto encontrado', canAdd: 'Puedes agregarlo', willRemain: r => `Te quedarán ${r}`,
    exceedsBy: e => `Excede tu presupuesto en ${e}`, availableColon: a => `Disponible: ${a}`, addBtn: 'Agregar', cancel: 'Cancelar',
    insufficientTitle: 'Presupuesto insuficiente', cantAdd: 'No puedes agregar este producto.',
    wouldExceed: e => `Tu compra superaría el presupuesto en ${e}.`, costLabelSingle: 'Precio del producto', costLabelQty: n => `Costo (× ${n})`,
    availableBalance: 'Saldo disponible', excess: 'Excedente', notAdded: n => `${n} no se agregó. Tu total no cambió.`, continueBuying: 'Continuar comprando',
    notFoundTitle: 'No encontramos este producto.', notFoundHint: 'Vuelve a escanearlo o cárgalo a mano con el precio de la góndola.',
    tryAgain: 'Intentar nuevamente', enterManually: 'Ingresar manualmente', backToPurchase: 'Volver a la compra',
    manualEntry: 'Carga manual', name: 'Nombre', namePlaceholder: 'Ej. Galletitas', unitPrice: 'Precio unitario', quantity: 'Cantidad', addToCart: 'Agregar al carrito',
    manualErrName: 'Escribe el nombre del producto.', manualErrPrice: 'Escribe un precio válido.',
    purchaseFinished: 'Compra finalizada', totalSpent: 'Total gastado', remaining: 'Saldo restante', productCount: 'Cantidad de productos', total: 'Total',
    newPurchaseBtn: 'Nueva compra', backToCart: 'Volver al carrito',
    added: n => `${n} agregado`, cartCleared: 'Carrito vaciado', exampleLoaded: 'Ejemplo cargado', exampleHint: 'Escanea "Detergente" para ver el rechazo', undo: 'Deshacer',
    onboardTitle: 'Personaliza tu compra', onboardSub: 'Configura antes de empezar. Podrás cambiarlo luego.',
    settingsTitle: 'Ajustes', settingsSub: 'Cambia tus preferencias. Tu compra actual no se ve afectada.',
    langSection: 'Idioma', currencySection: 'Moneda de compra', alertSection: 'Alerta de saldo',
    soundSection: 'Sonidos de la aplicación', continueBtn: 'Continuar', saveBtn: 'Guardar', exitBtn: 'Salir',
    benefitsEyebrow: 'Aprovecha tu compra',
    benefitsSection: 'Beneficios comerciales',
    benDemo: n => `Demostración: aquí se abriría "${n}".`,
    ben: {
      promo: { title: 'Ofertas especiales', desc: 'Descubre las promociones disponibles hoy en la tienda.', cta: 'Ver promociones' },
      postcompra: { title: '¡Tu próxima compra puede tener premio!', desc: 'Conoce nuestro programa de fidelización.', cta: 'Conocer más' },
      app: { title: 'Aprovecha este beneficio', desc: 'Descarga la app y descubre descuentos exclusivos.', cta: 'Descargar app' },
      fidelidad: { title: 'Compra, acumula y disfruta', desc: 'Suma puntos con cada compra y canjéalos por beneficios.', cta: 'Conocer programa' },
      cupon: { title: '¿Tienes un cupón?', desc: 'Utilízalo al finalizar tu compra y aprovecha tus beneficios.', cta: '' },
      registro: { title: 'Regístrate y obtén beneficios exclusivos', desc: 'Crea tu cuenta y desbloquea promociones especiales.', cta: 'Registrarme' },
      pagomixto: { title: '¿No quieres pagar todo de una sola forma?', desc: 'Consulta nuestras opciones de pago mixto en caja.', cta: 'Ver más' },
      formaspago: { title: 'Paga como prefieras', desc: 'Aceptamos distintas formas de pago para tu comodidad.', cta: '' },
      whatsapp: { title: '¿Necesitas ayuda?', desc: 'Escríbenos por WhatsApp, con gusto te ayudamos.', cta: 'Abrir WhatsApp' },
      redes: { title: 'Síguenos en redes', desc: 'Entérate primero de nuestras promociones y novedades.', cta: 'Seguir' },
    },
  },
};

const Engine = {
  totals(budget, cart, thr) {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const units = cart.reduce((s, i) => s + i.qty, 0);
    const available = budget - total;
    const pct = budget > 0 ? (total / budget) * 100 : 0;
    const status = available <= 0 ? 'limit' : available <= Math.round(budget * thr / 100) ? 'warn' : 'ok';
    return { total, units, available, pct, status };
  },
  check(budget, total, cost) {
    const next = total + cost;
    return next <= budget ? { ok: true, after: budget - next } : { ok: false, available: budget - total, excess: next - budget };
  },
};

function initState() {
  let prefs = {};
  try { prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null') || {}; } catch (e) {}
  return {
    screen: 'welcome', budgetInput: '', budget: 0, cart: [], startErr: '', shake: 0, pending: null, qty: 1, alert: null,
    pendingCode: '', manual: { name: '', price: '', qty: 1 }, manualErr: '', codeInput: '', toast: null, confirmClear: false, cam: 'idle', endedAt: null,
    currency: ['BRL', 'UYU', 'USD'].includes(prefs.currency) ? prefs.currency : 'BRL',
    locale: prefs.locale === 'es-UY' ? 'es-UY' : 'pt-BR',
    threshold: isFinite(prefs.threshold) && prefs.threshold > 0 ? prefs.threshold : 20,
    soundOn: typeof prefs.soundOn === 'boolean' ? prefs.soundOn : true,
    beneficiosOn: typeof prefs.beneficiosOn === 'boolean' ? prefs.beneficiosOn : true,
    settingsReturn: 'start', beneficiosCursor: {}, beneficiosCerrado: {}, onboarded: false,
  };
}

const s = initState();
let pendingBeneficiosSave = false;
function savePrefs() {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify({ locale: s.locale, currency: s.currency, threshold: s.threshold, soundOn: s.soundOn, beneficiosOn: s.beneficiosOn })); } catch (e) {}
}
function saveSession() {
  try { localStorage.setItem(KEY, JSON.stringify({ budget: s.budget, cart: s.cart, screen: s.screen, endedAt: s.endedAt, currency: s.currency })); } catch (e) {}
}

function L() { return T[s.locale]; }
function cur() { return CURRENCIES.find(c => c.code === s.currency); }
function thr() { const t = Number(s.threshold); return isFinite(t) && t > 0 ? t : 20; }
function totals(cart) { return Engine.totals(s.budget, cart || s.cart, thr()); }
function fmt(baseCents) {
  const c = cur();
  const converted = baseCents * c.factor;
  const a = Math.abs(converted);
  const roundedCents = Math.round(a);
  const str = (a / 100).toLocaleString(c.locale, { minimumFractionDigits: roundedCents % 100 ? 2 : 0, maximumFractionDigits: 2 });
  return (converted < 0 ? '−' : '') + c.symbol + ' ' + str;
}
function parseMoney(str) {
  let v = String(str || '').trim();
  if (!v) return NaN;
  v = v.includes(',') ? v.replace(/\./g, '').replace(',', '.') : v.replace(/\./g, '');
  const n = parseFloat(v);
  if (!isFinite(n)) return NaN;
  return (n * 100) / cur().factor;
}
function tile(p) {
  const [bg, ink] = TILES[p.cat] || TILES.Manual;
  const initials = p.name.split(/\s+/).filter(w => /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(w[0])).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  return { bg, ink, initials };
}
function buscarCodigo(code) { return CATALOG.find(p => p.code === code); }

// ---------- Sonido / vibración ----------
function playRef(id) { const el = document.getElementById(id); if (!el) return; try { el.pause(); el.currentTime = 0; el.play().catch(() => {}); } catch (e) {} }
function vibrate(pattern) { try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) {} }
function playAdded() { vibrate(30); if (s.soundOn) playRef('audio-added'); }
function playFinished() { vibrate([30, 40, 30]); if (s.soundOn) playRef('audio-finished'); }
function playInsufficient() { vibrate([60, 50, 60]); if (s.soundOn) playRef('audio-insufficient'); }

let toastTimer = null;
function showToast(msg, sub, canUndo) {
  clearTimeout(toastTimer);
  s.toast = { msg, sub, canUndo: !!canUndo };
  renderToast();
  toastTimer = setTimeout(() => { s.toast = null; renderToast(); }, 2600);
}

// ---------- Beneficios ("Aprovecha tu compra") ----------
function beneficioFor(screenKey) {
  if (!s.beneficiosOn) return null;
  const ahora = Date.now();
  const vigentes = BENEFICIOS.filter(b => b.screens.includes(screenKey) && b.activo &&
    (!b.fechaInicio || ahora >= new Date(b.fechaInicio).getTime()) && (!b.fechaFin || ahora <= new Date(b.fechaFin).getTime()));
  if (!vigentes.length) return null;
  const ordenados = [...vigentes].sort((a, b) => PRIORIDAD_PESO[a.prioridad] - PRIORIDAD_PESO[b.prioridad]);
  const idx = (s.beneficiosCursor[screenKey] || 0) % ordenados.length;
  if (s.beneficiosCerrado[screenKey] === idx) return null;
  const b = ordenados[idx];
  const txt = (L().ben && L().ben[b.id]) || {};
  return { b, idx, screenKey, titulo: txt.title || '', descripcion: txt.desc || '', cta: txt.cta || '' };
}
function bumpBeneficioCursor(screenKey) {
  s.beneficiosCursor[screenKey] = (s.beneficiosCursor[screenKey] || 0) + 1;
}
function renderBeneficio(containerId, screenKey, compacta) {
  const el = document.getElementById(containerId);
  const info = beneficioFor(screenKey);
  if (!info) { el.innerHTML = ''; return; }
  el.innerHTML = `
    <div class="beneficio-card${compacta ? ' compacta' : ''}">
      <div class="beneficio-header">
        <span class="beneficio-eyebrow">${L().benefitsEyebrow}</span>
        <button class="beneficio-cerrar" aria-label="Cerrar">✕</button>
      </div>
      <div class="beneficio-body">
        <span class="beneficio-icono">${info.b.icono}</span>
        <div><div class="beneficio-titulo">${info.titulo}</div><div class="beneficio-desc">${info.descripcion}</div></div>
      </div>
      ${info.cta ? `<button class="beneficio-cta">${info.cta} →</button>` : ''}
    </div>`;
  el.querySelector('.beneficio-cerrar').addEventListener('click', () => { s.beneficiosCerrado[screenKey] = info.idx; el.innerHTML = ''; });
  const ctaBtn = el.querySelector('.beneficio-cta');
  if (ctaBtn) ctaBtn.addEventListener('click', () => {
    if (info.b.enlace && info.b.enlace !== '#') window.open(info.b.enlace, '_blank');
    else showToast(L().benDemo(info.titulo), '', false);
  });
}

// ---------- Navegación ----------
let stream = null, scanTimer = null, lastCode = null, lastCodeAt = 0, undoCart = null;
function go(screen) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  document.getElementById('screen-' + screen).classList.add('active');
  s.screen = screen;
  saveSession();
  if (screen === 'scan') startCam(); else stopCam();
  render(screen);
}

function render(screen) {
  renderToast();
  if (screen === 'welcome') return;
  if (screen === 'prefs') return renderPrefs();
  if (screen === 'start') return renderStart();
  if (screen === 'shop') return renderShop();
  if (screen === 'scan') return renderScan();
}

// ---------- Textos estáticos por idioma (se re-render al togglear idioma) ----------
function renderStaticLabels() {
  const L_ = L();
  document.getElementById('lbl-currency-section').textContent = L_.currencySection;
  document.getElementById('lbl-currency-section2').textContent = L_.currencySection;
  document.getElementById('lbl-alert-section').textContent = L_.alertSection;
  document.getElementById('lbl-sound-section').textContent = L_.soundSection;
  document.getElementById('lbl-benefits-section').textContent = L_.benefitsSection;
  document.getElementById('lbl-your-purchase').textContent = L_.yourPurchase;
  document.getElementById('btn-shop-finish').textContent = L_.finish;
  document.getElementById('lbl-available').textContent = L_.available;
  document.getElementById('lbl-budget').textContent = L_.budget;
  document.getElementById('lbl-spent').textContent = L_.spent;
  document.getElementById('lbl-used').textContent = L_.used;
  document.getElementById('lbl-cart').textContent = L_.cart;
  document.getElementById('btn-clear-cart').textContent = L_.clearBtn;
  document.getElementById('lbl-scan-product').textContent = L_.scanProduct;
  document.getElementById('lbl-test-products').textContent = L_.testProducts;
  document.getElementById('lbl-tap-to-sim').textContent = L_.tapToSim;
  document.getElementById('lbl-no-read').textContent = L_.noRead;
  document.getElementById('input-code').placeholder = L_.codePlaceholder;
  document.getElementById('btn-submit-code').textContent = L_.search;
  document.getElementById('lbl-product-found').textContent = L_.productFound;
  document.getElementById('btn-result-cancel').textContent = L_.cancel;
  document.getElementById('lbl-manual-entry').textContent = L_.manualEntry;
  document.getElementById('lbl-name').textContent = L_.name;
  document.getElementById('input-manual-name').placeholder = L_.namePlaceholder;
  document.getElementById('lbl-unit-price').textContent = L_.unitPrice;
  document.getElementById('lbl-quantity').textContent = L_.quantity;
  document.getElementById('btn-manual-submit').textContent = L_.addToCart;
  document.getElementById('manual-currency-symbol').textContent = cur().symbol;
  document.getElementById('alert-cost-label').textContent = s.alert && s.alert.qty > 1 ? L_.costLabelQty(s.alert.qty) : L_.costLabelSingle;
  document.getElementById('alert-avail-label').textContent = L_.availableBalance;
  document.getElementById('alert-excess-label').textContent = L_.excess;
  document.getElementById('btn-alert-continue').textContent = L_.continueBuying;
  document.getElementById('btn-alert-cancel').textContent = L_.cancel;
  document.getElementById('notfound-hint').textContent = L_.notFoundHint;
  document.getElementById('btn-notfound-retry').textContent = L_.tryAgain;
  document.getElementById('btn-notfound-manual').textContent = L_.enterManually;
  document.getElementById('btn-notfound-back').textContent = L_.backToPurchase;
  document.getElementById('lbl-budget2').textContent = L_.budget;
  document.getElementById('lbl-total-spent').textContent = L_.totalSpent;
  document.getElementById('lbl-remaining').textContent = L_.remaining;
  document.getElementById('lbl-product-count').textContent = L_.productCount;
  document.getElementById('lbl-total').textContent = L_.total;
  document.getElementById('btn-new-purchase').textContent = L_.newPurchaseBtn;
  document.getElementById('btn-back-to-cart').textContent = L_.backToCart;
  document.getElementById('summary-thanks').textContent = L_.thankYou || '';
  document.getElementById('start-hero-title').textContent = L_.heroTitle;
  document.getElementById('start-hero-sub').textContent = L_.heroSub;
  document.getElementById('start-currency-name').textContent = s.currency;
  document.getElementById('lbl-amount').textContent = L_.amountLabel;
  document.getElementById('btn-start-purchase').textContent = L_.startBtn;
  document.getElementById('btn-start-locale').textContent = `${L_.flag} ${L_.short}`;
  document.getElementById('btn-shop-locale').textContent = L_.flag;
}

// ---------- Preferencias / Ajustes ----------
function renderPrefs() {
  const L_ = L();
  const isOnboarding = !s.onboarded;
  document.getElementById('prefs-title').textContent = isOnboarding ? L_.onboardTitle : L_.settingsTitle;
  document.getElementById('prefs-sub').textContent = isOnboarding ? L_.onboardSub : L_.settingsSub;
  document.getElementById('btn-prefs-back').style.display = isOnboarding ? 'none' : '';
  document.getElementById('btn-prefs-continue').textContent = isOnboarding ? L_.continueBtn : L_.saveBtn;
  document.getElementById('prefs-locale-name').textContent = `${L_.flag} ${LANG_NAMES[s.locale]}`;
  document.getElementById('prefs-currency-name').textContent = `${CUR_NAMES[s.currency].flag} ${s.currency}`;
  document.getElementById('prefs-threshold-val').textContent = s.threshold + '%';
  renderStaticLabels();

  const localeBox = document.getElementById('prefs-locale-options');
  localeBox.innerHTML = '';
  ['pt-BR', 'es-UY'].forEach(code => {
    const btn = document.createElement('button');
    btn.className = 'pill-btn' + (code === s.locale ? ' active' : '');
    btn.style.flex = '1'; btn.style.height = '34px';
    btn.textContent = `${T[code].flag} ${T[code].short}`;
    btn.addEventListener('click', () => { s.locale = code; renderPrefs(); });
    localeBox.appendChild(btn);
  });

  const curBox = document.getElementById('prefs-currency-options');
  curBox.innerHTML = '';
  CURRENCIES.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'pill-btn' + (c.code === s.currency ? ' active' : '');
    btn.style.flex = '1'; btn.style.height = '34px';
    btn.textContent = `${CUR_NAMES[c.code].flag} ${c.code}`;
    btn.addEventListener('click', () => { s.currency = c.code; renderPrefs(); });
    curBox.appendChild(btn);
  });

  const thBox = document.getElementById('prefs-threshold-options');
  thBox.innerHTML = '';
  [10, 15, 20, 25].forEach(v => {
    const btn = document.createElement('button');
    btn.className = 'pill-btn' + (v === s.threshold ? ' active' : '');
    btn.style.flex = '1'; btn.style.height = '34px'; btn.style.fontSize = '13px';
    btn.textContent = v + '%';
    btn.addEventListener('click', () => { s.threshold = v; renderPrefs(); });
    thBox.appendChild(btn);
  });

  document.getElementById('switch-sound').classList.toggle('on', s.soundOn);
  document.getElementById('switch-benefits').classList.toggle('on', s.beneficiosOn);
}

// ---------- Inicio ----------
function renderStart() {
  renderStaticLabels();
  document.getElementById('input-budget').value = s.budgetInput;
  document.getElementById('start-currency-symbol').textContent = cur().symbol;
  document.getElementById('start-threshold-note').textContent = L().thresholdNote(thr());
  const errBox = document.getElementById('start-err');
  errBox.style.display = s.startErr ? '' : 'none';
  errBox.textContent = s.startErr;
  document.getElementById('budget-row').style.boxShadow = s.startErr ? '0 0 0 2px #D23A2E inset' : 'none';

  const quick = document.getElementById('quick-amounts');
  quick.innerHTML = '';
  cur().quick.forEach(v => {
    const btn = document.createElement('button');
    btn.className = 'pill-btn'; btn.style.height = '44px'; btn.style.padding = '0 16px'; btn.style.fontSize = '15px'; btn.style.color = 'var(--ink)';
    btn.textContent = cur().symbol + ' ' + v.toLocaleString(cur().locale);
    btn.addEventListener('click', () => { s.budgetInput = String(v); s.startErr = ''; renderStart(); });
    quick.appendChild(btn);
  });
}

function startPurchase() {
  const c = parseMoney(s.budgetInput);
  if (!(typeof c === 'number' && isFinite(c) && c > 0)) {
    playInsufficient(); s.startErr = L().startErr; s.shake++; renderStart();
    return;
  }
  s.budget = c; s.cart = []; s.startErr = ''; s.endedAt = null; s.alert = null;
  go('shop');
}

// ---------- Compra ----------
function renderShop() {
  renderStaticLabels();
  const t = totals();
  const pal = s.budget > 0 ? PAL[t.status] : PAL.ok;
  document.getElementById('status-chip').style.background = pal.bg;
  document.getElementById('status-chip').style.color = pal.c;
  document.getElementById('status-dot').style.background = pal.c;
  document.getElementById('status-label').textContent = s.budget > 0 ? pal.label[s.locale] : '—';
  document.getElementById('available-amount').textContent = fmt(t.available);
  document.getElementById('available-amount').style.color = pal.c;
  document.getElementById('progress-bar').style.width = Math.min(100, t.pct) + '%';
  document.getElementById('progress-bar').style.background = pal.c;
  document.getElementById('val-budget').textContent = fmt(s.budget);
  document.getElementById('val-spent').textContent = fmt(t.total);
  document.getElementById('val-used').textContent = Math.round(t.pct) + '%';
  document.getElementById('cart-units').textContent = `· ${t.units} ${t.units === 1 ? L().unit : L().units}`;
  document.getElementById('btn-clear-cart').style.display = s.cart.length ? '' : 'none';

  const banner = document.getElementById('status-banner');
  if (s.budget > 0 && t.status === 'warn') {
    banner.style.display = 'flex'; banner.style.background = '#FDEFDD'; banner.style.color = '#8A4506';
    document.getElementById('status-banner-dot').style.background = '#D0690A';
    document.getElementById('status-banner-msg').textContent = L().warnMsg;
  } else if (s.budget > 0 && t.status === 'limit') {
    banner.style.display = 'flex'; banner.style.background = '#FBE7E5'; banner.style.color = '#8E1F16';
    document.getElementById('status-banner-dot').style.background = '#D23A2E';
    document.getElementById('status-banner-msg').textContent = L().limitMsg;
  } else banner.style.display = 'none';

  renderBeneficio('beneficio-shop', 'shop', false);

  document.getElementById('cart-empty').style.display = s.cart.length ? 'none' : '';
  document.getElementById('cart-empty').innerHTML = `${L().emptyCart}<br>${L().emptyCartSub}`;
  const list = document.getElementById('cart-list');
  list.innerHTML = '';
  s.cart.forEach(it => {
    const tl = tile(it);
    const row = document.createElement('div');
    row.className = 'card'; row.style.borderRadius = '20px'; row.style.padding = '12px';
    row.style.display = 'grid'; row.style.gridTemplateColumns = '52px 1fr auto'; row.style.gap = '12px'; row.style.alignItems = 'start';
    row.style.animation = 'tp-rise .3s ease';
    row.innerHTML = `
      <div style="width:52px;height:52px;border-radius:14px;background:${tl.bg};color:${tl.ink};display:flex;align-items:center;justify-content:center;font:700 16px 'Onest'">${tl.initials}</div>
      <div style="min-width:0">
        <div style="font:600 15px/1.25 'Onest'">${it.name}</div>
        <div style="font:400 11px 'JetBrains Mono';color:var(--ink-faint);margin-top:3px">${it.code}</div>
        <div style="font:500 13px 'Onest';color:var(--ink-soft);margin-top:3px">${fmt(it.price)} ${L().perUnit}</div>
      </div>
      <div style="font:700 16px 'Onest';text-align:right">${fmt(it.price * it.qty)}</div>
      <div style="grid-column:2 / 4;display:flex;align-items:center;justify-content:space-between">
        <div class="stepper"><button data-dec="${it.code}">−</button><span>${it.qty}</span><button data-inc="${it.code}">+</button></div>
        <button data-remove="${it.code}" style="height:40px;padding:0 10px;border:0;background:none;font:500 13px 'Onest';color:var(--ink-softer);cursor:pointer">${L().remove}</button>
      </div>`;
    list.appendChild(row);
  });
  list.querySelectorAll('[data-inc]').forEach(b => b.addEventListener('click', () => {
    const p = buscarCodigo(b.getAttribute('data-inc'));
    const chk = Engine.check(s.budget, totals().total, p.price);
    if (!chk.ok) { showAlert(p.name, p.price, 1, 'cart'); return; }
    const item = s.cart.find(x => x.code === p.code); item.qty += 1;
    playAdded(); saveSession(); renderShop();
  }));
  list.querySelectorAll('[data-dec]').forEach(b => b.addEventListener('click', () => {
    const code = b.getAttribute('data-dec');
    const item = s.cart.find(x => x.code === code); if (!item) return;
    item.qty -= 1; if (item.qty <= 0) s.cart = s.cart.filter(x => x.code !== code);
    saveSession(); renderShop();
  }));
  list.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => {
    s.cart = s.cart.filter(x => x.code !== b.getAttribute('data-remove'));
    saveSession(); renderShop();
  }));

  document.getElementById('confirm-clear').style.display = s.confirmClear ? 'flex' : 'none';
  document.getElementById('confirm-clear-msg').textContent = L().clearConfirm;
  document.getElementById('btn-cancel-clear').textContent = L().no;
  document.getElementById('btn-confirm-clear').textContent = L().yesClear;
}

function showAlert(name, cost, qty, from) {
  const t = totals();
  playInsufficient();
  s.alert = { name, cost, qty, from, available: s.budget - t.total, excess: t.total + cost - s.budget };
  renderAlert();
  go('alert');
}
function addToCart(p, qty, from) {
  const t = totals();
  const cost = p.price * qty;
  const chk = Engine.check(s.budget, t.total, cost);
  if (!chk.ok) { showAlert(p.name, cost, qty, from); return false; }
  const ex = s.cart.find(i => i.code === p.code);
  undoCart = s.cart.map(i => ({ ...i }));
  if (ex) ex.qty += qty; else s.cart.push({ code: p.code, name: p.name, price: p.price, cat: p.cat, qty });
  playAdded(); saveSession();
  const label = p.name + (qty > 1 ? ' × ' + qty : '');
  showToast(L().added(label), `${L().available} ${fmt(chk.after)}`, true);
  return true;
}

// ---------- Escáner ----------
function renderScan() {
  renderStaticLabels();
  const t = totals();
  const pal = s.budget > 0 ? PAL[t.status] : PAL.ok;
  document.getElementById('scan-status-dot').style.background = pal.c;
  document.getElementById('scan-available-label').textContent = `${L().available} ${fmt(t.available)}`;
  document.getElementById('input-code').value = '';

  const grid = document.getElementById('catalog-grid');
  grid.innerHTML = '';
  CATALOG.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'pill-btn';
    btn.style.cssText = 'height:44px;padding:0 12px;border-radius:14px;display:flex;align-items:center;gap:8px;font:500 14px "Onest";color:var(--ink)';
    btn.innerHTML = `${p.name} <span style="font-weight:700">${fmt(p.price)}</span>`;
    btn.addEventListener('click', () => { lastCode = null; onCode(p.code); });
    grid.appendChild(btn);
  });
  const unknownBtn = document.createElement('button');
  unknownBtn.className = 'pill-btn';
  unknownBtn.style.cssText = 'height:44px;padding:0 12px;border-radius:14px;border-style:dashed;color:var(--ink-soft)';
  unknownBtn.textContent = L().unknownCode;
  unknownBtn.addEventListener('click', () => { lastCode = null; onCode('0000000000000'); });
  grid.appendChild(unknownBtn);
}

function onCode(raw) {
  const code = String(raw || '').replace(/\s/g, '');
  if (!code) return;
  const now = Date.now();
  if (code === lastCode && now - lastCodeAt < 2000) return;
  lastCode = code; lastCodeAt = now;
  const p = buscarCodigo(code);
  if (!p) {
    playInsufficient();
    s.pendingCode = code;
    document.getElementById('notfound-title').textContent = L().notFoundTitle;
    document.getElementById('notfound-code').textContent = code;
    go('notfound');
    return;
  }
  const t = totals();
  if (!Engine.check(s.budget, t.total, p.price).ok) { showAlert(p.name, p.price, 1, 'scan'); return; }
  playAdded();
  s.pending = p; s.qty = 1;
  renderResult();
  go('result');
}

async function startCam() {
  const camMsgEl = document.getElementById('scan-cam-msg');
  const video = document.getElementById('scan-video');
  const md = navigator.mediaDevices;
  if (!md || !md.getUserMedia) { camMsgEl.textContent = L().camDenied; return; }
  camMsgEl.textContent = L().camStarting;
  try {
    stream = await md.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    if (s.screen !== 'scan') { stream.getTracks().forEach(t => t.stop()); return; }
    video.srcObject = stream;
    await video.play().catch(() => {});
    if ('BarcodeDetector' in window) {
      const det = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] });
      video.style.opacity = 1;
      camMsgEl.textContent = L().camIdle;
      scanTimer = setInterval(async () => {
        if (video.readyState < 2) return;
        try { const r = await det.detect(video); if (r && r[0]) onCode(r[0].rawValue); } catch (e) {}
      }, 300);
    } else {
      video.style.opacity = 1;
      camMsgEl.textContent = L().camNoDetector;
    }
  } catch (e) {
    camMsgEl.textContent = L().camDenied;
  }
}
function stopCam() {
  clearInterval(scanTimer); scanTimer = null;
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  const video = document.getElementById('scan-video');
  video.srcObject = null; video.style.opacity = 0;
}

// ---------- Resultado ----------
function renderResult() {
  const L_ = L();
  const p = s.pending;
  const tl = tile(p);
  const tileEl = document.getElementById('result-tile');
  tileEl.style.background = tl.bg; tileEl.style.color = tl.ink; tileEl.textContent = tl.initials;
  document.getElementById('result-name').textContent = p.name;
  document.getElementById('result-code').textContent = p.code;
  document.getElementById('result-price').textContent = fmt(p.price);
  document.getElementById('result-qty').textContent = s.qty;

  const t = totals();
  const cost = p.price * s.qty;
  const chk = Engine.check(s.budget, t.total, cost);
  const box = document.getElementById('result-verdict');
  if (chk.ok) {
    box.style.background = '#E4F4EA'; box.style.color = '#1A6E3D';
    document.getElementById('result-verdict-title').textContent = L_.canAdd;
    document.getElementById('result-verdict-sub').textContent = L_.willRemain(fmt(chk.after));
  } else {
    box.style.background = '#FBE7E5'; box.style.color = '#8E1F16';
    document.getElementById('result-verdict-title').textContent = L_.exceedsBy(fmt(chk.excess));
    document.getElementById('result-verdict-sub').textContent = L_.availableColon(fmt(chk.available));
  }
  document.getElementById('btn-confirm-add').textContent = `${L_.addBtn} · ${fmt(cost)}`;
  renderBeneficio('beneficio-result', 'result', true);
}

// ---------- Alerta ----------
function renderAlert() {
  const L_ = L();
  const al = s.alert;
  document.getElementById('alert-title').textContent = L_.insufficientTitle;
  document.getElementById('alert-cant-add').textContent = L_.cantAdd;
  document.getElementById('alert-would-exceed').textContent = L_.wouldExceed(fmt(al.excess));
  document.getElementById('alert-cost-label').textContent = al.qty > 1 ? L_.costLabelQty(al.qty) : L_.costLabelSingle;
  document.getElementById('alert-cost-val').textContent = fmt(al.cost);
  document.getElementById('alert-avail-label').textContent = L_.availableBalance;
  document.getElementById('alert-avail-val').textContent = fmt(al.available);
  document.getElementById('alert-excess-label').textContent = L_.excess;
  document.getElementById('alert-excess-val').textContent = fmt(al.excess);
  document.getElementById('alert-not-added').textContent = L_.notAdded(al.name);
  document.getElementById('btn-alert-continue').textContent = L_.continueBuying;
  document.getElementById('btn-alert-cancel').textContent = L_.cancel;
}

// ---------- Carga manual ----------
function renderManual() {
  renderStaticLabels();
  document.getElementById('input-manual-name').value = s.manual.name;
  document.getElementById('input-manual-price').value = s.manual.price;
  document.getElementById('manual-qty').textContent = s.manual.qty;
  const mPrice = parseMoney(s.manual.price);
  const box = document.getElementById('manual-verdict');
  if (mPrice >= 0 && s.manual.price !== '') {
    const t = totals();
    const cost = mPrice * s.manual.qty;
    const chk = Engine.check(s.budget, t.total, cost);
    box.style.display = '';
    if (chk.ok) {
      box.style.background = '#E4F4EA'; box.style.color = '#1A6E3D';
      document.getElementById('manual-verdict-title').textContent = L().canAdd;
      document.getElementById('manual-verdict-sub').textContent = L().willRemain(fmt(chk.after));
    } else {
      box.style.background = '#FBE7E5'; box.style.color = '#8E1F16';
      document.getElementById('manual-verdict-title').textContent = L().exceedsBy(fmt(chk.excess));
      document.getElementById('manual-verdict-sub').textContent = L().availableColon(fmt(chk.available));
    }
  } else box.style.display = 'none';
  const errEl = document.getElementById('manual-err');
  errEl.style.display = s.manualErr ? '' : 'none';
  errEl.textContent = s.manualErr;
}

// ---------- Resumen ----------
function renderSummary() {
  renderStaticLabels();
  const r = s.__lastSummary;
  if (!r) return;
  document.getElementById('summary-finished').textContent = L().purchaseFinished;
  document.getElementById('summary-date').textContent = new Date(r.date).toLocaleString(s.locale, { dateStyle: 'medium', timeStyle: 'short' });
  document.getElementById('summary-budget').textContent = fmt(r.budget);
  document.getElementById('summary-total').textContent = fmt(r.total);
  document.getElementById('summary-remaining').textContent = fmt(r.budget - r.total);
  document.getElementById('summary-units').textContent = r.items.reduce((a, i) => a + i.qty, 0);
  document.getElementById('summary-total2').textContent = fmt(r.total);
  const list = document.getElementById('summary-items');
  list.innerHTML = '';
  r.items.forEach(it => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:baseline;gap:10px;padding:12px 0;border-bottom:1px solid #F1EEE8';
    row.innerHTML = `<span style="flex:1;font:500 15px 'Onest'">${it.name} <span style="color:var(--ink-softer)">× ${it.qty}</span></span><span style="font:600 15px 'Onest'">${fmt(it.price * it.qty)}</span>`;
    list.appendChild(row);
  });
  renderBeneficio('beneficio-summary', 'summary', false);
}

// ---------- Toast ----------
function renderToast() {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  if (!s.toast) return;
  const active = document.querySelector('.screen.active');
  if (!active) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="check">✓</span><div style="flex:1;min-width:0"><div class="msg">${s.toast.msg}</div><div class="sub">${s.toast.sub}</div></div>${s.toast.canUndo ? `<button class="undo">${L().undo}</button>` : ''}`;
  active.appendChild(el);
  const undoBtn = el.querySelector('.undo');
  if (undoBtn) undoBtn.addEventListener('click', () => {
    if (undoCart) { s.cart = undoCart; undoCart = null; s.toast = null; render(s.screen); }
  });
}

// ---------- Wiring de eventos ----------
function loadExample() {
  const pick = c => CATALOG.find(x => x.code === c);
  // Café Molido + Papel Higiénico + Aceite de Girasol = $388 de $450 → quedan $62,
  // por debajo del precio del Detergente ($96): escanearlo reproduce el rechazo.
  s.cart = ['7891000100103', '7891000100073', '7891000100042'].map(c => ({ ...pick(c), qty: 1 }));
  s.budget = 45000; s.budgetInput = '450'; s.currency = 'BRL'; s.alert = null; s.pending = null; s.confirmClear = false;
  bumpBeneficioCursor('shop');
  go('shop');
  showToast(L().exampleLoaded, L().exampleHint, false);
}

function wire() {
  document.querySelectorAll('[id^="btn-exit-"]').forEach(b => b.addEventListener('click', () => { try { window.close(); } catch (e) {} }));

  document.getElementById('btn-welcome-start').addEventListener('click', () => { renderPrefs(); go('prefs'); });
  document.getElementById('btn-prefs-back').addEventListener('click', () => go(s.settingsReturn));
  document.getElementById('btn-prefs-continue').addEventListener('click', () => {
    savePrefs();
    if (!s.onboarded) { s.onboarded = true; renderStart(); go('start'); }
    else go(s.settingsReturn);
  });
  document.getElementById('switch-sound').addEventListener('click', () => { s.soundOn = !s.soundOn; renderPrefs(); });
  document.getElementById('switch-benefits').addEventListener('click', () => { s.beneficiosOn = !s.beneficiosOn; renderPrefs(); });

  document.getElementById('input-budget').addEventListener('input', e => { s.budgetInput = e.target.value.replace(/[^\d.,]/g, ''); s.startErr = ''; document.getElementById('start-err').style.display = 'none'; });
  document.getElementById('input-budget').addEventListener('keydown', e => { if (e.key === 'Enter') startPurchase(); });
  document.getElementById('btn-start-purchase').addEventListener('click', startPurchase);
  document.getElementById('btn-start-settings').addEventListener('click', () => { s.settingsReturn = 'start'; renderPrefs(); go('prefs'); });
  document.getElementById('btn-start-locale').addEventListener('click', () => { s.locale = s.locale === 'pt-BR' ? 'es-UY' : 'pt-BR'; renderStart(); });

  document.getElementById('btn-shop-locale').addEventListener('click', () => { s.locale = s.locale === 'pt-BR' ? 'es-UY' : 'pt-BR'; renderShop(); });
  document.getElementById('btn-shop-settings').addEventListener('click', () => { s.settingsReturn = 'shop'; renderPrefs(); go('prefs'); });
  document.getElementById('btn-shop-finish').addEventListener('click', () => {
    playFinished();
    s.__lastSummary = { date: Date.now(), budget: s.budget, total: totals().total, items: s.cart.map(i => ({ ...i })) };
    s.endedAt = s.__lastSummary.date;
    bumpBeneficioCursor('summary');
    renderSummary();
    go('summary');
  });
  document.getElementById('btn-open-scan').addEventListener('click', () => { document.getElementById('input-code').value = ''; go('scan'); });
  document.getElementById('btn-clear-cart').addEventListener('click', () => { s.confirmClear = true; renderShop(); });
  document.getElementById('btn-cancel-clear').addEventListener('click', () => { s.confirmClear = false; renderShop(); });
  document.getElementById('btn-confirm-clear').addEventListener('click', () => {
    undoCart = s.cart.map(i => ({ ...i })); s.cart = []; s.confirmClear = false; saveSession();
    showToast(L().cartCleared, `${L().available} ${fmt(s.budget)}`, true);
    renderShop();
  });

  document.getElementById('btn-scan-close').addEventListener('click', () => { bumpBeneficioCursor('shop'); go('shop'); });
  document.getElementById('btn-submit-code').addEventListener('click', () => {
    const v = document.getElementById('input-code').value;
    if (v.trim()) onCode(v);
  });
  document.getElementById('input-code').addEventListener('keydown', e => { if (e.key === 'Enter') { const v = e.target.value; if (v.trim()) onCode(v); } });

  document.getElementById('btn-result-back').addEventListener('click', () => go('scan'));
  document.getElementById('btn-result-cancel').addEventListener('click', () => { s.pending = null; go('scan'); });
  document.getElementById('btn-result-inc').addEventListener('click', () => { s.qty++; renderResult(); });
  document.getElementById('btn-result-dec').addEventListener('click', () => { s.qty = Math.max(1, s.qty - 1); renderResult(); });
  document.getElementById('btn-confirm-add').addEventListener('click', () => {
    if (!s.pending) return;
    if (addToCart(s.pending, s.qty, 'scan')) { s.pending = null; bumpBeneficioCursor('shop'); go('shop'); }
  });

  document.getElementById('btn-alert-continue').addEventListener('click', () => {
    lastCode = null;
    const toShop = s.alert && s.alert.from === 'cart';
    s.alert = null; s.pending = null;
    if (toShop) { bumpBeneficioCursor('shop'); go('shop'); } else go('scan');
  });
  document.getElementById('btn-alert-cancel').addEventListener('click', () => { s.alert = null; s.pending = null; bumpBeneficioCursor('shop'); go('shop'); });

  document.getElementById('btn-notfound-retry').addEventListener('click', () => go('scan'));
  document.getElementById('btn-notfound-manual').addEventListener('click', () => { renderManual(); go('manual'); });
  document.getElementById('btn-notfound-back').addEventListener('click', () => { bumpBeneficioCursor('shop'); go('shop'); });

  document.getElementById('btn-manual-back').addEventListener('click', () => go('notfound'));
  document.getElementById('input-manual-name').addEventListener('input', e => { s.manual.name = e.target.value; s.manualErr = ''; renderManual(); });
  document.getElementById('input-manual-price').addEventListener('input', e => { s.manual.price = e.target.value.replace(/[^\d.,]/g, ''); s.manualErr = ''; renderManual(); });
  document.getElementById('btn-manual-inc').addEventListener('click', () => { s.manual.qty++; renderManual(); });
  document.getElementById('btn-manual-dec').addEventListener('click', () => { s.manual.qty = Math.max(1, s.manual.qty - 1); renderManual(); });
  document.getElementById('btn-manual-submit').addEventListener('click', () => {
    const name = s.manual.name.trim();
    const mPrice = parseMoney(s.manual.price);
    if (!name) { s.manualErr = L().manualErrName; renderManual(); return; }
    if (!(mPrice >= 0)) { s.manualErr = L().manualErrPrice; renderManual(); return; }
    const p = { code: s.pendingCode || 'MAN-' + String(Date.now()).slice(-6), name, price: mPrice, cat: 'Manual' };
    if (addToCart(p, s.manual.qty, 'manual')) {
      s.manual = { name: '', price: '', qty: 1 }; s.manualErr = '';
      bumpBeneficioCursor('shop'); go('shop');
    }
  });

  document.getElementById('btn-new-purchase').addEventListener('click', () => {
    stopCam();
    s.screen = 'welcome'; s.budget = 0; s.cart = []; s.budgetInput = ''; s.alert = null; s.pending = null; s.toast = null; s.confirmClear = false; s.endedAt = null; s.beneficiosCerrado = {};
    go('welcome');
  });
  document.getElementById('btn-back-to-cart').addEventListener('click', () => { bumpBeneficioCursor('shop'); go('shop'); });
}

// Botón secreto para cargar el ejemplo: doble clic en el logo de la pantalla de bienvenida.
document.addEventListener('DOMContentLoaded', () => {
  wire();
  document.querySelector('#screen-welcome svg').addEventListener('dblclick', () => { s.onboarded = true; loadExample(); });
  go('welcome');
});
