/* Painel · Izadora Tannus — protótipo clicável.
   Tudo roda no navegador; o estado mora no localStorage. Ícones desenhados no
   traço do Lucide (ISC). */

(function () {
  'use strict';

  const CHAVE = 'painel-izadora-v1';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- datas ---------- */
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const hoje = () => iso(new Date());
  const addDias = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
  const diffDias = (a, b) => Math.round((parse(a) - parse(b)) / 864e5);
  const addUteis = (s, n) => { const d = parse(s); let c = 0; while (c < n) { d.setDate(d.getDate() + 1); const w = d.getDay(); if (w && w !== 6) c++; } return iso(d); };
  const proxUtil = s => { const d = parse(s); do { d.setDate(d.getDate() + 1); } while (!d.getDay() || d.getDay() === 6); return iso(d); };
  const SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const dataLonga = s => { const d = parse(s); return `${cap(SEMANA[d.getDay()])}, ${d.getDate()} de ${MESES[d.getMonth()]}`; };
  const dataCurta = s => { const d = parse(s); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
  const dataMedia = s => { const d = parse(s); return `${SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`; };
  const relativo = s => {
    const n = diffDias(s, hoje());
    if (n === 0) return 'hoje';
    if (n === 1) return 'amanhã';
    if (n === -1) return 'ontem';
    return n > 0 ? `em ${n} dias` : `há ${-n} dias`;
  };
  const agoraHM = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const minutos = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };
  const horaBonita = hm => { const [h, m] = hm.split(':'); return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`; };
  const brl = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });
  const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
  const novoId = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  /* ---------- ícones ---------- */
  const P = {
    hoje: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    agenda: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    clientes: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    casos: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>',
    intimacoes: '<path d="m14 13-7.5 7.5a2.12 2.12 0 0 1-3-3L11 10"/><path d="m16 16 6-6M8 8l6-6M9 7l8 8M21 11l-8-8"/>',
    tarefas: '<path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    honorarios: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    mais: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    mais2: '<path d="M5 12h14M12 5v14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    seta: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    esq: '<path d="m15 18-6-6 6-6"/>',
    dir: '<path d="m9 18 6-6-6-6"/>',
    baixo: '<path d="m6 9 6 6 6-6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    girar: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
    busca: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    lugar: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    video: '<path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    relogio: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    fio: '<path d="M3 12h4l3-9 4 18 3-9h4"/>',
    pasta: '<path d="M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-6"/><path d="m2 21 6-6M8 21v-6H2"/>',
    whats: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    seguir: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>'
  };
  const ic = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;

  /* ---------- domínio ---------- */
  const ETAPAS = ['Conversa', 'Documentos', 'Redação', 'Cartório ou fórum', 'Concluído'];
  const SERV = {
    'Consulta': {},
    'Diagnóstico Família e Patrimônio': {},
    'Pacto antenupcial': { revisao: true, testamento: true },
    'União estável': { revisao: true, testamento: true },
    'Acordo pós-nupcial': { revisao: true, testamento: true },
    'Testamento': { revisao: true },
    'Divórcio consensual': { judicial: true },
    'Inventário': { judicial: true }
  };
  const TIPOS_EV = { consulta: 'Consulta', audiencia: 'Audiência', reuniao: 'Reunião', cartorio: 'Cartório', foco: 'Trabalho no caso', pessoal: 'Pessoal' };
  const REGIMES = ['Comunhão parcial', 'Comunhão universal', 'Separação total (pacto)', 'Participação final nos aquestos', 'União estável (escritura)', 'União estável sem contrato', 'Ainda não casaram', 'Solteira', 'Solteiro', 'Viúva', 'Viúvo', 'Divorciada', 'Divorciado'];
  const ORIGENS = ['Instagram', 'WhatsApp', 'Indicação', 'Google', 'Conecta Mulher', 'Outro'];

  let S;
  const cliente = id => S.clientes.find(c => c.id === id);
  const caso = id => S.casos.find(k => k.id === id);
  const ultimo = s => (s || '').trim().split(/\s+/).pop();
  const primeiro = s => (s || '').trim().split(/\s+/)[0];
  function nomeFamilia(c) {
    if (!c) return 'Sem cliente';
    if (!c.conjuge) return c.nome;
    return ultimo(c.nome) === ultimo(c.conjuge) ? `${primeiro(c.nome)} e ${c.conjuge}` : `${c.nome} e ${c.conjuge}`;
  }

  /* ---------- estado ---------- */
  const CAMPOS_DATA = { clientes: ['desde'], casos: ['etapaDesde', 'abertoEm', 'concluidoEm'], eventos: ['data'], intimacoes: ['data'], parcelas: ['vencimento', 'pagoEm'], tarefas: ['prazo'], contatos: ['desde'] };
  function deslocar(s, n) {
    Object.keys(CAMPOS_DATA).forEach(col => (s[col] || []).forEach(o => CAMPOS_DATA[col].forEach(f => { if (o[f]) o[f] = addDias(o[f], n); })));
    if (s.ultimaConferencia) s.ultimaConferencia.data = addDias(s.ultimaConferencia.data, n);
  }
  function carregar() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(CHAVE)); } catch (e) { s = null; }
    if (!s || s.versao !== 1) return window.PainelDados.semear();
    // o dia anda junto: o que era "hoje" quando ela mexeu continua sendo hoje
    const n = diffDias(hoje(), s.semeadoEm);
    if (n) { deslocar(s, n); s.semeadoEm = hoje(); }
    return s;
  }
  function salvar(mexeu = true) {
    if (mexeu) S.mexeu = true;
    try { localStorage.setItem(CHAVE, JSON.stringify(S)); } catch (e) { /* aba privada: segue só na memória */ }
  }
  const foto = () => JSON.stringify(S);
  const voltar = f => () => { S = JSON.parse(f); salvar(); render(); };
  function marcarGuia(k) { if (!S.guia[k]) { S.guia[k] = true; } }

  /* ---------- contagens ---------- */
  const intimacoesNovas = () => S.intimacoes.filter(i => !i.lida);
  const parcelasVencidas = () => S.parcelas.filter(p => !p.pagoEm && p.vencimento < hoje());
  const contatosEsperando = () => S.contatos.filter(c => !c.respondido);
  const tarefasDoDia = () => S.tarefas.filter(t => !t.feita && t.prazo && t.prazo <= hoje());
  const eventosDo = d => S.eventos.filter(e => e.data === d).sort((a, b) => minutos(a.inicio) - minutos(b.inicio));

  function esteira() {
    const H = hoje(), itens = [];
    S.casos.forEach(k => {
      if (k.etapa !== 'Concluído' || !k.concluidoEm || !(SERV[k.servico] || {}).revisao) return;
      const key = k.id + ':rev';
      if (S.esteiraFeita[key]) return;
      const venc = addDias(k.concluidoEm, 365), dd = diffDias(venc, H);
      if (dd <= 45) itens.push({ tipo: 'revisao', key, caso: k, cli: cliente(k.clienteId), venc, dd });
    });
    S.clientes.forEach(c => {
      const ks = S.casos.filter(k => k.clienteId === c.id);
      if (ks.some(k => k.servico === 'Testamento')) return;
      const base = ks.find(k => (SERV[k.servico] || {}).testamento && k.etapa === 'Concluído' && k.concluidoEm && diffDias(H, k.concluidoEm) <= 120);
      const key = c.id + ':test';
      if (!base || S.esteiraFeita[key]) return;
      itens.push({ tipo: 'testamento', key, caso: base, cli: c, dd: 1 });
    });
    return itens.sort((a, b) => a.dd - b.dd);
  }

  /* ---------- navegação ---------- */
  const TELAS = [
    { id: 'hoje', rot: 'Hoje', ic: 'hoje' },
    { id: 'agenda', rot: 'Agenda', ic: 'agenda' },
    { id: 'clientes', rot: 'Clientes', ic: 'clientes' },
    { id: 'casos', rot: 'Casos', ic: 'casos' },
    { id: 'intimacoes', rot: 'Intimações', ic: 'intimacoes' },
    { id: 'tarefas', rot: 'Tarefas', ic: 'tarefas' },
    { id: 'honorarios', rot: 'Honorários', ic: 'honorarios' }
  ];
  const telaAtual = () => { const h = location.hash.replace('#', ''); return TELAS.some(t => t.id === h) ? h : 'hoje'; };
  function contador(id) {
    if (id === 'intimacoes') { const n = intimacoesNovas().length; return n ? `<span class="contador contador--alerta">${n}</span>` : ''; }
    if (id === 'honorarios') { const n = parcelasVencidas().length; return n ? `<span class="contador contador--alerta">${n}</span>` : ''; }
    if (id === 'tarefas') { const n = tarefasDoDia().length; return n ? `<span class="contador">${n}</span>` : ''; }
    if (id === 'clientes') { const n = contatosEsperando().length; return n ? `<span class="contador">${n}</span>` : ''; }
    return '';
  }
  function renderNav() {
    const at = telaAtual();
    $('#nav').innerHTML = TELAS.map(t => `<a href="#${t.id}" ${t.id === at ? 'aria-current="page"' : ''}>${ic(t.ic)}<span>${t.rot}</span>${contador(t.id)}</a>`).join('');
    const movel = ['hoje', 'agenda', 'casos', 'clientes'].map(id => TELAS.find(t => t.id === id));
    const naMais = ['intimacoes', 'tarefas', 'honorarios'].includes(at);
    const contMais = intimacoesNovas().length + parcelasVencidas().length;
    $('#barra-movel').innerHTML = movel.map(t => `<a href="#${t.id}" ${t.id === at ? 'aria-current="page"' : ''}>${ic(t.ic)}<span>${t.rot}</span>${contador(t.id)}</a>`).join('') +
      `<button type="button" data-acao="mais" ${naMais ? 'aria-current="page"' : ''}>${ic('mais')}<span>Mais</span>${contMais ? `<span class="contador contador--alerta">${contMais}</span>` : ''}</button>`;
    const u = S.ultimaConferencia;
    $('#djen-status').innerHTML = `DJEN conferido pela OAB/SP 308.083<br><b>${u.data === hoje() ? 'hoje' : dataCurta(u.data)}, às ${horaBonita(u.hora)}</b>`;
  }

  /* ---------- pedaços comuns ---------- */
  function painel(titulo, qtd, corpo, extra = '') {
    return `<section class="painel"><div class="painel__cab"><h2 class="painel__titulo">${titulo}${qtd ? ` <span class="qtd">${qtd}</span>` : ''}</h2>${extra}</div>${corpo}</section>`;
  }
  const opcoes = (lista, sel) => lista.map(v => `<option ${v === sel ? 'selected' : ''}>${esc(v)}</option>`).join('');
  const opcoesClientes = (sel, vazio = 'Sem cliente') => `<option value="">${vazio}</option>` + S.clientes.slice().sort((a, b) => nomeFamilia(a).localeCompare(nomeFamilia(b))).map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${esc(nomeFamilia(c))}</option>`).join('');
  const linkWhats = txt => `https://wa.me/?text=${encodeURIComponent(txt)}`;

  /* ================= HOJE ================= */
  function telaHoje() {
    const H = hoje();
    const evs = eventosDo(H), novas = intimacoesNovas(), venc = parcelasVencidas();
    const venceHoje = S.parcelas.filter(p => !p.pagoEm && p.vencimento === H);
    const esp = contatosEsperando(), est = esteira(), tar = tarefasDoDia();
    const h = new Date().getHours();
    const saud = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    const partes = [];
    if (evs.length) partes.push(`<b>${plural(evs.length, 'compromisso', 'compromissos')}</b>`);
    if (novas.length) partes.push(`<span class="alerta">${plural(novas.length, 'intimação nova', 'intimações novas')}</span>`);
    if (venc.length) partes.push(`<span class="alerta">${plural(venc.length, 'parcela vencida', 'parcelas vencidas')}</span>`);
    if (esp.length) partes.push(`<b>${plural(esp.length, 'pessoa esperando', 'pessoas esperando')}</b> resposta`);
    const frase = partes.length ? `${saud}, Izadora. Hoje tem ${partes.length > 1 ? partes.slice(0, -1).join(', ') + ' e ' + partes.slice(-1) : partes[0]}.` : `${saud}, Izadora. Nada pendente hoje: dia livre pra trabalhar nos casos.`;

    const intHtml = novas.length ? `<ul class="lista">${novas.map(i => {
      const k = caso(i.casoId), c = k && cliente(k.clienteId);
      return `<li class="item"><div class="item__linha"><span class="item__titulo"><span class="ponto"></span>${esc(nomeFamilia(c))}</span><span class="item__meta">${relativo(i.data)}</span></div>
        <p class="item__texto">${esc(i.texto)}</p>
        <div class="item__acoes"><button class="btn btn--peq btn--escuro" data-acao="criar-prazo" data-id="${i.id}">Criar prazo</button><button class="btn btn--peq btn--texto" data-acao="ler" data-id="${i.id}">Marcar como lida</button></div></li>`;
    }).join('')}</ul>` : `<p class="vazio">Nenhuma intimação nova. O painel confere o DJEN toda manhã pela sua OAB.</p>`;

    const parc = venc.concat(venceHoje);
    const honHtml = parc.length ? `<ul class="lista">${parc.map(p => {
      const k = caso(p.casoId), c = k && cliente(k.clienteId), atras = p.vencimento < H;
      const msg = `Oi, ${primeiro(c && c.nome)}! Passando pra lembrar da parcela ${p.n} de ${p.de} dos honorários (${brl(p.valor)}), com vencimento em ${dataCurta(p.vencimento)}. Qualquer dúvida, me chama.`;
      return `<li class="item"><div class="item__linha"><span class="item__titulo">${atras ? '<span class="ponto"></span>' : ''}${esc(nomeFamilia(c))}</span><span class="item__meta ${atras ? 'alerta' : ''}">${atras ? 'venceu ' + relativo(p.vencimento) : 'vence hoje'}</span></div>
        <p class="item__texto">${esc(k.servico)}, parcela ${p.n} de ${p.de} · <span class="num">${brl(p.valor)}</span></p>
        <div class="item__acoes"><button class="btn btn--peq btn--escuro" data-acao="baixa" data-id="${p.id}">Dar baixa</button><a class="btn btn--peq btn--texto" href="${linkWhats(msg)}" target="_blank" rel="noopener">${ic('whats')}Lembrar no WhatsApp</a></div></li>`;
    }).join('')}</ul>` : `<p class="vazio">Nenhum honorário vencido. Quando uma parcela atrasar, ela aparece aqui.</p>`;

    const espHtml = esp.length ? `<ul class="lista">${esp.map(c => {
      const n = diffDias(H, c.desde);
      return `<li class="item"><div class="item__linha"><span class="item__titulo">${n >= 3 ? '<span class="ponto"></span>' : ''}${esc(c.nome)}</span><span class="item__meta ${n >= 3 ? 'alerta' : ''}">${c.canal} · ${relativo(c.desde)}</span></div>
        <p class="item__texto">${esc(c.assunto)}</p>
        <div class="item__acoes"><button class="btn btn--peq" data-acao="respondi" data-id="${c.id}">Já respondi</button><button class="btn btn--peq btn--texto" data-acao="virar-cliente" data-id="${c.id}">Virar cliente</button></div></li>`;
    }).join('')}</ul>` : `<p class="vazio">Ninguém esperando. Quem chega pelo WhatsApp ou Instagram e não recebe resposta aparece aqui.</p>`;

    const estHtml = est.length ? `<ul class="lista">${est.map(itemEsteira).join('')}</ul>` : `<p class="vazio">Nada na esteira por enquanto. Quando um pacto ou testamento fizer um ano, a revisão aparece aqui.</p>`;

    const tarHtml = tar.length ? `<ul class="lista">${tar.map(t => {
      const atras = t.prazo < H, c = cliente(t.clienteId);
      return `<li class="item"><label class="tarefa-rapida"><input type="checkbox" class="marcar" data-tarefa="${t.id}"><span><span class="item__titulo">${esc(t.titulo)}</span>${c ? `<span class="tarefa__meta">${esc(nomeFamilia(c))}</span>` : ''}</span><span class="item__meta ${atras ? 'alerta' : ''}">${atras ? 'atrasada ' + relativo(t.prazo).replace('há ', '') : 'hoje'}</span></label></li>`;
    }).join('')}</ul>` : `<p class="vazio">Nenhuma tarefa pra hoje.</p>`;

    return `<header class="cab"><div class="cab__texto"><h1 class="manchete">${dataLonga(H)}</h1><p class="resumo">${frase}</p></div>
      <div class="cab__acoes"><button class="btn" data-acao="nova-tarefa-rapida">${ic('mais2')}Tarefa</button><button class="btn btn--principal" data-acao="novo-evento">${ic('mais2')}Compromisso</button></div></header>
      <div class="mesa">
        <section class="painel dia"><div class="dia__cab"><h2 class="painel__titulo">Agenda de hoje <span class="qtd">${evs.length || ''}</span></h2><a class="painel__link" href="#agenda">Semana inteira</a></div>
          ${linhaDoTempo(H, evs)}${amanha()}</section>
        <div class="trilho">
          ${painel('Intimações novas', novas.length, intHtml, `<button class="painel__link btn--texto" style="background:none;border:0;padding:0" data-acao="conferir-djen">Conferir agora</button>`)}
          ${painel('Honorários', parc.length, honHtml, `<a class="painel__link" href="#honorarios">Mês</a>`)}
          ${painel('Esperando sua resposta', esp.length, espHtml)}
          ${painel('Esteira', est.length, estHtml)}
          ${painel('Tarefas de hoje', tar.length, tarHtml, `<a class="painel__link" href="#tarefas">Todas</a>`)}
        </div>
      </div>`;
  }

  function itemEsteira(e) {
    const fam = esc(nomeFamilia(e.cli));
    if (e.tipo === 'revisao') {
      const alerta = e.dd < 0;
      return `<li class="item"><div class="item__linha"><span class="item__titulo">${alerta ? '<span class="ponto"></span>' : '<span class="ponto ponto--cobre"></span>'}Revisão de 1 ano · ${fam}</span><span class="item__meta ${alerta ? 'alerta' : ''}">${alerta ? 'venceu ' + relativo(e.venc) : relativo(e.venc)}</span></div>
        <p class="item__texto">${esc(e.caso.servico)} ${/^União/.test(e.caso.servico) ? 'assinada' : 'assinado'} em ${dataCurta(e.caso.concluidoEm)}. Hora de conversar sobre o que mudou na família desde então.</p>
        <div class="item__acoes"><button class="btn btn--peq btn--escuro" data-acao="agendar-esteira" data-key="${e.key}">Agendar a conversa</button><button class="btn btn--peq btn--texto" data-acao="esteira-feito" data-key="${e.key}">Já fiz</button></div></li>`;
    }
    return `<li class="item"><div class="item__linha"><span class="item__titulo"><span class="ponto ponto--cobre"></span>Oferecer testamento · ${fam}</span><span class="item__meta">pacto ${relativo(e.caso.concluidoEm)}</span></div>
      <p class="item__texto">Quem acabou de assinar o ${esc(e.caso.servico.toLowerCase())} já entendeu por que o papel protege. É o momento de falar do testamento.</p>
      <div class="item__acoes"><button class="btn btn--peq btn--escuro" data-acao="agendar-esteira" data-key="${e.key}">Agendar a conversa</button><button class="btn btn--peq btn--texto" data-acao="esteira-feito" data-key="${e.key}">Agora não</button></div></li>`;
  }

  function linhaDoTempo(d, evs) {
    let ini = 8, fim = 19;
    evs.forEach(e => { ini = Math.min(ini, Math.floor(minutos(e.inicio) / 60)); fim = Math.max(fim, Math.ceil(minutos(e.fim) / 60)); });
    const hora = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hora')) || 56;
    let horas = '';
    for (let h = ini; h < fim; h++) horas += `<div class="lt-hora"><span>${h}h</span></div>`;
    const blocos = evs.map(e => blocoEvento(e, ini, hora)).join('');
    let agora = '';
    if (d === hoje()) {
      const m = minutos(agoraHM());
      if (m >= ini * 60 && m <= fim * 60) agora = `<div class="agora" style="top:${(m - ini * 60) / 60 * hora}px"><span>${agoraHM()}</span></div>`;
    }
    const vazio = evs.length ? '' : `<p class="dia__vazio">Nenhum compromisso hoje. Clique em <b>Compromisso</b> pra marcar um.</p>`;
    return `${vazio}<div class="linha-tempo">${horas}<div class="lt-eventos">${blocos}</div>${agora}</div>`;
  }

  function blocoEvento(e, ini, hora) {
    const top = (minutos(e.inicio) - ini * 60) / 60 * hora;
    const alt = Math.max(24, (minutos(e.fim) - minutos(e.inicio)) / 60 * hora - 3);
    const c = cliente(e.clienteId);
    const curto = alt < 44 ? ' evento--curto' : '';
    const lugar = e.local ? `<small>${ic(/meet|teams|vídeo|video/i.test(e.local) ? 'video' : 'lugar')}${esc(e.local)}</small>` : '';
    return `<button type="button" class="evento evento--${e.tipo}${curto}" style="top:${top}px;height:${alt}px" data-acao="abrir-evento" data-id="${e.id}">
      <b><span class="num">${horaBonita(e.inicio)}</span> · ${esc(e.titulo)}${c ? ' · ' + esc(nomeFamilia(c)) : ''}</b>${lugar}</button>`;
  }

  function amanha() {
    const d = addDias(hoje(), 1), evs = eventosDo(d);
    if (!evs.length) return '';
    return `<div class="amanha"><h3>Amanhã, ${dataMedia(d).split(',')[0]}</h3><ul>${evs.map(e => { const c = cliente(e.clienteId); return `<li><span>${horaBonita(e.inicio)}</span><span>${esc(e.titulo)}${c ? ' · ' + esc(nomeFamilia(c)) : ''}</span></li>`; }).join('')}</ul></div>`;
  }

  /* ================= AGENDA ================= */
  let semanaOffset = 0;
  function telaAgenda() {
    const H = hoje(), d = parse(H);
    const seg = addDias(H, -((d.getDay() + 6) % 7) + semanaOffset * 7);
    const dias = Array.from({ length: 7 }, (_, i) => addDias(seg, i));
    const ini = 7, fim = 21, hora = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hora')) || 56;
    const fimSem = dias[6], ds = parse(seg), df = parse(fimSem);
    const rotulo = ds.getMonth() === df.getMonth() ? `${ds.getDate()} a ${df.getDate()} de ${MESES[df.getMonth()]}` : `${ds.getDate()} de ${MESES[ds.getMonth()].slice(0, 3)} a ${df.getDate()} de ${MESES[df.getMonth()].slice(0, 3)}`;
    let horas = '';
    for (let h = ini; h < fim; h++) horas += `<div>${h}h</div>`;
    const cabs = dias.map(x => { const dt = parse(x); return `<div class="semana__dia-cab ${x === H ? 'hoje' : ''}"><span>${x === H ? 'hoje' : SEMANA[dt.getDay()].slice(0, 3)}</span><b>${dt.getDate()}</b></div>`; }).join('');
    const cols = dias.map(x => {
      let agora = '';
      if (x === H) { const m = minutos(agoraHM()); if (m >= ini * 60 && m <= fim * 60) agora = `<div class="agora" style="left:0;top:${(m - ini * 60) / 60 * hora}px"></div>`; }
      return `<div class="semana__col ${x === H ? 'hoje' : ''}" data-dia="${x}" style="height:${(fim - ini) * hora}px">${eventosDo(x).map(e => blocoEvento(e, ini, hora)).join('')}${agora}</div>`;
    }).join('');

    const lista = Array.from({ length: 14 }, (_, i) => addDias(semanaOffset ? seg : H, i)).map(x => {
      const evs = eventosDo(x);
      if (!evs.length) return '';
      return `<section class="painel" style="margin-bottom:12px"><div class="painel__cab"><h2 class="painel__titulo">${x === H ? 'Hoje' : cap(dataMedia(x))}</h2></div><ul class="lista">${evs.map(e => { const c = cliente(e.clienteId); return `<li class="item" data-acao="abrir-evento" data-id="${e.id}" style="cursor:pointer"><div class="item__linha"><span class="item__titulo">${esc(e.titulo)}</span><span class="item__meta">${horaBonita(e.inicio)} a ${horaBonita(e.fim)}</span></div><p class="item__texto">${[TIPOS_EV[e.tipo], c && nomeFamilia(c), e.local].filter(Boolean).map(esc).join(' · ')}</p></li>`; }).join('')}</ul></section>`;
    }).join('') || `<p class="vazio">Nada marcado nos próximos 14 dias.</p>`;

    return `<header class="cab"><div class="cab__texto"><h1 class="titulo">Agenda</h1><p class="resumo">A mesma do seu Google Agenda: o que você marca no celular aparece aqui, e o que marca aqui vai pro celular.</p></div>
      <div class="cab__acoes"><div class="semana-nav"><button class="icone-btn" data-acao="semana" data-v="-1" aria-label="Semana anterior">${ic('esq')}</button><strong>${rotulo}</strong><button class="icone-btn" data-acao="semana" data-v="1" aria-label="Próxima semana">${ic('dir')}</button>${semanaOffset ? `<button class="btn btn--peq btn--texto" data-acao="semana" data-v="0">Hoje</button>` : ''}</div>
      <button class="btn btn--principal" data-acao="novo-evento">${ic('mais2')}Compromisso</button></div></header>
      <section class="painel semana"><div class="semana__grade"><div class="semana__dia-cab"></div>${cabs}<div class="semana__horas">${horas}</div>${cols}</div></section>
      <div class="agenda-lista">${lista}</div>
      <div class="legenda">${Object.keys(TIPOS_EV).map(t => `<span><i class="evento--${t}" style="position:static"></i>${TIPOS_EV[t]}</span>`).join('')}</div>
      <p class="dica dica--semana">${ic('info')}Clique num horário vazio pra marcar ali.</p>`;
  }

  /* ================= CLIENTES ================= */
  let buscaCli = '';
  function telaClientes() {
    const esp = contatosEsperando();
    const q = buscaCli.trim().toLowerCase();
    const lista = S.clientes.filter(c => !q || [c.nome, c.conjuge, ...(c.filhos || []).map(f => f.nome)].join(' ').toLowerCase().includes(q))
      .sort((a, b) => nomeFamilia(a).localeCompare(nomeFamilia(b)));
    const est = esteira();
    const linhas = lista.map(c => {
      const ks = S.casos.filter(k => k.clienteId === c.id && k.etapa !== 'Concluído');
      const prox = S.eventos.filter(e => e.clienteId === c.id && e.data >= hoje()).sort((a, b) => (a.data + a.inicio).localeCompare(b.data + b.inicio))[0];
      const e = est.find(x => x.cli && x.cli.id === c.id);
      const proxTxt = e ? `<span class="selo selo--alerta">${e.tipo === 'revisao' ? 'Revisão de 1 ano' : 'Oferecer testamento'}</span>` : prox ? `${esc(prox.titulo)}<span class="sub">${relativo(prox.data)}, ${horaBonita(prox.inicio)}</span>` : '<span class="sub">nada marcado</span>';
      return `<tr class="clicavel" data-acao="abrir-ficha" data-id="${c.id}"><td><span class="nome">${esc(nomeFamilia(c))}</span><span class="sub">${esc(c.cidade || '')}${c.filhos && c.filhos.length ? ' · ' + plural(c.filhos.length, 'filho', 'filhos') : ''}</span></td>
        <td class="some-movel">${esc(c.regime || '')}</td>
        <td><div class="chips">${ks.length ? ks.map(k => `<span class="selo">${esc(k.servico)}</span>`).join('') : '<span class="sub">nenhum em andamento</span>'}</div></td>
        <td class="some-movel">${proxTxt}</td><td class="some-movel">${esc(c.origem || '')}</td></tr>`;
    }).join('');

    const espHtml = esp.length ? painel('Chegaram e ainda não viraram cliente', esp.length, `<ul class="lista">${esp.map(c => `<li class="item"><div class="item__linha"><span class="item__titulo">${esc(c.nome)}</span><span class="item__meta ${diffDias(hoje(), c.desde) >= 3 ? 'alerta' : ''}">${c.canal} · ${relativo(c.desde)}</span></div><p class="item__texto">${esc(c.assunto)}</p><div class="item__acoes"><button class="btn btn--peq btn--escuro" data-acao="virar-cliente" data-id="${c.id}">Virar cliente</button><button class="btn btn--peq btn--texto" data-acao="respondi" data-id="${c.id}">Já respondi</button></div></li>`).join('')}</ul>`) : '';

    return `<header class="cab"><div class="cab__texto"><h1 class="titulo">Clientes</h1><p class="resumo">${plural(S.clientes.length, 'família', 'famílias')}. Cada ficha guarda o casal, os filhos, o regime de bens e o que já foi feito.</p></div>
      <div class="cab__acoes"><label class="busca">${ic('busca')}<span class="sr">Buscar</span><input class="entrada" type="search" id="busca-cli" placeholder="Buscar por nome ou filho" value="${esc(buscaCli)}"></label><button class="btn btn--principal" data-acao="nova-familia">${ic('mais2')}Família</button></div></header>
      ${espHtml}
      <section class="painel secao"><table class="tabela"><thead><tr><th>Família</th><th class="some-movel">Regime</th><th>Em andamento</th><th class="some-movel">Próximo</th><th class="some-movel">Veio de</th></tr></thead>
      <tbody>${linhas || `<tr><td colspan="5" class="vazio">Ninguém com esse nome. Confira a grafia ou cadastre a família.</td></tr>`}</tbody></table></section>`;
  }

  /* ================= CASOS ================= */
  function telaCasos() {
    const ativos = S.casos.filter(k => k.etapa !== 'Concluído').length;
    const cols = ETAPAS.map(et => {
      let ks = S.casos.filter(k => k.etapa === et);
      if (et === 'Concluído') ks = ks.sort((a, b) => (b.concluidoEm || '').localeCompare(a.concluidoEm || '')).slice(0, 6);
      return `<section class="coluna" data-etapa="${et}"><div class="coluna__cab"><h2>${et}</h2><span>${S.casos.filter(k => k.etapa === et).length}</span></div>
        <div class="coluna__lista">${ks.map(cartaoCaso).join('') || '<p class="vazio" style="padding:4px 6px">Arraste um caso pra cá.</p>'}</div></section>`;
    }).join('');
    return `<header class="cab"><div class="cab__texto"><h1 class="titulo">Casos</h1><p class="resumo">${plural(ativos, 'caso em andamento', 'casos em andamento')}. Arraste o cartão quando o caso mudar de etapa.</p></div>
      <div class="cab__acoes"><button class="btn btn--principal" data-acao="novo-caso">${ic('mais2')}Caso</button></div></header>
      <div class="quadro">${cols}</div>`;
  }
  function cartaoCaso(k) {
    const c = cliente(k.clienteId), dias = diffDias(hoje(), k.etapaDesde || k.abertoEm);
    const novas = S.intimacoes.filter(i => i.casoId === k.id && !i.lida).length;
    const i = ETAPAS.indexOf(k.etapa);
    const pe = k.etapa === 'Concluído' ? `<span>concluído ${relativo(k.concluidoEm)}</span>` : `<span>${dias ? `${dias} ${dias === 1 ? 'dia' : 'dias'} nesta etapa` : 'entrou hoje'}</span>`;
    return `<article class="caso" draggable="true" data-caso="${k.id}" tabindex="0" aria-label="${esc(nomeFamilia(c))}, ${esc(k.servico)}">
      <span class="caso__familia">${esc(nomeFamilia(c))}</span><span class="caso__servico">${esc(k.servico)} · <span class="num">${brl(k.valor)}</span></span>
      <div class="caso__pe">${pe}${novas ? `<span class="selo selo--alerta">${plural(novas, 'intimação', 'intimações')}</span>` : k.processo ? `<span class="selo selo--processo">${ic('intimacoes')}processo</span>` : ''}</div>
      ${i < ETAPAS.length - 1 ? `<button class="icone-btn caso__avancar" data-acao="avancar" data-id="${k.id}" aria-label="Mover pra ${ETAPAS[i + 1]}" title="Mover pra ${ETAPAS[i + 1]}">${ic('seta')}</button>` : ''}</article>`;
  }
  function mover(k, etapa) {
    if (!k || k.etapa === etapa) return;
    const f = foto(), H = hoje();
    k.etapa = etapa; k.etapaDesde = H;
    let msg = `${nomeFamilia(cliente(k.clienteId))}: ${k.servico} em ${etapa}.`;
    if (etapa === 'Concluído') {
      k.concluidoEm = H;
      const sv = SERV[k.servico] || {};
      if (sv.revisao) msg = `Concluído. A revisão de 1 ano entrou na esteira pra ${dataCurta(addDias(H, 365))}/${parse(addDias(H, 365)).getFullYear()}.`;
      if (sv.testamento && !S.casos.some(x => x.clienteId === k.clienteId && x.servico === 'Testamento')) msg += ' E a conversa sobre testamento já aparece em Hoje.';
    } else delete k.concluidoEm;
    marcarGuia('mover'); salvar(); render(); aviso(msg, voltar(f));
  }

  /* ================= INTIMAÇÕES ================= */
  let filtroInt = 'novas', chegouId = null;
  function telaIntimacoes() {
    const lista = S.intimacoes.map((i, n) => [i, n]).filter(([i]) => filtroInt === 'todas' || !i.lida).sort((a, b) => b[0].data.localeCompare(a[0].data) || b[1] - a[1]).map(x => x[0]);
    const u = S.ultimaConferencia;
    const itens = lista.map(i => {
      const k = caso(i.casoId), c = k && cliente(k.clienteId);
      return `<article class="intimacao ${i.lida ? '' : 'nova'} ${i.id === chegouId ? 'chegou' : ''}">
        <div class="intimacao__cab"><div class="intimacao__proc">${i.lida ? '' : '<span class="ponto"></span>'}${esc(nomeFamilia(c))} · ${esc(k ? k.servico : '')}<small>${esc(k && k.processo || '')} · ${esc(k && k.vara || 'TJSP')}</small></div>
        <span class="item__meta">${esc(i.tipo)} · ${relativo(i.data)} (${dataCurta(i.data)})</span></div>
        <p class="intimacao__texto">${esc(i.texto)}</p>
        <div class="item__acoes">${i.prazoCriado ? `<span class="selo selo--ok">${ic('check')}prazo criado</span>` : `<button class="btn btn--peq btn--escuro" data-acao="criar-prazo" data-id="${i.id}">Criar prazo</button>`}
        <button class="btn btn--peq btn--texto" data-acao="${i.lida ? 'nao-ler' : 'ler'}" data-id="${i.id}">${i.lida ? 'Marcar como não lida' : 'Marcar como lida'}</button>
        <button class="btn btn--peq btn--texto" data-acao="abrir-caso" data-id="${k ? k.id : ''}">Abrir o caso</button></div></article>`;
    }).join('');
    const vazio = filtroInt === 'novas' ? `<p class="vazio" style="padding:20px 22px">Nenhuma intimação nova. Toda manhã o painel confere o Diário de Justiça Eletrônico Nacional pela sua OAB e traz o texto inteiro pra cá.</p>` : `<p class="vazio" style="padding:20px 22px">Nenhuma intimação ainda.</p>`;
    return `<header class="cab"><div class="cab__texto"><h1 class="titulo">Intimações</h1><p class="resumo">O que saiu no Diário de Justiça em nome da sua OAB, com o texto inteiro. Uma intimação vira prazo com um clique.</p></div>
      <div class="cab__acoes"><div class="abas" role="group" aria-label="Filtro"><button data-acao="aba" data-v="novas" aria-pressed="${filtroInt === 'novas'}">Novas (${intimacoesNovas().length})</button><button data-acao="aba" data-v="todas" aria-pressed="${filtroInt === 'todas'}">Todas</button></div></div></header>
      <div class="fonte-djen">${ic('relogio')}<span>Conferido no DJEN pela OAB/SP 308.083 · ${u.data === hoje() ? 'hoje' : dataCurta(u.data)} às ${horaBonita(u.hora)}</span><button class="btn btn--peq" data-acao="conferir-djen">${ic('girar')}Conferir agora</button></div>
      <section class="painel" id="lista-int">${itens || vazio}</section>`;
  }
  function conferirDJEN(btn) {
    if (btn) { btn.classList.add('carregando'); btn.disabled = true; }
    const lista = $('#lista-int');
    if (lista) lista.insertAdjacentHTML('afterbegin', `<div class="intimacao" id="esq"><div class="esqueleto" style="width:40%"></div><div class="esqueleto" style="width:92%"></div><div class="esqueleto" style="width:70%"></div></div>`);
    setTimeout(() => {
      S.ultimaConferencia = { data: hoje(), hora: agoraHM() };
      marcarGuia('djen');
      if (!S.djenNovaEntregue) {
        const nova = Object.assign({}, S.intimacaoNova, { data: hoje() });
        S.intimacoes.push(nova); S.djenNovaEntregue = true; chegouId = nova.id;
        const k = caso(nova.casoId);
        salvar(); render();
        aviso(`Chegou 1 intimação nova: ${k.servico.toLowerCase()} de ${cliente(k.clienteId).nome}.`);
      } else {
        salvar(); render();
        aviso('Nada novo no DJEN desde a última conferência.');
      }
    }, 1300);
  }

  /* ================= TAREFAS ================= */
  function telaTarefas() {
    const H = hoje(), sem = addDias(H, 7);
    const abertas = S.tarefas.filter(t => !t.feita);
    const grupos = [
      ['Atrasadas', abertas.filter(t => t.prazo && t.prazo < H)],
      ['Hoje', abertas.filter(t => t.prazo === H)],
      ['Próximos 7 dias', abertas.filter(t => t.prazo > H && t.prazo <= sem)],
      ['Depois', abertas.filter(t => t.prazo > sem)],
      ['Sem data', abertas.filter(t => !t.prazo)],
      ['Feitas', S.tarefas.filter(t => t.feita).slice(-8).reverse()]
    ].filter(g => g[1].length);
    const linha = t => {
      const c = cliente(t.clienteId), atras = !t.feita && t.prazo && t.prazo < H;
      const meta = [c && nomeFamilia(c), t.prazo && (t.prazo === H ? 'hoje' : `${dataCurta(t.prazo)}, ${relativo(t.prazo)}`)].filter(Boolean).map(esc).join(' · ');
      return `<div class="tarefa ${t.feita ? 'feita' : ''}"><input type="checkbox" class="marcar" data-tarefa="${t.id}" ${t.feita ? 'checked' : ''} aria-label="Marcar como feita"><div><button class="tarefa__titulo" data-acao="tarefa-abrir" data-id="${t.id}">${esc(t.titulo)}</button><span class="tarefa__meta">${meta}</span></div>${atras ? '<span class="selo selo--alerta">atrasada</span>' : '<span></span>'}</div>`;
    };
    const ordenar = l => l.slice().sort((a, b) => (a.prazo || '9').localeCompare(b.prazo || '9'));
    return `<header class="cab"><div class="cab__texto"><h1 class="titulo">Tarefas</h1><p class="resumo">${plural(abertas.length, 'tarefa aberta', 'tarefas abertas')}. Uma tarefa começa com verbo e tem data; o que não tem data some da cabeça.</p></div></header>
      <form class="painel nova-tarefa" id="form-tarefa" autocomplete="off">
        <input class="entrada" name="titulo" placeholder="O que precisa ser feito? Comece com um verbo" aria-label="Nova tarefa" required>
        <input class="entrada" type="date" name="prazo" value="${H}" aria-label="Prazo">
        <select class="entrada" name="clienteId" aria-label="Cliente">${opcoesClientes('', 'Sem cliente')}</select>
        <button class="btn btn--principal" type="submit">${ic('mais2')}Adicionar</button></form>
      ${grupos.map(([n, l]) => painel(n, l.length, `<div>${(n === 'Feitas' ? l : ordenar(l)).map(linha).join('')}</div>`)).join('<div style="height:16px"></div>') || '<p class="vazio">Nenhuma tarefa. Escreva a primeira no campo acima.</p>'}`;
  }

  /* ================= HONORÁRIOS ================= */
  let mesOffset = 0;
  function telaHonorarios() {
    const H = hoje(), b = parse(H);
    const ref = new Date(b.getFullYear(), b.getMonth() + mesOffset, 1);
    const chave = `${ref.getFullYear()}-${pad(ref.getMonth() + 1)}`;
    const nomeMes = `${cap(MESES[ref.getMonth()])} de ${ref.getFullYear()}`;
    const ps = S.parcelas.filter(p => p.vencimento.slice(0, 7) === chave).sort((a, b2) => a.vencimento.localeCompare(b2.vencimento));
    const soma = l => l.reduce((t, p) => t + Number(p.valor), 0);
    const previsto = soma(ps), recebido = soma(ps.filter(p => p.pagoEm));
    const vencidas = ps.filter(p => !p.pagoEm && p.vencimento < H), vencido = soma(vencidas);
    const aberto = previsto - recebido - vencido;
    const pct = v => previsto ? (v / previsto * 100).toFixed(1) : 0;
    const linhas = ps.map(p => {
      const k = caso(p.casoId), c = k && cliente(k.clienteId);
      const st = p.pagoEm ? `<span class="status-pago">Pago em ${dataCurta(p.pagoEm)}</span>` : p.vencimento < H ? `<span class="status-vencido">Vencido ${relativo(p.vencimento)}</span>` : `<span class="status-aberto">${p.vencimento === H ? 'Vence hoje' : 'A receber'}</span>`;
      return `<tr><td><span class="nome">${esc(nomeFamilia(c))}</span><span class="sub">${esc(k ? k.servico : '')}</span></td><td class="some-movel num">${p.n} de ${p.de}</td><td class="num">${dataCurta(p.vencimento)}</td><td class="direita num">${brl(p.valor)}</td><td class="some-movel">${st}</td>
        <td class="direita">${p.pagoEm ? `<button class="btn btn--peq btn--texto" data-acao="desfazer-baixa" data-id="${p.id}">Desfazer</button>` : `<button class="btn btn--peq btn--escuro" data-acao="baixa" data-id="${p.id}">Dar baixa</button>`}</td></tr>`;
    }).join('');
    const ext = previsto ? `<p class="extrato">${brl(recebido)} recebidos de ${brl(previsto)} previstos em ${MESES[ref.getMonth()]}.</p>
      <p class="extrato-sub">${vencido ? `<b class="status-vencido">${brl(vencido)} vencidos</b> em ${plural(vencidas.length, 'parcela', 'parcelas')}. ` : ''}${aberto > 0 ? `${brl(aberto)} ainda a receber no mês.` : vencido ? '' : 'O mês está quitado.'}</p>
      <div class="barra-mes" role="img" aria-label="${pct(recebido)}% recebido"><i class="pago" style="width:${pct(recebido)}%"></i><i class="vencido" style="width:${pct(vencido)}%"></i></div>` : `<p class="extrato">Nenhuma parcela em ${MESES[ref.getMonth()]}.</p><p class="extrato-sub">Quando você cadastra um honorário parcelado, cada parcela cai no mês certo.</p>`;
    return `<header class="cab"><div class="cab__texto"><h1 class="titulo">Honorários</h1><p class="resumo">Cada contrato vira parcelas com data. Atrasou, aparece em Hoje.</p></div>
      <div class="cab__acoes"><div class="mes-nav"><button class="icone-btn" data-acao="mes" data-v="-1" aria-label="Mês anterior">${ic('esq')}</button><strong>${nomeMes}</strong><button class="icone-btn" data-acao="mes" data-v="1" aria-label="Próximo mês">${ic('dir')}</button></div>
      <button class="btn btn--principal" data-acao="novo-honorario">${ic('mais2')}Honorário</button></div></header>
      ${ext}
      ${ps.length ? `<section class="painel"><table class="tabela"><thead><tr><th>Cliente</th><th class="some-movel">Parcela</th><th>Vence</th><th class="direita">Valor</th><th class="some-movel">Situação</th><th></th></tr></thead><tbody>${linhas}</tbody></table></section>` : ''}`;
  }
  function darBaixa(id) {
    const p = S.parcelas.find(x => x.id === id); if (!p) return;
    const f = foto(); p.pagoEm = hoje(); marcarGuia('baixa'); salvar(); render();
    const k = caso(p.casoId);
    aviso(`Baixa de ${brl(p.valor)} de ${nomeFamilia(cliente(k.clienteId))}.`, voltar(f));
  }

  /* ================= FOLHA LATERAL ================= */
  const folha = $('#folha');
  function abrirFolha(titulo, html, montar) {
    $('#folha-titulo').textContent = titulo;
    $('#folha-corpo').innerHTML = html;
    if (!folha.open) folha.showModal();
    $('#folha-corpo').scrollTop = 0;
    if (montar) montar($('#folha-corpo'));
    const primeiroCampo = $('#folha-corpo input:not([type=hidden]), #folha-corpo select, #folha-corpo textarea');
    if (primeiroCampo && !primeiroCampo.dataset.semFoco) setTimeout(() => primeiroCampo.focus(), 60);
  }
  const fecharFolha = () => folha.open && folha.close();
  folha.addEventListener('click', e => { if (e.target === folha) fecharFolha(); });
  $('[data-acao="fechar-folha"]').innerHTML = ic('x');
  const dadosForm = f => Object.fromEntries(new FormData(f).entries());

  /* evento */
  function abrirEvento(ev, preset = {}, aoSalvar) {
    const novo = !ev;
    const e = ev || Object.assign({ data: hoje(), inicio: '10:00', fim: '11:00', tipo: 'consulta', titulo: '', local: 'Escritório' }, preset);
    abrirFolha(novo ? 'Novo compromisso' : 'Compromisso', `<form class="form" id="f-ev" autocomplete="off">
      <label class="campo"><span>O quê</span><input name="titulo" value="${esc(e.titulo)}" required placeholder="Consulta, audiência, assinatura…"></label>
      <div class="grade-campos">
        <label class="campo"><span>Tipo</span><select name="tipo">${Object.keys(TIPOS_EV).map(t => `<option value="${t}" ${t === e.tipo ? 'selected' : ''}>${TIPOS_EV[t]}</option>`).join('')}</select></label>
        <label class="campo"><span>Família</span><select name="clienteId">${opcoesClientes(e.clienteId)}</select></label>
        <label class="campo"><span>Dia</span><input type="date" name="data" value="${e.data}" required></label>
        <div class="grade-campos" style="gap:10px"><label class="campo"><span>Começa</span><input type="time" name="inicio" value="${e.inicio}" step="900" required></label><label class="campo"><span>Termina</span><input type="time" name="fim" value="${e.fim}" step="900" required></label></div>
        <label class="campo largo"><span>Onde</span><input name="local" value="${esc(e.local || '')}" placeholder="Escritório, Google Meet, fórum…"></label>
      </div>
      <p class="erro-msg" id="ev-erro" hidden>O horário de término precisa ser depois do início.</p>
      <p class="nota-form"><b>No painel de verdade</b>, este compromisso entra no seu Google Agenda, e o que você marca no celular aparece aqui.</p>
      <div class="form__acoes">${novo ? '' : `<button type="button" class="btn btn--texto btn--perigo" id="ev-apagar">Apagar</button>`}<div><button type="button" class="btn" data-acao="fechar-folha">Cancelar</button><button class="btn btn--principal" type="submit">${novo ? 'Marcar' : 'Salvar'}</button></div></div></form>`, corpo => {
      $('#f-ev', corpo).addEventListener('submit', x => {
        x.preventDefault();
        const d = dadosForm(x.target);
        if (minutos(d.fim) <= minutos(d.inicio)) { $('#ev-erro').hidden = false; return; }
        const f = foto();
        if (novo) S.eventos.push(Object.assign({ id: novoId('e') }, d)); else Object.assign(ev, d);
        if (aoSalvar) aoSalvar();
        salvar(); fecharFolha(); render();
        aviso(novo ? `Marcado: ${d.titulo}, ${dataMedia(d.data)} às ${horaBonita(d.inicio)}.` : 'Compromisso atualizado.', voltar(f));
      });
      const ap = $('#ev-apagar', corpo);
      if (ap) ap.addEventListener('click', () => { const f = foto(); S.eventos = S.eventos.filter(x => x !== ev); salvar(); fecharFolha(); render(); aviso('Compromisso apagado.', voltar(f)); });
    });
  }

  /* caso */
  function abrirCaso(k) {
    const c = cliente(k.clienteId);
    const ps = S.parcelas.filter(p => p.casoId === k.id);
    const pago = ps.filter(p => p.pagoEm).reduce((t, p) => t + p.valor, 0);
    const ints = S.intimacoes.filter(i => i.casoId === k.id).sort((a, b) => b.data.localeCompare(a.data));
    abrirFolha(`${k.servico}`, `<div class="ficha">
      <dl class="pares"><dt>Família</dt><dd><a href="#" data-acao="abrir-ficha" data-id="${c.id}">${esc(nomeFamilia(c))}</a></dd>
        <dt>Valor</dt><dd class="num">${brl(k.valor)}${ps.length ? ` · ${brl(pago)} recebidos` : ''}</dd>
        <dt>Aberto em</dt><dd>${dataCurta(k.abertoEm)}</dd>
        ${k.processo ? `<dt>Processo</dt><dd class="num">${esc(k.processo)}<br><span style="color:var(--tinta-3)">${esc(k.vara || '')}</span></dd>` : ''}
        ${k.concluidoEm ? `<dt>Concluído em</dt><dd>${dataCurta(k.concluidoEm)}</dd>` : ''}</dl>
      <label class="campo"><span>Etapa</span><select id="caso-etapa" data-sem-foco="1">${opcoes(ETAPAS, k.etapa)}</select></label>
      ${ps.length ? `<div class="ficha__bloco"><h3>Parcelas</h3><ul class="mini-lista">${ps.map(p => `<li><span class="num">${p.n} de ${p.de} · ${dataCurta(p.vencimento)}</span><span class="num">${brl(p.valor)} · ${p.pagoEm ? '<span class="status-pago">pago</span>' : p.vencimento < hoje() ? '<span class="status-vencido">vencido</span>' : 'a receber'}</span></li>`).join('')}</ul></div>` : ''}
      ${ints.length ? `<div class="ficha__bloco"><h3>Intimações</h3><ul class="mini-lista">${ints.map(i => `<li><span>${dataCurta(i.data)} · ${esc(i.texto.slice(0, 70))}…</span>${i.lida ? '' : '<span class="selo selo--alerta">nova</span>'}</li>`).join('')}</ul></div>` : ''}
      <div class="form__acoes"><button type="button" class="btn btn--texto btn--perigo" id="caso-apagar">Apagar caso</button><div><a class="btn" href="#intimacoes" data-acao="fechar-folha">Intimações</a><button type="button" class="btn btn--principal" data-acao="abrir-ficha" data-id="${c.id}">Abrir a ficha</button></div></div></div>`, corpo => {
      $('#caso-etapa', corpo).addEventListener('change', e => { fecharFolha(); mover(k, e.target.value); });
      $('#caso-apagar', corpo).addEventListener('click', () => {
        const f = foto();
        S.casos = S.casos.filter(x => x !== k); S.parcelas = S.parcelas.filter(p => p.casoId !== k.id); S.intimacoes = S.intimacoes.filter(i => i.casoId !== k.id);
        salvar(); fecharFolha(); render(); aviso('Caso apagado.', voltar(f));
      });
    });
  }
  function abrirNovoCaso(clienteId) {
    abrirFolha('Novo caso', `<form class="form" id="f-caso" autocomplete="off">
      <label class="campo"><span>Família</span><select name="clienteId" required>${opcoesClientes(clienteId, 'Escolha a família')}</select><small>Não está na lista? Cadastre a família em Clientes primeiro.</small></label>
      <div class="grade-campos">
        <label class="campo"><span>Serviço</span><select name="servico" id="caso-serv">${opcoes(Object.keys(SERV), 'Pacto antenupcial')}</select></label>
        <label class="campo"><span>Etapa</span><select name="etapa">${opcoes(ETAPAS.slice(0, 4), 'Conversa')}</select></label>
        <label class="campo"><span>Honorários (R$)</span><input type="number" name="valor" min="0" step="50" value="4500" required></label>
        <label class="campo"><span>Em quantas parcelas</span><input type="number" name="n" min="1" max="12" value="3" required></label>
        <label class="campo"><span>Primeira parcela vence em</span><input type="date" name="venc" value="${addDias(hoje(), 7)}" required></label>
        <label class="campo" id="campo-proc" hidden><span>Número do processo</span><input name="processo" placeholder="0000000-00.0000.8.26.0482"></label>
      </div>
      <p class="nota-form">As parcelas entram sozinhas em Honorários, uma por mês.</p>
      <div class="form__acoes"><div><button type="button" class="btn" data-acao="fechar-folha">Cancelar</button><button class="btn btn--principal" type="submit">Criar caso</button></div></div></form>`, corpo => {
      const serv = $('#caso-serv', corpo), proc = $('#campo-proc', corpo);
      const ajustar = () => { proc.hidden = !(SERV[serv.value] || {}).judicial; };
      serv.addEventListener('change', ajustar); ajustar();
      $('#f-caso', corpo).addEventListener('submit', x => {
        x.preventDefault();
        const d = dadosForm(x.target), f = foto(), H = hoje();
        const k = { id: novoId('k'), clienteId: d.clienteId, servico: d.servico, etapa: d.etapa, etapaDesde: H, valor: Number(d.valor), abertoEm: H };
        if (d.processo) { k.processo = d.processo; k.vara = 'Vara de Família e Sucessões de Presidente Prudente'; }
        S.casos.push(k);
        criarParcelas(k.id, Number(d.valor), Number(d.n), d.venc);
        salvar(); fecharFolha(); location.hash = '#casos'; render();
        aviso(`Caso criado, com ${plural(Number(d.n), 'parcela', 'parcelas')} em Honorários.`, voltar(f));
      });
    });
  }
  function criarParcelas(casoId, total, n, primeira) {
    const base = Math.floor(total / n * 100) / 100;
    for (let i = 1; i <= n; i++) {
      const d = parse(primeira); d.setMonth(d.getMonth() + i - 1);
      const valor = i === n ? Math.round((total - base * (n - 1)) * 100) / 100 : base;
      S.parcelas.push({ id: novoId('p'), casoId, n: i, de: n, valor, vencimento: iso(d) });
    }
  }
  function abrirNovoHonorario() {
    abrirFolha('Novo honorário', `<form class="form" id="f-hon" autocomplete="off">
      <label class="campo"><span>Caso</span><select name="casoId" required><option value="">Escolha o caso</option>${S.casos.map(k => `<option value="${k.id}">${esc(nomeFamilia(cliente(k.clienteId)))} · ${esc(k.servico)}</option>`).join('')}</select></label>
      <div class="grade-campos">
        <label class="campo"><span>Valor total (R$)</span><input type="number" name="valor" min="0" step="50" value="3000" required></label>
        <label class="campo"><span>Parcelas</span><input type="number" name="n" min="1" max="12" value="2" required></label>
        <label class="campo largo"><span>Primeira parcela vence em</span><input type="date" name="venc" value="${addDias(hoje(), 7)}" required></label>
      </div>
      <div class="form__acoes"><div><button type="button" class="btn" data-acao="fechar-folha">Cancelar</button><button class="btn btn--principal" type="submit">Criar parcelas</button></div></div></form>`, corpo => {
      $('#f-hon', corpo).addEventListener('submit', x => {
        x.preventDefault(); const d = dadosForm(x.target), f = foto();
        criarParcelas(d.casoId, Number(d.valor), Number(d.n), d.venc);
        salvar(); fecharFolha(); render(); aviso(`${plural(Number(d.n), 'parcela criada', 'parcelas criadas')}.`, voltar(f));
      });
    });
  }

  /* ficha da família */
  function abrirFicha(c) {
    const ks = S.casos.filter(k => k.clienteId === c.id);
    const ps = S.parcelas.filter(p => ks.some(k => k.id === p.casoId));
    const total = ps.reduce((t, p) => t + p.valor, 0), pago = ps.filter(p => p.pagoEm).reduce((t, p) => t + p.valor, 0);
    const prox = ps.filter(p => !p.pagoEm).sort((a, b) => a.vencimento.localeCompare(b.vencimento))[0];
    const evs = S.eventos.filter(e => e.clienteId === c.id && e.data >= hoje()).sort((a, b) => (a.data + a.inicio).localeCompare(b.data + b.inicio));
    const est = esteira().filter(e => e.cli && e.cli.id === c.id);
    const pessoas = [`<div class="pessoa"><b>${esc(c.nome)}</b><span>cliente</span></div>`]
      .concat(c.conjuge ? [`<div class="pessoa"><b>${esc(c.conjuge)}</b><span>cônjuge ou companheiro</span></div>`] : [])
      .concat((c.filhos || []).map(f => `<div class="pessoa"><b>${esc(f.nome)}</b><span>${f.idade} anos</span></div>`));
    abrirFolha(nomeFamilia(c), `<div class="ficha">
      ${est.map(e => `<div class="esteira-ficha">${ic('fio')}<span>${e.tipo === 'revisao' ? `<b>Revisão de 1 ano</b> do ${esc(e.caso.servico.toLowerCase())}: ${e.dd < 0 ? 'venceu ' : ''}${relativo(e.venc)}.` : `<b>Próximo passo da esteira:</b> conversar sobre testamento.`}</span></div>`).join('')}
      <div class="ficha__bloco"><h3>Família</h3><div class="familia">${pessoas.join('')}</div></div>
      <div class="ficha__bloco"><h3>Dados</h3><dl class="pares"><dt>Regime</dt><dd>${esc(c.regime || '—')}</dd><dt>Telefone</dt><dd class="num">${esc(c.telefone || '—')}</dd><dt>Cidade</dt><dd>${esc(c.cidade || '—')}</dd><dt>Veio de</dt><dd>${esc(c.origem || '—')}</dd><dt>Cliente desde</dt><dd>${c.desde ? dataCurta(c.desde) + '/' + parse(c.desde).getFullYear() : '—'}</dd></dl></div>
      <div class="ficha__bloco"><h3>Casos</h3>${ks.length ? `<ul class="mini-lista">${ks.map(k => `<li><a href="#" data-acao="abrir-caso" data-id="${k.id}">${esc(k.servico)}</a><span class="selo ${k.etapa === 'Concluído' ? 'selo--ok' : ''}">${esc(k.etapa)}</span></li>`).join('')}</ul>` : '<p class="vazio" style="padding:0">Nenhum caso ainda.</p>'}</div>
      ${ps.length ? `<div class="ficha__bloco"><h3>Honorários</h3><p style="margin:0" class="num">${brl(pago)} recebidos de ${brl(total)}.${prox ? ` Próxima parcela: ${brl(prox.valor)} em ${dataCurta(prox.vencimento)}${prox.vencimento < hoje() ? ' <span class="status-vencido">(vencida)</span>' : ''}.` : ' Tudo quitado.'}</p></div>` : ''}
      <div class="ficha__bloco"><h3>Próximos compromissos</h3>${evs.length ? `<ul class="mini-lista">${evs.map(e => `<li><span>${esc(e.titulo)}</span><span class="num">${dataCurta(e.data)}, ${horaBonita(e.inicio)}</span></li>`).join('')}</ul>` : '<p class="vazio" style="padding:0">Nada marcado.</p>'}</div>
      <label class="campo"><span>Anotações</span><textarea id="ficha-notas" data-sem-foco="1" placeholder="O que você precisa lembrar dessa família">${esc(c.notas || '')}</textarea><small>Salva sozinho.</small></label>
      <div class="form__acoes" style="justify-content:flex-start"><button type="button" class="btn" data-acao="editar-familia" data-id="${c.id}">${ic('seguir')}Editar</button><button type="button" class="btn" data-acao="novo-caso" data-id="${c.id}">${ic('mais2')}Caso</button><button type="button" class="btn" data-acao="novo-evento" data-cliente="${c.id}">${ic('agenda')}Compromisso</button><button type="button" class="btn btn--texto" data-acao="drive">${ic('pasta')}Pasta no Drive</button></div></div>`, corpo => {
      $('#ficha-notas', corpo).addEventListener('change', e => { c.notas = e.target.value; salvar(); aviso('Anotação salva.'); });
    });
  }
  function abrirFormFamilia(c, preset = {}, aoSalvar) {
    const novo = !c;
    const x = c || Object.assign({ nome: '', conjuge: '', filhos: [], regime: 'Comunhão parcial', telefone: '', cidade: 'Presidente Prudente', origem: 'Instagram', notas: '' }, preset);
    abrirFolha(novo ? 'Nova família' : 'Editar família', `<form class="form" id="f-fam" autocomplete="off">
      <div class="grade-campos">
        <label class="campo"><span>Nome da cliente</span><input name="nome" value="${esc(x.nome)}" required></label>
        <label class="campo"><span>Cônjuge ou companheiro</span><input name="conjuge" value="${esc(x.conjuge)}" placeholder="Opcional"></label>
        <label class="campo largo"><span>Filhos</span><textarea name="filhos" placeholder="Um por linha: nome, idade">${esc((x.filhos || []).map(f => `${f.nome}, ${f.idade}`).join('\n'))}</textarea></label>
        <label class="campo"><span>Regime de bens</span><select name="regime">${opcoes(REGIMES, x.regime)}</select></label>
        <label class="campo"><span>Veio de</span><select name="origem">${opcoes(ORIGENS, x.origem)}</select></label>
        <label class="campo"><span>Telefone</span><input name="telefone" value="${esc(x.telefone)}" inputmode="tel" placeholder="(18) 00000-0000"></label>
        <label class="campo"><span>Cidade</span><input name="cidade" value="${esc(x.cidade)}"></label>
        <label class="campo largo"><span>Anotações</span><textarea name="notas">${esc(x.notas)}</textarea></label>
      </div>
      <p class="nota-form"><b>Documento não fica aqui.</b> Contrato, certidão e minuta ficam no seu Google Drive; a ficha só guarda o atalho pra pasta.</p>
      <div class="form__acoes"><div><button type="button" class="btn" data-acao="fechar-folha">Cancelar</button><button class="btn btn--principal" type="submit">${novo ? 'Cadastrar' : 'Salvar'}</button></div></div></form>`, corpo => {
      $('#f-fam', corpo).addEventListener('submit', ev => {
        ev.preventDefault();
        const d = dadosForm(ev.target), f = foto();
        d.filhos = (d.filhos || '').split('\n').map(l => l.trim()).filter(Boolean).map(l => { const m = l.split(','); return { nome: m[0].trim(), idade: parseInt(m[1], 10) || '?' }; });
        let alvo = c;
        if (novo) { alvo = Object.assign({ id: novoId('f'), desde: hoje() }, d); S.clientes.push(alvo); marcarGuia('familia'); } else Object.assign(c, d);
        if (aoSalvar) aoSalvar(alvo);
        salvar(); render();
        aviso(novo ? `${nomeFamilia(alvo)} cadastrada.` : 'Ficha atualizada.', voltar(f));
        abrirFicha(alvo);
      });
    });
  }

  /* tarefa */
  function abrirTarefa(t) {
    abrirFolha('Tarefa', `<form class="form" id="f-tar" autocomplete="off">
      <label class="campo"><span>O que fazer</span><input name="titulo" value="${esc(t ? t.titulo : '')}" required placeholder="Comece com um verbo"></label>
      <div class="grade-campos"><label class="campo"><span>Prazo</span><input type="date" name="prazo" value="${t ? t.prazo || '' : hoje()}"></label>
      <label class="campo"><span>Família</span><select name="clienteId">${opcoesClientes(t && t.clienteId)}</select></label></div>
      <div class="form__acoes">${t ? '<button type="button" class="btn btn--texto btn--perigo" id="tar-apagar">Apagar</button>' : ''}<div><button type="button" class="btn" data-acao="fechar-folha">Cancelar</button><button class="btn btn--principal" type="submit">${t ? 'Salvar' : 'Criar'}</button></div></div></form>`, corpo => {
      $('#f-tar', corpo).addEventListener('submit', e => {
        e.preventDefault(); const d = dadosForm(e.target), f = foto();
        if (t) Object.assign(t, d); else S.tarefas.push(Object.assign({ id: novoId('t'), feita: false }, d));
        salvar(); fecharFolha(); render(); aviso(t ? 'Tarefa atualizada.' : 'Tarefa criada.', voltar(f));
      });
      const ap = $('#tar-apagar', corpo);
      if (ap) ap.addEventListener('click', () => { const f = foto(); S.tarefas = S.tarefas.filter(x => x !== t); salvar(); fecharFolha(); render(); aviso('Tarefa apagada.', voltar(f)); });
    });
  }

  /* prazo a partir de intimação */
  function abrirPrazo(i) {
    const k = caso(i.casoId), c = cliente(k.clienteId);
    const m = i.texto.match(/(\d+)\s*\([^)]*\)\s*dias/i) || i.texto.match(/prazo de (\d+)/i);
    const dias = m ? Number(m[1]) : 15;
    const titulo = /comprov/i.test(i.texto) ? 'Comprovar o recolhimento' : /manifest/i.test(i.texto) ? 'Manifestar nos autos' : 'Cumprir a intimação';
    const inicio = proxUtil(i.data);
    abrirFolha('Criar prazo', `<form class="form" id="f-prazo" autocomplete="off">
      <p class="intimacao__texto" style="background:var(--claro);padding:12px 14px;border-radius:12px">${esc(i.texto)}</p>
      <label class="campo"><span>Tarefa</span><input name="titulo" value="${esc(titulo)} · ${esc(c.nome)}" required></label>
      <div class="grade-campos">
        <label class="campo"><span>Prazo em dias úteis</span><input type="number" name="dias" id="pz-dias" min="1" max="120" value="${dias}" required></label>
        <label class="campo"><span>Conta a partir de</span><input type="date" name="inicio" id="pz-ini" value="${inicio}" required></label>
      </div>
      <p class="resumo" style="margin:0;font-size:1rem" id="pz-venc"></p>
      <p class="nota-form">O painel conta dias úteis e pula fim de semana. <b>Feriado forense e suspensão de prazo não entram na conta</b>: confira antes de confiar.</p>
      <div class="form__acoes"><div><button type="button" class="btn" data-acao="fechar-folha">Cancelar</button><button class="btn btn--principal" type="submit">Criar prazo</button></div></div></form>`, corpo => {
      const calc = () => { const n = Number($('#pz-dias', corpo).value) || 1, ini = $('#pz-ini', corpo).value; if (!ini) return ''; const v = addUteis(ini, n - 1); $('#pz-venc', corpo).innerHTML = `Vence <b>${dataMedia(v)}</b> (${relativo(v)}).`; return v; };
      $('#pz-dias', corpo).addEventListener('input', calc); $('#pz-ini', corpo).addEventListener('input', calc); calc();
      $('#f-prazo', corpo).addEventListener('submit', e => {
        e.preventDefault(); const d = dadosForm(e.target), f = foto(), venc = calc();
        S.tarefas.push({ id: novoId('t'), titulo: d.titulo, prazo: venc, clienteId: c.id, feita: false, intimacaoId: i.id });
        i.lida = true; i.prazoCriado = true; marcarGuia('prazo');
        salvar(); fecharFolha(); render();
        aviso(`Prazo criado pra ${dataCurta(venc)} e intimação marcada como lida.`, voltar(f));
      });
    });
  }

  /* menu "mais" no celular */
  function abrirMais() {
    abrirFolha('Mais', `<nav class="ficha">${['intimacoes', 'tarefas', 'honorarios'].map(id => { const t = TELAS.find(x => x.id === id); return `<a class="btn" style="justify-content:flex-start;height:52px" href="#${id}" data-acao="fechar-folha">${ic(t.ic)}${t.rot}${contador(id).replace('contador', 'contador').replace('class="contador"', 'class="contador" style="background:var(--claro-2);color:var(--tinta)"')}</a>`; }).join('')}
      <p class="nota-form">DJEN conferido pela OAB/SP 308.083 · ${S.ultimaConferencia.data === hoje() ? 'hoje' : dataCurta(S.ultimaConferencia.data)} às ${horaBonita(S.ultimaConferencia.hora)}</p>
      <button type="button" class="btn btn--texto" data-acao="restaurar">${ic('girar')}Restaurar dados de exemplo</button></nav>`);
  }

  /* ================= GUIA ================= */
  const PASSOS = [
    { k: 'djen', t: 'Confira o DJEN agora', h: '#intimacoes' },
    { k: 'prazo', t: 'Transforme uma intimação em prazo', h: '#intimacoes' },
    { k: 'baixa', t: 'Dê baixa numa parcela', h: '#honorarios' },
    { k: 'mover', t: 'Leve um caso pra próxima etapa', h: '#casos' },
    { k: 'familia', t: 'Cadastre uma família nova', h: '#clientes' }
  ];
  let guiaMovelAberto = false;
  function renderGuia() {
    const feitos = PASSOS.filter(p => S.guia[p.k]).length, tudo = feitos === PASSOS.length;
    const html = `<button type="button" class="guia__cab" data-acao="guia" aria-expanded="${!S.guiaFechado}"><span><b>${tudo ? 'Pronto' : 'Experimente'}</b><span>${feitos} de ${PASSOS.length}</span></span>${ic('baixo')}</button>
      <ol class="guia__passos">${PASSOS.map(p => `<li class="${S.guia[p.k] ? 'feito' : ''}"><i>${S.guia[p.k] ? ic('check') : ''}</i><a href="${p.h}">${p.t}</a></li>`).join('')}</ol>
      <div class="guia__pe">${tudo ? '<b>Isso é o painel com dados de mentira.</b> Com os seus, ele confere o DJEN sozinho, lê a sua agenda e lembra da esteira de cada família.' : 'Tudo aqui é fictício. Pode mexer à vontade: o botão <b>Restaurar exemplo</b> volta tudo ao começo.'}</div>`;
    const lat = $('#guia-lateral'), mov = $('#guia');
    lat.classList.toggle('fechado', !!S.guiaFechado); lat.innerHTML = html;
    mov.classList.toggle('fechado', !guiaMovelAberto); mov.innerHTML = html.replace(`aria-expanded="${!S.guiaFechado}"`, `aria-expanded="${guiaMovelAberto}"`);
  }

  /* ================= AVISO ================= */
  let avisoTimer;
  function aviso(msg, desfazer) {
    const a = $('#aviso');
    a.innerHTML = `<span>${esc(msg)}</span>${desfazer ? '<button type="button">Desfazer</button>' : ''}`;
    a.classList.add('ver');
    if (desfazer) a.querySelector('button').onclick = () => { desfazer(); a.classList.remove('ver'); };
    clearTimeout(avisoTimer); avisoTimer = setTimeout(() => a.classList.remove('ver'), desfazer ? 6500 : 3800);
  }

  /* ================= RENDER ================= */
  const VIEWS = { hoje: telaHoje, agenda: telaAgenda, clientes: telaClientes, casos: telaCasos, intimacoes: telaIntimacoes, tarefas: telaTarefas, honorarios: telaHonorarios };
  let ultimaTela = null;
  function render() {
    const t = telaAtual();
    const tela = $('#tela');
    const rolagem = ultimaTela === t ? window.scrollY : 0;
    tela.innerHTML = VIEWS[t]();
    renderNav(); renderGuia();
    document.title = `${TELAS.find(x => x.id === t).rot} · Izadora Tannus`;
    if (ultimaTela !== t) { window.scrollTo(0, 0); } else window.scrollTo(0, rolagem);
    ultimaTela = t;
    montarTela(t);
    chegouId = null;
  }
  function montarTela(t) {
    if (t === 'clientes') {
      const b = $('#busca-cli');
      b.addEventListener('input', e => { buscaCli = e.target.value; const pos = e.target.selectionStart; render(); const nb = $('#busca-cli'); nb.focus(); nb.setSelectionRange(pos, pos); });
    }
    if (t === 'tarefas') {
      $('#form-tarefa').addEventListener('submit', e => {
        e.preventDefault(); const d = dadosForm(e.target), f = foto();
        S.tarefas.push({ id: novoId('t'), titulo: d.titulo.trim(), prazo: d.prazo, clienteId: d.clienteId, feita: false });
        salvar(); render(); $('#form-tarefa [name=titulo]').focus(); aviso('Tarefa adicionada.', voltar(f));
      });
    }
    if (t === 'casos') montarArraste();
    if (t === 'agenda') {
      const hora = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hora')) || 56;
      $$('.semana__col').forEach(col => col.addEventListener('click', e => {
        if (e.target !== col) return;
        const y = e.clientY - col.getBoundingClientRect().top;
        const m = 7 * 60 + Math.floor(y / hora * 2) * 30;
        const ini = `${pad(Math.floor(m / 60))}:${pad(m % 60)}`, fim = `${pad(Math.floor((m + 60) / 60))}:${pad(m % 60)}`;
        abrirEvento(null, { data: col.dataset.dia, inicio: ini, fim });
      }));
    }
  }
  function montarArraste() {
    let arrastando = null;
    $$('.caso').forEach(el => {
      el.addEventListener('dragstart', e => { arrastando = el.dataset.caso; el.classList.add('arrastando'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', arrastando); });
      el.addEventListener('dragend', () => { el.classList.remove('arrastando'); $$('.coluna').forEach(c => c.classList.remove('sobre')); });
      el.addEventListener('click', e => { if (e.target.closest('[data-acao]')) return; abrirCaso(caso(el.dataset.caso)); });
      el.addEventListener('keydown', e => { if (e.key === 'Enter') abrirCaso(caso(el.dataset.caso)); });
    });
    $$('.coluna').forEach(col => {
      col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('sobre'); });
      col.addEventListener('dragleave', e => { if (!col.contains(e.relatedTarget)) col.classList.remove('sobre'); });
      col.addEventListener('drop', e => { e.preventDefault(); col.classList.remove('sobre'); const id = e.dataTransfer.getData('text/plain') || arrastando; mover(caso(id), col.dataset.etapa); });
    });
  }

  /* ================= AÇÕES ================= */
  const ACOES = {
    'restaurar': () => { const f = foto(), g = S.guia; S = window.PainelDados.semear(); S.guia = {}; salvar(false); fecharFolha(); render(); aviso('Dados de exemplo restaurados.', () => { S = JSON.parse(f); S.guia = g; salvar(); render(); }); },
    'fechar-folha': () => fecharFolha(),
    'conferir-djen': el => conferirDJEN(el),
    'criar-prazo': el => abrirPrazo(S.intimacoes.find(i => i.id === el.dataset.id)),
    'ler': el => { const f = foto(); S.intimacoes.find(i => i.id === el.dataset.id).lida = true; salvar(); render(); aviso('Intimação marcada como lida.', voltar(f)); },
    'nao-ler': el => { S.intimacoes.find(i => i.id === el.dataset.id).lida = false; salvar(); render(); },
    'baixa': el => darBaixa(el.dataset.id),
    'desfazer-baixa': el => { const p = S.parcelas.find(x => x.id === el.dataset.id); delete p.pagoEm; salvar(); render(); aviso('Baixa desfeita.'); },
    'respondi': el => { const f = foto(), c = S.contatos.find(x => x.id === el.dataset.id); c.respondido = true; salvar(); render(); aviso(`${c.nome} saiu da lista de espera.`, voltar(f)); },
    'virar-cliente': el => {
      const ct = S.contatos.find(x => x.id === el.dataset.id);
      abrirFormFamilia(null, { nome: ct.nome, origem: ORIGENS.includes(ct.canal) ? ct.canal : 'Outro', notas: ct.assunto }, () => { ct.respondido = true; ct.convertido = true; });
    },
    'agendar-esteira': el => {
      const e = esteira().find(x => x.key === el.dataset.key); if (!e) return;
      abrirEvento(null, { titulo: e.tipo === 'revisao' ? 'Revisão de 1 ano' : 'Conversa sobre testamento', tipo: 'reuniao', clienteId: e.cli.id, data: proxUtil(hoje()), local: 'Escritório' }, () => { S.esteiraFeita[e.key] = true; });
    },
    'esteira-feito': el => { const f = foto(); S.esteiraFeita[el.dataset.key] = true; salvar(); render(); aviso('Saiu da esteira.', voltar(f)); },
    'abrir-evento': el => abrirEvento(S.eventos.find(e => e.id === el.dataset.id)),
    'novo-evento': el => abrirEvento(null, el.dataset.cliente ? { clienteId: el.dataset.cliente, tipo: 'reuniao' } : {}),
    'abrir-caso': el => { const k = caso(el.dataset.id); if (k) abrirCaso(k); },
    'novo-caso': el => abrirNovoCaso(el.dataset.id),
    'avancar': el => { const k = caso(el.dataset.id); mover(k, ETAPAS[ETAPAS.indexOf(k.etapa) + 1]); },
    'abrir-ficha': el => abrirFicha(cliente(el.dataset.id)),
    'nova-familia': () => abrirFormFamilia(null),
    'editar-familia': el => abrirFormFamilia(cliente(el.dataset.id)),
    'tarefa-abrir': el => abrirTarefa(S.tarefas.find(t => t.id === el.dataset.id)),
    'nova-tarefa-rapida': () => abrirTarefa(null),
    'semana': el => { const v = Number(el.dataset.v); semanaOffset = v === 0 ? 0 : semanaOffset + v; render(); },
    'mes': el => { mesOffset += Number(el.dataset.v); render(); },
    'aba': el => { filtroInt = el.dataset.v; render(); },
    'guia': el => { if (el.closest('#guia')) guiaMovelAberto = !guiaMovelAberto; else { S.guiaFechado = !S.guiaFechado; salvar(false); } renderGuia(); },
    'drive': () => aviso('No painel de verdade, este botão abre a pasta da família no seu Google Drive.'),
    'mais': () => abrirMais(),
    'novo-honorario': () => abrirNovoHonorario()
  };
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-acao]');
    if (!el || !ACOES[el.dataset.acao]) return;
    const href = el.getAttribute('href');
    if (el.tagName === 'A' && href === '#') e.preventDefault();
    if (el.tagName === 'TR' && e.target.closest('a,button')) return;
    ACOES[el.dataset.acao](el);
  });
  document.addEventListener('change', e => {
    const id = e.target.dataset && e.target.dataset.tarefa;
    if (!id) return;
    const t = S.tarefas.find(x => x.id === id), f = foto();
    t.feita = e.target.checked; salvar();
    setTimeout(() => { render(); if (t.feita) aviso(`Feita: ${t.titulo}.`, voltar(f)); }, 220);
  });
  window.addEventListener('hashchange', () => { fecharFolha(); render(); });
  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea, select') || folha.open || e.metaKey || e.ctrlKey || e.altKey) return;
    const n = Number(e.key);
    if (n >= 1 && n <= TELAS.length) location.hash = '#' + TELAS[n - 1].id;
  });
  // a linha do "agora" anda sozinha
  setInterval(() => { if (!folha.open && ['hoje', 'agenda'].includes(telaAtual()) && !document.activeElement.matches('input, textarea, select')) render(); }, 60000);

  S = carregar();
  salvar(false);
  render();
})();
