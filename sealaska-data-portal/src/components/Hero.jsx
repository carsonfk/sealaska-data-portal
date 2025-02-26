import React from "react";

export default function Hero( {scrollToMap} ) {
    return (
        <div className="heroContainer">
            <div className="heroContent">
                <h1>Welcome to Sealaska's New Data Portal
                </h1>
                <p></p>
                <h2>What this tool does:</h2>
                
                <ul>
                    <li>Leave the map in View mode and view the updated status of Sealaska lands</li>
                    <li>Swap over to contribute mode to let us know about something you found</li>
                </ul>
                <button className="heroButton" onClick={scrollToMap}>Get Started</button>
            </div>
            <img className="heroImage" src="southeast.png" alt="temp"/>
        </div>
    )
}