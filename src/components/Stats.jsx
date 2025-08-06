import React, {useState, useEffect, useRef} from "react";

export default function Stats({locations, projects, lands, roads, mode, target}){


    useEffect(() => {
        console.log(mode);
    }, [mode]);

    if (mode === 'view') {
        return (
            <>
            <p>Hello World</p>
            </>
        )
    }

}