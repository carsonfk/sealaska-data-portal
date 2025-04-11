import React, {useState, useEffect, useRef} from "react";
import AddFeatureForm from "../components/AddFeatureForm";
import Map from "../components/Map";
import ListFeatures from "../components/ListFeatures";
//import {getDatabase, ref, onValue, get, orderByChild, equalTo, query } from 'firebase/database'
import Hero from "../components/Hero";
import ViewContributeForm from "../components/ViewContributeForm";

export default function Home(props){
	const [data, setData] = useState()
	//const [filter, setFilter] = useState('null')
	const [reset, setReset] = useState(0);
	const ref = useRef(null);
    const [mapMode, setMapMode] = useState('view');
    const [currentSelection, setCurrentSelection] = useState([[], 'none']);

    useEffect(() => {
		async function contributeMode() {
			//const db = getDatabase();
			//const ref = ref(db, "POI");
			//const orderByType = query(ref, orderByChild('type'), equalTo(filter)) // makes a query to the database to only return values with type=filter
			//const querySnapshot = await get(orderByType);
			//setData(querySnapshot)
		}

		async function viewMode() {

		}

		if (mapMode === 'view'){ 
			viewMode();
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
		async function initialLoad() {
			//setData(props.locations);
			//const db = getDatabase();
			//const racksRef = ref(db, "racks");
			//const first = await get(racksRef);
			//setData(first)
		}
		initialLoad();
	}, [, reset])

	const scrollToMap = () => {
		if (ref.current) {
		  ref.current.scrollIntoView({ behavior: 'smooth' });
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