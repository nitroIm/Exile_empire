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

let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch(e) {
  console.log('Firebase init error:', e);
}

window.loadPlayer = async function() {
  if (!db) return;
  try {
    const docRef = doc(db, 'players', 'test_user_1');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const d = snap.data();
      document.getElementById('metal').textContent = d.metal || 0;
      document.getElementById('crystal').textContent = d.crystal || 0;
      document.getElementById('stars').textContent = d.stars || 0;
    } else {
      await setDoc(docRef, { metal: 500, crystal: 200, stars: 0 });
      document.getElementById('metal').textContent = 500;
      document.getElementById('crystal').textContent = 200;
      document.getElementById('stars').textContent = 0;
    }
  } catch(e) {
    console.log('Firebase load error:', e);
    document.getElementById('metal').textContent = 'ERR';
  }
};