import { useState, useEffect } from "react";
import { useQueryParams, capitalizeFirst } from "../functions";
import $ from 'jquery';
//import { getDatabase, ref, set as firebaseSet, push } from 'firebase/database'
//import FilterForm from './FilterForm'

export default function ListFeatures( {locations, mode, target, onCenter} ) {
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
        let title = document.querySelector('#list-locations > .list-title');
        let subtitle = document.querySelector('#list-locations > .list-subtitle');
        let table = document.querySelector('#list-locations > .feature-list');
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
        console.log(layerName);
        let currentLayer = '#list-' + layerName
        let title = document.querySelector(currentLayer + ' > .list-title');
        let subtitle = document.querySelector(currentLayer + ' > .list-subtitle');
        let table = document.querySelector(currentLayer + ' > .feature-list');
        let row, cell1, cell2;

        title.innerHTML = capitalizeFirst(layerName);
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

    }, []);

    useEffect(() => {
        if (locations && mode === 'view') {
            buildTablePosts();
            buildTableOther('projects');
            buildTableOther('lands');
            buildTableOther('roads');
        }
    }, [locations, mode]); //fire this whenever the features put into the map change, map mode changes, or table mode changes
    
    useEffect(() => {
        if (mode === 'view' && (target[1] === 'map' || target[1] === 'reset')) {
            updateTableHL(target[0]);
        };
    }, [target]);

    useEffect(() => {
        let subtitle = document.querySelector('#list-locations > .list-subtitle');
        subtitle.innerHTML = 'Reviewed: ' + ratio[0] + ' of ' + (ratio[0] + ratio[1]);
    }, [ratio])

    if (mode === 'view') {
        return (
            <>
            <div id='list-locations' className='list'>
                <h3 className='list-title'>Posts</h3>
                <p className='list-subtitle'></p>
                <table className="feature-list"></table>
            </div>
            <div id='list-projects' className='list'>
                <h3 className='list-title'>Projects</h3>
                <p className='list-subtitle'></p>
                <table className="feature-list"></table>
            </div>
            <div id='list-lands' className='list'>
                <h3 className='list-title'>Lands</h3>
                <p className='list-subtitle'></p>
                <table className="feature-list"></table>
            </div>
            <div id='list-roads' className='list'>
                <h3 className='list-title'>Roads</h3>
                <p className='list-subtitle'></p>
                <table className="feature-list"></table>
            </div>
            </>
        )
    }
}