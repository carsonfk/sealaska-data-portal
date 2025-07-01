import React, {useState, useEffect, useRef} from "react";
import { getTimestampAK } from "../functions";

export default function Refresh({onReset, reset, locations}){

    function refreshAnimation() { //animated refresh icon
        let refresh = document.getElementById('refresh');
        refresh.classList.add('delay');
        refresh.classList.add('rotate');
        setTimeout(() => {
            refresh.classList.add('no-transition');
            refresh.classList.remove('rotate');
        }, 200);
    }

    function onSubmit() { //manual refresh
        onReset();
        refreshAnimation();
    }

    useEffect(() => {
        refreshAnimation();
        let ts = getTimestampAK();
        document.getElementById("reset").textContent = "Last Reset: " + ts.time + ", " + ts.date;
    }, [reset]);

    useEffect(() => {
        let refresh = document.getElementById('refresh');
        if (locations) {
            refresh.classList.remove('no-transition');
            refresh.classList.remove('delay');
        } else {
            refresh.classList.add('delay');
        }
    }, [locations]);

    return (
        <>
            <button id="refresh" class="icon interactive" type='submit' onClick={onSubmit}></button>
            <p id="reset">Last Reset: N/A</p>
        </>
    )

}