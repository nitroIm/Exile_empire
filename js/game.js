// ============================================
// КАРТЫ
// ============================================
var MAPS = [
  { file: "maps/map_01.PNG", col: 0, row: 0 },
  { file: "maps/map_2.PNG",  col: 1, row: 0 },
  { file: "maps/map_3.PNG",  col: 0, row: 1 },
  { file: "maps/map_4.PNG",  col: 1, row: 1 }
];
var TILE = 1024;
var WORLD_W = 2048;
var WORLD_H = 2048;

// ============================================
// ПЕРСОНАЖ
// ============================================
var HERO_SIZE = 128;
var HERO_SPEED = 4;
var HERO_FRAME_TIME = 8;
var HERO_FRAMES = {
  up:    ['characters/hero/up_1.PNG',    'characters/hero/up_2.PNG'],
  down:  ['characters/hero/down_1.PNG',  'characters/hero/down_2.PNG'],
  left:  ['characters/hero/left_1.PNG',  'characters/hero/left_2.PNG'],
  right: ['characters/hero/left_1.PNG',  'characters/hero/left_2.PNG']
};
var HERO_IDLE = 'characters/hero/up_1.PNG';

var hero = {
  x: 1024, y: 1024, targetX: 1024, targetY: 1024,
  el: null, frameIndex: 0, frameCounter: 0,
  moving: false, dir: 'up'
};

// ============ ПРОФИЛЬ ============
var currentProfile = {
  name: 'АДМИРАЛ',
  avatar: '',
  soundOn: true,
  musicOn: true,
  soundVol: 70,
  musicVol: 40
};

// ============================================
// ЗВУКИ через HOWLER.JS
// ============================================
var musicMenu = new Howl({
  src: ['sounds/music_menu.mp3'],
  loop: true,
  volume: 0.4,
  html5: false,
  preload: true,
  onload: function() { console.log('🎵 Музыка загружена'); },
  onloaderror: function(id, e) { console.log('❌ Музыка не загрузилась:', e); },
  onplayerror: function(id, e) {
    console.log('❌ Ошибка воспроизведения:', e);
    musicMenu.once('unlock', function() { musicMenu.play(); });
  }
});

var soundClick = new Howl({
  src: ['sounds/click.mp3'],
  volume: 0.7,
  html5: false,
  preload: true,
  onload: function() { console.log('🖱 Клик загружен'); },
  onloaderror: function(id, e) { console.log('❌ Клик не загрузился:', e); }
});

function updateMusicVolume() {
  var v = Math.max(0, Math.min(1, currentProfile.musicVol / 100));
  musicMenu.volume(v);
  console.log('🔊 Музыка volume =', v);
}

function updateClickVolume() {
  var v = Math.max(0, Math.min(1, currentProfile.soundVol / 100));
  soundClick.volume(v);
}

function playClick() {
  if (!currentProfile.soundOn) return;
  updateClickVolume();
  soundClick.play();
}

function startMenuMusic() {
  if (!currentProfile.musicOn) return;
  if (document.getElementById('game').classList.contains('visible')) return;
  updateMusicVolume();
  if (!musicMenu.playing()) {
    musicMenu.play();
  }
}

function stopMenuMusic() {
  if (musicMenu.playing()) {
    musicMenu.pause();
  }
}

// Автопривязка клика ко всем кнопкам
function attachClickSounds() {
  var selectors = [
    '.menu-btn',
    '.bottom-btn',
    '#profile-save',
    '#profile-back',
    '.vol-btn',
    '.profile-toggle',
    '.profile-mini-btn',
    '#panel-handle',
    '#profile-back-bottom'
  ];
  selectors.forEach(function(sel) {
    document.querySelectorAll(sel).forEach(function(el) {
      el.addEventListener('touchstart', playClick, { passive: true });
      el.addEventListener('click', playClick);
    });
  });
}

