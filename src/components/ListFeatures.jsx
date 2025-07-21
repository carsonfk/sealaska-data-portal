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
     },
     { "type": "Feature", "properties": {
       "type": "temp",
       "details": "temp",
       "image": "placeholder"},
     "geometry": { "type": "Point", "coordinates": [-134.824398, 56.511916] },
     "id": 3
     },
     { "type": "Feature", "properties": {
       "type": "temp",
       "details": "temp",
       "image": "placeholder"},
     "geometry": { "type": "Point", "coordinates": [-134.824398, 56.511916] },
     "id": 4
     },
     { "type": "Feature", "properties": {
       "type": "temp",
       "details": "temp",
       "image": "placeholder"},
     "geometry": { "type": "Point", "coordinates": [-134.824398, 56.511916] },
     "id": 5
     },
     { "type": "Feature", "properties": {
       "type": "temp",
       "details": "temp",
       "image": "placeholder"},
     "geometry": { "type": "Point", "coordinates": [-134.824398, 56.511916] },
     "id": 6
     },
     { "type": "Feature", "properties": {
       "type": "temp",
       "details": "temp",
       "image": "placeholder"},
     "geometry": { "type": "Point", "coordinates": [-134.824398, 56.511916] },
     "id": 7
     },
     { "type": "Feature", "properties": {
       "type": "temp",
       "details": "temp",
       "image": "placeholder"},
     "geometry": { "type": "Point", "coordinates": [-134.824398, 56.511916] },
     "id": 8
     },
     { "type": "Feature", "properties": {
       "type": "temp",
       "details": "temp",
       "image": "placeholder"},
     "geometry": { "type": "Point", "coordinates": [-134.824398, 56.511916] },
     "id": 9
     },
     { "type": "Feature", "properties": {
       "type": "temp",
       "details": "temp",
       "image": "placeholder"},
     "geometry": { "type": "Point", "coordinates": [-134.824398, 56.511916] },
     "id": 10
     },
     { "type": "Feature", "properties": {
       "type": "temp",
       "details": "temp",
       "image": "placeholder"},
     "geometry": { "type": "Point", "coordinates": [-134.824398, 56.511916] },
     "id": 11
     },
     { "type": "Feature", "properties": {
       "type": "temp",
       "details": "temp",
       "image": "placeholder"},
     "geometry": { "type": "Point", "coordinates": [-134.824398, 56.511916] },
     "id": 12
     },
     { "type": "Feature", "properties": {
       "type": "temp",
       "details": "temp",
       "image": "placeholder"},
     "geometry": { "type": "Point", "coordinates": [-134.824398, 56.511916] },
     "id": 13
     },
     { "type": "Feature", "properties": {
       "type": "temp",
       "details": "temp",
       "image": "placeholder"},
     "geometry": { "type": "Point", "coordinates": [-134.824398, 56.511916] },
     "id": 14
     },
     { "type": "Feature", "properties": {
       "type": "temp",
       "details": "temp",
       "image": "placeholder"},
     "geometry": { "type": "Point", "coordinates": [-134.824398, 56.511916] },
     "id": 15
     }
    ]
    const testjson = JSON.parse(JSON.stringify(test));

    function buildTablePosts() { //populates the table with available data
        let reviewedCount = 0
        let unreviewedCount = 0;
        let json = locations; // revisit
        let title = document.querySelector('#list-posts .list-title');
        let subtitle = document.querySelector('#list-posts .list-subtitle');
        let table = document.querySelector('#list-posts .feature-list');
        let row, cell1, cell2;

        title.innerHTML = 'Posts';
        subtitle.classList.remove('hide');
        if (table.childElementCount !== 0) {
            $("#list-posts .feature-list tr").remove();
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
                        onCenter('posts', parseInt(currentRow.id), 'list'); // sends current highlighted row id
                    } else {
                        onCenter('posts', -1, 'list'); // no row is highlighted
                    }
                });
            } else {
                unreviewedCount++;
            }
        }
        setRatio([reviewedCount, unreviewedCount]);
    }

    function buildTableOther(layerName) {
        let currentLayer = '#list-' + layerName
        let title = document.querySelector(currentLayer + ' .list-title');
        let subtitle = document.querySelector(currentLayer + ' .list-subtitle');
        let table = document.querySelector(currentLayer + ' .feature-list');
        let row, cell1, cell2;

        title.innerHTML = capitalizeFirst(layerName);
        subtitle.classList.add('hide');
        if (table.childElementCount !== 0) {
            $(currentLayer + " .feature-list tr").remove();
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
                for (let child of table.children[0].children) {
                    if (child.classList.contains("hl")) {
                        if (!currentRow.classList.contains("hl")) {
                            child.classList.toggle("hl");
                        }
                    }
                }
                currentRow.classList.toggle("hl");
                if (currentRow.classList.contains("hl")) {
                    onCenter('lands', parseInt(currentRow.id), 'list'); // sends current highlighted row id
                } else {
                    onCenter('lands', -1, 'list'); // no row is highlighted
                }
            });
        }
    }

    function updateTableHL(layerName, id) {
        let tables = document.getElementsByTagName("table");
        for (let i = 0; i < tables.length; i++) {
            if (tables[i].children[0]) {
                //console.log(tables[i].parentElement.classList);
                if (tables[i].parentElement.id === ('list-' + layerName)) {
                    //console.log(tables[i].children[0].children);
                    for (let child of tables[i].children[0].children) {
                        if ((child.classList.contains("hl") && id !== parseInt(child.id)) || (!child.classList.contains("hl") && id === parseInt(child.id))) {
                            child.classList.toggle("hl");
                        }
                    }
                } else {
                    for (let child of tables[i].children[0].children) {
                        child.classList.remove("hl");
                    }
                }
            }
        }
    }

    function swapViewList(e) {
        //console.log(e.target);
        let lists = document.getElementsByClassName('list');
        if (!e.target.parentNode.parentNode.classList.contains('collapsed')) { // if clicked table is expanded
            e.target.parentNode.parentNode.classList.add('collapsed');
            onCenter('none', -1, 'list'); // no row is highlighted
            updateTableHL('none', -1);
        } else { // if clicked table is collapsed
            for (let i = 0; i < lists.length; i++) {
                if (!lists[i].classList.contains('collapsed')) {
                    lists[i].classList.add('collapsed');
                }
            }
            e.target.parentNode.parentNode.classList.remove('collapsed');
            onCenter(e.target.parentNode.parentNode.id.slice(5), -1, 'list'); // no row is highlighted
            updateTableHL(e.target.parentNode.parentNode.id.slice(5), -1);
        }
    }

    function swapViewMap(target) {
        updateTableHL(target[0], target[1]);
        if (target[1] !== -1) {
            let lists = document.getElementsByClassName('list');
            //console.log(lists);
            if (document.getElementById('list-' + target[0]).classList.contains('collapsed')) {
                for (let i = 0; i < lists.length; i++) {
                    if (!lists[i].classList.contains('collapsed')) {
                        lists[i].classList.add('collapsed');
                    }
                    document.getElementById('list-' + target[0]).classList.remove('collapsed');
                }
            }
        }
    }

    useEffect(() => {
        if (locations && mode === 'view') {
            buildTablePosts();
            buildTableOther('projects');
            buildTableOther('lands');
            buildTableOther('roads');
        }
    }, [locations, mode]); //fire this whenever the features put into the map change, map mode changes, or table mode changes

    useEffect(() => {
        if (mode === 'view') {
            //console.log("hi!")
            let listSubgroups = document.getElementsByClassName('subgroup');
            for (let i = 0; i < listSubgroups.length; i++) {
                listSubgroups[i].addEventListener("click", swapViewList);
            }
        }
    }, [mode])
    
    useEffect(() => {
        if (mode === 'view' && (target[2] === 'map' || target[2] === 'reset')) {
            //updateTableHL(target[0], target[1]);
            swapViewMap(target);
        };
    }, [target]);

    useEffect(() => {
        let subtitle = document.querySelector('#subgroup-posts > .list-subtitle');
        subtitle.innerHTML = 'Reviewed: ' + ratio[0] + ' of ' + (ratio[0] + ratio[1]);
    }, [ratio]);

    if (mode === 'view') {
        return (
            <>
            <div id='list-posts' className='list'>
                <div id='subgroup-posts' className='subgroup interactive'>
                    <h3 className='list-title'>Posts</h3>
                    <p className='list-subtitle collapsable'></p>
                </div>
                <table className="feature-list collapsable"></table>
            </div>
            <div id='list-projects' className='list collapsed'>
                <div id='subgroup-projects' className='subgroup interactive'>
                    <h3 className='list-title'>Projects</h3>
                    <p className='list-subtitle collapsable'></p>
                </div>
                <table className="feature-list collapsable"></table>
            </div>
            <div id='list-lands' className='list collapsed'>
                <div id='subgroup-lands' className='subgroup interactive'>
                    <h3 className='list-title'>Lands</h3>
                    <p className='list-subtitle collapsable'></p>
                </div>
                <table className="feature-list collapsable"></table>
            </div>
            <div id='list-roads' className='list collapsed'>
                <div id='subgroup-roads' className='subgroup interactive'>
                    <h3 className='list-title'>Roads</h3>
                    <p className='list-subtitle collapsable'></p>
                </div>
                <table className="feature-list collapsable"></table>
            </div>
            </>
        )
    }
}