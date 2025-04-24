import React, {useState, useEffect, useRef} from "react";
import AddFeatureForm from "../components/AddFeatureForm";
import Map from "../components/Map";
import ListFeatures from "../components/ListFeatures";
import {getDatabase, ref, onValue, get, orderByChild, equalTo, query } from 'firebase/database'
import Hero from "../components/Hero";
import ViewContributeForm from "../components/ViewContributeForm";

export default function Home(props){
	const [data, setData] = useState()
	//const [filter, setFilter] = useState('null')
	const [reset, setReset] = useState(0);
    const [mapMode, setMapMode] = useState('view');
    const [currentSelection, setCurrentSelection] = useState([[], 'none']);
	const mapRef = useRef(null);
	const timerRef = useRef();

	function useInterval(callback, delay) {
		// Remember the latest callback.
		useEffect(() => {
		    timerRef.current = callback;
		}, [callback]);

		// Set up the interval.
		useEffect(() => {
		    function tick() {
			    timerRef.current();
		    }
		    if (delay !== null) {
			    let id = setInterval(tick, delay);
			    return () => clearInterval(id);
		    }
		}, [delay]);
	}

	useInterval(() => {
		setReset((reset) => reset + 1);
	}, 10000);

    useEffect(() => {
		async function contributeMode() {
			//const db = getDatabase();
			//const locRef = ref(db, "features");
			//const orderByType = query(locRef, orderByChild('type')) // makes a query to the database
			//const querySnapshot = await get(orderByType);
			//setData(querySnapshot)

			//const db = getDatabase();
			//const locRef = ref(db, "features");
			//const first = await get(locRef);
			//setData(first);
		}

		async function viewMode() {
			//const db = getDatabase();
			//const locRef = ref(db, "features");
			//const first = await get(locRef);
			//setData(first);
		}

		if (mapMode === 'view'){
			viewMode();
		} else if (mapMode === 'contribute'){
			contributeMode();
		}
	}, [mapMode]) //anytime mapMode is updated

    const handleFormSubmit = (selectedMode) => { //from form jsx - this has to do with updating map mode value when the map mode form is submitted
		if (mapMode !== selectedMode) {
			setMapMode(selectedMode);
		}
	}
    const handleCurrentSelection = (coordinates) => { //from map jsx - updates current point selection (will default to empty when mode is set to view)
		if (coordinates.length === 0) {
			setCurrentSelection([[], 'map']);
		} else {
			setCurrentSelection([coordinates, 'map']);
		}
    }
	const handleEdits = (coordinates) => { //from addfeature jsx - updates current point selection (will default to empty when mode is set to view)
        setCurrentSelection([coordinates, 'box']);
    }

	const handleReset = () => {
		setReset((reset) => reset + 1);
	}
	
	useEffect(()=>{ //this pulls data from the database on reset
		async function resetLoad() {
			const db = getDatabase();
			const locRef = ref(db, "features");
			const dbFeatures = await get(locRef);

			let jsonFeatures = []; // create an empty array to add all the new geoJSON stuff
			dbFeatures.forEach((row) => {
				// for every feature, create a geoJSON format object and add it to the newLocations arr
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
				}","timestamp":{"date":"${
					row.val().timestamp.date
					}","time":"${
					row.val().timestamp.time
				}"}},"geometry":{"type":"Point","coordinates":[${
					row.val().longitude},${
					row.val().latitude
				}]}}`;
				console.log(newLoc);
				jsonFeatures.push(newLoc);
			});

			setData(jsonFeatures);
		}
		resetLoad();
		console.log(reset);
	}, [reset])

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
            
			<div className="content">
				<div className="features">
					<Hero scrollToMap={scrollToMap}/>
					<ViewContributeForm onSubmit={handleFormSubmit} />
					<AddFeatureForm mode={mapMode} selectionCoordinates={currentSelection} onEdit={handleEdits} onReset={handleReset}/>
					<ListFeatures locations={data} mode={mapMode}/>
				</div>
				<Map locations={data} mode={mapMode} selectionCoordinates={currentSelection} onSelect={handleCurrentSelection}/>
				<div className="options">
					
				</div>
			</div>
        </main>

        <footer>
			
        </footer>
        </>
    )
}