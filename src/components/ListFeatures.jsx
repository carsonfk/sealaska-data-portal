import React, { useState, useEffect } from "react";
import $ from 'jquery';
//import { getDatabase, ref, set as firebaseSet, push } from 'firebase/database'
//import FilterForm from './FilterForm'

export default function ListFeatures( {locations, mode} ) {
    const [ratio, setRatio] = useState([0,0]);

    function updateTable() {
        let reviewedCount = 0;
        let unreviewedCount = 0;
        let json = JSON.parse(`[${locations}]`)
        let table = document.getElementsByTagName("table")[0];
        let row, cell1, cell2, cell3;
        if (table.childElementCount !== 0) {
            $("#feature-list tr").remove();
        }
        for (let i = 0; i < json.length; i++) {
            let reviewed = json[i].properties.reviewed == "true";
            if (reviewed) {
                reviewedCount++;
                row = table.insertRow(-1);
                cell1 = row.insertCell(0);
                cell2 = row.insertCell(1);
                cell3 = row.insertCell(2);
                cell1.innerHTML = json[i].properties.timestamp.date;
                cell2.innerHTML = json[i].properties.timestamp.time;
                cell3.innerHTML = json[i].properties.type;
            } else {
                unreviewedCount++;
            }
        }
        setRatio([reviewedCount, unreviewedCount]);
    }

    useEffect(() => {
        if (locations && mode === 'view') {
            updateTable();
        }
    }, [locations, mode]); //fire this whenever the features put into the map change
    
    if (mode === 'view') {
        return (
            <div className="list-location">
                <h2>Locations</h2>
                <p>Reviewed: {ratio[0]} of {ratio[0] + ratio[1]}</p>
                <table id="feature-list"></table>
            </div>
        )
    }
}