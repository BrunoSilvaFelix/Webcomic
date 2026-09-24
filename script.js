// ---------- Configuração ----------
// Ajuste estes valores conforme sua webcomic cresce.
const CONFIG = {
  pasta: 'imagens',
  prefixo: 'pagina',
  extensao: 'png',
  digitos: 2, // pagina01.png, pagina02.png...
  pastaAudio: 'trilha',
  ultimaPaginaAntesDaRamificacao: 13, // até aqui a história é sempre igual pra todo mundo
};
 
// A partir da página 13, a história se abre em caminhos diferentes.
// Escolhendo o "Bandido" o leitor segue a história principal (essas
// páginas aqui); escolhendo qualquer outro personagem, ele entra na
// ramificação daquele personagem (ver RAMIFICACOES logo abaixo).
// Marcador do "Jogo do Bicho" dentro de uma sequência de páginas. Onde
// ele aparece na lista, entra o jogo; as páginas que vêm DEPOIS dele
// só são criadas no documento quando as 4 fatias forem reveladas — ou
// seja, antes disso não existe nada abaixo do jogo pra onde rolar.
// (Use no máximo uma vez por sequência.)
const ID_PAGINA_JOGO = 'jogo-bicho';

const JOGO_DO_BICHO = {
  // Uma imagem por aposta (dentro de CONFIG.pasta). Lidas da esquerda
  // pra direita, formando um único quadro horizontal. O jogo tem
  // exatamente uma rodada por fatia. Se a imagem não existir, aparece
  // um espaço reservado ("Fatia 1"...) pra testar sem os arquivos.
  personagem:'personagem.png',
  fatias: ['fatia1.png', 'fatia2.png', 'fatia3.png', 'fatia4.png'],
  razaoQuadro: 1055 / 592, // proporção do quadro completo em cada fatia
  bichos: [
    'Avestruz', 'Águia', 'Burro', 'Borboleta', 'Cachorro',
    'Cabra', 'Carneiro', 'Camelo', 'Cobra', 'Coelho',
    'Cavalo', 'Elefante', 'Galo', 'Gato', 'Jacaré',
    'Leão', 'Macaco', 'Porco', 'Pavão', 'Peru',
    'Touro', 'Tigre', 'Urso', 'Veado', 'Vaca',
  ],
  tempos: { // em milissegundos
    antesDaFatia: 800,     // do resultado até a fatia aparecer
    resultado: 2200,       // do clique até a tabela voltar ao normal
    aposUltimaFatia: 1200, // da última fatia até liberar a continuação
  },
};

// O jogo entra depois da página 15 da história principal (mude a
// posição do marcador se quiser em outro ponto).
const PAGINAS_HISTORIA_PRINCIPAL = [14, 15, 16,ID_PAGINA_JOGO, 17, 18, 19, 20];
 
// Sequência de páginas de cada ramificação (a história de cada
// personagem). Os números aqui são só um EXEMPLO de 3 páginas cada,
// pra você ver o padrão — ajuste a quantidade e os números pra bater
// com as páginas reais que você for desenhando. Não precisa ser uma
// faixa "redonda": pode ser qualquer lista de números, na ordem que a
// história daquele personagem deve ser lida.
const RAMIFICACOES = {
  bebe: [26, 27],
  velho: [28, 29],
  estatua: [30, 31],
  chapeuzinho: [32, 33],
};
 
// Trilha sonora de cada página. Deixe "null" nas páginas sem música.
//
// Cada entrada pode ser:
//   - uma STRING com o nome do arquivo -> toca em loop, do início ao
//     fim do arquivo inteiro (comportamento padrão, mais simples);
//   - um OBJETO, para controle fino:
//       arquivo    - nome do arquivo (obrigatório)
//       loop       - true (padrão) ou false. Se false, toca uma vez
//                    e para sozinho (fica em silêncio até a próxima
//                    página com trilha definida)
//       loopStart  - segundo em que o loop começa (padrão: 0)
//       loopEnd    - segundo em que o loop termina/volta pro início
//                    (padrão: o arquivo inteiro)
//       efeito     - true para efeitos avulsos (explosão, grito,
//                    record-scratch...): toca uma vez, POR CIMA da
//                    trilha de fundo atual, sem interrompê-la. Nesse
//                    caso loop/loopStart/loopEnd são ignorados.
//
// Repetir o mesmo "arquivo" em páginas seguidas com o MESMO
// loopStart/loopEnd continua sem reiniciar o loop. Se o loopStart/
// loopEnd for diferente, é tratado como uma trilha diferente (troca
// com crossfade normalmente).
const MAPA_TRILHAS = {
  1: null,
  2: 'antecipacao.wav',
  3: { arquivo: 'tema_carcara-sombrio-001.wav', loopStart: 2.8, loopEnd: 40 },
  4: { arquivo: 'sfx/record-scratch-2.mp3', efeito: true, pararFundo: true },
  5: null,
  6: 'trilha_fundo_principal.wav',
  7: 'trilha_fundo_principal.wav',
  8: 'sfx/radio_policia.wav',
  9: { arquivo: 'tema_carcara-sombrio-001.wav', loopStart: 20, loopEnd: 40 },
  10: 'sfx/transito_policia.wav',
  11: 'trilha_fundo_principal.wav',
  12: {arquivo:'sfx/harp.wav',efeito: true, pararFundo:true},
  13: { arquivo: 'carcara_suspense.wav', loopStart: 0, loopEnd: 31 },
  14: 'trilha_fundo_principal.wav',
  15: null,
  16: 'trilha_fundo_principal.wav',
  17: 'trilha_frenetica.wav',
  18: 'trilha_frenetica.wav',
  19: 'carcara-falha.wav',
  20: null,
  21: 'micro_interacoes/mocroint-bebe.wav',
  [ID_PAGINA_JOGO]: 'trilha_frenetica.wav', // troque por um arquivo pra ter trilha durante o jogo
  26: {
    arquivo: 'sfx/whoosh.wav',
    efeito: true,
    pararFundo:true
  },
  27: {
    arquivo: 'sfx/punch.mp3',
    efeito: true,
    pararFundo:true
  },
  28: {
    arquivo: 'sfx/punch.mp3',
    efeito: true,
    pararFundo:true
  },
  29: {
    arquivo: 'sfx/gun-shot.mp3',
    efeito: true,
    pararFundo:true
  },
  32: {
    arquivo: 'sfx/whoosh.wav',
    efeito: true,
    pararFundo:true
  },
  33: {
    arquivo: 'sfx/gun-shot.mp3',
    efeito: true,
    pararFundo:true
  },
};

