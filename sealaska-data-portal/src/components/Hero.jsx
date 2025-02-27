import React from "react";

//use 2 divs with card structure to emphasize both goals + make wrap for phones/tablets
export default function Hero( {scrollToMap} ) {
    return (
        <div className="heroContainer">
            <div className="heroContent">
                <h1>Sealaska Data Portal
                </h1>
                <p></p>
                <h2>What this tool does:</h2>
                
                <ul>
                    <li>Leave the map in View mode and view the updated status of Sealaska lands</li>
                    <li>Swap over to Contribute mode to let us know about something you found</li>
                </ul>
                <button className="heroButton" onClick={scrollToMap}>Get Started</button>
            </div>
            <img className="heroImage" src="southeast.jpg" alt="A bear and cub walking in the Tongass National Forest region of Southeast Alaska"/>
        </div>
    )
}