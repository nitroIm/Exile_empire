// ============================================
// КАРТЫ — добавляй новые здесь
// col: 0 = левая, 1 = правая
// row: 0 = верх,  1 = низ
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
// ПЕРСОНАЖ (адмирал)
// ============================================
var HERO_SIZE = 128;
var HERO_SPEED = 4;
var HERO_FRAME_TIME = 8;

// Пока есть только up_1 и up_2 — они используются для всех направлений.
// Когда загрузишь down/left/right — просто замени пути ниже.
var HERO_FRAMES = {
  up:    ['characters/hero/up_1.PNG',    'characters/hero/up_2.PNG'],
  down:  ['characters/hero/down_1.PNG',  'characters/hero/down_2.PNG'],
  left:  ['characters/hero/left_1.PNG',  'characters/hero/left_2.PNG'],
  right: ['characters/hero/right_1.PNG', 'characters/hero/right_2.PNG']
};
var HERO_IDLE = 'characters/hero/left_1.PNG';
var hero = {
  x: 1024, y: 1024,
  targetX: 1024, targetY: 1024,
  el: null,
  frameIndex: 0,
  frameCounter: 0,
  moving: false,
  dir: 'up'
};

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

      // Определяем направление
      if (Math.abs(dx) > Math.abs(dy)) {
        hero.dir = dx > 0 ? 'right' : 'left';
      } else {
        hero.dir = dy > 0 ? 'down' : 'up';
      }

      // Анимация ходьбы
      hero.frameCounter++;
      if (hero.frameCounter >= HERO_FRAME_TIME) {
        hero.frameCounter = 0;
        hero.frameIndex = (hero.frameIndex + 1) % HERO_FRAMES[hero.dir].length;
        hero.el.src = HERO_FRAMES[hero.dir][hero.frameIndex];
      }
    } else {
      hero.x = hero.targetX;
      hero.y = hero.targetY;
      hero.el.style.left = hero.x + 'px';
      hero.el.style.top = hero.y + 'px';
      hero.moving = false;
      hero.el.src = HERO_IDLE;
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

setTimeout(function() {
  document.getElementById('splash').className = 'hidden';
  document.getElementById('menu').className = 'visible';
}, 7000);

// ============ PLAY ============
window.startGame = function() {
  document.getElementById('menu').className = '';
  document.getElementById('game').className = 'visible';
  initMap();
  if (window.loadPlayer) window.loadPlayer();
};

// ============ СВАЙП + ЗУМ + ТАП ============
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

  // Переменные для зума относительно центра щипка
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
          Math.abs(e.touches[0].clientY - touchStartY) > 10) {
        moved = true;
      }
      clamp();
      apply();
    } else if (pinching && e.touches.length === 2) {
      var d = distance(e.touches[0], e.touches[1]);
      var newScale = startScale * (d / startDist);
      if (newScale < 0.7) newScale = 0.7;
      if (newScale > 3) newScale = 3;

      // Точка мира, которая под центром щипка (до зума)
      var worldX_at_center = (pinchCenterX - pinchStartPosX) / startScale;
      var worldY_at_center = (pinchCenterY - pinchStartPosY) / startScale;

      // После зума эта точка должна остаться на месте
      posX = pinchCenterX - worldX_at_center * newScale;
      posY = pinchCenterY - worldY_at_center * newScale;

      scale = newScale;
      clamp();
      apply();
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