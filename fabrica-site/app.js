/* Fábrica de Barbeiros · site de demonstração (Carioca's Consultoria, out/2026)

   1. Topo que escurece ao rolar.
   2. Sequências de quadros desenhadas num canvas pela rolagem: o filme da abertura
      (d/ 16:9 e m/ 9:16) e a Magic Clip Gold girando na loja. Carga em passadas
      (de 16 em 16, depois completando), mesmo desenho da repaginada do Lucas Cabral:
      a rolagem funciona desde o início e só fica mais "picada" até tudo chegar.
      Com Save-Data ou 2G carrega de 8 em 8. Com movimento reduzido não carrega nada.
   3. Vídeos reais do Instagram tocam só quando aparecem na tela.
   4. O certificado com o nome de quem visita, o guilhochê e os carimbos.
   5. O agente da Fábrica (demonstração com perguntas reais). */
(function () {
  'use strict';
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var conexao = navigator.connection || {};
  var economia = !!conexao.saveData || /(^|slow-)2g/.test(conexao.effectiveType || '');
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ================================================================ topo */
  var topo = document.getElementById('topo');
  function marcarTopo() { topo.classList.toggle('is-solido', window.scrollY > window.innerHeight * 0.6); }
  window.addEventListener('scroll', marcarTopo, { passive: true });
  marcarTopo();

  /* ================================================================ sequências */
  function sequencia(sec, opts) {
    var total = parseInt(sec.getAttribute('data-quadros'), 10) || 0;
    var canvas = sec.querySelector(opts.canvas);
    if (reduz || total < 2 || !canvas || !canvas.getContext) { if (opts.estatico) opts.estatico(); return; }
    var ctx = canvas.getContext('2d', { alpha: false });
    var emPe = opts.versoes && window.matchMedia('(max-aspect-ratio: 4/5)').matches;
    var pasta = sec.getAttribute('data-base') + (opts.versoes ? (emPe ? 'm/' : 'd/') : '');
    var quadros = new Array(total);
    var prontos = new Uint8Array(total);
    var alvo = 0, desenhado = -1, visivel = true, agendado = false;
    var largura = 0, altura = 0;

    function nome(i) { return pasta + String(i + 1).padStart(4, '0') + '.webp'; }

    var fila = [], vistos = new Uint8Array(total), tentativas = new Uint8Array(total);
    (economia ? [8] : [16, 8, 4, 2, 1]).forEach(function (passo) {
      for (var i = 0; i < total; i += passo) if (!vistos[i]) { vistos[i] = 1; fila.push(i); }
    });
    if (!vistos[total - 1]) fila.splice(1, 0, total - 1);
    var emVoo = 0, MAX = economia ? 2 : 6;
    function carregar() {
      while (emVoo < MAX && fila.length) {
        (function (i) {
          emVoo++;
          var img = new Image();
          img.decoding = 'async';
          img.onload = function () {
            quadros[i] = img; prontos[i] = 1; emVoo--;
            if (i === 0) { sec.classList.add('is-viva'); agendar(); }
            else if (Math.abs(i - alvo) < 4) agendar();
            carregar();
          };
          // falha passageira do servidor (o GitHub devolve 503 logo depois de publicar):
          // tenta de novo até duas vezes; enquanto isso desenha o quadro vizinho
          img.onerror = function () {
            emVoo--;
            if (tentativas[i] < 2) { tentativas[i]++; setTimeout(function () { fila.push(i); carregar(); }, 800 * tentativas[i]); }
            carregar();
          };
          img.src = nome(i) + (tentativas[i] ? '?r=' + tentativas[i] : '');
        })(fila.shift());
      }
    }

    var dpr = 1;
    function medir() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      largura = canvas.clientWidth; altura = canvas.clientHeight;
      canvas.width = Math.round(largura * dpr); canvas.height = Math.round(altura * dpr);
      desenhado = -1; agendar();
    }
    function maisPerto(i) {
      if (prontos[i]) return i;
      for (var d = 1; d < total; d++) {
        if (i - d >= 0 && prontos[i - d]) return i - d;
        if (i + d < total && prontos[i + d]) return i + d;
      }
      return -1;
    }
    function desenhar() {
      agendado = false;
      var r = sec.getBoundingClientRect();
      var curso = r.height - window.innerHeight;
      var p = curso > 0 ? clamp(-r.top / curso, 0, 1) : 0;
      if (opts.progresso) opts.progresso(p);
      alvo = Math.round(p * (total - 1));
      var i = maisPerto(alvo);
      if (i < 0 || i === desenhado) return;
      var img = quadros[i];
      var w = canvas.width, h = canvas.height;
      var reg = opts.regiao ? opts.regiao(w, h, dpr) : { x: 0, y: 0, w: w, h: h };
      if (opts.fundo) { ctx.fillStyle = opts.fundo; ctx.fillRect(0, 0, w, h); }
      ctx.save();
      ctx.beginPath(); ctx.rect(reg.x, reg.y, reg.w, reg.h); ctx.clip();
      var esc = Math.max(reg.w / img.naturalWidth, reg.h / img.naturalHeight);
      var dw = img.naturalWidth * esc, dh = img.naturalHeight * esc;
      ctx.drawImage(img, reg.x + (reg.w - dw) / 2, reg.y + (reg.h - dh) / 2, dw, dh);
      ctx.restore();
      desenhado = i;
    }
    function agendar() { if (!agendado && visivel) { agendado = true; requestAnimationFrame(desenhar); } }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visivel = es[0].isIntersecting;
        if (visivel) { if (fila.length && !emVoo) carregar(); agendar(); }
      }, { rootMargin: '200px 0px' }).observe(sec);
    }
    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', medir);
    medir();
    if (opts.cedo) carregar();
    else if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { carregar(); io.disconnect(); }
      }, { rootMargin: '120% 0px' });
      io.observe(sec);
    } else carregar();
  }

  /* o filme da abertura: capítulos e régua acompanham a rolagem */
  var filme = document.getElementById('filme');
  if (filme) {
    var capitulos = Array.prototype.slice.call(filme.querySelectorAll('.capitulo'));
    var regua = filme.querySelector('.regua');
    var marcas = regua ? Array.prototype.slice.call(regua.querySelectorAll('li')) : [];
    var ultimoCap = -1;
    sequencia(filme, {
      canvas: '.filme__tela', versoes: true, cedo: true,
      estatico: function () { filme.classList.add('is-estatico'); },
      progresso: function (p) {
        var c = 0;
        capitulos.forEach(function (el, k) {
          if (p >= parseFloat(el.getAttribute('data-de')) && p < parseFloat(el.getAttribute('data-ate'))) c = k;
        });
        if (c !== ultimoCap) {
          capitulos.forEach(function (el, k) { el.classList.toggle('is-ativo', k === c); });
          ultimoCap = c;
        }
        if (regua) {
          regua.style.setProperty('--p', p.toFixed(3));
          var ativa = 0;
          marcas.forEach(function (li, k) { if (p >= parseFloat(li.getAttribute('data-p')) - 0.02) ativa = k; });
          marcas.forEach(function (li, k) { li.classList.toggle('is-ativo', k === ativa); });
        }
        filme.classList.toggle('passou-inicio', p > 0.02);
      }
    });
  }

  /* a Magic Clip Gold girando: as características acendem com a volta */
  var vitrine = document.getElementById('vitrine');
  if (vitrine) {
    var specs = Array.prototype.slice.call(vitrine.querySelectorAll('.vitrine__specs li'));
    sequencia(vitrine, {
      canvas: '.vitrine__tela',
      fundo: '#0F0E0D',
      // abaixo do topo fixo; em pé, a máquina ocupa a parte de cima e a ficha fica embaixo
      regiao: function (w, h, d) {
        var topo = Math.round(64 * d);
        return h > w ? { x: 0, y: topo, w: w, h: Math.round(h * 0.56) } : { x: 0, y: topo, w: w, h: h - topo };
      },
      estatico: function () { specs.forEach(function (li) { li.classList.add('is-ativo'); }); },
      progresso: function (p) {
        specs.forEach(function (li) { li.classList.toggle('is-ativo', p >= parseFloat(li.getAttribute('data-de'))); });
      }
    });
  }

  /* ================================================================ vídeos reais */
  var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-video]'));
  if (videos.length && 'IntersectionObserver' in window && !reduz && !economia) {
    var ioVideo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (!v.getAttribute('src')) v.src = v.getAttribute('data-video');
          var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
        } else if (!v.paused) v.pause();
      });
    }, { threshold: 0.3 });
    videos.forEach(function (v) { ioVideo.observe(v); });
  }

  /* ================================================================ certificado */
  var campo = document.getElementById('nome-aluno');
  var nomeNoPapel = document.querySelector('[data-nome]');
  var nomeVisitante = '';
  // o nome fica numa linha só: se não couber, a letra diminui (até a metade do tamanho)
  function ajustarNome() {
    if (!nomeNoPapel) return;
    nomeNoPapel.style.fontSize = '';
    var base = parseFloat(getComputedStyle(nomeNoPapel).fontSize), t = base;
    while (nomeNoPapel.scrollWidth > nomeNoPapel.clientWidth + 1 && t > base * 0.5) {
      t *= 0.94; nomeNoPapel.style.fontSize = t.toFixed(1) + 'px';
    }
  }
  function escreverNome() {
    nomeVisitante = (campo.value || '').trim().replace(/\s+/g, ' ');
    nomeNoPapel.textContent = nomeVisitante || 'Seu nome aqui';
    nomeNoPapel.classList.toggle('is-vazio', !nomeVisitante);
    ajustarNome();
  }
  if (campo && nomeNoPapel) { campo.addEventListener('input', escreverNome); escreverNome(); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustarNome);

  var papel = document.querySelector('.papel');
  var folha = papel && papel.querySelector('.papel__folha');
  var guilhoche = papel && papel.querySelector('.papel__guilhoche');
  function desenharGuilhoche() {
    if (!guilhoche || !guilhoche.getContext) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = guilhoche.clientWidth, h = guilhoche.clientHeight;
    if (!w || !h) return;
    guilhoche.width = Math.round(w * dpr); guilhoche.height = Math.round(h * dpr);
    var g = guilhoche.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    // mesma régua do estilo.css (.papel__miolo começa em 10,4% da largura): margem 2,6%,
    // faixa 4,2%, filetes a 0,4% dela. Assim o texto nunca encosta na moldura
    var m = w * 0.026, banda = w * 0.042, fio = Math.max(2, w * 0.004);
    // moldura: ondas cruzadas como em cédula, contornando o papel
    function contorno(t) {
      var per = 2 * (w + h - 4 * m), d = t * per;
      if (d < w - 2 * m) return [m + d, m, 0, 1];
      d -= w - 2 * m; if (d < h - 2 * m) return [w - m, m + d, -1, 0];
      d -= h - 2 * m; if (d < w - 2 * m) return [w - m - d, h - m, 0, -1];
      d -= w - 2 * m; return [m, h - m - d, 1, 0];
    }
    // ondas com a mesma densidade em qualquer tamanho (número par fecha a volta sem emenda)
    var volta = 2 * (w + h - 4 * m), ondas = 2 * Math.round(volta / 36), ondasLargas = 2 * Math.round(volta / 72);
    var fios = [
      { cor: 'rgba(200,16,46,.55)', fase: 0, amp: 0.5, freq: ondas },
      { cor: 'rgba(200,16,46,.35)', fase: Math.PI, amp: 0.5, freq: ondas },
      { cor: 'rgba(18,18,20,.28)', fase: Math.PI / 2, amp: 0.42, freq: ondasLargas },
      { cor: 'rgba(18,18,20,.18)', fase: -Math.PI / 2, amp: 0.42, freq: ondasLargas }
    ];
    fios.forEach(function (f) {
      g.beginPath(); g.strokeStyle = f.cor; g.lineWidth = 0.7;
      for (var k = 0; k <= 2400; k++) {
        var t = k / 2400, q = contorno(t);
        var off = banda / 2 + Math.sin(t * f.freq * Math.PI + f.fase) * banda * f.amp;
        var x = q[0] + q[2] * off, y = q[1] + q[3] * off;
        if (k === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.stroke();
    });
    g.strokeStyle = 'rgba(18,18,20,.55)'; g.lineWidth = 1;
    g.strokeRect(m - fio, m - fio, w - 2 * (m - fio), h - 2 * (m - fio));
    var dentro = m + banda + fio;
    g.strokeRect(dentro, dentro, w - 2 * dentro, h - 2 * dentro);
    // rosácea de fundo (hipotrocoide), bem clara e com o miolo vazado: com dd = R - r todas
    // as voltas passavam pelo centro e acendiam um ponto vermelho em cima da linha do nome
    var cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.34, r = R * 0.23, dd = (R - r) * 0.6;
    g.beginPath(); g.strokeStyle = 'rgba(200,16,46,.07)'; g.lineWidth = 0.8;
    for (var a = 0; a <= Math.PI * 2 * 23; a += 0.02) {
      var x = (R - r) * Math.cos(a) + dd * Math.cos(((R - r) / r) * a);
      var y = (R - r) * Math.sin(a) - dd * Math.sin(((R - r) / r) * a);
      if (a === 0) g.moveTo(cx + x, cy + y); else g.lineTo(cx + x, cy + y);
    }
    g.stroke();
  }
  if (papel) {
    desenharGuilhoche();
    // redesenha no quadro seguinte: mexer no tamanho dentro do aviso dá erro de laço no navegador
    if ('ResizeObserver' in window) new ResizeObserver(function () { requestAnimationFrame(function () { desenharGuilhoche(); ajustarNome(); }); }).observe(folha || papel);
    if ('IntersectionObserver' in window && !reduz) {
      var ioPapel = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { papel.classList.add('is-carimbado'); ioPapel.disconnect(); }
      }, { threshold: 0.45 });
      ioPapel.observe(papel);
    }
  }

  /* ================================================================ o agente */
  var painel = document.getElementById('conversa');
  var chamar = document.getElementById('chamar');
  var fio = painel.querySelector('[data-fio]');
  var form = painel.querySelector('[data-form]');
  var entrada = document.getElementById('msg');
  var atalhos = painel.querySelector('[data-atalhos]');
  var aberto = false, saudou = false, ocupado = false, noFilme = true, digitando = false;
  // o botão flutuante some enquanto o filme passa (a abertura já tem os botões dela) e
  // enquanto a pessoa digita o nome do certificado (no Android ele subiria com o teclado
  // e cobriria o campo). Um botão de ação por vez: com o flutuante na tela, o do topo sai
  function mostrarChamar() {
    var flutuante = !(aberto || noFilme || digitando);
    chamar.classList.toggle('is-oculto', !flutuante);
    document.getElementById('topo').classList.toggle('sem-acao', flutuante);
  }
  if (filme && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { noFilme = es[0].isIntersecting; mostrarChamar(); }, { rootMargin: '0px 0px -40% 0px' }).observe(filme);
  } else { noFilme = false; }
  document.addEventListener('focusin', function (e) {
    if (e.target.matches('input') && !painel.contains(e.target)) { digitando = true; mostrarChamar(); }
  });
  document.addEventListener('focusout', function (e) {
    if (e.target.matches('input') && !painel.contains(e.target)) { digitando = false; mostrarChamar(); }
  });
  mostrarChamar();

  var respostas = [
    { re: /visit|conhecer|passar a[ií]|ir a[ií]|marcar/i, txt: ['Fechado! Fica melhor amanhã ou no sábado?', 'Me diz teu nome que eu já aviso o Jullio que você vem.'], aviso: 'Aviso pro Jullio no WhatsApp · Interessado quer visitar a escola. Veio pelo site. A conversa fica salva no painel da semana.' },
    { re: /valor|pre[çc]o|quanto|custa|parcel|pagamento|investimento|\$/i, txt: ['O valor muda conforme o curso e a turma, e a gente parcela.', 'Te passo certinho agora: você tá começando do zero ou já corta?'] },
    { re: /mulher|aluna|menina|feminin/i, txt: ['Pode e deve! Tem aluna na turma agora, inclusive gente que vem lá de Belford Roxo.', 'O curso é o mesmo e modelo pra treinar não falta. Quer saber os horários?'] },
    { re: /j[aá] (sou|corto|trabalho)|barbeir[ao]|certificado|diploma|aperfei|perfect/i, txt: ['Pra quem já corta tem o Aperfeiçoamento: tesoura, degradê em 3 tons, pigmentação, platinado e colorimetria, com certificado no final.', 'Há quanto tempo você corta? Assim eu te digo se encaixa direto.'] },
    { re: /zero|nunca|come[çc]ando|iniciante|aprender|primeira vez|do zero/i, txt: ['Então o teu é o Barbeiro do zero: 4 meses, turma de manhã, de tarde ou de noite.', 'E você corta em modelo de verdade desde a primeira semana. Tem aluno que com 3 aulas já estava cortando sozinho.', 'Qual turno fica melhor pra você?'] },
    { re: /onde|endere[çc]o|fica|chegar|localiza|bairro|brt/i, txt: ['Av. Brás de Pina, 714, sobreloja, Penha Circular.', 'Em frente à estação Guaporé do BRT, perto do Hospital Getúlio Vargas. Segunda a sábado, das 8h às 20h. Bora marcar uma visita?'] },
    { re: /turma|come[çc]a|hor[aá]rio|turno|manh[aã]|tarde|noite|dura|quanto tempo|meses/i, txt: ['Tem turma de manhã, de tarde e de noite, e o curso completo dura 4 meses.', 'Quer que eu reserve uma visita pra você conhecer a sala antes de começar?'] },
    { re: /workshop|imers[aã]o|tesoura|fade|print/i, txt: ['Os workshops são de um dia, com prática, coffee break e certificado. Já teve Tesoura do Zero e Imersão do Fade.', 'Quer que eu te avise quando abrir a próxima data?'] },
    { re: /kit|m[aá]quina|loja|comprar|wahl|magic|senior|wmark|x1|jrl|madeshow|kemei/i, txt: ['Tem sim, na Fábrica Barber Store, dentro da escola, e a gente envia pro Brasil todo.', 'Aluno já sai com o kit no primeiro dia. Quer que eu te mande os modelos disponíveis?'] },
    { re: /idade|anos|menor|crian[çc]a|adolescente/i, txt: ['Essa eu confirmo com o Jullio pra não te passar errado, e te respondo aqui mesmo.', 'Me fala tua idade?'] },
    { re: /^(oi|ol[aá]|bom dia|boa tarde|boa noite|e a[ií]|fala)/i, txt: ['Fala! Bem-vindo à Fábrica.', 'Você tá começando do zero ou já corta?'] }
  ];
  var padrao = { txt: ['Boa pergunta. Essa eu passo pro Jullio e te respondo aqui mesmo, rapidinho.', 'Enquanto isso: você tá começando do zero ou já corta?'] };

  function rolar() { fio.scrollTop = fio.scrollHeight; }
  function bolha(classe, texto) {
    var d = document.createElement('div');
    d.className = 'msg ' + classe; d.textContent = texto;
    fio.appendChild(d); rolar(); return d;
  }
  function responder(texto) {
    var r = padrao;
    for (var k = 0; k < respostas.length; k++) if (respostas[k].re.test(texto)) { r = respostas[k]; break; }
    var fila = r.txt.slice();
    ocupado = true;
    (function proxima() {
      if (!fila.length) {
        if (r.aviso) setTimeout(function () { bolha('msg--aviso', r.aviso); ocupado = false; }, reduz ? 0 : 500);
        else ocupado = false;
        return;
      }
      var dig = document.createElement('div');
      dig.className = 'digitando'; dig.innerHTML = '<i></i><i></i><i></i>';
      fio.appendChild(dig); rolar();
      setTimeout(function () { dig.remove(); bolha('msg--ag', fila.shift()); proxima(); }, reduz ? 0 : 750 + Math.min(fila[0].length * 12, 900));
    })();
  }
  function enviar(texto) {
    texto = (texto || '').trim();
    if (!texto || ocupado) return;
    bolha('msg--eu', texto);
    setTimeout(function () { responder(texto); }, reduz ? 0 : 300);
  }
  function abrir(prefixo) {
    if (!aberto) {
      painel.hidden = false; aberto = true;
      mostrarChamar(); chamar.setAttribute('aria-expanded', 'true');
      if (!saudou) {
        saudou = true;
        bolha('msg--ag', (nomeVisitante ? 'Fala, ' + nomeVisitante.split(' ')[0] + '! ' : 'Fala! ') + 'Aqui é a Fábrica de Barbeiros. Pode perguntar o que quiser sobre curso, turma, preço ou a loja.');
      }
    }
    if (prefixo) setTimeout(function () { enviar(prefixo); }, reduz ? 0 : 350);
    setTimeout(function () { entrada.focus({ preventScroll: true }); }, 60);
  }
  function fechar() {
    painel.hidden = true; aberto = false;
    mostrarChamar(); chamar.setAttribute('aria-expanded', 'false');
    if (!chamar.classList.contains('is-oculto')) chamar.focus({ preventScroll: true });
  }

  document.addEventListener('click', function (e) {
    var gatilho = e.target.closest('[data-conversa]');
    if (gatilho) { e.preventDefault(); abrir(gatilho.getAttribute('data-conversa')); return; }
    if (e.target.closest('[data-fechar]')) fechar();
  });
  atalhos.addEventListener('click', function (e) {
    var b = e.target.closest('[data-p]');
    if (b) enviar(b.getAttribute('data-p'));
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); enviar(entrada.value); entrada.value = ''; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && aberto) fechar(); });
})();