// ============ СБОРКА МИРА ============
(function buildWorld() {
  var world = document.getElementById('world');
  world.style.width = WORLD_W + 'px';
  world.style.height = WORLD_H + 'px';
  MAPS.forEach(function(m) {
    var img = document.createElement('img');
    img.src = m.file;
    img.style.position = 'absolute';
    img.style.left = (m.col * TILE) + 'px';
    img.style.top = (m.row * TILE) + 'px';
    img.style.width = TILE + 'px';
    img.style.height = TILE + 'px';
    world.appendChild(img);
  });
  var heroEl = document.createElement('img');
  heroEl.src = HERO_IDLE;
  heroEl.style.position = 'absolute';
  heroEl.style.width = HERO_SIZE + 'px';
  heroEl.style.height = HERO_SIZE + 'px';
  heroEl.style.left = hero.x + 'px';
  heroEl.style.top = hero.y + 'px';
  heroEl.style.pointerEvents = 'none';
  heroEl.style.zIndex = '5';
  world.appendChild(heroEl);
  hero.el = heroEl;
  heroLoop();
})();

// ============ ДВИЖЕНИЕ ГЕРОЯ ============
function heroLoop() {
  if (hero.moving) {
    var dx = hero.targetX - hero.x;
    var dy = hero.targetY - hero.y;
    var dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > 3) {
      hero.x += (dx / dist) * HERO_SPEED;
      hero.y += (dy / dist) * HERO_SPEED;
      hero.el.style.left = hero.x + 'px';
      hero.el.style.top = hero.y + 'px';
      if (Math.abs(dx) > Math.abs(dy)) hero.dir = dx > 0 ? 'right' : 'left';
      else hero.dir = dy > 0 ? 'down' : 'up';
      hero.frameCounter++;
      if (hero.frameCounter >= HERO_FRAME_TIME) {
        hero.frameCounter = 0;
        hero.frameIndex = (hero.frameIndex + 1) % HERO_FRAMES[hero.dir].length;
        hero.el.src = HERO_FRAMES[hero.dir][hero.frameIndex];
      }
      hero.el.style.transform = hero.dir === 'right' ? 'scaleX(-1)' : 'scaleX(1)';
    } else {
      hero.x = hero.targetX;
      hero.y = hero.targetY;
      hero.el.style.left = hero.x + 'px';
      hero.el.style.top = hero.y + 'px';
      hero.moving = false;
      hero.el.src = HERO_IDLE;
      hero.el.style.transform = 'scaleX(1)';
    }
  }
  requestAnimationFrame(heroLoop);
}

function heroMoveTo(clientX, clientY) {
  var world = document.getElementById('world');
  var rect = world.getBoundingClientRect();
  var scaleX = WORLD_W / rect.width;
  var scaleY = WORLD_H / rect.height;
  var x = (clientX - rect.left) * scaleX;
  var y = (clientY - rect.top) * scaleY;
  if (x < HERO_SIZE/2) x = HERO_SIZE/2;
  if (x > WORLD_W - HERO_SIZE/2) x = WORLD_W - HERO_SIZE/2;
  if (y < HERO_SIZE/2) y = HERO_SIZE/2;
  if (y > WORLD_H - HERO_SIZE/2) y = WORLD_H - HERO_SIZE/2;
  hero.targetX = x;
  hero.targetY = y;
  hero.moving = true;
}

// ============ TELEGRAM ============
var tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) { tg.ready(); tg.expand(); }

