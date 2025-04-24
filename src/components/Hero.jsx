import React from "react";

//use 2 divs with card structure to emphasize both goals + make wrap for phones/tablets
export default function Hero( {scrollToMap} ) {
    return (
        <div className="heroContent">
            <h1>Sealaska Data Portal
            </h1>
            <p></p>
            <h2>What this tool does:</h2>
            
            <ul>
                <li>Leave the map in View mode to view Southeast Alaska land status and community posts.</li>
                <li>Swap to Contribute mode to post something you found!</li>
            </ul>
        </div>
    )
}

//<button className="heroButton" onClick={scrollToMap}>Get Started</button>