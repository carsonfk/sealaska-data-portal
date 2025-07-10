import React, {useState, useEffect, useRef} from "react";
import { useQueryParams } from "../functions";
import {getDatabase, ref, onValue, get, orderByChild, equalTo, query } from 'firebase/database'
import AddFeatureForm from "../components/AddFeatureForm";
import Map from "../components/Map";
import ListFeatures from "../components/ListFeatures";
import Hero from "../components/Hero";
import ViewContributeForm from "../components/ViewContributeForm";
import Refresh from "../components/Refresh";
import FilterForm from "../components/FilterForm";

export default function Home(props){
	const { getParam, setParam } = useQueryParams();
	const [data, setData] = useState();
	const [target, setTarget] = useState([-1, 'none']);
	//const [filter, setFilter] = useState('null')
	const [sort, setSort] = useState('newest');
	const [reset, setReset] = useState(0);
    const [mapMode, setMapMode] = useState('view');
    const [currentSelection, setCurrentSelection] = useState([[], 'none']);
	const mapRef = useRef(null);
	//const timerRef = useRef(null);
	const windowWidth = useRef(window.innerWidth);
	const [timerLong, setTimerLong] = useState();
	const [timerShort, setTimerShort] = useState([]);
	const [sidebars, setSidebars] = useState();
	const [tableMode, setTableMode] = useState({posts: [true, true], projects: [true, false], lands: [true, false], roads: [true, false]}); //reconsider

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
		sidebar[0].onclick = () => {
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
		};
	}

	//sort provided JSON using sort state
	function sortJSON(locations) {
		if (sort === 'newest') {
			let locationsSort = []; 
			for (let i = locations.length - 1; i > -1; i--) {
				locationsSort.push(locations[i]);
			}
			locations = locationsSort;
		}
		return locations;
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

    const handleCurrentSelection = (coordinates) => { //from map jsx - updates current point selection (will default to empty when mode is set to view)
		if (coordinates.length === 0) {
			setCurrentSelection([[], 'map']);
		} else {
			setCurrentSelection([coordinates, 'map']);
		}
    };

	const handleEdits = (coordinates) => { //from addfeature jsx - updates current point selection (will default to empty when mode is set to view)
        setCurrentSelection([coordinates, 'box']);
    };

	const handleTemp = (id) => { //from map jsx - updates map center
		setTarget([id, 'map']);
	};

	const handleCenter = (id) => { //from listfeatures jsx - updates map center
		setTarget([id, 'list']);
	};

	const handleReset = () => {
		setReset((reset) => reset + 1);
	};

	const handleFormSubmit = () => {
		setMapMode('view');
		//setTarget([, 'list'])
	};

	useEffect(() => {
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

	useEffect(() => {
		//async function contributeMode() { //unused
		//}

		//async function viewMode() { //unused
		//}

		//if (mapMode === 'view'){
		//	viewMode();
		//} else if (mapMode === 'contribute'){
		//	contributeMode();
		//}
		console.log(mapMode)
	}, [mapMode]) //anytime mapMode is updated
	
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
			setData(sortJSON(JSON.parse(`[${publicJSON}]`)));
			
			//retains target after a reset
			if(reset !== 0) {
				setTimeout(() => {
					setTarget([target[0], 'reset']);
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
			let update = document.getElementById("update");
			if (!update.classList.contains("hide")) { // case 1: update msg is visible because of recent refresh -> reset popup
				update.classList.toggle("hide");
				setTimeout(() => {
				update.classList.toggle("hide");
				}, 100)
			} else { // case 2: update msg is hidden -> make visible
				update.classList.toggle("hide");
			}
			if (timerShort.length !== 0) { //restart update msg hide timer if ongoing
				clearTimeout(timerShort);
			}
			setTimerShort(setTimeout(() => { //set update msg hide timer
				if (!update.classList.contains("hide")) {
				update.classList.toggle("hide");
				}
			}, 7000));
		}
	}, [data])

	const scrollToMap = () => { //no longer functional or needed
		if (mapRef.current) {
		  mapRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	};

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
					<Hero scrollToMap={scrollToMap}/>
					<ViewContributeForm mode={mapMode} onSubmit={handleModeSubmit}/>
					<AddFeatureForm mode={mapMode} selectionCoordinates={currentSelection} onEdit={handleEdits} onReset={handleReset} submitSwap={handleFormSubmit}/>
					<ListFeatures locations={data} mode={mapMode} target={target} onCenter={handleCenter}/>
				</div>
				<div id="map">
					<Map locations={data} mode={mapMode} target={target} selectionCoordinates={currentSelection} sidebars={sidebars} onSelect={handleCurrentSelection} onTemp={handleTemp}/>
				</div>
				<div id="right-drawer" className={"main-container interactive drawer right " + hidden("right")}>
					<img id="arrow-right" className="arrow" alt="From pictarts.com" src="https://pictarts.com/21/material/01-vector/m-0027-arrow.png"></img>
				</div>
				<div id="options" className={"main-container sidebar right " + hidden("right")}>
					<Refresh onReset={handleReset} reset={reset} locations={data}/>
					<FilterForm/>
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

//function useInterval(callback, delay) {
		// Remember the latest callback.
	//	useEffect(() => {
	//	    timerRef.current = callback;
	//	}, [callback]);

		// Set up the interval.
	//	useEffect(() => {
	//	    function tick() {
	//		    timerRef.current();
	//	    }
	//	    if (delay !== null) {
	//		    let id = setInterval(tick, delay);
				//setTemp(id);
	//		    return () => clearInterval(id);
	//	    }
	//	}, [delay]);
	//}

	//useInterval(() => {
	//	setReset((reset) => reset + 1);
	//}, 5000);