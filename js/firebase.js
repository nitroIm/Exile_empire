import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAaAMt8O1pNfF7O2TJkWSyyvv6Ndp5XHfU",
  authDomain: "exile-empire.firebaseapp.com",
  projectId: "exile-empire",
  storageBucket: "exile-empire.firebasestorage.app",
  messagingSenderId: "465765692374",
  appId: "1:465765692374:web:c6b984f3ba91ecc22c2a77"
};

let app, db, auth;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch(e) { console.log('Firebase init error:', e); }

// ============ ID ИГРОКА (из Telegram) ============
window.getPlayerId = function() {
  if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    return 'tg_' + window.Telegram.WebApp.initDataUnsafe.user.id;
  }
  let testId = localStorage.getItem('test_player_id');
  if (!testId) {
    testId = 'test_user_1';
    localStorage.setItem('test_player_id', testId);
  }
  return testId;
};

// ============ АНОНИМНЫЙ ВХОД ============
let authReady = false;
let authPromise = new Promise(function(resolve) {
  if (!auth) { resolve(null); return; }
  onAuthStateChanged(auth, function(user) {
    if (user) {
      authReady = true;
      console.log('✅ Авторизация готова, uid:', user.uid);
      resolve(user);
    }
  });
  // Пробуем войти анонимно
  signInAnonymously(auth).catch(function(e) {
    console.log('Ошибка авторизации:', e);
    resolve(null);
  });
});

// ============ ЗАГРУЗКА ИГРОКА ============
window.loadPlayer = async function() {
  await authPromise;
  if (!db || !authReady) { console.log('Нет авторизации'); return null; }
  const playerId = window.getPlayerId();
  try {
    const docRef = doc(db, 'players', playerId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      console.log('Игрок загружен:', data);
      if (window.applyProfileData) window.applyProfileData(data);
      return data;
    } else {
      const newPlayer = {
        name: (window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Адмирал').slice(0, 15),
        avatar: window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url || '',
        soundOn: true, musicOn: true,
        soundVol: 100, musicVol: 40,
        metal: 500, crystal: 200, energy: 100,
        army: 0, stars: 0,
        rank: 'РЯДОВОЙ',
        createdAt: new Date().toISOString()
      };
      await setDoc(docRef, newPlayer);
      console.log('Создан новый игрок:', newPlayer);
      if (window.applyProfileData) window.applyProfileData(newPlayer);
      return newPlayer;
    }
  } catch(e) {
    console.log('Ошибка загрузки:', e);
    return null;
  }
};

// ============ СОХРАНЕНИЕ ИГРОКА ============
window.savePlayer = async function(data) {
  await authPromise;
  if (!db || !authReady) return false;
  const playerId = window.getPlayerId();
  try {
    await setDoc(doc(db, 'players', playerId), data, { merge: true });
    console.log('Игрок сохранён:', data);
    return true;
  } catch(e) {
    console.log('Ошибка сохранения:', e);
    return false;
  }
};