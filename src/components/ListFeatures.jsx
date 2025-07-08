import React, { useState, useEffect, use } from "react";
import $ from 'jquery';
//import { getDatabase, ref, set as firebaseSet, push } from 'firebase/database'
//import FilterForm from './FilterForm'

export default function ListFeatures( {locations, mode, onCenter, target, tableMode} ) {
    const [ratio, setRatio] = useState([0,0]);

    let test = [
     { "type": "Feature", "properties": {
       "type": "temp",
       "details": "temp",
       "image": "placeholder"},
     "geometry": { "type": "Point", "coordinates": [-134.979453, 57.035768] },
     "id": 0
     },
     { "type": "Feature", "properties": {
       "type": "temp",
       "details": "temp",
       "image": "placeholder"},
     "geometry": { "type": "Point", "coordinates": [-133.149579, 56.130115] },
     "id": 1
     },
     { "type": "Feature", "properties": {
       "type": "temp",
       "details": "temp",
       "image": "placeholder"},
     "geometry": { "type": "Point", "coordinates": [-134.824398, 56.511916] },
     "id": 2
     }
    ]
    const testjson = JSON.parse(JSON.stringify(test));

    function buildTablePosts() { //populates the table with available data
        let reviewedCount = 0
        let unreviewedCount = 0;
        let json = locations; // revisit
        let title = document.getElementById('list-title');
        let subtitle = document.getElementById('list-subtitle');
        let table = document.getElementById('feature-list');
        let row, cell1, cell2;

        title.innerHTML = 'Posts';
        subtitle.classList.remove('hide');
        if (table.childElementCount !== 0) {
            $("#feature-list tr").remove();
        }

        //loops sorted json to construct table
        for (let i = 0; i < json.length; i++) {
            let reviewed = json[i].properties.reviewed === "true";
            if (reviewed) {
                reviewedCount++;
                row = table.insertRow(-1);
                row.id = json[i].id;
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
                            }
                        }
                    }
                    currentRow.classList.toggle("hl");
                    if (currentRow.classList.contains("hl")) {
                        onCenter(parseInt(currentRow.id)); // sends current highlighted row id
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

    function buildTableOther(layerName) {
        let title = document.getElementById('list-title');
        let subtitle = document.getElementById('list-subtitle');
        let table = document.getElementsByTagName("table")[0];
        let row, cell1, cell2;

        title.innerHTML = layerName;
        subtitle.classList.add('hide');
        if (table.childElementCount !== 0) {
            $("#feature-list tr").remove();
        }

        //loops sorted json to construct table
        for (let i = 0; i < testjson.length; i++) {
            row = table.insertRow(-1);
            row.id = testjson[i].id;
            cell1 = row.insertCell(0);
            cell2 = row.insertCell(1);
            cell1.innerHTML = testjson[i].properties.type;
            cell2.innerHTML = testjson[i].properties.details;
            row.addEventListener("click", (e) => {
                let currentRow = e.target.parentNode;
                currentRow.classList.toggle("hl");
                if (currentRow.classList.contains("hl")) {
                    //onCenter(parseInt(currentRow.id)); // sends current highlighted row id
                } else {
                    //onCenter(-1); // no row is highlighted
                }
            });
        }
    }

    function updateTableHL(id) {
        let table = document.getElementsByTagName("table")[0];
        if (table.children[0]) {
            for (let child of table.children[0].children) {
                if (child.classList.contains("hl") && id !== parseInt(child.id) || !child.classList.contains("hl") && id === parseInt(child.id)) {
                    child.classList.toggle("hl");
                }
            }
        }
    }

    //function buildLayerMenu() {
    //    let menuContainer = document.getElementById('table-layers');
    //}

    useEffect(() => {


    }, [tableMode]); //fire this when table mode changes

    useEffect(() => {
        if (locations && mode === 'view') {
            if (!tableMode) { //for testing only
                buildTablePosts();
            } else {
                buildTableOther('lands');
            };
        }
    }, [locations, mode, tableMode]); //fire this whenever the features put into the map change, map mode changes, or table mode changes
    
    useEffect(() => {
        if (mode === 'view' && (target[1] === 'map' || target[1] === 'reset')) {
            updateTableHL(target[0]);
        };
    }, [target]);

    useEffect(() => {
        let subtitle = document.getElementById('list-subtitle');
        subtitle.innerHTML = 'Reviewed: ' + ratio[0] + ' of ' + (ratio[0] + ratio[1]);
    }, [ratio])

    if (mode === 'view') {
        return (
            <>
            <div className="list-location">
                <h3 id='list-title'>Loading...</h3>
                <p id='list-subtitle' className='hide'></p>
                <table id="feature-list"></table>
            </div>
            </>
        )
    }
}