// Personagens com destaque ao passar o mouse, por página.
//
// Cada personagem aponta pra uma página "gêmea" (paginaDestaque) que é
// visualmente idêntica à original, exceto por aquele personagem em
// específico (ex: a página 21 é igual à 13, só que com o bebê com uma
// silhueta azul). Ao passar o mouse numa área retangular aproximada
// (area) sobre aquele personagem, a página gêmea INTEIRA aparece por
// cima — como as duas imagens são idênticas fora do personagem
// destacado, o efeito visual é o mesmo de um recorte preciso, sem
// precisar desenhar um contorno certinho.
//
// "ramificacao" é a chave dentro de RAMIFICACOES pra onde o clique
// naquele personagem deve levar. O Bandido não tem ramificação
// (null) porque, nele, o clique continua a história principal.
//
// "area" é um retângulo em % da imagem: { left, top, width, height }.
// Não precisa ser exato — só precisa cobrir o personagem, já que ele
// só serve pra detectar o mouse, nunca aparece na tela.
const PERSONAGENS_INTERATIVOS = {
  13: [
    {
      nome: 'Bebê',
      paginaDestaque: 21,
      ramificacao: 'bebe',
      area: { left: '5%', top: '63%', width: '23%', height: '17%' },
      somHover: 'micro_interacoes/microint-bebe.wav', // toca ao passar o mouse
    },
    {
      nome: 'Velho',
      paginaDestaque: 22,
      ramificacao: 'velho',
      area: { left: '16%', top: '37%', width: '25%', height: '30%' },
      somHover: 'micro_interacoes/microint-veio.wav',
    },
    {
      nome: 'Estátua',
      paginaDestaque: 23,
      ramificacao: 'estatua',
      area: { left: '45%', top: '8%', width: '21%', height: '28%' },
      somHover: 'micro_interacoes/microint-estatua.wav',
    },
    {
      nome: 'Bandido',
      paginaDestaque: 24,
      ramificacao: null, // continua a história principal
      area: { left: '55%', top: '33%', width: '20%', height: '44%' },
      somHover: 'micro_interacoes/microint-bandido.wav',
    },
    {
      nome: 'Chapeuzinho',
      paginaDestaque: 25,
      ramificacao: 'chapeuzinho',
      area: { left: '81%', top: '40%', width: '17%', height: '33%' },
      somHover: 'micro_interacoes/microint-chapeu.wav',
    },
  ],
};
 
// ---------- Elementos ----------
const leitorEl = document.getElementById('leitor');
const btnTopo = document.getElementById('btn-topo');
const avisoAudioEl = document.getElementById('aviso-audio');
 
// ---------- Estado do áudio ----------
let ctx = null;
let masterGain = null;
let audioDesbloqueado = false;
let paginaPendente = null; // página atual, tocada assim que o áudio for desbloqueado
let trilhaDeFundo = null; // { source, gain, chave } — só a trilha contínua
const cacheDeBuffers = new Map(); // nomeArquivo -> Promise<AudioBuffer>, evita baixar 2x
 
// ---------- Estado da navegação ----------
// As páginas de 1 até "ultimaPaginaAntesDaRamificacao" são sempre as
// mesmas pra todo mundo. Ex: [1, 2, 3, ..., 13].
const SEQUENCIA_INICIAL = Array.from(
  { length: CONFIG.ultimaPaginaAntesDaRamificacao },
  (_, indice) => indice + 1
);
 
