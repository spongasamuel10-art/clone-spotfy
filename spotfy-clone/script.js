// 1. CAPTURA DOS ELEMENTOS DO HTML
const audio = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const songTitle = document.getElementById('song-title');
const artistName = document.getElementById('artist-name');
const cover = document.getElementById('cover');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationTimeEl = document.getElementById('duration-time');
const playlistList = document.getElementById('playlist-list');
const songForm = document.getElementById('song-form');

// Elementos do Mixer de Volume
const volumeSlider = document.getElementById('volume-slider');
const volumeIcon = document.getElementById('volume-icon');

// 2. PLAYLIST INICIAL
const playlist = [
  {
    title: 'Arrependidaço',
    artist: 'Artista 1',
    file: 'musicas/arrependidaco.mp3',
    cover: 'https://picsum.photos/id/10/250'
  },
  {
    title: 'Até Que Durou',
    artist: 'Artista 2',
    file: 'musicas/ate-que-durou.mp3',
    cover: 'https://picsum.photos/id/20/250'
  },
  {
    title: 'Menos é Mais',
    artist: 'Artista 3',
    file: 'musicas/menos-e-mais.mp3',
    cover: 'https://picsum.photos/id/30/250'
  }
];

let indexAtual = 0;

// 3. CARREGAR A MÚSICA NA TELA
function carregarMusica(posicao) {
  if (playlist.length === 0) return;

  const musica = playlist[posicao];
  songTitle.textContent = musica.title;
  artistName.textContent = musica.artist;
  audio.src = musica.file;
  cover.src = musica.cover;
  
  destacarMusicaAtiva();
}

// 4. PLAY / PAUSE
function alternarPlay() {
  if (playlist.length === 0) return;

  if (audio.paused) {
    audio.play();
    playBtn.textContent = '⏸';
  } else {
    audio.pause();
    playBtn.textContent = '▶';
  }
}

// 5. NAVEGAÇÃO
function musicaAnterior() {
  if (playlist.length === 0) return;

  indexAtual--;
  if (indexAtual < 0) indexAtual = playlist.length - 1;
  carregarMusica(indexAtual);
  audio.play();
  playBtn.textContent = '⏸';
}

function proximaMusica() {
  if (playlist.length === 0) return;

  indexAtual++;
  if (indexAtual >= playlist.length) indexAtual = 0;
  carregarMusica(indexAtual);
  audio.play();
  playBtn.textContent = '⏸';
}

// 6. CONTROLADOR DE MIXER DE VOLUME
volumeSlider.addEventListener('input', (e) => {
  const valorVolume = e.target.value;
  audio.volume = valorVolume;

  if (valorVolume == 0) {
    volumeIcon.textContent = '🔇';
  } else if (valorVolume < 0.5) {
    volumeIcon.textContent = '🔉';
  } else {
    volumeIcon.textContent = '🔊';
  }
});

// 7. EXCLUIR MÚSICA DA PLAYLIST
function excluirMusica(indexParaExcluir) {
  playlist.splice(indexParaExcluir, 1);

  if (playlist.length === 0) {
    audio.pause();
    audio.src = '';
    songTitle.textContent = 'Nenhuma música';
    artistName.textContent = '-';
    cover.src = 'https://picsum.photos/id/100/250';
    playBtn.textContent = '▶';
    renderizarPlaylist();
    return;
  }

  if (indexParaExcluir === indexAtual) {
    if (indexAtual >= playlist.length) {
      indexAtual = playlist.length - 1;
    }
    carregarMusica(indexAtual);
    audio.play();
    playBtn.textContent = '⏸';
  } else if (indexParaExcluir < indexAtual) {
    indexAtual--;
  }

  renderizarPlaylist();
}

