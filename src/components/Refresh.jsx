import React, {useState, useEffect, useRef} from "react";
import { getTimestampAK } from "../functions";

export default function Refresh({onReset, reset, locations}){

    function refreshAnimation() { //animated refresh icon
        let refresh = document.getElementById('refresh');
        let refreshElements = document.getElementById('refresh-container').children;
        refreshElements[0].classList.toggle('hide');
        refreshElements[1].classList.toggle('hide');
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
        if (reset == 0) {
            refreshAnimation();
        }
        let ts = getTimestampAK();
        document.getElementById("last-reset").textContent = "Last Reset: " + ts.time + ", " + ts.date;
    }, [reset]);

    useEffect(() => {
        let refresh = document.getElementById('refresh');
        let refreshElements = document.getElementById('refresh-container').children;
        if (locations) {
            refreshElements[0].classList.toggle('hide');
            refreshElements[1].classList.toggle('hide');
            refresh.classList.remove('no-transition');
            refresh.classList.remove('delay');
        } else {
            refresh.classList.add('delay');
        }
    }, [locations]);

    return (
        <>
            <button id="refresh" className="icon interactive" type='submit' onClick={onSubmit}></button>
            <div id="refresh-container" className="refresh-container">
                <div className="progress-bar-container hide">
                    <div id="progress-bar" className="progress-bar"></div>
                </div>
                <p id="last-reset" className="">Last Reset: N/A</p>
            </div>
        </>
    )

}