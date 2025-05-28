import React, {useState, useEffect, useRef} from "react";
import getTimestampAK from "../functions";

export default function Options({onReset, reset}){

    function onSubmit() {
        onReset();
    }

    useEffect(() => {
        let temp = getTimestampAK();
        document.getElementById("reset").textContent = "Last Reset: " + temp.time + ", " + temp.date;
    }, [reset])

    return (
        <>
        <div>
            <button id="refresh"type='submit' onClick={onSubmit}>Refresh!</button>
            <button id="refresh-small" type='submit' onClick={onSubmit}></button>
            <p id="reset">Last Reset: N/A</p>
        </div>
        </>
    )

}