// ============================================
// ЗАГРУЗЧИК
// ============================================
var loaderProgress = 0;
var loaderStart = Date.now();
var loaderDuration = 5000;
var loaderInterval = setInterval(function() {
  var elapsed = Date.now() - loaderStart;
  var t = elapsed / loaderDuration;
  if (t > 1) t = 1;
  var eased = 1 - Math.pow(1 - t, 2.5);
  var jitter = Math.sin(elapsed / 400) * 0.03;
  loaderProgress = Math.min(100, Math.max(0, (eased + jitter) * 100));
  var fill = document.getElementById('loading-fill');
  if (fill) fill.style.width = loaderProgress + '%';
  if (t >= 1) {
    clearInterval(loaderInterval);
    if (fill) fill.style.width = '100%';
    setTimeout(function() {
      document.getElementById('splash').className = 'hidden';
      document.getElementById('menu').className = 'visible';

      attachClickSounds();
      startMenuMusic();

      var startOnce = function() {
        startMenuMusic();
        document.removeEventListener('touchstart', startOnce);
        document.removeEventListener('click', startOnce);
      };
      document.addEventListener('touchstart', startOnce);
      document.addEventListener('click', startOnce);

      if (window.loadPlayer) window.loadPlayer();
    }, 400);
  }
}, 50);

// ============================================
// ПРИМЕНЕНИЕ ДАННЫХ ПРОФИЛЯ
// ============================================
window.applyProfileData = function(data) {
  if (!data) return;

  if (data.name) currentProfile.name = data.name;
  if (data.avatar) currentProfile.avatar = data.avatar;
  if (typeof data.soundOn !== 'undefined') currentProfile.soundOn = data.soundOn;
  if (typeof data.musicOn !== 'undefined') currentProfile.musicOn = data.musicOn;
  if (typeof data.soundVol !== 'undefined') currentProfile.soundVol = data.soundVol;
  if (typeof data.musicVol !== 'undefined') currentProfile.musicVol = data.musicVol;

  var playerName = document.getElementById('player-name');
  if (playerName) playerName.textContent = currentProfile.name;

  var nameInput = document.getElementById('profile-name-input');
  if (nameInput) nameInput.value = currentProfile.name;

  var avatarBig = document.getElementById('avatar-big-img');
  var avatarSmall = document.getElementById('avatar');
  if (currentProfile.avatar) {
    if (avatarBig) avatarBig.src = currentProfile.avatar;
    if (avatarSmall) avatarSmall.src = currentProfile.avatar;
  }

  var soundToggle = document.getElementById('toggle-sound');
  var musicToggle = document.getElementById('toggle-music');
  if (soundToggle) {
    soundToggle.textContent = currentProfile.soundOn ? 'ВКЛ' : 'ВЫКЛ';
    soundToggle.classList.toggle('off', !currentProfile.soundOn);
  }
  if (musicToggle) {
    musicToggle.textContent = currentProfile.musicOn ? 'ВКЛ' : 'ВЫКЛ';
    musicToggle.classList.toggle('off', !currentProfile.musicOn);
  }

  var soundVolVal = document.getElementById('vol-sound-val');
  var musicVolVal = document.getElementById('vol-music-val');
  if (soundVolVal) soundVolVal.textContent = currentProfile.soundVol + '%';
  if (musicVolVal) musicVolVal.textContent = currentProfile.musicVol + '%';

  if (typeof data.metal !== 'undefined') {
    var metal = document.getElementById('metal');
    if (metal) metal.textContent = data.metal;
  }
  if (typeof data.crystal !== 'undefined') {
    var crystal = document.getElementById('crystal');
    if (crystal) crystal.textContent = data.crystal;
  }
  if (typeof data.stars !== 'undefined') {
    var stars = document.getElementById('stars');
    if (stars) stars.textContent = data.stars;
  }

  updateMusicVolume();
  updateClickVolume();
};

// ============================================
// ПЕРЕХОДЫ
// ============================================
window.startGame = function() {
  var hasProfile = localStorage.getItem('profile_ready');
  if (!hasProfile) {
    if (tg) tg.HapticFeedback?.impactOccurred('medium');
    document.getElementById('menu').className = '';
    fillProfileFromTelegram();
    document.getElementById('profile-screen').className = 'visible';
    return;
  }
  openGame();
};

function openGame() {
  stopMenuMusic();
  document.getElementById('menu').className = '';
  document.getElementById('profile-screen').className = '';
  document.getElementById('game').className = 'visible';
  initMap();
}

