import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAaAMt8O1pNfF7O2TJkWSyyvv6Ndp5XHfU",
  authDomain: "exile-empire.firebaseapp.com",
  projectId: "exile-empire",
  storageBucket: "exile-empire.firebasestorage.app",
  messagingSenderId: "465765692374",
  appId: "1:465765692374:web:c6b984f3ba91ecc22c2a77"
};

let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch(e) { console.log('Firebase init error:', e); }

// ============ ID ИГРОКА ============
window.getPlayerId = function() {
  // Если в Telegram — берём настоящий ID
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
    return 'tg_' + window.Telegram.WebApp.initDataUnsafe.user.id;
  }
  // Если в браузере (для теста) — фиксированный ID
  let testId = localStorage.getItem('test_player_id');
  if (!testId) {
    testId = 'test_user_1';
    localStorage.setItem('test_player_id', testId);
  }
  return testId;
};

// ============ ЗАГРУЗКА ИГРОКА ============
window.loadPlayer = async function() {
  if (!db) return null;
  const playerId = window.getPlayerId();
  try {
    const docRef = doc(db, 'players', playerId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      console.log('Игрок загружен:', data);
      // Применяем данные к UI
      if (window.applyProfileData) window.applyProfileData(data);
      return data;
    } else {
      // Новый игрок
      const newPlayer = {
        name: (window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Адмирал').slice(0, 15),
        avatar: window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url || '',
        soundOn: true,
        musicOn: true,
        soundVol: 100,
        musicVol: 100,
        metal: 500,
        crystal: 200,
        stars: 0,
        rank: 'РЯДОВОЙ',
        createdAt: new Date().toISOString()
      };
      await setDoc(docRef, newPlayer);
      console.log('Создан новый игрок:', newPlayer);
      if (window.applyProfileData) window.applyProfileData(newPlayer);
      return newPlayer;
    }
  } catch(e) {
    console.log('Firebase load error:', e);
    return null;
  }
};

// ============ СОХРАНЕНИЕ ИГРОКА ============
window.savePlayer = async function(data) {
  if (!db) return false;
  const playerId = window.getPlayerId();
  try {
    const docRef = doc(db, 'players', playerId);
    await setDoc(docRef, data, { merge: true });
    console.log('Игрок сохранён:', data);
    return true;
  } catch(e) {
    console.log('Firebase save error:', e);
    return false;
  }
};