// "ordemAtual" é a lista de páginas (na ordem certa) que existem AGORA
// na tela — muda dinamicamente conforme o leitor escolhe um
// personagem. As setas do teclado e o scroll do mouse navegam
// seguindo essa lista, não um simples "número + 1", porque depois da
// página 13 o "próximo número" depende de qual personagem foi
// escolhido.
let ordemAtual = [...SEQUENCIA_INICIAL];
let paginaAtual = 1;
let bloqueadoPorRolagem = false; // evita disparar várias páginas de uma vez no mesmo gesto de scroll
let toqueInicialY = null; // posição Y (dedo) no início do gesto de toque atual
let toqueJaMudouDePagina = false; // trava POR GESTO: só deixa mudar 1 página mesmo segurando o dedo
let observerPaginas = null; // guardado aqui pra poder observar páginas criadas depois do início
let contadorBlocoFim = 0; // usado só pra dar um id único a cada bloco "fim de ramificação"
 
// ---------- Funções ----------
function caminhoDaPagina(numero) {
  const numeroFormatado = String(numero).padStart(CONFIG.digitos, '0');
  return `${CONFIG.pasta}/${CONFIG.prefixo}${numeroFormatado}.${CONFIG.extensao}`;
}
 
function garantirContexto() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

// Busca e decodifica um arquivo de áudio, guardando em cache para não
// baixar/decodificar de novo se a mesma faixa for usada em outra página.
function carregarBuffer(nomeArquivo) {
  if (cacheDeBuffers.has(nomeArquivo)) {
    return cacheDeBuffers.get(nomeArquivo);
  }

  const promessa = fetch(`${CONFIG.pastaAudio}/${nomeArquivo}`)
    .then((resposta) => resposta.arrayBuffer())
    .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer));

  cacheDeBuffers.set(nomeArquivo, promessa);
  return promessa;
}

// Aceita tanto uma string simples ('arquivo.wav') quanto um objeto
// { arquivo, loop, loopStart, loopEnd, efeito }, e sempre devolve o
// objeto completo com os padrões preenchidos.
function normalizarTrilha(entrada) {
  if (!entrada) return null;

  const config = typeof entrada === 'string' ? { arquivo: entrada } : entrada;

  return {
    arquivo: config.arquivo,
    loop: config.loop ?? true,
    loopStart: config.loopStart ?? 0,
    loopEnd: config.loopEnd ?? null, // null = até o fim do buffer, resolvido depois de carregar
    efeito: config.efeito ?? false,
    pararFundo: config.pararFundo ?? false,
  };
}

// Identifica de forma única "este arquivo tocando este trecho" — duas
// páginas com o mesmo arquivo mas loopStart/loopEnd diferentes contam
// como trilhas diferentes (troca com crossfade); com o mesmo trecho,
// contam como a mesma trilha (não reinicia).
function chaveDaTrilha(config) {
  return `${config.arquivo}|${config.loopStart}|${config.loopEnd}`;
}

// Toca a trilha de fundo (com ou sem loop, com ou sem recorte de
// trecho), com crossfade suave a partir do que estiver tocando.
async function tocarTrilhaDeFundo(config) {
  const chave = chaveDaTrilha(config);
  if (trilhaDeFundo?.chave === chave) return; // já tocando esse trecho, não reinicia

  const anterior = trilhaDeFundo;
  trilhaDeFundo = null; // evita corrida se a página mudar de novo antes do buffer carregar

  const buffer = await carregarBuffer(config.arquivo);

  // Se o usuário já saiu dessa página enquanto o arquivo carregava,
  // descarta — outra chamada mais recente já deve estar em curso.
  const paginaComTrilha = String(paginaAtual).startsWith('jogo-fatia-')
    ? ID_PAGINA_JOGO
    : paginaAtual;
  const configAtual = normalizarTrilha(MAPA_TRILHAS[paginaComTrilha]);
  if (!configAtual || chaveDaTrilha(configAtual) !== chave) return;

  const loopEnd = config.loopEnd ?? buffer.duration;

  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  source.loop = config.loop;
  if (config.loop) {
    source.loopStart = config.loopStart;
    source.loopEnd = loopEnd;
  }
  source.connect(gain).connect(masterGain);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.8);
  source.start(0, config.loop ? config.loopStart : 0);

  if (!config.loop) {
    // Sem loop: ao terminar, libera o "slot" de fundo pra tocar de
    // novo se o usuário revisitar a página (senão o sistema pensaria
    // que essa trilha ainda está tocando).
    source.onended = () => {
      if (trilhaDeFundo?.source === source) trilhaDeFundo = null;
    };
  }

  if (anterior) {
    anterior.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    anterior.source.stop(ctx.currentTime + 0.9);
  }

  trilhaDeFundo = { source, gain, chave };
}

function pararTrilhaDeFundo() {
  if (!trilhaDeFundo) return;
  const atual = trilhaDeFundo;
  trilhaDeFundo = null;
  atual.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
  atual.source.stop(ctx.currentTime + 0.9);
}

// Toca um efeito avulso uma única vez. Por padrão soa por cima da
// trilha de fundo, sem afetá-la; com pararFundo: true, corta a
// trilha de fundo em seco antes de tocar (efeito "record scratch").
async function tocarEfeitoUmaVez(config) {
  if (config.pararFundo && trilhaDeFundo) {
    const atual = trilhaDeFundo;
    trilhaDeFundo = null;
    atual.gain.gain.setValueAtTime(0, ctx.currentTime); // corte seco, sem fade
    atual.source.stop();
  }

  const buffer = await carregarBuffer(config.arquivo);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = false;
  source.connect(masterGain);
  source.start(0);
}

