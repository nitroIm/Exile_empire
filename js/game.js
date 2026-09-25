// ================= КАРТЫ =================
// Добавляй новые карты сюда. col/row — позиция в сетке (0 или 1).
var MAPS = [
  { file: "maps/map_01.PNG", col: 0, row: 0 },
  { file: "maps/map_2.PNG", col: 1, row: 0 },
  { file: "maps/map_3.PNG", col: 0, row: 1 },
  { file: "maps/map_4.PNG", col: 1, row: 1 }
];

var TILE = 1024;
var WORLD_W = 2048;
var WORLD_H = 2048;

// ================= СБОРКА МИРА =================
(function buildWorld() {
  var world = document.getElementById('world');
  world.style.width = WORLD_W + 'px';
  world.style.height = WORLD_H + 'px';
  MAPS.forEach(function(m) {
    var img = document.createElement('img');
    img.src = m.file;
    img.style.left = (m.col * TILE) + 'px';
    img.style.top = (m.row * TILE) + 'px';
    img.onerror = function() { this.style.display = 'none'; };
    world.appendChild(img);
  });
})();

// ================= TELEGRAM =================
var tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) { tg.ready(); tg.expand(); }

// Заставка 7 секунд
setTimeout(function() {
  document.getElementById('splash').className = 'hidden';
  document.getElementById('menu').className = 'visible';
}, 7000);

// ================= PLAY =================
window.startGame = function() {
  document.getElementById('menu').className = '';
  document.getElementById('game').className = 'visible';
  initMap();
  if (window.loadPlayer) window.loadPlayer();
};

// ================= СВАЙП + ЗУМ =================
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

  game.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
      dragging = true;
      startX = e.touches[0].clientX - posX;
      startY = e.touches[0].clientY - posY;
    } else if (e.touches.length === 2) {
      dragging = false;
      pinching = true;
      startDist = distance(e.touches[0], e.touches[1]);
      startScale = scale;
    }
  }, { passive: false });

  game.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (dragging && e.touches.length === 1) {
      posX = e.touches[0].clientX - startX;
      posY = e.touches[0].clientY - startY;
      clamp();
      apply();
    } else if (pinching && e.touches.length === 2) {
      var d = distance(e.touches[0], e.touches[1]);
      scale = startScale * (d / startDist);
      if (scale < 0.7) scale = 0.7;
      if (scale > 3) scale = 3;
      clamp();
      apply();
    }
  }, { passive: false });

  game.addEventListener('touchend', function(e) {
    if (e.touches.length === 0) { dragging = false; pinching = false; }
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