function fillProfileFromTelegram() {
  if (!tg || !tg.initDataUnsafe || !tg.initDataUnsafe.user) return;
  var u = tg.initDataUnsafe.user;
  var nameField = document.getElementById('profile-name-input');
  var avatarBig = document.getElementById('avatar-big-img');
  if (nameField && !nameField.value) {
    nameField.value = (u.first_name || u.username || 'Адмирал').slice(0, 15);
  }
  if (u.photo_url && avatarBig) {
    avatarBig.src = u.photo_url;
  }
}

window.openProfileScreen = function() {
  if (tg) tg.HapticFeedback?.impactOccurred('light');
  document.getElementById('menu').className = '';
  fillProfileFromTelegram();
  document.getElementById('profile-screen').className = 'visible';
};

window.closeProfileScreen = function() {
  if (tg) tg.HapticFeedback?.impactOccurred('light');
  document.getElementById('profile-screen').className = '';
  document.getElementById('menu').className = 'visible';
  if (currentProfile.musicOn) startMenuMusic();
};

// ============================================
// СОХРАНЕНИЕ ПРОФИЛЯ
// ============================================
(function initSave() {
  var saveBtn = document.getElementById('profile-save');
  if (!saveBtn) return;

  saveBtn.addEventListener('click', async function() {
    var nameInput = document.getElementById('profile-name-input');
    var avatarBig = document.getElementById('avatar-big-img');
    var soundToggle = document.getElementById('toggle-sound');
    var musicToggle = document.getElementById('toggle-music');

    var dataToSave = {
      name: nameInput ? (nameInput.value || 'Адмирал') : 'Адмирал',
      avatar: avatarBig ? avatarBig.src : '',
      soundOn: !soundToggle?.classList.contains('off'),
      musicOn: !musicToggle?.classList.contains('off'),
      soundVol: currentProfile.soundVol,
      musicVol: currentProfile.musicVol
    };

    var oldText = saveBtn.textContent;
    saveBtn.textContent = 'СОХРАНЕНИЕ...';

    if (window.savePlayer) {
      await window.savePlayer(dataToSave);
    }

    localStorage.setItem('profile_ready', '1');
    localStorage.setItem('player_name', dataToSave.name);
    localStorage.setItem('player_avatar', dataToSave.avatar);

    currentProfile.name = dataToSave.name;
    currentProfile.avatar = dataToSave.avatar;

    var playerName = document.getElementById('player-name');
    var avatarSmall = document.getElementById('avatar');
    if (playerName) playerName.textContent = dataToSave.name;
    if (avatarSmall && dataToSave.avatar) avatarSmall.src = dataToSave.avatar;

    if (tg) tg.HapticFeedback?.impactOccurred('medium');

    saveBtn.textContent = 'СОХРАНЕНО ✓';
    setTimeout(function() {
      saveBtn.textContent = oldText;
      openGame();
    }, 600);
  });
})();