function tocarFaixaDaPagina(numeroPagina) {
  const config = normalizarTrilha(MAPA_TRILHAS[numeroPagina]);

  if (!audioDesbloqueado) {
    paginaPendente = numeroPagina; // memoriza; toca assim que desbloquear
    return;
  }

  // Página sem trilha definida: para a trilha de fundo, se houver.
  if (!config) {
    pararTrilhaDeFundo();
    return;
  }

  if (config.efeito) {
    tocarEfeitoUmaVez(config);
    return;
  }

  tocarTrilhaDeFundo(config);
}

function desbloquearAudio() {
  audioDesbloqueado = true;
  garantirContexto();

  if (avisoAudioEl) {
    avisoAudioEl.classList.add('escondido');
  }

  // Se o leitor já estava numa página com trilha antes do desbloqueio,
  // começa a tocar agora.
  if (paginaPendente !== null) {
    tocarFaixaDaPagina(paginaPendente);
    paginaPendente = null;
  }
}
 
// Volume que a trilha de fundo assume enquanto um som de personagem
// toca por cima dela ("duck"), e o tempo da rampa pra ir até lá e
// pra voltar ao normal depois. 0.25 = 25% do volume original.
const VOLUME_TRILHA_ABAIXADO = 0.25;
const DURACAO_ABAIXAR_VOLUME = 0.15; // segundos
const DURACAO_RESTAURAR_VOLUME = 0.35; // segundos

// Abaixa o volume da trilha de fundo (se houver alguma tocando) numa
// rampa suave. cancelScheduledValues() interrompe qualquer rampa
// anterior ainda em andamento (ex: usuário passou o mouse de um
// personagem pro outro rapidamente), pra sempre partir do volume
// ATUAL, sem "saltos".
function abaixarVolumeDaTrilha() {
  if (!trilhaDeFundo) return;
  const agora = ctx.currentTime;
  trilhaDeFundo.gain.gain.cancelScheduledValues(agora);
  trilhaDeFundo.gain.gain.linearRampToValueAtTime(VOLUME_TRILHA_ABAIXADO, agora + DURACAO_ABAIXAR_VOLUME);
}

// Devolve a trilha de fundo ao volume normal.
function restaurarVolumeDaTrilha() {
  if (!trilhaDeFundo) return;
  const agora = ctx.currentTime;
  trilhaDeFundo.gain.gain.cancelScheduledValues(agora);
  trilhaDeFundo.gain.gain.linearRampToValueAtTime(1, agora + DURACAO_RESTAURAR_VOLUME);
}

/**
 * Toca o som de um personagem ao passar o mouse (personagem.somHover),
 * usando a mesma engine (AudioContext + buffers) da trilha de fundo,
 * em vez de um <audio> separado — assim os dois convivem no mesmo
 * grafo de áudio, o que é o que permite abaixar o volume de um
 * enquanto o outro toca.
 *
 * A trilha de fundo é abaixada ("duck") assim que o som do
 * personagem começa, e volta ao volume normal em pararSomHover(),
 * quando o mouse sai de cima dele — não quando o som termina, pra
 * ficar abaixada durante todo o tempo em que o personagem está em
 * destaque, mesmo que o áudio dele seja mais curto que o hover.
 */
async function tocarSomHover(nomeArquivo) {
  if (!nomeArquivo || !audioDesbloqueado) return;

  abaixarVolumeDaTrilha();

  const buffer = await carregarBuffer(nomeArquivo);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = false;
  source.connect(masterGain);
  source.start(0);
}

/** Devolve a trilha de fundo ao volume normal quando o mouse sai de cima do personagem. */
function pararSomHover() {
  restaurarVolumeDaTrilha();
}

/**
 * Cria as duas camadas de destaque de um personagem:
 *  1. o "hotspot" — uma área retangular invisível que detecta o mouse
 *     E o clique (personagem.area define onde ela fica)
 *  2. a "camada cheia" — a página gêmea (paginaDestaque) INTEIRA,
 *     começando com opacidade 0, que aparece no hover
 *
 * No style.css, a regra ".personagem-hotspot:hover + .personagem-camada"
 * faz a camada cheia aparecer quando o mouse está sobre o hotspot ao
 * lado dela — puro CSS, sem precisar de JavaScript pra isso.
 *
 * O CLIQUE nesse mesmo hotspot é o que decide o rumo da história: se o
 * personagem tem uma "ramificacao" definida, o leitor entra na
 * história daquele personagem; senão (caso do Bandido), a história
 * principal continua normalmente.
 */
