/* Dados de exemplo — todos fictícios.
   As datas nascem relativas ao dia em que a página abre, pra que "hoje" seja
   sempre hoje. Números de processo têm dígito verificador inválido de
   propósito: não existe processo real com esses números. */

(function () {
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  function semear() {
    const base = new Date();
    const D = n => iso(new Date(base.getFullYear(), base.getMonth(), base.getDate() + n));
    const H = D(0);

    const clientes = [
      { id: 'f1', nome: 'Juliana Prado Moreira', conjuge: 'Rafael Moreira', filhos: [], regime: 'Comunhão parcial', telefone: '(18) 90000-0101', cidade: 'Presidente Prudente', origem: 'Instagram', desde: D(-48), notas: 'Casaram em 2025 sem pacto. Ela quer separar o que veio da herança da mãe. Rafael topou o acordo depois da segunda conversa.' },
      { id: 'f2', nome: 'Camila Ferraz', conjuge: 'Diego Santana', filhos: [], regime: 'Ainda não casaram', telefone: '(18) 90000-0102', cidade: 'Presidente Prudente', origem: 'Indicação', desde: D(-21), notas: 'Casamento marcado pra fevereiro. Diego tem participação na empresa da família. Veio pelo Conecta Mulher.' },
      { id: 'f3', nome: 'Helena Bassi Duarte', conjuge: '', filhos: [{ nome: 'Marcos', idade: 41 }, { nome: 'Luísa', idade: 37 }], regime: 'Viúva (comunhão parcial)', telefone: '(18) 90000-0103', cidade: 'Álvares Machado', origem: 'Indicação', desde: D(-140), notas: 'Inventário do marido. Imóvel rural e duas aplicações. Filhos de acordo, sem conflito. Marcos é quem responde mais rápido.' },
      { id: 'f4', nome: 'Patrícia Lemes', conjuge: 'André Lemes', filhos: [{ nome: 'Sofia', idade: 9 }, { nome: 'Davi', idade: 6 }], regime: 'Comunhão parcial', telefone: '(18) 90000-0104', cidade: 'Presidente Prudente', origem: 'Google', desde: D(-75), notas: 'Divórcio consensual com guarda compartilhada. Os dois querem resolver rápido e sem briga por causa das crianças.' },
      { id: 'f5', nome: 'Renata Okada', conjuge: 'Marcelo Okada', filhos: [{ nome: 'Ana', idade: 2 }], regime: 'Separação total (pacto)', telefone: '(18) 90000-0105', cidade: 'Presidente Prudente', origem: 'Instagram', desde: D(-420), notas: 'Pacto assinado no ano passado. A filha nasceu depois: vale conversar sobre testamento na revisão.' },
      { id: 'f6', nome: 'Simone Carvalho', conjuge: 'Paulo Teixeira', filhos: [{ nome: 'Gabriel', idade: 15 }], regime: 'União estável (escritura)', telefone: '(18) 90000-0106', cidade: 'Regente Feijó', origem: 'WhatsApp', desde: D(-430), notas: 'Segunda união dos dois. O Gabriel é filho dela do primeiro casamento.' },
      { id: 'f7', nome: 'Fernanda Gil', conjuge: 'Lucas Arantes', filhos: [], regime: 'Separação total (pacto)', telefone: '(18) 90000-0107', cidade: 'Presidente Prudente', origem: 'Indicação', desde: D(-95), notas: 'Pacto pronto e registrado. Ela perguntou de testamento no dia da assinatura.' },
      { id: 'f8', nome: 'Beatriz Nogueira', conjuge: 'Henrique Alves', filhos: [{ nome: 'Pedro', idade: 12 }], regime: 'União estável sem contrato', telefone: '(18) 90000-0108', cidade: 'Presidente Prudente', origem: 'Instagram', desde: D(-3), notas: 'Segunda união. Mora com o Henrique há quatro anos, sem nada no papel. Marcou o diagnóstico pelo Instagram.' },
      { id: 'f9', nome: 'Mariana Tavares Lopes', conjuge: 'João Lopes', filhos: [{ nome: 'Clara', idade: 19 }, { nome: 'Bento', idade: 16 }], regime: 'Comunhão universal', telefone: '(18) 90000-0109', cidade: 'Presidente Prudente', origem: 'Indicação', desde: D(-30), notas: 'Testamento dos dois, com cláusula pra proteger o Bento até os 25.' },
      { id: 'f10', nome: 'Clara Mendes', conjuge: '', filhos: [], regime: 'Solteira', telefone: '(18) 90000-0110', cidade: 'Presidente Prudente', origem: 'Google', desde: D(-9), notas: 'Consulta sobre compra de imóvel com o namorado. Ficou de voltar quando decidirem.' }
    ];

    const casos = [
      { id: 'k1', clienteId: 'f1', servico: 'Acordo pós-nupcial', etapa: 'Redação', etapaDesde: D(-6), valor: 4000, abertoEm: D(-40) },
      { id: 'k2', clienteId: 'f2', servico: 'Pacto antenupcial', etapa: 'Documentos', etapaDesde: D(-12), valor: 4500, abertoEm: D(-18) },
      { id: 'k3', clienteId: 'f3', servico: 'Inventário', etapa: 'Cartório ou fórum', etapaDesde: D(-90), valor: 12000, abertoEm: D(-130), processo: '9990011-21.2026.8.26.0482', vara: '1ª Vara de Família e Sucessões de Presidente Prudente' },
      { id: 'k4', clienteId: 'f4', servico: 'Divórcio consensual', etapa: 'Cartório ou fórum', etapaDesde: D(-35), valor: 5000, abertoEm: D(-70), processo: '9990027-02.2026.8.26.0482', vara: '2ª Vara de Família e Sucessões de Presidente Prudente' },
      { id: 'k5', clienteId: 'f5', servico: 'Pacto antenupcial', etapa: 'Concluído', etapaDesde: D(-350), valor: 4200, abertoEm: D(-400), concluidoEm: D(-350) },
      { id: 'k6', clienteId: 'f6', servico: 'União estável', etapa: 'Concluído', etapaDesde: D(-379), valor: 3600, abertoEm: D(-420), concluidoEm: D(-379) },
      { id: 'k7', clienteId: 'f7', servico: 'Pacto antenupcial', etapa: 'Concluído', etapaDesde: D(-19), valor: 4500, abertoEm: D(-90), concluidoEm: D(-19) },
      { id: 'k8', clienteId: 'f8', servico: 'Diagnóstico Família e Patrimônio', etapa: 'Conversa', etapaDesde: D(-3), valor: 500, abertoEm: D(-3) },
      { id: 'k9', clienteId: 'f9', servico: 'Testamento', etapa: 'Redação', etapaDesde: D(-8), valor: 3000, abertoEm: D(-28) },
      { id: 'k10', clienteId: 'f10', servico: 'Consulta', etapa: 'Concluído', etapaDesde: D(-9), valor: 500, abertoEm: D(-9), concluidoEm: D(-9) }
    ];

    const eventos = [
      { id: 'e1', data: H, inicio: '08:30', fim: '09:30', titulo: 'Revisar a minuta do acordo', tipo: 'foco', clienteId: 'f1', local: 'Escritório' },
      { id: 'e2', data: H, inicio: '10:00', fim: '11:00', titulo: 'Diagnóstico Família e Patrimônio', tipo: 'consulta', clienteId: 'f8', local: 'Escritório' },
      { id: 'e3', data: H, inicio: '15:00', fim: '16:00', titulo: 'Audiência de conciliação', tipo: 'audiencia', clienteId: 'f4', local: 'Videoconferência (Teams)' },
      { id: 'e4', data: H, inicio: '17:30', fim: '18:00', titulo: 'Escola das crianças', tipo: 'pessoal', local: '' },
      { id: 'e5', data: D(1), inicio: '09:00', fim: '10:00', titulo: 'Assinatura no 2º Tabelião de Notas', tipo: 'cartorio', clienteId: 'f9', local: 'Cartório, centro' },
      { id: 'e6', data: D(1), inicio: '14:00', fim: '15:00', titulo: 'Reunião sobre a minuta', tipo: 'reuniao', clienteId: 'f1', local: 'Google Meet' },
      { id: 'e7', data: D(2), inicio: '10:30', fim: '11:30', titulo: 'Primeira consulta', tipo: 'consulta', clienteId: 'f2', local: 'Escritório' },
      { id: 'e8', data: D(3), inicio: '19:00', fim: '21:00', titulo: 'Conecta Mulher', tipo: 'pessoal', local: 'Espaço do evento' },
      { id: 'e9', data: D(-1), inicio: '11:00', fim: '12:00', titulo: 'Conversa com os filhos da Helena', tipo: 'reuniao', clienteId: 'f3', local: 'Google Meet' },
      { id: 'e10', data: D(4), inicio: '09:30', fim: '10:30', titulo: 'Documentos do pacto', tipo: 'reuniao', clienteId: 'f2', local: 'Escritório' },
      { id: 'e11', data: D(-2), inicio: '16:00', fim: '17:00', titulo: 'Consulta', tipo: 'consulta', clienteId: 'f10', local: 'Escritório' }
    ];

    const intimacoes = [
      { id: 'i1', casoId: 'k3', data: H, tipo: 'Intimação', lida: false,
        texto: 'Manifeste-se a inventariante, no prazo de 15 (quinze) dias, sobre a avaliação dos bens apresentada pela Fazenda do Estado para fins de ITCMD, bem como sobre as primeiras declarações retificadas. Intime-se.' },
      { id: 'i2', casoId: 'k4', data: D(-1), tipo: 'Intimação', lida: false,
        texto: 'Com o parecer favorável do Ministério Público, manifestem-se as partes no prazo de 5 (cinco) dias. Mantida a audiência de conciliação designada.' },
      { id: 'i3', casoId: 'k4', data: D(-12), tipo: 'Intimação', lida: true,
        texto: 'Designo audiência de conciliação, por videoconferência (Microsoft Teams), para a data informada no sistema, às 15h00. O link será enviado às partes por e-mail. Intimem-se.' },
      { id: 'i4', casoId: 'k3', data: D(-33), tipo: 'Despacho', lida: true,
        texto: 'Recebo as primeiras declarações. Cite-se a Fazenda do Estado para manifestação sobre os valores atribuídos aos bens. Int.' }
    ];
    // a que chega quando ela clicar em "Conferir agora"
    const intimacaoNova = { id: 'i5', casoId: 'k3', tipo: 'Intimação', lida: false,
      texto: 'Defiro a expedição de alvará para levantamento dos valores depositados na conta de titularidade do falecido, para pagamento do ITCMD. Intime-se a inventariante para comprovar o recolhimento em 10 (dez) dias.' };

    const parcelas = [
      { id: 'p1', casoId: 'k1', n: 1, de: 2, valor: 2000, vencimento: D(-25), pagoEm: D(-25) },
      { id: 'p2', casoId: 'k1', n: 2, de: 2, valor: 2000, vencimento: D(5) },
      { id: 'p3', casoId: 'k2', n: 1, de: 3, valor: 1500, vencimento: D(-10), pagoEm: D(-9) },
      { id: 'p4', casoId: 'k2', n: 2, de: 3, valor: 1500, vencimento: D(20) },
      { id: 'p5', casoId: 'k2', n: 3, de: 3, valor: 1500, vencimento: D(50) },
      { id: 'p6', casoId: 'k3', n: 1, de: 6, valor: 2000, vencimento: D(-63), pagoEm: D(-63) },
      { id: 'p7', casoId: 'k3', n: 2, de: 6, valor: 2000, vencimento: D(-33), pagoEm: D(-32) },
      { id: 'p8', casoId: 'k3', n: 3, de: 6, valor: 2000, vencimento: D(-3) },
      { id: 'p9', casoId: 'k3', n: 4, de: 6, valor: 2000, vencimento: D(27) },
      { id: 'p10', casoId: 'k3', n: 5, de: 6, valor: 2000, vencimento: D(57) },
      { id: 'p11', casoId: 'k3', n: 6, de: 6, valor: 2000, vencimento: D(87) },
      { id: 'p12', casoId: 'k4', n: 1, de: 2, valor: 2500, vencimento: D(-40), pagoEm: D(-40) },
      { id: 'p13', casoId: 'k4', n: 2, de: 2, valor: 2500, vencimento: D(12) },
      { id: 'p14', casoId: 'k9', n: 1, de: 1, valor: 3000, vencimento: D(1) },
      { id: 'p15', casoId: 'k8', n: 1, de: 1, valor: 500, vencimento: H },
      { id: 'p16', casoId: 'k10', n: 1, de: 1, valor: 500, vencimento: D(-9), pagoEm: D(-9) },
      { id: 'p17', casoId: 'k7', n: 1, de: 3, valor: 1500, vencimento: D(-80), pagoEm: D(-80) },
      { id: 'p18', casoId: 'k7', n: 2, de: 3, valor: 1500, vencimento: D(-50), pagoEm: D(-50) },
      { id: 'p19', casoId: 'k7', n: 3, de: 3, valor: 1500, vencimento: D(-20), pagoEm: D(-18) }
    ];

    const tarefas = [
      { id: 't1', titulo: 'Pedir a certidão de casamento atualizada', prazo: D(-2), clienteId: 'f2', feita: false },
      { id: 't2', titulo: 'Enviar a minuta revisada pro casal', prazo: H, clienteId: 'f1', feita: false },
      { id: 't3', titulo: 'Ligar pra Sueli sobre o inventário do pai', prazo: H, feita: false },
      { id: 't4', titulo: 'Conferir a avaliação do ITCMD', prazo: D(4), clienteId: 'f3', feita: false },
      { id: 't5', titulo: 'Gravar o vídeo sobre pacto pro Instagram', prazo: D(3), feita: false },
      { id: 't6', titulo: 'Preparar a conversa da revisão de 1 ano', prazo: D(10), clienteId: 'f5', feita: false },
      { id: 't7', titulo: 'Mandar o orçamento do testamento', prazo: D(-26), clienteId: 'f9', feita: true }
    ];

    const contatos = [
      { id: 'c1', nome: 'Tatiane Rocha', canal: 'WhatsApp', assunto: 'Já casou sem pacto e quer saber se ainda dá pra fazer', desde: D(-1), respondido: false },
      { id: 'c2', nome: 'Aline Ribeiro', canal: 'Instagram', assunto: 'Mora junto há seis anos, pergunta sobre união estável', desde: D(-2), respondido: false },
      { id: 'c3', nome: 'Sueli Martins', canal: 'Indicação', assunto: 'Inventário do pai, três irmãos. Indicada pela Camila', desde: D(-4), respondido: false }
    ];

    return {
      versao: 1, semeadoEm: H, mexeu: false, guia: {}, guiaFechado: false,
      ultimaConferencia: { data: H, hora: '07:02' }, djenNovaEntregue: false,
      clientes, casos, eventos, intimacoes, intimacaoNova, parcelas, tarefas, contatos,
      esteiraFeita: {}
    };
  }

  window.PainelDados = { semear };
})();
