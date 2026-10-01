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

// 2. VARIÁVEIS DE ESTADO
let playlist = [];
let indexAtual = 0;
let primeiraCarga = true;

// FUNÇÃO PARA CONVERTER QUALQUER ARQUIVO EM STRING (BASE64 / DATA URL)
function fileToString(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // Retorna 'data:audio/mp3;base64,...'
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// 3. BUSCAR MÚSICAS EM TEMPO REAL NO REALTIME DATABASE
database.ref('musicas').on('value', (snapshot) => {
  playlist = [];

  snapshot.forEach((childSnapshot) => {
    playlist.push({
      id: childSnapshot.key,
      ...childSnapshot.val()
    });
  });

  renderizarPlaylist();

  if (playlist.length > 0 && primeiraCarga) {
    indexAtual = 0;
    carregarMusica(indexAtual);
    primeiraCarga = false;
  } else if (playlist.length === 0) {
    songTitle.textContent = 'Nenhuma música';
    artistName.textContent = 'Cadastre uma música ao lado';
    cover.src = 'https://picsum.photos/id/100/250';
    audio.src = '';
  }
}, (error) => {
  console.error("Erro ao carregar do Realtime Database:", error);
  playlistList.innerHTML = '<li style="color: #ef4444; justify-content: center;">Erro ao carregar músicas!</li>';
});

// 4. CARREGAR A MÚSICA SELECIONADA NA TELA
function carregarMusica(posicao) {
  if (playlist.length === 0) return;

  const musica = playlist[posicao];
  songTitle.textContent = musica.title;
  artistName.textContent = musica.artist;
  audio.src = musica.file; // A string Base64 é atribuída diretamente aqui!
  cover.src = musica.cover || 'https://picsum.photos/id/100/250';
  
  destacarMusicaAtiva();
}

// 5. ALTERNAR PLAY E PAUSE
function alternarPlay() {
  if (playlist.length === 0 || !audio.src) {
    alert("Nenhuma música válida selecionada!");
    return;
  }

  if (audio.paused) {
    audio.play().then(() => {
      playBtn.textContent = '⏸';
    }).catch(err => {
      console.error("Erro ao tocar áudio:", err);
      alert("Não foi possível reproduzir este áudio.");
    });
  } else {
    audio.pause();
    playBtn.textContent = '▶';
  }
}

// 6. NAVEGAÇÃO ENTRE MÚSICAS
function musicaAnterior() {
  if (playlist.length === 0) return;

  indexAtual--;
  if (indexAtual < 0) indexAtual = playlist.length - 1;
  carregarMusica(indexAtual);
  audio.play().then(() => playBtn.textContent = '⏸').catch(() => {});
}

function proximaMusica() {
  if (playlist.length === 0) return;

  indexAtual++;
  if (indexAtual >= playlist.length) indexAtual = 0;
  carregarMusica(indexAtual);
  audio.play().then(() => playBtn.textContent = '⏸').catch(() => {});
}

// 7. RENDERIZAR A PLAYLIST NA INTERFACE
function renderizarPlaylist() {
  playlistList.innerHTML = '';

  if (playlist.length === 0) {
    playlistList.innerHTML = '<li style="justify-content: center; color: var(--text-muted);">Sua playlist está vazia</li>';
    return;
  }

  playlist.forEach((musica, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${musica.title}</span> <span>${musica.artist}</span>`;
    
    li.addEventListener('click', () => {
      indexAtual = index;
      carregarMusica(indexAtual);
      audio.play().then(() => playBtn.textContent = '⏸').catch(() => {});
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

// 8. BARRA DE PROGRESSO DO ÁUDIO
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

// 9. CADASTRO DE MÚSICA CONVERTENDO ARQUIVOS PARA STRING (BASE64)
songForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const submitBtn = songForm.querySelector('.btn-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Convertendo e salvando...';

  try {
    const titulo = document.getElementById('input-title').value;
    const artista = document.getElementById('input-artist').value;
    const audioFileInput = document.getElementById('input-audio');
    const audioPathInput = document.getElementById('input-audio-path').value;
    const coverFileInput = document.getElementById('input-cover');

    let caminhoAudio = '';
    let caminhoCapa = 'https://picsum.photos/id/100/250';

    // A) SE SELECIONOU UM ARQUIVO MP3 DO COMPUTADOR:
    if (audioFileInput.files.length > 0) {
      const file = audioFileInput.files[0];

      // O Realtime Database aceita nós de até 10MB. 
      // É recomendado escolher arquivos MP3 de até 8MB~10MB.
      if (file.size > 10 * 1024 * 1024) {
        alert('O arquivo MP3 é muito grande! Escolha um arquivo com menos de 10MB.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Adicionar ao Firebase';
        return;
      }

      // Converte o MP3 em STRING
      caminhoAudio = await fileToString(file);

    } else if (audioPathInput.trim() !== '') {
      // Se digitou um link URL
      caminhoAudio = audioPathInput.trim();
    } else {
      alert('Por favor, selecione um arquivo MP3 ou digite um link!');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Adicionar ao Firebase';
      return;
    }

    // B) SE SELECIONOU UMA IMAGEM DE CAPA:
    if (coverFileInput && coverFileInput.files.length > 0) {
      caminhoCapa = await fileToString(coverFileInput.files[0]);
    }

    // C) SALVA A STRING DIRETAMENTE NO REALTIME DATABASE
    await database.ref('musicas').push({
      title: titulo,
      artist: artista,
      file: caminhoAudio,
      cover: caminhoCapa,
      createdAt: Date.now()
    });

    alert('Música cadastrada com sucesso!');
    songForm.reset();
    document.getElementById('audio-filename').textContent = '🎵 Clique para selecionar o áudio';
    document.getElementById('cover-filename').textContent = '🖼️ Clique para selecionar a capa';

  } catch (error) {
    console.error('Erro ao converter ou salvar no Firebase:', error);
    alert('Erro ao converter ou salvar a música.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Adicionar ao Firebase';
  }
});

// 10. ATUALIZAR NOMES DOS ARQUIVOS NOS BOTÕES DO FORMULÁRIO
document.getElementById('input-audio').addEventListener('change', function(e) {
  const fileName = e.target.files[0] ? e.target.files[0].name : '🎵 Clique para selecionar o áudio';
  document.getElementById('audio-filename').textContent = fileName;
});

document.getElementById('input-cover').addEventListener('change', function(e) {
  const fileName = e.target.files[0] ? e.target.files[0].name : '🖼️ Clique para selecionar a capa';
  document.getElementById('cover-filename').textContent = fileName;
});

// 11. CONTROLES
playBtn.addEventListener('click', alternarPlay);
prevBtn.addEventListener('click', musicaAnterior);
nextBtn.addEventListener('click', proximaMusica);
audio.addEventListener('ended', proximaMusica);