function criarDestaquePersonagem(personagem) {
  const hotspot = document.createElement('div');
  hotspot.className = 'personagem-hotspot';
  hotspot.title = personagem.nome;
  hotspot.style.left = personagem.area.left;
  hotspot.style.top = personagem.area.top;
  hotspot.style.width = personagem.area.width;
  hotspot.style.height = personagem.area.height;
 
  hotspot.addEventListener('click', () => {
    if (personagem.ramificacao) {
      seguirParaRamificacao(RAMIFICACOES[personagem.ramificacao], personagem.nome);
    } else {
      seguirParaRamificacao(PAGINAS_HISTORIA_PRINCIPAL, null);
    }
  });

  hotspot.addEventListener('mouseenter', () => tocarSomHover(personagem.somHover));
  hotspot.addEventListener('mouseleave', pararSomHover);
 
  const camada = document.createElement('div');
  camada.className = 'personagem-camada';
  camada.style.backgroundImage = `url('${caminhoDaPagina(personagem.paginaDestaque)}')`;
 
  return [hotspot, camada];
}
 
/**
 * Monta o elemento <div class="pagina"> de uma página específica
 * (com sua <img> e, se for o caso, as camadas de destaque dos
 * personagens). Não insere no documento — só cria e devolve, pra quem
 * chamou decidir onde e quando inserir.
 */
function criarElementoDaPagina(numero) {
  const container = document.createElement('div');
  container.className = 'pagina';
  container.dataset.pagina = numero;
 
  const img = document.createElement('img');
  img.src = caminhoDaPagina(numero);
  img.alt = `Página ${numero} da webcomic`;
  img.loading = numero <= 2 ? 'eager' : 'lazy';
 
  const personagens = PERSONAGENS_INTERATIVOS[numero];
 
  if (personagens) {
    // Página com personagens interativos: a imagem entra dentro de
    // uma moldura (.pagina-imagem-wrap) que "abraça" exatamente o
    // tamanho renderizado da imagem, pra que as camadas de destaque
    // (position: absolute) se alinhem certinho com ela.
    const wrap = document.createElement('div');
    wrap.className = 'pagina-imagem-wrap';
    wrap.appendChild(img);
    personagens.forEach((personagem) => {
      const [hotspot, camada] = criarDestaquePersonagem(personagem);
      wrap.appendChild(hotspot);
      wrap.appendChild(camada);
    });
    container.appendChild(wrap);
  } else {
    container.appendChild(img);
  }
 
  return container;
}
 
/**
 * Cria o "bloco de fim de ramificação": a tela final de uma história
 * de personagem, com o botão pra voltar à página 13 e escolher outro.
 * Cada chamada recebe um id único (fim-1, fim-2...) porque o leitor
 * pode entrar em ramificações diferentes várias vezes na mesma visita.
 */
function criarBlocoFimRamificacao(nomePersonagem) {
  contadorBlocoFim++;
  const id = `fim-${contadorBlocoFim}`;
 
  const container = document.createElement('div');
  container.className = 'pagina pagina-fim';
  container.dataset.pagina = id;
 
  const titulo = document.createElement('p');
  titulo.className = 'pagina-fim-titulo';
  if(nomePersonagem == 'Bebê' || nomePersonagem == 'Velho'){
    titulo.textContent = `Fim da história do ${nomePersonagem}`;
  }else {
    titulo.textContent = `Fim da história da ${nomePersonagem}`;
  }
 
  const botao = document.createElement('button');
  botao.className = 'btn-selecao';
  botao.textContent = '← Voltar para a seleção de personagens';
  botao.addEventListener('click', voltarParaSelecao);
 
  container.appendChild(titulo);
  container.appendChild(botao);
 
  return container;
}
 
/**
 * Remove do documento todas as páginas que vieram DEPOIS da
 * ramificação (ou seja, tudo que não faz parte da SEQUENCIA_INICIAL) e
 * reseta a navegação pra esse estado inicial. Chamada tanto ao clicar
 * em "voltar" quanto sempre que o leitor escolhe um personagem (pra
 * trocar de escolha sempre partir de uma tela limpa).
 */
function limparContinuacao() {
  const paginasIniciais = new Set(SEQUENCIA_INICIAL);
 
  Array.from(leitorEl.children).forEach((elemento) => {
    const numero = Number(elemento.dataset.pagina);
    const fazParteDoInicio = Number.isInteger(numero) && paginasIniciais.has(numero);
 
    if (!fazParteDoInicio) {
      if (observerPaginas) observerPaginas.unobserve(elemento);
      elemento.remove();
    }
  });
 
  ordemAtual = [...SEQUENCIA_INICIAL];
}
 
/**
 * Ponto central da ramificação: monta a sequência de páginas escolhida
 * (a história principal ou a de um personagem), insere no documento
 * logo depois da página 13, e rola até a primeira página nova.
 *
 * nomePersonagem: se preenchido, adiciona o botão de "voltar" no final
 * dessa sequência (usado nas ramificações). Se for null, a sequência
 * termina normalmente sem botão — é o caso da história principal, que
 * segue até o fim de verdade.
 */
function inserirNoLeitor(elemento, chaveNaOrdem) {
  leitorEl.appendChild(elemento);
  if (observerPaginas) observerPaginas.observe(elemento);
  ordemAtual.push(chaveNaOrdem);
}

/**
 * Insere no documento as páginas de uma sequência, na ordem. Ao achar o
 * marcador do jogo, insere a página do jogo e PARA: o restante da
 * sequência (e o bloco de fim, se houver) só é anexado quando o jogo
 * chama o callback, depois de revelar a última fatia.
 */
