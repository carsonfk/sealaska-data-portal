import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import reportWebVitals from './reportWebVitals';

//import 'libs/font-awesome/6.2.0/css/all.min.css'

//import taxBlocks from "./data/taxblocks.geojson";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqqzFtIBrtnZIMhUonX1wovD5ugYbQ5U0",
  authDomain: "sealaska-data-portal.firebaseapp.com",
  projectId: "sealaska-data-portal",
  storageBucket: "sealaska-data-portal.firebasestorage.app",
  messagingSenderId: "322330606070",
  appId: "1:322330606070:web:41393bb74d9fc5a8306fd7",
  measurementId: "G-9TWKWJBQ98"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
