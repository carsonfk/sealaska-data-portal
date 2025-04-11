import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import reportWebVitals from './reportWebVitals';

//import 'libs/font-awesome/6.2.0/css/all.min.css'

import LOCATIONS from "./data/locations.geojson";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "temp",
  authDomain: "sealaska-data-portal.firebaseapp.com",
  projectId: "sealaska-data-portal",
  storageBucket: "sealaska-data-portal.appspot.com",
  messagingSenderId: "10640855230",
  appId: "1:10640855230:web:d4177df4457c77b5f08eef",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App locations={LOCATIONS} />
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
