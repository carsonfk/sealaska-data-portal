import React from "react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function NavBar() {
    const [isOpen, setIsOpen] = useState(false);

    function toggleMenu() {
        setIsOpen(!isOpen);
    }

    return (
        <nav className={`topnav ${isOpen ? 'responsive' : ''}`}>
            <div className="navbar">
                <img className="logo" src="Sealaska-Logo.svg" alt="Sealaska Logo"/>
                <div className="nav-links">
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/about">About</NavLink>
                </div>
                {/* menu toggle */}
                <label className="menu">
                    <input type='checkbox' name="menu-checkbox" id="menu-checkbox" onClick={toggleMenu}/><label for="menu-checkbox"></label>
                </label>
            </div>
        </nav>
    )
}