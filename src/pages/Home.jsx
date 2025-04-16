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

    useEffect(() => {
		console.log("hi")
		async function contributeMode() {
			//const db = getDatabase();
			//const locRef = ref(db, "features");
			//const orderByType = query(locRef, orderByChild('type')) // makes a query to the database
			//const querySnapshot = await get(orderByType);
			//setData(querySnapshot)

			const db = getDatabase();
			const locRef = ref(db, "features");
			const first = await get(locRef);
			setData(first);
		}

		async function viewMode() {
			const db = getDatabase();
			const locRef = ref(db, "features");
			const first = await get(locRef);
			setData(first);
		}

		if (mapMode === 'view'){
			if (reset === 0) {
				setTimeout(() => {
					viewMode();
				}, 2000);
			} else {
				viewMode();
			}
		} else if (mapMode === 'contribute'){
			contributeMode();
		}
		setReset(reset + 1)
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

	useEffect(()=>{ //this pulls data from the database on reset
		async function swapLoad() {
			const db = getDatabase();
			const locRef = ref(db, "features");
			const swap = await get(locRef);
			setData(swap);
		}
		swapLoad();
	}, [reset])

	const scrollToMap = () => {
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
				<div className="contribute">
					<Hero scrollToMap={scrollToMap}/>
					<ViewContributeForm onSubmit={handleFormSubmit} />
					<AddFeatureForm mode={mapMode} selectionCoordinates={currentSelection} onEdit={handleEdits}/>
					<ListFeatures mode={mapMode}/>
				</div>
				<Map locations={data} mode={mapMode} reset={reset} selectionCoordinates={currentSelection} onSelect={handleCurrentSelection}/>
				<div className="options">
					
				</div>
			</div>
        </main>

        <footer>
			
        </footer>
        </>
    )
}