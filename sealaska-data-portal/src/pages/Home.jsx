import React, {useState, useEffect, useRef} from "react";
import AddFeatureForm from "../components/AddFeature";
import Map from "../components/Map";
//import FilterForm from "../components/FilterForm";
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
			viewMode()
		} else if (mapMode === 'contribute'){
			contributeMode()
		}
		setReset(reset + 1)
	}, [mapMode]) //anytime mapMode is updated

    const handleFormSubmit = (selectedMode) => { //from form jsx - this has to do with updating map mode value when the map mode form is submitted
		if (mapMode !== selectedMode) {
			console.log(selectedMode);
			setMapMode(selectedMode);
		}
	}
    const handleCurrentSelection = (coordinates) => { //from map jsx - updates current point selection (will default to empty when mode is set to view)
        console.log("map coordinates received by home.jsx!")
		if (coordinates.length === 0) {
			setCurrentSelection([[], 'map']);
		} else {
			setCurrentSelection([coordinates, 'map']);
		}
    }
	const handleEdits = (coordinates) => { //from addfeature jsx - updates current point selection (will default to empty when mode is set to view)
		console.log("box coordinates received by home.jsx!")
        setCurrentSelection([coordinates, 'box']);
    }

	useEffect(()=>{ //this pulls data from the database on reset
		//async function noFilterLoad() {
		//	const db = getDatabase();
		//	const racksRef = ref(db, "racks");
		//	const first = await get(racksRef);
		//	setData(first)
		//}
		//noFilterLoad()
	}, [reset])

	const scrollToMap = () => {
		if (ref.current) {
		  ref.current.scrollIntoView({ behavior: 'smooth' });
		}
	};

    return (
        <>
		<header>
			<Hero scrollToMap={scrollToMap}/>
		</header>
		
        <main>
            
			<div className="content">
                <ViewContributeForm onSubmit={handleFormSubmit} />
				<Map locations={data} mode={mapMode} reset={reset} selectionCoordinates={currentSelection} onSelect={handleCurrentSelection}/>
				<AddFeatureForm mode={mapMode} selectionCoordinates={currentSelection} onEdit={handleEdits}/>
			</div>

			<div className="content">
				
			</div>
        </main>

        <footer>
			
        </footer>
        </>
    )
}