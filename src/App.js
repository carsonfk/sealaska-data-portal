import React from "react";
import NavBar from "./components/Nav";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import About from "./pages/About";
import Home from "./pages/Home";

export function App(props) {
  return (
    <>
    <NavBar />
    <Routes>
      <Route path="/about" element={<About />} />
      <Route path="*" element={<Home />} />
    </Routes>
    </>
  );
}

export default App;
