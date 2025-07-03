import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import reportWebVitals from './reportWebVitals';

//import 'libs/font-awesome/6.2.0/css/all.min.css'

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// AGOL API stuff
import { createApiKey } from "@esri/arcgis-rest-developer-credentials";
import { ArcGISIdentityManager } from "@esri/arcgis-rest-request";
import { moveItem, getSelf } from "@esri/arcgis-rest-portal";


const username = process.env.REACT_APP_ARCGIS_USERNAME;
const password = process.env.REACT_APP_ARCGIS_PASSWORD;
const portalURL = process.env.REACT_APP_ARCGIS_PORTAL_URL;

console.log(portalURL);

//const authentication = await ArcGISIdentityManager.signIn({
//  username: username,
//  password: password,
//  portal: portalURL
//});

//const orgUrl = await getSelf({ authentication: authentication });

//const newKey = await createApiKey({
//	title: `API key ${Math.floor(Date.now() / 1000)}`,
//	description: "API Key generated with ArcGIS REST JS with spatial analysis and basemap privileges",
//	tags: ["api key", "basemaps", "spatial analysis", "authentication"],

//  privileges: [
//    "premium:user:spatialanalysis",
//    "premium:user:basemaps" // Not available for ArcGIS Enterprise
//  ],
	  
//	generateToken1: true,

//  apiToken1ExpirationDate: new Date(Date.now() + 1000 * 60 * 60 * 0.5), // 1000ms * 60s * 60min * 24h * 30days

//	authentication: authentication
//});

//console.log(`\nNew API key created: ${newKey.accessToken1}`);
//console.log(`\nView item: https://${orgUrl.urlKey}.maps.arcgis.com/home/item.html?id=${newKey.itemId}`);

//const moved = await moveItem({
//  itemId: newKey.itemId,
//  folderId: "YOUR_FOLDER_ID",
//  authentication: authentication
//});

//console.log(`\nItem moved ${JSON.stringify(moved)}`);


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
