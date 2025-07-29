import { useState, useEffect } from "react";
import { useQueryParams, capitalizeFirst } from "../functions";
import $ from 'jquery';
//import { getDatabase, ref, set as firebaseSet, push } from 'firebase/database'
//import FilterForm from './FilterForm'

export default function ListFeatures( {locations, projects, lands, roads, mode, target, onCenter} ) {
    const [ratio, setRatio] = useState([0,0]);

    function buildTable(layerName, data) { // adds data to a specific table
        console.log(data);
        let currentLayer = '#list-' + layerName
        let title = document.querySelector(currentLayer + ' .list-title');
        let table = document.querySelector(currentLayer + ' .feature-list');

        title.innerHTML = capitalizeFirst(layerName);
        if (table.childElementCount !== 0) {
            $(currentLayer + " .feature-list tr").remove();
        }

        //loops sorted json to construct table
        if (layerName === 'posts') {
            let reviewedCount = 0
            let unreviewedCount = 0;
            for (let i = 0; i < data.length; i++) {
                let reviewed = data[i].properties.reviewed === "true";
                if (reviewed) {
                    reviewedCount++;
                    buildTableRow(layerName, table, data[i]);
                } else {
                    unreviewedCount++;
                }
            }
            setRatio([reviewedCount, unreviewedCount]);
        } else if (layerName === 'lands') {
            for (let i = 0; i < data.length; i++) {
                let sealaska = data[i].properties.SurfFull === "Sealaska";
                if (sealaska) {
                    buildTableRow(layerName, table, data[i]);
                }
            }
        } else {
            for (let i = 0; i < data.length; i++) {
                buildTableRow(layerName, table, data[i]);
            }
        }
    }

    function buildTableRow(layerName, table, rowData) { // builds one table tow
        let row = table.insertRow(-1);
        row.id = rowData.id;
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        if (layerName === 'posts') {
            cell1.innerHTML = rowData.properties.timestamp.time + "<br>" + rowData.properties.timestamp.date;
            cell2.innerHTML = rowData.properties.type;
        } else if (layerName === 'projects') {
                
        } else if (layerName === 'lands') {
            cell1.innerHTML = rowData.properties.SurfFull;
            cell2.innerHTML = rowData.properties.TaxName;
            //let cell3 = row.insertCell(1);
            //cell3.innerHTML = rowData.properties.TAX_NAME;
        } else if (layerName === 'roads') {

        }
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
                onCenter(layerName, parseInt(currentRow.id), 'list'); // sends current highlighted row id
            } else {
                onCenter(layerName, -1, 'list'); // no row is highlighted
            }
        });
    }

    function updateTableHL(layerName, id) {
        let tables = document.getElementsByTagName("table");
        for (let i = 0; i < tables.length; i++) {
            if (tables[i].children[0]) {
                if (tables[i].parentElement.id === ('list-' + layerName)) {
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
            buildTable('posts', locations);
        }
    }, [locations, mode]); //fire this whenever the post features put into the map change or map mode changes

    //useEffect(() => {
    //    if (projects && mode === 'view') {
    //        buildTable('projects', projects);
    //    }
    //}, [projects, mode]); //fire this whenever the project features put into the map change or map mode changes

    useEffect(() => {
        if (lands && mode === 'view') {
            buildTable('lands', lands);
        }
    }, [lands, mode]); //fire this whenever the lands features put into the map change or map mode changes

    //useEffect(() => {
    //    if (roads && mode === 'view') {
    //        buildTable('roads', roads);
    //    }
    //}, [roads, mode]); //fire this whenever the roads features put into the map change or map mode changes


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
            swapViewMap(target); //figure out why non-post table hl doesn't refresh on refresh
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