// ============================================
// СВАЙП + ЗУМ + ТАП
// ============================================
function initMap() {
  var world = document.getElementById('world');
  var game = document.getElementById('game');
  var posX = 0, posY = 0, scale = 1;
  posX = -(WORLD_W - window.innerWidth) / 2;
  posY = -(WORLD_H - window.innerHeight) / 2;
  apply();
  var startX = 0, startY = 0;
  var startDist = 0, startScale = 1;
  var dragging = false, pinching = false;
  var touchStartTime = 0;
  var touchStartX = 0, touchStartY = 0;
  var moved = false;
  var pinchCenterX = 0, pinchCenterY = 0;
  var pinchStartPosX = 0, pinchStartPosY = 0;

  game.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
      dragging = true;
      startX = e.touches[0].clientX - posX;
      startY = e.touches[0].clientY - posY;
      touchStartTime = Date.now();
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      moved = false;
    } else if (e.touches.length === 2) {
      dragging = false;
      pinching = true;
      startDist = distance(e.touches[0], e.touches[1]);
      startScale = scale;
      pinchCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      pinchCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      pinchStartPosX = posX;
      pinchStartPosY = posY;
    }
  }, { passive: false });

  game.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (dragging && e.touches.length === 1) {
      posX = e.touches[0].clientX - startX;
      posY = e.touches[0].clientY - startY;
      if (Math.abs(e.touches[0].clientX - touchStartX) > 10 ||
          Math.abs(e.touches[0].clientY - touchStartY) > 10) moved = true;
      clamp(); apply();
    } else if (pinching && e.touches.length === 2) {
      var d = distance(e.touches[0], e.touches[1]);
      var newScale = startScale * (d / startDist);
      if (newScale < 0.7) newScale = 0.7;
      if (newScale > 3) newScale = 3;
      var worldX_at_center = (pinchCenterX - pinchStartPosX) / startScale;
      var worldY_at_center = (pinchCenterY - pinchStartPosY) / startScale;
      posX = pinchCenterX - worldX_at_center * newScale;
      posY = pinchCenterY - worldY_at_center * newScale;
      scale = newScale;
      clamp(); apply();
    }
  }, { passive: false });

  game.addEventListener('touchend', function(e) {
    if (e.touches.length === 0) {
      dragging = false;
      pinching = false;
      if (!moved && Date.now() - touchStartTime < 300) {
        heroMoveTo(touchStartX, touchStartY);
      }
    }
  });

  function distance(a, b) {
    var dx = a.clientX - b.clientX;
    var dy = a.clientY - b.clientY;
    return Math.sqrt(dx*dx + dy*dy);
  }
  function clamp() {
    var w = WORLD_W * scale;
    var h = WORLD_H * scale;
    var minX = -(w - window.innerWidth);
    var minY = -(h - window.innerHeight);
    if (posX > 0) posX = 0;
    if (posX < minX) posX = minX;
    if (posY > 0) posY = 0;
    if (posY < minY) posY = minY;
  }
  function apply() {
    world.style.transformOrigin = '0 0';
    world.style.transform = 'translate(' + posX + 'px, ' + posY + 'px) scale(' + scale + ')';
  }
}

// ============================================
// ВЫДВИЖНАЯ ПАНЕЛЬ
// ============================================
(function initPanel() {
  var bar = document.getElementById('bottom-bar');
  var handle = document.getElementById('panel-handle');
  if (!bar || !handle) return;
  handle.addEventListener('click', function() {
    bar.classList.toggle('expanded');
    if (tg) tg.HapticFeedback?.impactOccurred('light');
  });
  var startY = 0;
  handle.addEventListener('touchstart', function(e) { startY = e.touches[0].clientY; });
  handle.addEventListener('touchend', function(e) {
    var endY = e.changedTouches[0].clientY;
    var diff = startY - endY;
    if (diff > 30) bar.classList.add('expanded');
    if (diff < -30) bar.classList.remove('expanded');
  });
})();

// ============================================
// ПРОФИЛЬ
// ============================================
(function initNameFilter() {
  var nameInput = document.getElementById('profile-name-input');
  if (!nameInput) return;
  nameInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^A-Za-zА-Яа-яЁё ]/g, '');
    if (this.value.length > 15) this.value = this.value.slice(0, 15);
  });
})();

(function initToggles() {
  var sound = document.getElementById('toggle-sound');
  var music = document.getElementById('toggle-music');
  if (sound) sound.addEventListener('click', function() {
    sound.classList.toggle('off');
    sound.textContent = sound.classList.contains('off') ? 'ВЫКЛ' : 'ВКЛ';
    currentProfile.soundOn = !sound.classList.contains('off');
  });
  if (music) music.addEventListener('click', function() {
    music.classList.toggle('off');
    music.textContent = music.classList.contains('off') ? 'ВЫКЛ' : 'ВКЛ';
    currentProfile.musicOn = !music.classList.contains('off');
    if (currentProfile.musicOn) {
      if (!document.getElementById('game').classList.contains('visible')) {
        startMenuMusic();
      }
    } else {
      stopMenuMusic();
    }
  });
})();