function anexarSequencia(sequencia, nomePersonagem) {
  for (let i = 0; i < sequencia.length; i++) {
    const item = sequencia[i];

    if (item === ID_PAGINA_JOGO) {
      const restante = sequencia.slice(i + 1);
      const jogo = criarPaginaDoJogo(() => anexarSequencia(restante, nomePersonagem));
      inserirNoLeitor(jogo, ID_PAGINA_JOGO);
      return;
    }

    inserirNoLeitor(criarElementoDaPagina(item), item);
  }

  if (nomePersonagem) {
    const blocoFim = criarBlocoFimRamificacao(nomePersonagem);
    inserirNoLeitor(blocoFim, blocoFim.dataset.pagina);
  }
}

function seguirParaRamificacao(sequenciaDeNumeros, nomePersonagem) {
  limparContinuacao();
  anexarSequencia(sequenciaDeNumeros, nomePersonagem);

  // A primeira página nova é a que vem logo depois da última página
  // da SEQUENCIA_INICIAL dentro de ordemAtual.
  irParaPagina(ordemAtual[SEQUENCIA_INICIAL.length]);
}

/** Botão "voltar pra seleção": limpa a ramificação e volta pra página 13. */
function voltarParaSelecao() {
  limparContinuacao();
  irParaPagina(CONFIG.ultimaPaginaAntesDaRamificacao);
}

function criarPaginaDaFatia(arquivo, indice) {
  const pagina = document.createElement('div');
  pagina.className = 'pagina pagina-jogo-fatia';
  pagina.dataset.pagina = `jogo-fatia-${indice + 1}`;
  pagina.dataset.jogoFatia = indice;

  const img = document.createElement('img');
  img.src = `${CONFIG.pasta}/${arquivo}`;
  img.alt = `Quadro após a aposta ${indice + 1}`;
  img.loading = 'eager';
  pagina.appendChild(img);

  return pagina;
}

/**
 * Cria a página do Jogo do Bicho. O herói (Carcará) aposta num bicho, o
 * bandido sorteia SEMPRE outro (trapaça), e a cada derrota uma página de
 * fatia é inserida abaixo do jogo. Depois da última fatia, chama
 * aoConcluir() — só então as páginas seguintes passam a existir.
 */
function criarPaginaDoJogo(aoConcluir) {
  const { bichos, fatias, razaoQuadro, tempos } = JOGO_DO_BICHO;
  const numeroDe = (indice) => String(indice + 1).padStart(2, '0');

  const container = document.createElement('div');
  container.className = 'pagina pagina-jogo';
  container.dataset.pagina = ID_PAGINA_JOGO;
  container.dataset.jogoConcluido = 'false';
  container.style.setProperty('--razao-quadro', razaoQuadro);

  // Ignora timers de um jogo que já saiu da tela (leitor trocou de ramificação).
  const agendar = (funcao, ms) => setTimeout(() => { if (container.isConnected) funcao(); }, ms);

  function rotular(botao, numero, texto) {
    const n = document.createElement('span');
    n.className = 'bicho-num';
    n.textContent = numero;
    const t = document.createElement('span');
    t.className = 'bicho-nome';
    t.textContent = texto;
    botao.replaceChildren(n, t);
  }

  // --- Tabela de escolha ---
  const grade = document.createElement('div');
  grade.className = 'jogo-grade';

  const botoes = bichos.map((nome, indice) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'bicho-btn';
    rotular(botao, numeroDe(indice), nome);
    botao.addEventListener('click', () => apostar(indice));
    grade.appendChild(botao);
    return botao;
  });

  const area = document.createElement('div');
  area.className = 'jogo-area';
  area.append(grade);

  const personagem = document.createElement('div');
  personagem.className = 'jogo-personagem';

  const imgPersonagem = document.createElement('img');
  imgPersonagem.alt = 'Personagem';
  imgPersonagem.addEventListener('error', () => {
    imgPersonagem.remove();
    const reserva = document.createElement('span');
    reserva.className = 'jogo-placeholder';
    reserva.textContent = 'Personagem';
    personagem.appendChild(reserva);
  }, { once: true });
  imgPersonagem.src = `${CONFIG.pasta}/${JOGO_DO_BICHO.personagem}`;
  personagem.appendChild(imgPersonagem);

  container.append(area, personagem);

  // --- Lógica ---
  let rodadas = 0;
  let ocupado = false; // true enquanto o resultado de uma aposta está na tela
  let paginaFatiaAtual = null;

  function restaurarTabela() {
    botoes.forEach((botao, indice) => {
      botao.className = 'bicho-btn';
      rotular(botao, numeroDe(indice), bichos[indice]);
    });
    grade.classList.remove('ocupada');
    ocupado = false;
  }

  function finalizar() {
    botoes.forEach((botao) => { botao.disabled = true; });
    container.dataset.jogoConcluido = 'true';
    aoConcluir(); // só agora as páginas seguintes entram no documento
  }

  function carregarFatia(indice) {
    if (paginaFatiaAtual) {
      if (observerPaginas) observerPaginas.unobserve(paginaFatiaAtual);
      ordemAtual = ordemAtual.filter((item) => item !== paginaFatiaAtual.dataset.pagina);
      paginaFatiaAtual.remove();
    }

    const pagina = criarPaginaDaFatia(fatias[indice], indice);
    paginaFatiaAtual = pagina;
    inserirNoLeitor(pagina, pagina.dataset.pagina);

    if (indice === fatias.length - 1) {
      agendar(finalizar, tempos.aposUltimaFatia);
    } else {
      restaurarTabela();
    }

    setTimeout(() => irParaPagina(pagina.dataset.pagina), 100);
  }

  function apostar(escolhido) {
    if (ocupado || rodadas >= fatias.length) return;
    ocupado = true;
    grade.classList.add('ocupada');

    // Trapaça: sorteia qualquer bicho, MENOS o escolhido.
    const sorteado = (escolhido + 1 + Math.floor(Math.random() * (bichos.length - 1))) % bichos.length;

    botoes[escolhido].classList.add('perdeu');
    rotular(botoes[escolhido], numeroDe(escolhido), 'PERDEU');
    botoes[sorteado].classList.add('ganhou');
    rotular(botoes[sorteado], numeroDe(sorteado), 'GANHOU!');

    const indiceDaFatia = rodadas;
    rodadas++;
    agendar(() => {
      carregarFatia(indiceDaFatia);
    }, tempos.antesDaFatia);
  }

  return container;
}

