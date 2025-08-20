import { useState, useEffect } from "react";
import { useQueryParams, capitalizeFirst, formatNumber } from "../functions";
import $ from 'jquery';
//import { getDatabase, ref, set as firebaseSet, push } from 'firebase/database'
//import FilterForm from './FilterForm'

export default function ListFeatures( {locations, projects, lands, roads, mode, target, layerVis, onCenter} ) {
    const { getParam, setParam } = useQueryParams();
    const [ratio, setRatio] = useState([0,0]);
    const [sort, setSort] = useState('newest');

    const layerList = ['posts', 'projects', 'lands', 'roads'];

    //limits provided JSON to prioritized info for list
    function handleData(data, layerName) {
        let returnArr = []
        if (layerName === 'posts') {
            let reviewedCount = 0;
            let unreviewedCount = 0;
            for (let i = 0; i < data.length; i++) {
                let reviewed = data[i].properties.reviewed === "true";
                if (reviewed) {
                    reviewedCount++;
                    returnArr.push(data[i]);
                } else {
                    unreviewedCount++;
                }
            }
            setRatio([reviewedCount, unreviewedCount]);
        } else if (layerName === 'lands') {
            for (let i = 0; i < data.length; i++) {
                let sealaska = data[i].properties.SurfFull === "Sealaska";
                if (sealaska) {
                    returnArr.push(data[i]);
                }
            }
        } else {
            for (let i = 0; i < data.length; i++) {
                returnArr.push(data[i])
            }
        }
        return returnArr;
    }

    //sorts provided JSON using provided sort
	function sortData(data, sort) {
        //console.log('hi!')
		let dataSort = [];
        if (sort === 'newest') {
			for (let i = data.length - 1; i > -1; i--) {
				dataSort.push(data[i]);
			}
		} else if (sort === 'oldest') {
			
        } else if (sort === 'name') {
			let dataTemp = data;
			for (let i = 1; i < dataTemp.length; i++) {
				let key = dataTemp[i];
				let j = i - 1;
				while (j >= 0 && dataTemp[j].properties.TaxName.localeCompare(key.properties.TaxName.charAt(0)) === 1) {
					dataTemp[j + 1] = dataTemp[j];
					j--;
				}
				dataTemp[j + 1] = key;
			}
            dataSort = dataTemp;
		} else if (sort === 'name-reverse') {
	
		}
		return dataSort;
	}

    function tabInit(layerName, tabContainer) { // builds a single tab button (consider combining with tableInit)
        let tab = document.createElement('div');
        tab.id = 'tab-' + layerName;
        tab.className = 'tab interactive-2';
        tab.innerHTML = capitalizeFirst(layerName);

        if (getParam(layerName)) {
            tab.classList.add('hide');
        } else {
            if (getParam('targetLayer')) {
                if (layerName === 'posts') {
                    tab.classList.add('behind');
                } else {
                    if (getParam('targetLayer') !== layerName) {
                        tab.classList.add('behind');
                    }
                }
            } else {
                if (layerName !== 'posts') {
                    tab.classList.add('behind');
                }
            }
        }

        tab.addEventListener('click', () => {
            if (tab.classList.contains('behind')) {
                swapViewTab(layerName);
            }
        });
        tabContainer.appendChild(tab);
    }

    function tableInit(layerName, listContainer) { // prepares a single table for data (consider combining with tabInit)
        let testDiv = document.createElement('div');
        testDiv.id = 'subgroup-' + layerName;
        testDiv.className = 'subgroup';
        let title = document.createElement('h3');
        title.className = 'list-title';
        title.innerHTML = capitalizeFirst(layerName);
        let testP = document.createElement('p');
        testP.className = 'list-subtitle';
        let table = document.createElement('table');
        table.id = 'table-' + layerName;
        table.className = 'feature-list';

        testDiv.appendChild(title);
        testDiv.appendChild(testP);
        //testDiv.addEventListener("click", swapViewList);
        let containerDiv = document.createElement('div');
        containerDiv.id = 'list-' + layerName;
        containerDiv.className = 'list'

        if (getParam(layerName)) {
            containerDiv.classList.add('hide');
        } else {
            if (getParam('targetLayer')) {
                if (layerName === 'posts') {
                    containerDiv.classList.add('hide')
                } else {
                    if (getParam('targetLayer') !== layerName) {
                        containerDiv.classList.add('hide');
                    }
                }
            } else {
                if (layerName !== 'posts') {
                    containerDiv.classList.add('hide');
                }
            }
        }

        containerDiv.appendChild(testDiv);
        containerDiv.appendChild(table);
        listContainer.appendChild(containerDiv);
    }

    function buildTableRow(rowData, layerName, table) { // builds one table row
        let row = table.insertRow(-1);
        row.id = rowData.id;
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        if (layerName === 'posts') {
            cell1.innerHTML = rowData.properties.timestamp.time + "<br>" + rowData.properties.timestamp.date;
            cell2.innerHTML = rowData.properties.type;
        } else if (layerName === 'projects') {
                
        } else if (layerName === 'lands') {
            cell1.innerHTML = rowData.properties.TaxName;
            cell2.innerHTML = formatNumber(rowData.properties.AreaAcres, 2) + ' acres';
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
                onCenter({name: layerName, id: parseInt(currentRow.id), fly: true}); // sends current highlighted row id
            } else {
                onCenter({name: layerName, id: -1, fly: false}); // no row is highlighted
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

    function swapView(target) {
        //console.log('swap!')
        updateTableHL(target.name, target.id);
        if (target.id !== -1) {
            let tabs = document.getElementsByClassName('tab');
            if (document.getElementById('tab-' + target.name).classList.contains('behind')) {
                for (let i = 0; i < tabs.length; i++) {
                    if (!tabs[i].classList.contains('behind')) {
                        tabs[i].classList.add('behind');
                    }
                    document.getElementById('tab-' + target.name).classList.remove('behind');
                }
            }

            let lists = document.getElementsByClassName('list');
            if (document.getElementById('list-' + target.name).classList.contains('hide')) {
                for (let i = 0; i < lists.length; i++) {
                    if (!lists[i].classList.contains('hide')) {
                        lists[i].classList.add('hide');
                    }
                    document.getElementById('list-' + target.name).classList.remove('hide');
                }
            }
        }
    }

    function swapViewTab(layerName) {
        //console.log('tab!')
        let tabs = document.getElementsByClassName('tab');
        for (let i = 0; i < tabs.length; i++) {
            if (!tabs[i].classList.contains('behind')) {
                tabs[i].classList.add('behind');
            }
        }
        document.getElementById('tab-' + layerName).classList.remove('behind');

        let lists = document.getElementsByClassName('list');
        for (let i = 0; i < lists.length; i++) {
            if (!lists[i].classList.contains('hide')) {
                lists[i].classList.add('hide');
            }
        }
        document.getElementById('list-' + layerName).classList.remove('hide');
        onCenter({name: layerName, id: -1, fly: false}); // no row is highlighted
        updateTableHL(layerName, -1);

        //console.log(layerName)
    }

    function swapViewMenu(layerName) {
        let visibleTabs = document.querySelectorAll('#tab-container :not(.hide)');
        let targetTab = document.getElementById('tab-' + layerName);
        if (visibleTabs.length === 0) { // adding first tab
            targetTab.classList.remove('behind');
            targetTab.classList.remove('hide');
            document.getElementById('list-' + layerName).classList.remove('hide');
            onCenter({name: layerName, id: -1, fly: false});
        } else if (visibleTabs.length === 1 && !targetTab.classList.contains('hide')) { // removing last tab
            targetTab.classList.add('behind');
            targetTab.classList.add('hide');
            document.getElementById('list-' + layerName).classList.add('hide');
            onCenter({name: 'none', id: -1, fly: false});   
        } else { // adding or removing any other tab
            //targetTab.classList.add('behind');
            if (!targetTab.classList.contains('hide')) {
                for (let j = 0; j < visibleTabs.length; j++) {
                    if (visibleTabs[j] === targetTab) {
                        if (!targetTab.classList.contains('behind')) {
                            let targetTabNew;
                            if (j === 0) {
                                targetTabNew = visibleTabs[j + 1];
                            } else {
                                targetTabNew = visibleTabs[j - 1];
                            }
                            let layerNameNew = targetTabNew.id.substring(4);
                            document.getElementById('list-' + layerName).classList.add('hide');
                            document.getElementById('list-' + layerNameNew).classList.remove('hide');
                            targetTabNew.classList.remove('behind');
                            onCenter({name: layerNameNew, id: -1, fly: false});
                            updateTableHL(layerNameNew, -1);
                        }
                    }
                }
            } else {
                targetTab.classList.add('behind');
            }
            targetTab.classList.toggle('hide');
        }
    }

    function tableLoad(data, layerName, sort) {
        let limit = handleData(data, layerName);
        let sorted = sortData(limit, sort);
        let table = document.getElementById('table-' + layerName); 

        if (table.childElementCount !== 0) {
            $('#table-' + layerName + " tr").remove();
        }

        //loops limited and sorted json to construct table
        for (let i = 0; i < sorted.length; i++) {
            buildTableRow(sorted[i], layerName, table);
        }
    }

    useEffect(() => {
        //onCenter({name: getParam('targetLayer'), id: -1, fly: false});
    }, [])

    useEffect(() => {
        if (mode === 'view') {
            let tabContainer = document.getElementById('tab-container');
            if (tabContainer.childElementCount !== 0) {
                $('#tab-container > div').remove();
            }

            let listContainer = document.getElementById('list-container');
            if (listContainer.childElementCount !== 0) {
                $('#list-container > div').remove();
            }

            for (let i = 0; i < layerList.length; i++) { //initializes associated tabs and lists simultaneously
                if (i === 0) {
                    tabInit(layerList[i], tabContainer);
                } else {
                    setTimeout(() => {
                        tabInit(layerList[i], tabContainer);
                    }, i * 300);
                }
                tableInit(layerList[i], listContainer);
            }
        }
    }, [mode])

    useEffect(() => {
        if (locations && mode === 'view') {
            tableLoad(locations, 'posts', 'newest')
        }
    }, [locations, mode]); //fire this whenever the post features put into the map change or map mode changes

    //useEffect(() => {
    //    if (projects && mode === 'view') {
    //        buildTable('projects', projects);
    //    }
    //}, [projects, mode]); //fire this whenever the project features put into the map change or map mode changes

    useEffect(() => {
        if (lands && mode === 'view') {
            tableLoad(lands, 'lands', 'name')
        }
    }, [lands, mode]); //fire this whenever the lands features put into the map change or map mode changes

    //useEffect(() => {
    //    if (roads && mode === 'view') {
    //        buildTable('roads', roads);
    //    }
    //}, [roads, mode]); //fire this whenever the roads features put into the map change or map mode changes

    useEffect(() => {
        if (mode === 'view' && target) {
            //console.log(target);
            swapView(target); //figure out why non-post table hl doesn't refresh on refresh
        };
    }, [target]);

    useEffect(() => {
        //console.log(ratio);
        let subtitle = document.querySelector('#subgroup-posts > .list-subtitle');
        subtitle.innerHTML = 'Reviewed: ' + ratio[0] + ' of ' + (ratio[0] + ratio[1]);
    }, [ratio]);

    useEffect(() => {
        if (layerVis) {
            //console.log('layerVis')
            let tabs = document.getElementById('tab-container').children;
            for (let i = 0; i < tabs.length; i++) {
                if (layerVis[layerList[i]] !== !tabs[i].classList.contains('hide')) {
                    swapViewMenu(layerList[i]);
                }
            }
        }
    }, [layerVis]);

    if (mode === 'view') {
        return (
            <>
            <br></br>
            <div id='layers-container'>
                <div id='tab-container'></div>
                <div id='list-container'></div>
            </div>
            </>
        )
    }
}