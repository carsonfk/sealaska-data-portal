import React, {useState, useEffect, useRef} from "react";



export default function Options({onReset}){

    function onSubmit() {
        onReset();
    }

    return (
        <>
        <button type='submit' onClick={onSubmit}>Refresh!</button>
        </>
    )

}