function criarPaginas() {
  const fragmento = document.createDocumentFragment();
 
  SEQUENCIA_INICIAL.forEach((numero) => {
    fragmento.appendChild(criarElementoDaPagina(numero));
  });
 
  leitorEl.appendChild(fragmento);
}
 
function observarPaginaVisivel() {
  observerPaginas = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        // Adiciona o fade ao entrar na tela e remove ao sair, então o
        // efeito acontece toda vez, subindo ou descendo.
        entrada.target.classList.toggle('visivel', entrada.isIntersecting);
 
        if (entrada.isIntersecting) {
          const valor = entrada.target.dataset.pagina;
          const numero = Number(valor);
          const ehPaginaDeHistoria = Number.isInteger(numero);
 
          // paginaAtual guarda o número (páginas normais) ou o id de
          // texto (ex: "fim-1", no bloco de fim de ramificação).
          paginaAtual = ehPaginaDeHistoria ? numero : valor;
 
          if (ehPaginaDeHistoria) {
            tocarFaixaDaPagina(numero);
          } else if (valor === ID_PAGINA_JOGO || valor.startsWith('jogo-fatia-')) {
            tocarFaixaDaPagina(ID_PAGINA_JOGO);
          } else {
            // Chegou na tela de "fim de ramificação": para a trilha de fundo.
            pararTrilhaDeFundo();
          }
        }
      });
    },
    { threshold: 0.5 }
  );
 
  document.querySelectorAll('.pagina').forEach((el) => observerPaginas.observe(el));
}
 
function controlarBotaoTopo() {
  window.addEventListener('scroll', () => {
    btnTopo.classList.toggle('visivel', window.scrollY > 400);
  });
 
  btnTopo.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
 
/** Rola suavemente até a página (ou bloco de fim) com o id informado. */
function irParaPagina(numero) {
  const elemento = document.querySelector(`.pagina[data-pagina="${numero}"]`);
 
  if (elemento) {
    elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
 
/**
 * Acha a posição da página atual dentro de ordemAtual. Usado pelas
 * setas do teclado e pelo scroll do mouse pra saber qual é "a próxima"
 * — que não é necessariamente "número + 1" depois que uma ramificação
 * foi escolhida.
 */
function indiceNaOrdemAtual() {
  return ordemAtual.indexOf(paginaAtual);
}
 
function irParaProximaPagina() {
  const indice = indiceNaOrdemAtual();
  if (indice === -1 || indice + 1 >= ordemAtual.length) return;
  irParaPagina(ordemAtual[indice + 1]);
}
 
function irParaPaginaAnterior() {
  const indice = indiceNaOrdemAtual();
  if (indice <= 0) return;
  irParaPagina(ordemAtual[indice - 1]);
}

function indiceDaFatiaDoJogo(valor) {
  const elemento = document.querySelector(`.pagina[data-pagina="${valor}"]`);
  return elemento ? Number(elemento.dataset.jogoFatia) : -1;
}

function paginaMaisProximaDoCentro() {
  const centroDaTela = window.innerHeight / 2;
  return Array.from(document.querySelectorAll('.pagina')).reduce((maisProxima, pagina) => {
    const caixa = pagina.getBoundingClientRect();
    const distancia = Math.abs((caixa.top + caixa.bottom) / 2 - centroDaTela);
    if (!maisProxima || distancia < maisProxima.distancia) {
      return { valor: pagina.dataset.pagina, distancia };
    }
    return maisProxima;
  }, null)?.valor;
}

function controlarSetasDoTeclado() {
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'ArrowDown') {
      evento.preventDefault();
      irParaProximaPagina();
    }
 
    if (evento.key === 'ArrowUp') {
      evento.preventDefault();
      irParaPaginaAnterior();
    }
  });
}
 
