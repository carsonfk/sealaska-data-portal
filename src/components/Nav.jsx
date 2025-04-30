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
                {/* logo */}
                <div className="nav-content">
                    <img className="logo" src="assets/Sealaska-Logo.svg" alt="Sealaska Logo"/>
                </div>
                {/* navigate */}
                <div className="nav-content">
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/about">About</NavLink>
                </div>
                {/* sign in + menu toggle */}
                <div className="nav-content">
                    <a>Sign In</a>
                    <label className="menu">
                        <input type='checkbox' name="menu-checkbox" id="menu-checkbox" onClick={toggleMenu}/><label for="menu-checkbox"></label>
                    </label>
                </div>
            </div>
        </nav>
    )
}