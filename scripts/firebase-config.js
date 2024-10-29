// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfLu4gaugOzFPFYIzt99xLhEgzoLJaV3s",
  authDomain: "ilumina-financas-app.firebaseapp.com",
  projectId: "ilumina-financas-app",
  storageBucket: "ilumina-financas-app.appspot.com",
  messagingSenderId: "576443325481",
  appId: "1:576443325481:web:b7e307eabfc9f1dd221038"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export {auth, db};
