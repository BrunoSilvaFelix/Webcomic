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
 
    container.appendChild(img);
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