window.uploadAvatar = function() {
  document.getElementById('avatar-file').click();
};
(function initUpload() {
  var fileInput = document.getElementById('avatar-file');
  if (!fileInput) return;
  fileInput.addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      document.getElementById('avatar-big-img').src = ev.target.result;
      currentProfile.avatar = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
})();

// ============================================
// ГРОМКОСТЬ
// ============================================
window.changeVolume = function(type, delta) {
  if (type === 'sound') {
    currentProfile.soundVol = Math.max(0, Math.min(100, currentProfile.soundVol + delta));
    var el = document.getElementById('vol-sound-val');
    if (el) el.textContent = currentProfile.soundVol + '%';
    updateClickVolume();
  } else {
    currentProfile.musicVol = Math.max(0, Math.min(100, currentProfile.musicVol + delta));
    var el2 = document.getElementById('vol-music-val');
    if (el2) el2.textContent = currentProfile.musicVol + '%';
    updateMusicVolume();
  }
  if (tg) tg.HapticFeedback?.impactOccurred('light');
};

// ============================================
// ЗАГЛУШКИ
// ============================================
window.openBase    = function() { if (tg) tg.HapticFeedback?.impactOccurred('light'); alert('База'); };
window.openMine    = function() { if (tg) tg.HapticFeedback?.impactOccurred('light'); alert('Рудник'); };
window.openFight   = function() { if (tg) tg.HapticFeedback?.impactOccurred('medium'); alert('Бой'); };
window.openMap     = function() { if (tg) tg.HapticFeedback?.impactOccurred('light'); alert('Карта'); };
window.openShop    = function() { if (tg) tg.HapticFeedback?.impactOccurred('light'); alert('Магазин'); };
window.openArmy    = function() { if (tg) tg.HapticFeedback?.impactOccurred('light'); alert('Армия'); };
window.openScience = function() { if (tg) tg.HapticFeedback?.impactOccurred('light'); alert('Наука'); };
window.openFleet   = function() { if (tg) tg.HapticFeedback?.impactOccurred('light'); alert('Флот'); };
window.openClan    = function() { if (tg) tg.HapticFeedback?.impactOccurred('light'); alert('Клан'); };
window.openQuests  = function() { if (tg) tg.HapticFeedback?.impactOccurred('light'); alert('Задания'); };
// ============================================
// ШЕСТЕРЁНКА
// ============================================
window.openGearMenu = function() {
  playClick();
  document.getElementById('gear-menu').className = 'visible';
};

window.closeGearMenu = function() {
  playClick();
  document.getElementById('gear-menu').className = '';
};

window.gearSave = async function() {
  playClick();
  // Сохраняем профиль в Firebase
  var dataToSave = {
    name: currentProfile.name,
    avatar: currentProfile.avatar,
    soundOn: currentProfile.soundOn,
    musicOn: currentProfile.musicOn,
    soundVol: currentProfile.soundVol,
    musicVol: currentProfile.musicVol
  };
  if (window.savePlayer) {
    await window.savePlayer(dataToSave);
  }
  // Показываем "СОХРАНЕНО"
  var btn = document.querySelector('.gear-menu-btn.save');
  if (btn) {
    var old = btn.textContent;
    btn.textContent = 'СОХРАНЕНО ✓';
    setTimeout(function() {
      btn.textContent = old;
      closeGearMenu();
    }, 800);
  }
};

window.gearExit = function() {
  playClick();
  closeGearMenu();
  // Стоп музыка
  stopMenuMusic();
  // Показать меню
  document.getElementById('game').className = '';
  document.getElementById('menu').className = 'visible';
  // Музыка меню
  startMenuMusic();
};