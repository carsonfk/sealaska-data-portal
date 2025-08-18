import { useState, useEffect, useRef } from "react";
import { useQueryParams, stateTimer} from "../functions";
import { getDatabase, ref, onValue, get, orderByChild, equalTo, query } from 'firebase/database'
import { request } from '@esri/arcgis-rest-request';
import AddFeatureForm from "../components/AddFeatureForm";
import Map from "../components/Map";
import ListFeatures from "../components/ListFeatures";
import Hero from "../components/Hero";
import ViewContributeForm from "../components/ViewContributeForm";
import Refresh from "../components/Refresh";
import FilterForm from "../components/FilterForm";
import Stats from "../components/Stats";

export default function Home(props){
	const { getParam, setParam } = useQueryParams();
	const windowWidth = useRef(window.innerWidth);
	const [data, setData] = useState();
	const [projectsData, setProjectsData] = useState();
	const [landsData, setLandsData] = useState();
	const [roadsData, setRoadsData] = useState();
	const [target, setTarget] = useState({name: 'none', id: -1, fly: false});
	//const [filter, setFilter] = useState('null')
	//const [sort, setSort] = useState('newest');
	const [reset, setReset] = useState(0);
    const [mapMode, setMapMode] = useState('view');
    const [currentSelection, setCurrentSelection] = useState({coordinates:[], origin: 'none'});
	const [timerLong, setTimerLong] = useState();
	const [timer, setTimer] = useState([]);
	const [sidebars, setSidebars] = useState();
	const [layerVis, setLayerVis] = useState(); //{'posts': false, 'projects': false, 'lands': false, 'roads': true}

	const landsURL = 'https://services7.arcgis.com/q9QUA4QfbvUGfm76/arcgis/rest/services/SELands/FeatureServer/0/query?where=1%3D1&outSR=4326&outFields=OwnCategor&outFields=SurfFull&outFields=TaxName&outFields=AreaAcres&outFields=OBJECTID&f=pgeojson';
	const projectsURL = '';
	const roadsURL = '';

	//returns class to close sidebars
	function closed(side) {
		if (side === 'right' && !getParam('left') && window.innerWidth <= 878) {
			return 'closed';
		}
		let val;
		return (getParam(side) ? val = 'closed': val = '');
	}

	//initialize a single sidebar click event
	function sidebarInit(side) {
		let other;
		(side === "left") ? other = "right" : other = "left";
		let sidebar = document.getElementsByClassName(side);
		let sidebar2 = document.getElementsByClassName(other);
		sidebar[0].addEventListener("click", () => {
			sidebar[0].classList.toggle("closed");
			sidebar[1].classList.toggle("closed");
			if (sidebar[1].classList.contains('closed')) { //exits contribute mode when closing left sidebar
				setMapMode('view');
			}

			if (window.innerWidth <= 878 && !getParam(other)) { //if window size below 878 and opposite sidebar is visible
				sidebar2[0].classList.toggle("closed");
				sidebar2[1].classList.toggle("closed");
				setParam(other, false);
				setSidebars((sidebars) => ({left: !sidebars.left, right: !sidebars.right}));
				if (other === "left") {
					setMapMode("view");
				}
			} else { //if opposite sidebar is hidden
				setSidebars((sidebars) => ({left: (side === "left" ? !sidebars.left: sidebars.left), 
					right: (side === "right" ? !sidebars.right : sidebars.right)}));
			}

			if (sidebar[1].classList.contains("closed")) {
				setParam(side, false);
			} else {
				setParam(side, null);
			}
		});
	}

	//requests static layer data from AGOL
	function requestStaticLayers() {
		/*
		request(projectsURL)
		.then(response => {
			console.log('Success:', response);
		})
		.catch(error => {
			console.error(error);
		});
		*/

		request(landsURL)
		.then(response => {
			//console.log('Success:', response);
			setLandsData(response.features);
		})
		.catch(error => {
			console.error(error);
		});

		/*
		request(roadsURL)
		.then(response => {
			console.log('Success:', response);
		})
		.catch(error => {
			console.error(error);
		});
		*/
	}

	const handleResize = () => { //right sidebar hidden on screen shrink (if left sidebar is visible)
		windowWidth.current = window.innerWidth;
		if (windowWidth.current <= 878 && !getParam('left') && !getParam('right')) {
			let right = document.getElementsByClassName('right');
			right[0].classList.remove('closed');
			right[1].classList.remove('closed');
			setParam('right', false);
			setSidebars((sidebars) => ({left: sidebars.left, right: !sidebars.right}));
		}
	};

    const handleModeSubmit = (selectedMode) => { //from form jsx - this has to do with updating map mode value when the map mode form is submitted
		if (mapMode !== selectedMode) {
			setMapMode(selectedMode);
		}
	};

    const handleCurrentSelection = ({coordinates: point, origin: component}) => { //from addfeature or map jsx - updates current point selection (will default to empty when mode is set to view)
		setCurrentSelection({coordinates: point, origin: component});
    };

	const handleCenter = ({name: layerName, id: layerId, fly: bool}) => { //from listfeatures jsx or map jsx - updates targeted feature
		if (layerName === 'retain') {
			setTarget((target) => ({name: target.name, id: layerId, fly: bool}));
		} else {
			setTarget({name: layerName, id: layerId, fly: bool});
		}
	};

	const handleReset = () => {
		setReset((reset) => reset + 1);
	};

	const handleFormSubmit = () => {
		setMapMode('view');
	};

	const handleLayerVis = (layerName, bool) => {
		setLayerVis(prev => ({
			...prev,
			[layerName]: bool
		}));
	} 

	useEffect(() => {
		requestStaticLayers(); //puts in requests for all map layers (besides basemap and posts layers)

		let close = document.getElementById("msg-close");
		close.addEventListener('click', () => {
			let update = document.getElementById("update");
			update.classList.toggle("transition");
		});

		setLayerVis({posts: !getParam('posts'), projects: !getParam('projects'), lands: !getParam('lands'), roads: !getParam('roads')});

		var leftInit, rightInit;
		if (!getParam('right') && getParam('right') && window.innerWidth <= 878) {
			setParam('right', false);
		};
		getParam('left') ? leftInit = false : leftInit = true;
		getParam("right") ? rightInit = false : rightInit = true;
		
		setSidebars({left: leftInit, right: rightInit});
		sidebarInit('left');
		sidebarInit('right');

		window.addEventListener("resize", handleResize);
   		return () => window.removeEventListener("resize", handleResize);
	}, []);
	
	useEffect(()=>{ //this pulls data from the database on inital load and reset
		async function resetLoad() {
			const db = getDatabase();
			const locRef = ref(db, "features");
			const dbFeatures = await get(locRef);

			let publicJSON = []; // create an empty array to add public geoJSON stuff
			let allJSON = []; // create an empty array to add all geoJSON stuff
			let localID = 0;
			dbFeatures.forEach((row) => {
				// for every feature, create a geoJSON format object and add it to public and/or private array
				const newLoc = `{"type":"Feature","properties":{"type":"${
					row.val().type
					}","details":"${
					row.val().details
					}","image":"${
					row.val().image
					}","sharing":"${
					row.val().sharing
					}","reviewed":"${
					row.val().reviewed
					}","account":"${
					row.val().account
					}","timestamp":{"date":"${
						row.val().timestamp.date
						}","time":"${
						row.val().timestamp.time
					}"}},"geometry":{"type":"Point","coordinates":[${
						row.val().longitude},${
						row.val().latitude
					}]},"id": ${localID}}`;
				if (row.val().sharing === "public") {
					publicJSON.push(newLoc);
				}
				allJSON.push(newLoc);
				localID++;
			});

			//sorts parsed JSON and sets it as global data
			setData(JSON.parse(`[${publicJSON}]`));
			
			//retains target after a reset
			if(reset !== 0) {
				setTimeout(() => {
					setTarget((target) => ({name: target.name, id: target.id, fly: false}));
				}, 150);
			}
		}
		resetLoad();
		console.log(reset);

		clearTimeout(timerLong);
		setTimerLong(setTimeout(() => {
			setReset((reset) => reset + 1);
		}, 300000));
	}, [reset]);

	useEffect(() => {
		if (mapMode === 'view') {
			setTarget({name: (getParam('targetLayer') ? getParam('targetLayer') : 'posts'), id: -1, fly: false});
		} else {
			setTarget({name: 'none', id: -1, fly: false});
		}
	}, [mapMode]);

	useEffect(() => {
		if (target.name !== 'none') {
			setParam('targetLayer', target.name !== 'posts' ? target.name : null);
		}
	}, [target])

	useEffect(() => {
		if (data) {
			stateTimer(timer, setTimer, 7000, 'update', 'transition');
		}
	}, [data])

	useEffect(() => { //testing
		if (layerVis) {
			console.log(layerVis);
		}
	}, [layerVis]);

    return (
        <>
		<header>
		</header>
        <main>
			<div id="content-layer" className="main-layer">
				<div id="left-drawer" className={"main-container interactive drawer left " + closed("left")}>
					<img id="arrow-left" className="arrow" alt="From pictarts.com" src="https://pictarts.com/21/material/01-vector/m-0027-arrow.png"></img>
				</div>
				<div id="features" className={"main-container sidebar left " + closed("left")}>
					<Hero/>
					<ViewContributeForm mode={mapMode} onSubmit={handleModeSubmit}/>
					<AddFeatureForm mode={mapMode} selectionCoordinates={currentSelection} onSelect={handleCurrentSelection} onReset={handleReset} submitSwap={handleFormSubmit}/>
					<ListFeatures locations={data} projects={projectsData} lands={landsData} roads={roadsData} mode={mapMode} target={target} layerVis={layerVis} onCenter={handleCenter}/>
				</div>
				<div id="map">
					<Map locations={data} projects={projectsData} lands={landsData} roads={roadsData} mode={mapMode} target={target} selectionCoordinates={currentSelection} sidebars={sidebars} layerVis={layerVis} onSelect={handleCurrentSelection} onCenter={handleCenter} onLayerVis={handleLayerVis}/>
				</div>
				<div id="right-drawer" className={"main-container interactive drawer right " + closed("right")}>
					<img id="arrow-right" className="arrow" alt="From pictarts.com" src="https://pictarts.com/21/material/01-vector/m-0027-arrow.png"></img>
				</div>
				<div id="options" className={"main-container sidebar right " + closed("right")}>
					<Refresh onReset={handleReset} reset={reset} locations={data}/>
					<FilterForm/>
					<Stats locations={data} mode={mapMode} projects={projectsData} lands={landsData} roads={roadsData} target={target}/>
				</div>
			</div>
			<div id="overlay-layer" className="main-layer">
				<div id="update" className="map-element transition">
					<div id="location-msg">Locations Updated</div>
					<div id="msg-close" className="interactive">CLOSE</div>
				</div>
			</div>
        </main>
        <footer>
        </footer>
        </>
    )
}