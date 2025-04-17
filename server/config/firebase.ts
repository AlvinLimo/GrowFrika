import { initializeApp } from "firebase/app";
import {getDatabase} from "firebase/database";

// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyAxD2Brgo2gNdQq0_KZs6GH3Py6fLxk0vg",
  authDomain: "growfrika.firebaseapp.com",
  projectId: "growfrika",
  storageBucket: "growfrika.firebasestorage.app",
  messagingSenderId: "25229950651",
  appId: "1:25229950651:web:458e51cd30da408236b39e",
  measurementId: "G-VQ9SK4X2KB",
  databaseURL: "https://default.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { app, db };