// ---------- Configuração ----------
// Ajuste estes valores conforme sua webcomic cresce.
const CONFIG = {
  pasta: 'imagens',
  prefixo: 'pagina',
  extensao: 'png',
  totalPaginas: 20,
  digitos: 2, // pagina01.png, pagina02.png...
  pastaAudio: 'trilha',
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
  3: { arquivo: 'tema_carcara-sombrio-001.wav', loopStart: 2.5, loopEnd: 40 },
  4: { arquivo: 'sfx/record-scratch-2.mp3', efeito: true, pararFundo: true },
  5: null,
  6: 'trilha_fundo_principal.wav',
  7: 'trilha_fundo_principal.wav',
  8: 'sfx/radio_policia.wav',
  9: { arquivo: 'tema_carcara-sombrio-001.wav', loopStart: 0, loopEnd: 15 },
  10: 'sfx/transito_policia.wav',
  11: 'trilha_fundo_principal.wav',
  12: {arquivo:'sfx/harp.wav',efeito: true, pararFundo:true},
  13: { arquivo: 'carcara_suspense.wav', loopStart: 0, loopEnd: 31 },
  14: 'trilha_fundo_principal.wav',
  15: null,
  16: 'trilha_fundo_principal.wav',
  17: 'trilha_frenetica.wav',
  18: 'trilha_frenetica.wav',
  19: null,
  20: null,
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
// "area" é um retângulo em % da imagem: { left, top, width, height }.
// Não precisa ser exato — só precisa cobrir o personagem, já que ele
// só serve pra detectar o mouse, nunca aparece na tela.
const PERSONAGENS_INTERATIVOS = {
  13: [
    {
      nome: 'Bebê',
      paginaDestaque: 21,
      area: { left: '5%', top: '63%', width: '23%', height: '17%' },
    },
    {
      nome: 'Senhor do jornal',
      paginaDestaque: 22,
      area: { left: '16%', top: '37%', width: '25%', height: '30%' },
    },
    {
      nome: 'Estátua',
      paginaDestaque: 23,
      area: { left: '45%', top: '8%', width: '21%', height: '28%' },
    },
    {
      nome: 'Encapuzado',
      paginaDestaque: 24,
      area: { left: '55%', top: '33%', width: '20%', height: '44%' },
    },
    {
      nome: 'Menina da cesta',
      paginaDestaque: 25,
      area: { left: '81%', top: '40%', width: '17%', height: '33%' },
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
let paginaAtual = 1;
let bloqueadoPorRolagem = false; // evita disparar várias páginas de uma vez no mesmo gesto de scroll
 
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
  const configAtual = normalizarTrilha(MAPA_TRILHAS[paginaAtual]);
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
 
/**
 * Cria as duas camadas de destaque de um personagem:
 *  1. o "hotspot" — uma área retangular invisível que só serve pra
 *     detectar o mouse (personagem.area define onde ela fica)
 *  2. a "camada cheia" — a página gêmea (paginaDestaque) INTEIRA,
 *     começando com opacidade 0
 *
 * No style.css, a regra ".personagem-hotspot:hover + .personagem-camada"
 * faz a camada cheia aparecer quando o mouse está sobre o hotspot ao
 * lado dela — puro CSS, sem precisar de JavaScript pra isso.
 *
 * As duas precisam ser criadas e inseridas juntas, uma logo depois da
 * outra, porque o seletor "+" do CSS só funciona entre irmãos
 * adjacentes no HTML.
 */
function criarDestaquePersonagem(personagem) {
  const hotspot = document.createElement('div');
  hotspot.className = 'personagem-hotspot';
  hotspot.title = personagem.nome;
  hotspot.style.left = personagem.area.left;
  hotspot.style.top = personagem.area.top;
  hotspot.style.width = personagem.area.width;
  hotspot.style.height = personagem.area.height;
 
  const camada = document.createElement('div');
  camada.className = 'personagem-camada';
  camada.style.backgroundImage = `url('${caminhoDaPagina(personagem.paginaDestaque)}')`;
 
  return [hotspot, camada];
}
 
function criarPaginas() {
  const fragmento = document.createDocumentFragment();
 
  for (let numero = 1; numero <= CONFIG.totalPaginas; numero++) {
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
 
    fragmento.appendChild(container);
  }
 
  leitorEl.appendChild(fragmento);
}
 
function observarPaginaVisivel() {
  const observer = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        // Adiciona o fade ao entrar na tela e remove ao sair, então o
        // efeito acontece toda vez, subindo ou descendo.
        entrada.target.classList.toggle('visivel', entrada.isIntersecting);
 
        if (entrada.isIntersecting) {
          const numero = Number(entrada.target.dataset.pagina);
          paginaAtual = numero;
          tocarFaixaDaPagina(numero);
        }
      });
    },
    { threshold: 0.5 }
  );
 
  document.querySelectorAll('.pagina').forEach((el) => observer.observe(el));
}
 
function controlarBotaoTopo() {
  window.addEventListener('scroll', () => {
    btnTopo.classList.toggle('visivel', window.scrollY > 400);
  });
 
  btnTopo.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
 
function irParaPagina(numero) {
  const alvo = Math.min(Math.max(numero, 1), CONFIG.totalPaginas);
  const elemento = document.querySelector(`.pagina[data-pagina="${alvo}"]`);
 
  if (elemento) {
    elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
 
function controlarSetasDoTeclado() {
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'ArrowDown') {
      evento.preventDefault();
      irParaPagina(paginaAtual + 1);
    }
 
    if (evento.key === 'ArrowUp') {
      evento.preventDefault();
      irParaPagina(paginaAtual - 1);
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
 
      if (evento.deltaY > 0) {
        irParaPagina(paginaAtual + 1);
      } else if (evento.deltaY < 0) {
        irParaPagina(paginaAtual - 1);
      }
 
      setTimeout(() => {
        bloqueadoPorRolagem = false;
      }, 700);
    },
    { passive: false }
  );
}
 
// ---------- Inicialização ----------
criarPaginas();
observarPaginaVisivel();
controlarBotaoTopo();
controlarSetasDoTeclado();
controlarRolagemDoMouse();
document.addEventListener('click', desbloquearAudio, { once: true });