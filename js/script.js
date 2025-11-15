const API_BASE = 'https://pokeapi.co/api/v2/pokemon';
const container = document.getElementById('cardsContainer');
const loadingEl = document.getElementById('loading');
const loadMoreBtn = document.getElementById('loadMore');
const searchInput = document.getElementById('searchInput');

let offset = 0;
const limit = 30;
let isLoading = false;
let allLoaded = [];


const typeTranslations = {
  grass: "Grama",
  fire: "Fogo",
  water: "Água",
  bug: "Inseto",
  normal: "Normal",
  poison: "Veneno",
  electric: "Elétrico",
  ground: "Terra",
  fairy: "Fada",
  fighting: "Lutador",
  psychic: "Psíquico",
  rock: "Pedra",
  ghost: "Fantasma",
  ice: "Gelo",
  dragon: "Dragão",
  dark: "Sombrio",
  steel: "Aço",
  flying: "Voador"
};

function translateTypes(typesArray) {
  return typesArray.map(t => typeTranslations[t.type.name] || t.type.name).join(', ');
}

function formatName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

async function fetchList(off=0, lim=30, name='') {
  isLoading = true; loadingEl.style.display = 'block';
  try {
    if(name) {
      const res = await fetch(`${API_BASE}/${name.toLowerCase()}`);
      if(!res.ok) { loadingEl.textContent = 'Nenhum resultado.'; isLoading=false; return; }
      const data = await res.json();
      clearCards();
      createCardFromData(data);
      isLoading = false; loadingEl.style.display='none'; return;
    }

    const res = await fetch(`${API_BASE}?offset=${off}&limit=${lim}`);
    const data = await res.json();
    const promises = data.results.map(r => fetch(r.url).then(res=>res.json()));
    const details = await Promise.all(promises);
    details.forEach(d => { allLoaded.push(d); createCardFromData(d); });
    offset += lim;
  } catch(err) {
    console.error(err);
    loadingEl.textContent = 'Erro ao buscar dados.';
  } finally {
    isLoading = false; loadingEl.style.display = 'none';
  }
}

function createCardFromData(p) {
  const card = document.createElement('article');
  card.classList.add('card');

  const img = document.createElement('img');
  img.src = p.sprites.other['official-artwork'].front_default;
  img.alt = p.name;

  const h3 = document.createElement('h3');
  h3.textContent = formatName(p.name);

  const meta = document.createElement('div');
  meta.classList.add('meta');

  const type = document.createElement('span');
  type.classList.add('badge');
  type.textContent = translateTypes(p.types);

  const weight = document.createElement('span');
  weight.classList.add('badge');
  weight.textContent = `Peso: ${(p.weight / 10).toFixed(1)} kg`;

  meta.append(type, weight);
  card.append(img, h3, meta);
  container.appendChild(card);
}

function clearCards(){ container.innerHTML = ''; }

loadMoreBtn.addEventListener('click', ()=> fetchList(offset, limit, ''));

searchInput.addEventListener('keyup', (e)=>{
  if(e.key==='Enter'){
    clearCards();
    fetchList(0,limit, searchInput.value.trim());
  }
});

// initial load
fetchList(offset, limit);
