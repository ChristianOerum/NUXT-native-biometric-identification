import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyDfvFGzutEmdMUN9bZotOljYTjGN3H0T9g",
    authDomain: "bubbles-main-db.firebaseapp.com",
    projectId: "bubbles-main-db",
    storageBucket: "bubbles-main-db.appspot.com",
    messagingSenderId: "679373330831",
    appId: "1:679373330831:web:cbfcb66fe56c3c49b713fa"
  };

const firebase = initializeApp(firebaseConfig);

const db = getFirestore(firebase);

export {
  db
};