// 8. RENDERIZAR PLAYLIST NA INTERFACE
function renderizarPlaylist() {
  playlistList.innerHTML = '';

  if (playlist.length === 0) {
    playlistList.innerHTML = '<li class="empty-msg">Sua playlist está vazia</li>';
    return;
  }

  playlist.forEach((musica, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="song-info">
        <span>${musica.title}</span>
        <small style="color: var(--text-secondary);">${musica.artist}</small>
      </div>
      <button class="btn-delete" title="Excluir música">🗑</button>
    `;
    
    li.addEventListener('click', () => {
      indexAtual = index;
      carregarMusica(indexAtual);
      audio.play();
      playBtn.textContent = '⏸';
    });

    const btnDelete = li.querySelector('.btn-delete');
    btnDelete.addEventListener('click', (e) => {
      e.stopPropagation();
      excluirMusica(index);
    });

    playlistList.appendChild(li);
  });

  destacarMusicaAtiva();
}

function destacarMusicaAtiva() {
  const itens = playlistList.querySelectorAll('li');
  itens.forEach((li, index) => {
    if (index === indexAtual) {
      li.classList.add('active');
    } else {
      li.classList.remove('active');
    }
  });
}

// 9. ATUALIZAR TEMPO E BARRA DE PROGRESSO
audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    const progresso = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progresso;

    let minAtual = Math.floor(audio.currentTime / 60);
    let segAtual = Math.floor(audio.currentTime % 60);
    if (segAtual < 10) segAtual = `0${segAtual}`;
    currentTimeEl.textContent = `${minAtual}:${segAtual}`;

    let minDuracao = Math.floor(audio.duration / 60);
    let segDuracao = Math.floor(audio.duration % 60);
    if (segDuracao < 10) segDuracao = `0${segDuracao}`;
    durationTimeEl.textContent = `${minDuracao}:${segDuracao}`;
  }
});

progressBar.addEventListener('input', () => {
  if (audio.duration) {
    const tempoDesejado = (progressBar.value / 100) * audio.duration;
    audio.currentTime = tempoDesejado;
  }
});

// 10. FORMULÁRIO DE CADASTRO
songForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const titulo = document.getElementById('input-title').value;
  const artista = document.getElementById('input-artist').value;
  const audioFileInput = document.getElementById('input-audio');
  const audioPathInput = document.getElementById('input-audio-path').value;
  const coverFileInput = document.getElementById('input-cover');

  let caminhoAudio = '';
  if (audioFileInput.files.length > 0) {
    caminhoAudio = URL.createObjectURL(audioFileInput.files[0]);
  } else if (audioPathInput.trim() !== '') {
    caminhoAudio = audioPathInput.trim();
  } else {
    alert('Por favor, selecione um arquivo de áudio ou digite o caminho!');
    return;
  }

  let caminhoCapa = 'https://picsum.photos/id/100/250';
  if (coverFileInput.files.length > 0) {
    caminhoCapa = URL.createObjectURL(coverFileInput.files[0]);
  }

  playlist.push({
    title: titulo,
    artist: artista,
    file: caminhoAudio,
    cover: caminhoCapa
  });

  renderizarPlaylist();
  songForm.reset();
  document.getElementById('audio-filename').textContent = '🎵 Clique para selecionar o áudio';
  document.getElementById('cover-filename').textContent = '🖼️ Clique para selecionar a capa';

  if (playlist.length === 1) {
    indexAtual = 0;
    carregarMusica(indexAtual);
  }
});

// 11. MANIPULAÇÃO DE INPUTS DE ARQUIVO
document.getElementById('input-audio').addEventListener('change', function(e) {
  const fileName = e.target.files[0] ? e.target.files[0].name : '🎵 Clique para selecionar o áudio';
  document.getElementById('audio-filename').textContent = fileName;
});

document.getElementById('input-cover').addEventListener('change', function(e) {
  const fileName = e.target.files[0] ? e.target.files[0].name : '🖼️ Clique para selecionar a capa';
  document.getElementById('cover-filename').textContent = fileName;
});

// 12. LISTENERS DOS CONTROLES
playBtn.addEventListener('click', alternarPlay);
prevBtn.addEventListener('click', musicaAnterior);
nextBtn.addEventListener('click', proximaMusica);
audio.addEventListener('ended', proximaMusica);

// INICIALIZAÇÃO
carregarMusica(indexAtual);
renderizarPlaylist();