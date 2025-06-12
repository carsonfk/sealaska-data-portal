import React, {useState, useEffect, useRef} from "react";
import { getTimestampAK } from "../functions";

export default function Options({onReset, reset}){
    
    function onSubmit() {
        onReset();
        let testing = document.getElementById('refresh');
        testing.classList.add('delay');
        testing.classList.add('rotate');
        setTimeout(() => {
            testing.classList.add('no-transition');
            setTimeout(() => {
                testing.classList.remove('rotate');
                setTimeout(() => {
                    testing.classList.remove('no-transition');
                    testing.classList.remove('delay');
                }, 100);
            }, 1);
        }, 200);
    }

    useEffect(() => {
        let tsAK = getTimestampAK();
        document.getElementById("reset").textContent = "Last Reset: " + tsAK.time + ", " + tsAK.date;
    }, [reset])

    return (
        <>
        <div>
            <button id="refresh" class="icon interactive" type='submit' onClick={onSubmit}></button>
            <p id="reset">Last Reset: N/A</p>
        </div>
        </>
    )

}