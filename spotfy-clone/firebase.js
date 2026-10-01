// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAyCI40BMqpk2uAKtbua36oG2-_Rh2iQGk",
  authDomain: "clone-spotfy-73feb.firebaseapp.com",
  databaseURL: "https://clone-spotfy-73feb-default-rtdb.firebaseio.com",
  projectId: "clone-spotfy-73feb",
  storageBucket: "clone-spotfy-73feb.firebasestorage.app",
  messagingSenderId: "711133521362",
  appId: "1:711133521362:web:59517b66dcfc98e146140b",
  measurementId: "G-JDCC215V98"
};

// Inicialização do Firebase
firebase.initializeApp(firebaseConfig);

// Apenas o Realtime Database (Sem Storage)
const database = firebase.database();