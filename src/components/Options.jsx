import React, {useState, useEffect, useRef} from "react";

export default function Options({onReset}, timestamp){

    //duplicate function, find a way to write only once
    function getTimestampAK() {
        const timestamp = new Date(); // Current date and time

        // Format the date and time in a specific time zone
        const formattedTimestamp = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Juneau',
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(timestamp);

        let timestampSplit = formattedTimestamp.split(', ');
        return {date: timestampSplit[0], time: timestampSplit[1]};
    }

    function onSubmit() {
        onReset();

        let temp = getTimestampAK();
        document.getElementById("reset").textContent = "Last Reset: " + temp.time + ", " + temp.date;
    }

    return (
        <>
            <button type='submit' onClick={onSubmit}>Refresh!</button>
            <p id="reset">Last Reset: N/A</p>
        </>
    )

}