import React, {useState, useEffect, useRef} from "react";
import { getTimestampAK } from "../functions";

export default function Refresh({onReset, reset}){
    
    function refreshAnimation() { //animated refresh icon
        let refresh = document.getElementById('refresh');
        refresh.classList.add('delay');
        refresh.classList.add('rotate');
        setTimeout(() => {
            refresh.classList.add('no-transition');
            setTimeout(() => {
                refresh.classList.remove('rotate');
                setTimeout(() => {
                    refresh.classList.remove('no-transition');
                    refresh.classList.remove('delay');
                }, 100);
            }, 1);
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
    }, [reset])

    return (
        <>
            <button id="refresh" class="icon interactive" type='submit' onClick={onSubmit}></button>
            <p id="reset">Last Reset: N/A</p>
        </>
    )

}