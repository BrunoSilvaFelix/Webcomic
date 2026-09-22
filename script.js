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
const PAGINAS_HISTORIA_PRINCIPAL = [14, 15, 16, 17, 18, 19, 20];
 
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
 
// Trilha sonora de cada página. Use o nome exato do arquivo dentro da
// pasta "trilha" (com a extensão, ex: '.wav'). Deixe "null" nas páginas
// que não devem ter música. Funciona normalmente também pras páginas
// das ramificações (26, 27, 28...) — é só adicionar as chaves aqui.
const MAPA_TRILHAS = {
  1: null,
  2: 'antecipacao.wav',
  3: 'tema_carcara-sombrio-001.wav',
  4: 'sfx/record-scratch-2.mp3',
  5: null,
  6: 'trilha_fundo_principal.wav',
  7: 'trilha_fundo_principal.wav',
  8: 'sfx/radio_policia.wav',
  9: 'tema_carcara-sombrio-001.wav',
  10: 'sfx/transito_policia.wav',
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
 
// Personagens clicáveis/com destaque ao passar o mouse, na página 13.
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
    },
    {
      nome: 'Velho',
      paginaDestaque: 22,
      ramificacao: 'velho',
      area: { left: '16%', top: '37%', width: '25%', height: '30%' },
    },
    {
      nome: 'Estátua',
      paginaDestaque: 23,
      ramificacao: 'estatua',
      area: { left: '45%', top: '8%', width: '21%', height: '28%' },
    },
    {
      nome: 'Bandido',
      paginaDestaque: 24,
      ramificacao: null, // continua a história principal
      area: { left: '55%', top: '33%', width: '20%', height: '44%' },
    },
    {
      nome: 'Chapeuzinho',
      paginaDestaque: 25,
      ramificacao: 'chapeuzinho',
      area: { left: '81%', top: '40%', width: '17%', height: '33%' },
    },
  ],
};
 
// ---------- Elementos ----------
const leitorEl = document.getElementById('leitor');
const btnTopo = document.getElementById('btn-topo');
const avisoAudioEl = document.getElementById('aviso-audio');
 
// ---------- Estado do áudio ----------
const audioEl = new Audio(); // toca uma vez só (sem loop)
let audioDesbloqueado = false;
let arquivoTrilhaAtual = null;
 
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
let observerPaginas = null; // guardado aqui pra poder observar páginas criadas depois do início
let contadorBlocoFim = 0; // usado só pra dar um id único a cada bloco "fim de ramificação"
 
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
function seguirParaRamificacao(sequenciaDeNumeros, nomePersonagem) {
  limparContinuacao();
 
  sequenciaDeNumeros.forEach((numero) => {
    const elemento = criarElementoDaPagina(numero);
    leitorEl.appendChild(elemento);
    if (observerPaginas) observerPaginas.observe(elemento);
    ordemAtual.push(numero);
  });
 
  if (nomePersonagem) {
    const blocoFim = criarBlocoFimRamificacao(nomePersonagem);
    leitorEl.appendChild(blocoFim);
    if (observerPaginas) observerPaginas.observe(blocoFim);
    ordemAtual.push(blocoFim.dataset.pagina);
  }
 
  // A primeira página nova é a que vem logo depois da última página
  // da SEQUENCIA_INICIAL dentro de ordemAtual.
  irParaPagina(ordemAtual[SEQUENCIA_INICIAL.length]);
}
 
/** Botão "voltar pra seleção": limpa a ramificação e volta pra página 13. */
function voltarParaSelecao() {
  limparContinuacao();
  irParaPagina(CONFIG.ultimaPaginaAntesDaRamificacao);
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
          } else {
            // Chegou na tela de "fim de ramificação": para a música.
            audioEl.pause();
            arquivoTrilhaAtual = null;
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
 
// ---------- Inicialização ----------
criarPaginas();
observarPaginaVisivel();
controlarBotaoTopo();
controlarSetasDoTeclado();
controlarRolagemDoMouse();
document.addEventListener('click', desbloquearAudio, { once: true });