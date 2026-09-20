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
 
// Trilha sonora de cada página. Use o nome exato do arquivo dentro da
// pasta "trilha" (com a extensão, ex: '.wav'). Deixe "null" nas páginas
// que não devem ter música.
const MAPA_TRILHAS = {
  1: null,
  2: 'antecipacao.wav',
  3: 'tema_carcara-sombrio-001.wav',
  4: 'record-scratch-2.mp3',
  5: null,
  6: 'trilha_fundo_principal.wav',
  7: 'trilha_fundo_principal.wav',
  8: null,
  9: 'tema_carcara-sombrio-001.wav',
  10: null,
  11: 'trilha_fundo_principal.wav',
  12: 'trilha_fundo_principal.wav',
  13: 'carcara-suspense.wav',
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
// silhueta azul). Ao passar o mouse, mostramos essa página gêmea
// recortada (clip-path) só na área daquele personagem — o resto da
// imagem continua sendo a página original por baixo.
//
// "pontos" é a área (em % da imagem) que contorna o personagem — use
// https://bennettfeely.com/clippy/ pra desenhar/ajustar visualmente se
// quiser refinar o contorno.
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
const paginaVisivelEl = document.getElementById('pagina-visivel');
const paginaTotalEl = document.getElementById('pagina-total');
const btnTopo = document.getElementById('btn-topo');
const avisoAudioEl = document.getElementById('aviso-audio');
 
// ---------- Estado do áudio ----------
const audioEl = new Audio(); // toca uma vez só (sem loop)
let audioDesbloqueado = false;
let arquivoTrilhaAtual = null;
 
// ---------- Estado da navegação ----------
let paginaAtual = 1;
 
// ---------- Funções ----------
function caminhoDaPagina(numero) {
  const numeroFormatado = String(numero).padStart(CONFIG.digitos, '0');
  return `${CONFIG.pasta}/${CONFIG.prefixo}${numeroFormatado}.${CONFIG.extensao}`;
}
 
function tocarFaixaDaPagina(numeroPagina) {
  const nomeArquivo = MAPA_TRILHAS[numeroPagina];
 
  // Página sem trilha definida: para o que estiver tocando.
  if (!nomeArquivo) {
    audioEl.pause();
    arquivoTrilhaAtual = null;
    return;
  }
 
  // Mesmo arquivo que já está tocando (ex: página 5 e 6 usam a mesma
  // faixa): deixa continuar de onde está, sem reiniciar.
  if (nomeArquivo === arquivoTrilhaAtual) return;
 
  arquivoTrilhaAtual = nomeArquivo;
  audioEl.src = `${CONFIG.pastaAudio}/${nomeArquivo}`;
 
  if (audioDesbloqueado) {
    audioEl.play().catch(() => {});
  }
}
 
function desbloquearAudio() {
  audioDesbloqueado = true;
 
  if (avisoAudioEl) {
    avisoAudioEl.classList.add('escondido');
  }
 
  // Se o leitor já está numa página com trilha, começa a tocar agora.
  if (audioEl.src) {
    audioEl.play().catch(() => {});
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
          paginaVisivelEl.textContent = numero;
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
 
// ---------- Inicialização ----------
paginaTotalEl.textContent = CONFIG.totalPaginas;
criarPaginas();
observarPaginaVisivel();
controlarBotaoTopo();
controlarSetasDoTeclado();
document.addEventListener('click', desbloquearAudio, { once: true });