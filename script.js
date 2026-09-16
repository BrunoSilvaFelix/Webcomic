// ---------- Configuração ----------
const CONFIG = {
  pasta: 'imagens',
  prefixo: 'pagina',
  extensao: 'png',
  totalPaginas: 9,
  digitos: 2, // pagina01.png, pagina02.png...
};

// ---------- Elementos ----------
const leitorEl = document.getElementById('leitor');
const paginaVisivelEl = document.getElementById('pagina-visivel');
const paginaTotalEl = document.getElementById('pagina-total');
const btnTopo = document.getElementById('btn-topo');

// ---------- Funções ----------
function caminhoDaPagina(numero) {
  const numeroFormatado = String(numero).padStart(CONFIG.digitos, '0');
  return `${CONFIG.pasta}/${CONFIG.prefixo}${numeroFormatado}.${CONFIG.extensao}`;
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
        if (entrada.isIntersecting) {
          paginaVisivelEl.textContent = entrada.target.dataset.pagina;
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

// ---------- Inicialização ----------
paginaTotalEl.textContent = CONFIG.totalPaginas;
criarPaginas();
observarPaginaVisivel();
controlarBotaoTopo();