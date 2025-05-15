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
                    <a className="nav-item" href="https://sealaska.com/" title="Sealaska">
                        <img className="logo-small" alt="Icon" src="https://sealaska.com/wp-content/themes/sealaska-redesign/resources/images/Icon.svg"></img>
                    </a>
                    <a className="nav-item" href="https://sealaska.com/" title="Sealaska">
                        <img className="logo" alt="Sealaska" src="https://sealaska.com/wp-content/uploads/2024/02/Sealaska-Logo-CMYK_Cream.svg"></img>
                    </a>
                </div>
                {/* navigate */}
                <div className="nav-content">
                    <NavLink className="nav-link" to="/">Home</NavLink>
                    <NavLink className="nav-link" to="/about">About</NavLink>
                </div>
                {/* sign in + menu toggle */}
                <div className="nav-content">
                    <a className="nav-link">Sign In</a>
                    <label className="menu">
                        <input type='checkbox' name="menu-checkbox" id="menu-checkbox" onClick={toggleMenu}/><label for="menu-checkbox"></label>
                    </label>
                </div>
            </div>
        </nav>
    )
}