// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8HFfn83FJoqspWdh6ZagLdRhTEell-Hc",
  authDomain: "axn-web-cb7d4.firebaseapp.com",
  databaseURL: "https://axn-web-cb7d4-default-rtdb.firebaseio.com",
  projectId: "axn-web-cb7d4",
  storageBucket: "axn-web-cb7d4.firebasestorage.app",
  messagingSenderId: "816200746521",
  appId: "1:816200746521:web:4a20455ba65f3e73334c88",
  measurementId: "G-G2P307D54Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
export { database, firebaseConfig };