/**
 * Faz qualquer scroll do mouse (por menor que seja) pular direto pra
 * a página inteira seguinte ou anterior, em vez de rolar aos poucos.
 *
 * { passive: false } é necessário pra poder chamar preventDefault() —
 * sem isso o navegador ignora a chamada e rola do jeito normal dele
 * ao mesmo tempo que tentamos ir pra outra página, dando um scroll
 * "duplo" e bagunçado.
 *
 * bloqueadoPorRolagem existe porque um único gesto de scroll do mouse
 * dispara várias vezes o evento "wheel" seguidas — sem esse bloqueio,
 * a página pularia várias páginas de uma vez só num movimento rápido
 * do scroll. Ele é liberado de novo depois de 700ms, tempo aproximado
 * da animação suave do scrollIntoView em irParaPagina().
 */
function controlarRolagemDoMouse() {
  window.addEventListener(
    'wheel',
    (evento) => {
      evento.preventDefault();
 
      if (bloqueadoPorRolagem) return;
      bloqueadoPorRolagem = true;

      const paginaVisivel = paginaMaisProximaDoCentro();
      const indiceDaFatia = indiceDaFatiaDoJogo(paginaVisivel);
      if (indiceDaFatia >= 0) {
        const indiceNaSequencia = ordemAtual.indexOf(paginaVisivel);
        const destino = indiceDaFatia < JOGO_DO_BICHO.fatias.length - 1
          ? ID_PAGINA_JOGO
          : ordemAtual[indiceNaSequencia + 1];
        irParaPagina(destino);
        setTimeout(() => {
          bloqueadoPorRolagem = false;
        }, 700);
        return;
      }

      const jogo = document.querySelector(`.pagina[data-pagina="${ID_PAGINA_JOGO}"]`);
      if (paginaAtual === ID_PAGINA_JOGO && jogo?.dataset.jogoConcluido !== 'true') {
        setTimeout(() => {
          bloqueadoPorRolagem = false;
        }, 700);
        return;
      }

      if (evento.deltaY > 0) {
        irParaProximaPagina();
      } else if (evento.deltaY < 0) {
        irParaPaginaAnterior();
      }
 
      setTimeout(() => {
        bloqueadoPorRolagem = false;
      }, 700);
    },
    { passive: false }
  );
}
 
/**
 * Equivalente do controlarRolagemDoMouse(), só que pra toque (celular
 * e tablet) — o evento "wheel" não existe em telas de toque, então o
 * scroll ali depende só do gesto de arrastar o dedo, calculado aqui
 * "na mão" com touchstart/touchmove/touchend.
 *
 * touchstart: guarda em toqueInicialY a posição Y de onde o dedo
 * encostou, e reseta a trava do gesto atual.
 *
 * touchmove: compara a posição atual do dedo com toqueInicialY. Se a
 * diferença já passar de LIMIAR_TOQUE (poucos pixels — um deslize
 * bem pequeno já conta), muda de página, IGUAL ao scroll do mouse.
 * O preventDefault() roda em toda chamada (mesmo antes do limiar),
 * pra o navegador nunca chegar a rolar do jeito nativo dele — sem
 * isso, daria pra ver a página arrastando "solta" por baixo do nosso
 * pulo automático.
 *
 * toqueJaMudouDePagina é o que impede a pessoa de "atravessar" várias
 * páginas segurando o dedo na tela e arrastando bem longe: depois da
 * primeira mudança de página do gesto, essa trava fica ligada até o
 * dedo soltar (touchend) — só então um novo gesto (novo touchstart)
 * pode mudar de página de novo.
 */
function controlarToqueNoCelular() {
  const LIMIAR_TOQUE = 15; // pixels — deslize mínimo pra contar como intencional

  window.addEventListener(
    'touchstart',
    (evento) => {
      toqueInicialY = evento.touches[0].clientY;
      toqueJaMudouDePagina = false;
    },
    { passive: true }
  );

  window.addEventListener(
    'touchmove',
    (evento) => {
      evento.preventDefault();

      if (toqueInicialY === null || toqueJaMudouDePagina || bloqueadoPorRolagem) return;

      const posicaoAtual = evento.touches[0].clientY;
      const diferenca = toqueInicialY - posicaoAtual; // positivo = dedo subiu na tela

      if (Math.abs(diferenca) < LIMIAR_TOQUE) return;

      toqueJaMudouDePagina = true;
      bloqueadoPorRolagem = true;

      if (diferenca > 0) {
        irParaProximaPagina(); // dedo subiu = conteúdo "sobe" = próxima página
      } else {
        irParaPaginaAnterior();
      }

      setTimeout(() => {
        bloqueadoPorRolagem = false;
      }, 700);
    },
    { passive: false }
  );

  window.addEventListener(
    'touchend',
    () => {
      toqueInicialY = null;
      toqueJaMudouDePagina = false;
    },
    { passive: true }
  );
}

// ---------- Inicialização ----------
criarPaginas();
observarPaginaVisivel();
controlarBotaoTopo();
controlarSetasDoTeclado();
controlarRolagemDoMouse();
controlarToqueNoCelular();
document.addEventListener('click', desbloquearAudio, { once: true });