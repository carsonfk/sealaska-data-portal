import React, { useState, useEffect, use } from "react";
import $ from 'jquery';
//import { getDatabase, ref, set as firebaseSet, push } from 'firebase/database'
//import FilterForm from './FilterForm'

export default function ListFeatures( {locations, mode, onCenter, target} ) {
    const [ratio, setRatio] = useState([0,0]);

    function buildTable() { //populates the table with available data
        let reviewedCount = 0;
        let unreviewedCount = 0;
        let json = locations; // revisit
        let table = document.getElementsByTagName("table")[0];
        let row, cell1, cell2;
        if (table.childElementCount !== 0) {
            $("#feature-list tr").remove();
        }

        //loops sorted json to construct table
        for (let i = 0; i < json.length; i++) {
            let reviewed = json[i].properties.reviewed == "true";
            if (reviewed) {
                reviewedCount++;
                row = table.insertRow(-1);
                row.id = i;
                cell1 = row.insertCell(0);
                cell2 = row.insertCell(1);
                cell1.innerHTML = json[i].properties.timestamp.time + "<br>" + json[i].properties.timestamp.date;
                cell2.innerHTML = json[i].properties.type;
                row.addEventListener("click", (e) => {
                    let currentRow = e.target.parentNode;
                    for (let child of table.children[0].children) {
                        if (child.classList.contains("hl")) {
                            if (!currentRow.classList.contains("hl")) {
                                child.classList.toggle("hl");
                                console.log("hello");
                            }
                        }
                    }
                    currentRow.classList.toggle("hl");
                    if (currentRow.classList.contains("hl")) {
                        onCenter(currentRow.id); // sends current highlighted row id
                    } else {
                        onCenter(-1); // no row is highlighted
                    }
                });
            } else {
                unreviewedCount++;
            }
        }
        setRatio([reviewedCount, unreviewedCount]);
    }

    function updateTableHL(id) {
        let table = document.getElementsByTagName("table")[0];

        //for (let child of table.children[0].children) {
        //    if (child.classList.contains("hl")) {
        //        child.classList.toggle("hl");
                //if (!currentRow.classList.contains("hl")) {
                //    child.classList.toggle("hl");
                //    console.log("hello");
                //}
        //    }
        //}
    }

    useEffect(() => {
        if (locations && mode === 'view') {
            buildTable();
        }
    }, [locations, mode]); //fire this whenever the features put into the map change or the mode changes
    
    useEffect(() => {
        if (target) {
            updateTableHL(target)
        }
    }, [target])

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