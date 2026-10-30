/* Página de venda — Canelite: o método RunnersFit
   Estado da oferta: pelo relógio, quando a agenda estiver preenchida; ?estado=publico|lista|espera é só prévia.
   ?lista abre o preço da lista enquanto ele valer. */
(function () {
  'use strict';

  // O que muda quando plataforma, lista e datas fecharem. Vazio = ainda não existe.
  var CONFIG = {
    checkout: { publico: '', lista: '' },
    listaWhatsApp: '',
    // horário de Brasília, ex.: '2026-11-04T08:00:00-03:00' e '2026-11-06T23:59:00-03:00'
    agenda: { abertura: '', fimLista: '' },
    // o que aparece escrito enquanto a agenda estiver vazia
    textoAbertura: '04/11',
    textoPrazo: '06/11, às 23h59'
  };

  var url = new URL(window.location.href);
  var agora = Date.now();
  var abertura = Date.parse(CONFIG.agenda.abertura);
  var fimLista = Date.parse(CONFIG.agenda.fimLista);

  function formatar(ms, comHora) {
    var d = new Date(ms);
    var opcoes = { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' };
    var dia = d.toLocaleDateString('pt-BR', opcoes);
    if (!comHora) return dia;
    var h = d.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
    return dia + ', às ' + h;
  }

  function estadoAtual() {
    var previa = url.searchParams.get('estado');
    if (previa === 'publico' || previa === 'lista' || previa === 'espera') return previa;
    if (abertura && agora < abertura) return 'espera';
    if (url.searchParams.has('lista') && (!fimLista || agora <= fimLista)) return 'lista';
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

  // Medição sem dado de saúde: o teste só registra que foi usado, nunca o que a pessoa marcou.
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
      var link = destino(local);
      if (link) {
        ev.preventDefault();
        window.location.href = link;
      } else if (local === 'oferta') {
        ev.preventDefault();
        avisar(estado === 'espera'
          ? 'O link da lista do WhatsApp entra aqui quando ela for criada.'
          : 'O link de compra entra aqui quando a plataforma de vendas estiver configurada.');
      }
      // sem link ainda: os outros botões descem até o preço
    });
  });

  document.querySelectorAll('.pagina a').forEach(function (a) {
    a.addEventListener('click', function () { rastrear('abriu_pagina', { local: a.getAttribute('data-local') }); });
  });

  // O teste: o veredito vem do CSS; aqui ele é lido em voz alta.
  var quadro = document.querySelector('.quadro');
  var falado = document.getElementById('veredito-falado');
  var alertaAtivo = false;
  var testeUsado = false;

  function vereditoVisivel() {
    var vs = quadro.querySelectorAll('.v');
    for (var i = 0; i < vs.length; i++) {
      if (!vs[i].classList.contains('v-vazio') && window.getComputedStyle(vs[i]).display !== 'none') return vs[i];
    }
    return null;
  }

  if (quadro) {
    quadro.addEventListener('change', function () {
      var marcado = quadro.querySelector('input[name="estagio"]:checked');
      var sinais = quadro.querySelectorAll('input[name="sinal"]:checked').length;
      alertaAtivo = sinais > 0 || (marcado && marcado.value === '4');
      var v = vereditoVisivel();
      if (falado) {
        var titulo = v && v.querySelector('.v-titulo');
        var dito = v && v.querySelector('.dito');
        falado.textContent = v ? ((titulo ? titulo.textContent + ' ' : '') + (dito ? dito.textContent : '')).trim() : '';
      }
      if (!testeUsado) { testeUsado = true; rastrear('teste', {}); }
      // a resposta aparece onde a pessoa tocou: se ficou abaixo da tela, rola só o necessário
      if (v) {
        var r = v.getBoundingClientRect();
        if (r.bottom > window.innerHeight - 16) {
          var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          v.scrollIntoView({ block: 'nearest', behavior: reduzir ? 'auto' : 'smooth' });
        }
      }
      atualizarBarra();
    });
  }

  // A barra fixa só aparece quando nenhum outro botão de compra está na tela (o teste tem o dele).
  var barra = document.getElementById('barra');
  var vigiados = [document.getElementById('anexo'), document.querySelector('.valor'), quadro].filter(Boolean);
  var naTela = new Map();

  function atualizarBarra() {
    if (!barra) return;
    var algumNaTela = false;
    naTela.forEach(function (v) { if (v) algumNaTela = true; });
    var mostrar = naTela.size === vigiados.length && !algumNaTela && !alertaAtivo;
    barra.classList.toggle('visivel', mostrar);
    barra.setAttribute('aria-hidden', mostrar ? 'false' : 'true');
    var link = barra.querySelector('a');
    if (link) link.tabIndex = mostrar ? 0 : -1;
  }

  if ('IntersectionObserver' in window && barra && vigiados.length) {
    var ofertaVista = false;
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        naTela.set(e.target, e.isIntersecting);
        if (e.isIntersecting && e.target.classList.contains('valor') && !ofertaVista) {
          ofertaVista = true;
          rastrear('viu_oferta', {});
        }
      });
      atualizarBarra();
    });
    vigiados.forEach(function (el) { observador.observe(el); });
  }
})();
