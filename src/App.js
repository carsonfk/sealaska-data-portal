import React from "react";
import NavBar from "./components/Nav";
import { Route, Routes } from 'react-router-dom';
import About from "./pages/About";
import Home from "./pages/Home";
import Contribute from "./pages/Contribute";

export function App(props) {
  return (
    <>
		<NavBar />
		<Routes>
			<Route path="/about" element={<About />} />
			<Route path="*" element={<Home locations={props.locations}/>} />
            <Route path="/contribute" element={<Contribute locations={props.locations}/>} />
		</Routes>
    </>
  );
}

export default App;