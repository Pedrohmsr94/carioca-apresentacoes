/* Página de venda — Canelite: o método RunnersFit
   Estado da oferta: pelo relógio, quando a agenda estiver preenchida; ?estado=publico|lista|espera é só prévia.
   ?lista abre o preço da lista enquanto ele valer. */
(function () {
  'use strict';

  // O que muda quando plataforma, lista e datas fecharem. Vazio = ainda não existe.
  var CONFIG = {
    checkout: { publico: '', lista: '' },
    listaWhatsApp: '',
    // horário de Brasília, pelo plano v2: '2026-11-23T08:00:00-03:00' e '2026-11-25T23:59:00-03:00'.
    // Sem fimLista, o ?lista mostra o preço cheio: o preço do grupo só existe com prazo de verdade.
    agenda: { abertura: '', fimLista: '' },
    textoAbertura: '23/11',
    textoPrazo: '25/11, às 23h59'
  };

  var url = new URL(window.location.href);
  var agora = Date.now();
  var abertura = Date.parse(CONFIG.agenda.abertura);
  var fimLista = Date.parse(CONFIG.agenda.fimLista);

  function formatar(ms, comHora) {
    var d = new Date(ms);
    var dia = d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' });
    if (!comHora) return dia;
    var h = d.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
    return dia + ', às ' + h;
  }

  function estadoAtual() {
    var previa = url.searchParams.get('estado');
    if (previa === 'publico' || previa === 'lista' || previa === 'espera') return previa;
    if (abertura && agora < abertura) return 'espera';
    if (url.searchParams.has('lista') && fimLista && agora <= fimLista) return 'lista';
    return 'publico';
  }
  var estado = estadoAtual();

  document.querySelectorAll('[data-estado]').forEach(function (el) {
    el.hidden = el.getAttribute('data-estado').split(' ').indexOf(estado) === -1;
  });
  var textoAbertura = abertura ? formatar(abertura, false) : CONFIG.textoAbertura;
  var textoPrazo = fimLista ? formatar(fimLista, true) : CONFIG.textoPrazo;
  document.querySelectorAll('[data-abertura]').forEach(function (el) { el.textContent = textoAbertura; });
  document.querySelectorAll('[data-prazo]').forEach(function (el) { el.textContent = textoPrazo; });

  // Origem da visita: o pedido é lido por origem (lista, bio, stories, QR code).
  var origem = url.searchParams.get('utm_source');
  try {
    origem = origem || window.sessionStorage.getItem('origem');
    window.sessionStorage.setItem('origem', origem || 'direto');
  } catch (e) { /* navegação privada */ }
  origem = origem || 'direto';

  // Medição sem dado de saúde: dos sinais, só se registra que a lista foi usada.
  window.dataLayer = window.dataLayer || [];
  function rastrear(evento, dados) {
    var registro = { event: evento, estado: estado, origem: origem };
    for (var k in dados) { registro[k] = dados[k]; }
    window.dataLayer.push(registro);
    if (typeof window.fbq === 'function') {
      if (evento === 'clique_comprar') window.fbq('track', 'InitiateCheckout');
      if (evento === 'clique_lista') window.fbq('track', 'Lead');
    }
  }
  rastrear('visita', {});

  var toast = document.getElementById('toast');
  var relogio;
  function avisar(texto) {
    toast.textContent = texto;
    toast.hidden = false;
    window.clearTimeout(relogio);
    relogio = window.setTimeout(function () { toast.hidden = true; }, 4500);
  }

  function destino(local) {
    var base = estado === 'espera' ? CONFIG.listaWhatsApp : CONFIG.checkout[estado];
    if (!base) return '';
    if (estado === 'espera') return base;
    var d = new URL(base);
    d.searchParams.set('utm_source', origem);
    d.searchParams.set('utm_content', local);
    return d.toString();
  }

  document.querySelectorAll('[data-comprar]').forEach(function (botao) {
    botao.addEventListener('click', function (ev) {
      var local = botao.getAttribute('data-local');
      rastrear(estado === 'espera' ? 'clique_lista' : 'clique_comprar', { local: local });
      ev.preventDefault();
      var link = destino(local);
      if (link) { window.location.href = link; return; }
      avisar(estado === 'espera'
        ? 'O link do grupo do WhatsApp entra aqui quando ele for criado.'
        : 'O link de compra entra aqui quando a plataforma de vendas estiver configurada.');
    });
  });
  document.querySelectorAll('a[href^="#"][data-local]:not([data-comprar])').forEach(function (a) {
    a.addEventListener('click', function () {
      rastrear(a.getAttribute('href') === '#oferta' ? 'ir_oferta' : 'ir_alerta', { local: a.getAttribute('data-local') });
    });
  });

  // Sinais de alerta: o aviso vem do CSS; aqui ele é lido em voz alta.
  var sinais = document.querySelector('.sinais');
  var falado = document.getElementById('sinais-falado');
  var alertaAtivo = false;
  var usado = false;
  if (sinais) {
    sinais.addEventListener('change', function () {
      alertaAtivo = sinais.querySelectorAll('input:checked').length > 0;
      if (falado) {
        falado.textContent = alertaAtivo
          ? 'Com esse sinal, procure avaliação antes de qualquer exercício. Pode ser fratura por estresse, que pede outro tratamento.'
          : '';
      }
      if (!usado) { usado = true; rastrear('sinais', {}); }
      atualizarBarra();
    });
  }

  // O sublinhado do lema se risca quando aparece (só pra quem não pediu menos movimento).
  var sublinhado = document.querySelector('.sublinhado');
  if (sublinhado && 'IntersectionObserver' in window && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    sublinhado.classList.add('espera');
    var vigia = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { sublinhado.classList.add('visto-agora'); vigia.disconnect(); }
    }, { threshold: 1 });
    vigia.observe(sublinhado);
  }

  // A barra aparece depois da abertura e some na oferta e enquanto houver sinal marcado.
  var barra = document.getElementById('barra');
  var abertura_ = document.querySelector('.abertura');
  var oferta = document.getElementById('oferta');
  var aberturaNaTela = true;
  var ofertaNaTela = false;

  function atualizarBarra() {
    if (!barra) return;
    var mostrar = !aberturaNaTela && !ofertaNaTela && !alertaAtivo;
    barra.classList.toggle('visivel', mostrar);
    barra.setAttribute('aria-hidden', mostrar ? 'false' : 'true');
    var link = barra.querySelector('a');
    if (link) link.tabIndex = mostrar ? 0 : -1;
  }

  if ('IntersectionObserver' in window && barra && abertura_ && oferta) {
    var ofertaVista = false;
    new IntersectionObserver(function (e) {
      aberturaNaTela = e[0].isIntersecting;
      atualizarBarra();
    }).observe(abertura_);
    new IntersectionObserver(function (e) {
      ofertaNaTela = e[0].isIntersecting;
      if (ofertaNaTela && !ofertaVista) { ofertaVista = true; rastrear('viu_oferta', {}); }
      atualizarBarra();
    }).observe(oferta);
  }
})();
