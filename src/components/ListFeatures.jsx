import React, { useState, useEffect } from "react";
import $ from 'jquery';
//import { getDatabase, ref, set as firebaseSet, push } from 'firebase/database'
//import FilterForm from './FilterForm'

export default function ListFeatures( {locations, mode} ) {
    
    function updateTable() {
        let temp = JSON.parse(`[${locations}]`)
        let table = document.getElementsByTagName("table")[0];
        let row, cell1, cell2, cell3, cell4;
        if (table.childElementCount !== 0) {
            $("#feature-list tr").remove();
        }
        for (let i = 0; i < temp.length; i++) {
            let reviewed = temp[i].properties.reviewed == "true";
            if (reviewed) {
                row = table.insertRow(-1);
                cell1 = row.insertCell(0);
                cell2 = row.insertCell(1);
                cell3 = row.insertCell(2);
                cell4 = row.insertCell(3);
                cell1.innerHTML = temp[i].properties.timestamp.date;
                cell2.innerHTML = temp[i].properties.timestamp.time;
                cell3.innerHTML = temp[i].properties.type;
                cell4.innerHTML = temp[i].properties.details;
            }
        }
    }

    useEffect(() => {
        if (locations && mode === 'view') {
            updateTable();
        }
    }, [locations]); //fire this whenever the features put into the map change

    useEffect(() => {
        if (locations && mode === 'view') {
            updateTable();
        }
    }, [mode]); //fire this whenever the map mode is changed
    
    if (mode === 'view') {
        return (
            <div className="table">
                <h2>Table</h2>
                <button>Filter by type</button>
                <table id="feature-list"></table>
            </div>
        )
    }
}