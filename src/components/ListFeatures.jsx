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
    const handleData = (data, layerName) => {
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
	const sortData = (data, sort) => {
		let dataSort = [];
        if (sort === 'newest') {
			for (let i = data.length - 1; i > -1; i--) {
				dataSort.push(data[i]);
			}
		} else if (sort === 'oldest') {
			
        } else if (sort === 'name') {
		    dataSort = data;
			for (let i = 1; i < dataSort.length; i++) {
				let key = dataSort[i];
				let j = i - 1;
				while (j >= 0 && dataSort[j].properties.TaxName.localeCompare(key.properties.TaxName.charAt(0)) === 1) {
					dataSort[j + 1] = dataSort[j];
					j--;
				}
				dataSort[j + 1] = key;
			}
		} else if (sort === 'name-reverse') {
	
		}
		return dataSort;
	}

    const tabInit = (layerName, tabContainer) => { // builds a single tab button (consider combining with listInit)
        let tab = document.createElement('div');
        tab.id = 'tab-' + layerName;
        tab.className = 'tab interactive-2';
        tab.innerHTML = capitalizeFirst(layerName);

        if (getParam(layerName)) {
            tab.classList.add('hide');
        } else {
            if ((getParam('targetLayer') && getParam('targetLayer') !== layerName) || !getParam('targetLayer')) {
                tab.classList.add('behind');
            }
        }

        tab.addEventListener('click', () => {
            if (tab.classList.contains('behind')) {
                swapViewTab(layerName);
            }
        });
        tabContainer.appendChild(tab);
    }

    const listInit = (layerName, listContainer) => { // prepares a single table for data (consider combining with tabInit)
        let subgroup = document.createElement('div');
        subgroup.id = 'subgroup-' + layerName;
        subgroup.className = 'subgroup';
        let title = document.createElement('h3');
        title.className = 'list-title';
        title.innerHTML = capitalizeFirst(layerName);
        let para = document.createElement('p');
        para.className = 'list-subtitle';
        //let sortButton = document.createElement('button');

        let table = document.createElement('table');
        table.id = 'table-' + layerName;
        table.className = 'feature-list';

        subgroup.appendChild(title);
        subgroup.appendChild(para);
        //subgroup.appendChild(sortButton);
        //subgroup.addEventListener("click", swapViewList);
        let listDiv = document.createElement('div');
        listDiv.id = 'list-' + layerName;
        listDiv.className = 'list'

        if (getParam(layerName)) {
            listDiv.classList.add('hide');
        } else {
            if ((getParam('targetLayer') && getParam('targetLayer') !== layerName) || !getParam('targetLayer')) {
                listDiv.classList.add('hide');
            }
        }

        listDiv.appendChild(subgroup);
        listDiv.appendChild(table);
        listContainer.appendChild(listDiv);
    }

    const buildTableRow = (rowData, layerName, table) => { // builds one table row
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

    const updateTableHL = (layerName, id) => {
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

    const swapView = (target) => {
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
        } else {
            console.log('lelele');
        }
    }

    const swapViewTab = (layerName) => {
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
    }

    const swapViewMenu = (layerName) => {
        let visibleTabs = document.querySelectorAll('#tab-container :not(.hide)');
        let targetTab = document.getElementById('tab-' + layerName);
        if (visibleTabs.length === 0) { // adding first tab
            targetTab.classList.remove('hide', 'behind');
            document.getElementById('list-' + layerName).classList.remove('hide');
            onCenter({name: layerName, id: -1, fly: false});
        } else if (visibleTabs.length === 1 && !targetTab.classList.contains('hide')) { // removing last tab
            targetTab.classList.add('hide', 'behind');
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

    const tableLoad = (data, layerName, sort) => {
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
    }, []);

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
                /*
                if (i === 0) {
                    tabInit(layerList[i], tabContainer);
                } else {
                    setTimeout(() => {
                        tabInit(layerList[i], tabContainer);
                    }, i * 300);
                }
                */

                tabInit(layerList[i], tabContainer);
                listInit(layerList[i], listContainer);
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
        if (target && mode === 'view') {
            console.log(target);
            swapView(target); //figure out why non-post table hl doesn't refresh on refresh
        };
    }, [target]);

    useEffect(() => {
        if (layerVis) {
            if (mode === 'view') {
                let tabs = document.getElementById('tab-container').children;
                for (let i = 0; i < tabs.length; i++) {
                    if (layerVis[layerList[i]] !== !tabs[i].classList.contains('hide')) {
                        swapViewMenu(layerList[i]);
                    }
                }
            } else {
                /*
                let temp = false;
                for (let i = 0; i < layerList.length; i++) {
                    if (layerVis[layerList[i]]) {
                        onCenter({name: layerList[i], id: -1, fly: false});
                        temp = true;
                        break;
                    }
                }
                if (!temp) {
                    onCenter({name: 'none', id: -1, fly: false});
                }
                */
            }
        }
    }, [layerVis]);

     useEffect(() => {
        if (mode === 'view') {
            document.querySelector('#subgroup-posts > .list-subtitle').innerHTML = 
                'Reviewed: ' + ratio[0] + ' of ' + (ratio[0] + ratio[1]);
        }
    }, [ratio]);

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