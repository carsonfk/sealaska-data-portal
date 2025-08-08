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
	const [data, setData] = useState();
	const [projectsData, setProjectsData] = useState();
	const [landsData, setLandsData] = useState();
	const [roadsData, setRoadsData] = useState();
	const [target, setTarget] = useState({name: 'posts', id: -1, fly: false}); //change posts to none when query param stuff is working
	//const [filter, setFilter] = useState('null')
	//const [sort, setSort] = useState('newest');
	const [reset, setReset] = useState(0);
    const [mapMode, setMapMode] = useState('view');
    const [currentSelection, setCurrentSelection] = useState({coordinates:[], origin: 'none'});
	const windowWidth = useRef(window.innerWidth);
	const [timerLong, setTimerLong] = useState();
	const [timer, setTimer] = useState([]);
	const [sidebars, setSidebars] = useState();
	//const [tableMode, setTableMode] = useState({posts: [true, true], projects: [true, false], lands: [true, false], roads: [true, false]}); //reconsider

	const landsURL = 'https://services7.arcgis.com/q9QUA4QfbvUGfm76/arcgis/rest/services/SELands/FeatureServer/0/query?where=1%3D1&outSR=4326&outFields=OwnCategor&outFields=SurfFull&outFields=TaxName&outFields=AreaAcres&outFields=OBJECTID&f=pgeojson';
	const projectsURL = '';
	const roadsURL = '';

	//returns class to hide sidebars
	function hidden(side) {
		if (side === "right" && !getParam('left') && window.innerWidth <= 878) {
			return "hide";
		}
		let val;
		getParam(side) ? val = "hide": val = null;
		return val;
	}

	//initialize click event
	function clickInit(side) {
		let other;
		(side === "left") ? other = "right" : other = "left";
		let sidebar = document.getElementsByClassName(side);
		let sidebar2 = document.getElementsByClassName(other);
		sidebar[0].addEventListener("click", () => {
			sidebar[0].classList.toggle("hide");
			sidebar[1].classList.toggle("hide");
			if (sidebar[1].classList.contains('hide')) { //exits contribute mode when closing left sidebar
				setMapMode('view');
			}

			if (window.innerWidth <= 878) {
				if (!getParam(other)) { //if opposite sidebar is visible
					sidebar2[0].classList.toggle("hide");
					sidebar2[1].classList.toggle("hide");
					setParam(other, false);
					setSidebars(sidebars => [!sidebars[0], !sidebars[1]]);
					if (other === "left") {
						setMapMode("view");
					}
				} else { //if opposite sidebar is hidden
					setSidebars(sidebars => [side === "left" ? !sidebars[0] : sidebars[0], 
						side === "right" ? !sidebars[1] : sidebars[1]]);
				}

				if (sidebar[1].classList.contains("hide")) {
					setParam(side, false);
				} else {
					setParam(side, null);
				}
			} else {
				setSidebars(sidebars => [side === "left" ? !sidebars[0] : sidebars[0], 
					side === "right" ? !sidebars[1] : sidebars[1]]);
				if (sidebar[1].classList.contains("hide")) {
					setParam(side, false);
				} else {
					setParam(side, null);
				}
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
			right[0].classList.remove('hide');
			right[1].classList.remove('hide');
			setParam('right', false);
			setSidebars(sidebars => [sidebars[0], !sidebars[1]]);
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
		} else if (layerName !== target.name || layerId !== target.id || bool != target.fly) {
			setTarget({name: layerName, id: layerId, fly: bool});
		}
	};

	const handleReset = () => {
		setReset((reset) => reset + 1);
	};

	const handleFormSubmit = () => {
		setMapMode('view');
	};

	useEffect(() => {
		requestStaticLayers();

		let close = document.getElementById("msg-close");
		close.onclick = () => {
			let update = document.getElementById("update");
			update.classList.toggle("hide");
		};

		var leftInit, rightInit;
		if (!getParam('right') && getParam('right') && window.innerWidth <= 878) {
			setParam('right', false);
		};
		getParam('left') ? leftInit = false : leftInit = true;
		getParam("right") ? rightInit = false : rightInit = true;
		
		setSidebars([leftInit, rightInit]);
		clickInit('left');
		clickInit('right');

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
		if (data) {
			stateTimer(timer, setTimer, 7000, 'update');
		}
	}, [data])

    return (
        <>
		<header>
		</header>
        <main>
			<div id="content-layer" className="main-layer">
				<div id="left-drawer" className={"main-container interactive drawer left " + hidden("left")}>
					<img id="arrow-left" className="arrow" alt="From pictarts.com" src="https://pictarts.com/21/material/01-vector/m-0027-arrow.png"></img>
				</div>
				<div id="features" className={"main-container sidebar left " + hidden("left")}>
					<Hero/>
					<ViewContributeForm mode={mapMode} onSubmit={handleModeSubmit}/>
					<AddFeatureForm mode={mapMode} selectionCoordinates={currentSelection} onSelect={handleCurrentSelection} onReset={handleReset} submitSwap={handleFormSubmit}/>
					<ListFeatures locations={data} projects={projectsData} lands={landsData} roads={roadsData} mode={mapMode} target={target} onCenter={handleCenter}/>
				</div>
				<div id="map">
					<Map locations={data} projects={projectsData} lands={landsData} roads={roadsData} mode={mapMode} target={target} selectionCoordinates={currentSelection} sidebars={sidebars} onSelect={handleCurrentSelection} onCenter={handleCenter}/>
				</div>
				<div id="right-drawer" className={"main-container interactive drawer right " + hidden("right")}>
					<img id="arrow-right" className="arrow" alt="From pictarts.com" src="https://pictarts.com/21/material/01-vector/m-0027-arrow.png"></img>
				</div>
				<div id="options" className={"main-container sidebar right " + hidden("right")}>
					<Refresh onReset={handleReset} reset={reset} locations={data}/>
					<FilterForm/>
					<Stats locations={data} mode={mapMode} projects={projectsData} lands={landsData} roads={roadsData} target={target}/>
				</div>
			</div>
			<div id="overlay-layer" className="main-layer">
				<div id="update" className="map-element hide">
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