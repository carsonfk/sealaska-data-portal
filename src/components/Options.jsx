import React, {useState, useEffect, useRef} from "react";
import getTimestampAK from "../functions";

export default function Options({onReset, reset}){
    
    function updateSize() {
        document.getElementById('h').textContent = window.innerHeight;
        document.getElementById('w').textContent = window.innerWidth;
    }
    window.addEventListener("resize", updateSize);

    function onSubmit() {
        onReset();
    }

    useEffect(() => {
        let temp = getTimestampAK();
        document.getElementById("reset").textContent = "Last Reset: " + temp.time + ", " + temp.date;
    }, [reset])

    return (
        <>
            <button type='submit' onClick={onSubmit}>Refresh!</button>
            <p id="reset">Last Reset: N/A</p>
            <p id="h"></p>
            <p id="w"></p>
        </>
    )

}