import React, {useState, useEffect, useRef} from "react";
import AddFeatureForm from "../components/AddFeature";
import Map from "../components/Map";
import FilterForm from "../components/FilterForm";
import {getDatabase, ref, onValue, get, orderByChild, equalTo, query } from 'firebase/database'
import Hero from "../components/Hero";
import ViewContributeForm from "../components/ViewContributeForm";

export default function Home(props){
	const [data, setData] = useState()
	//const [filter, setFilter] = useState('null')
	const [reset, setReset] = useState(0);
	const mapRef = useRef(null);
    const [mapMode, setMapMode] = useState('v');
    const [selectionCoordinates, setSelectionCoordinates] = useState([]);

    useEffect(() =>{
		async function contributeMode() {
			//const db = getDatabase();
			//const racksRef = ref(db, "racks");
			//const orderByType = query(racksRef, orderByChild('type'), equalTo(filter)) // makes a query to the database to only return values with type=filter
			//const querySnapshot = await get(orderByType);
			//setData(querySnapshot)


		}
		if (mapMode === 'v'){ 
			//setReset(reset + 1)
		} else { contributeMode() } 
	}, [mapMode]) //anytime mapMode is updated

    const handleFormSubmit = (selectedMode) => { //this has to do with updating map mode value when the map mode form is submitted
		setMapMode(selectedMode);
	};

    const handleCurrentSelection = (coordinates) => { //updates current point selection (will default to empty when mode is set to view)
        setSelectionLat(coordinates[1]);
        setSelectionLong(coordinates[0]);
    }






    return (
        <>
		<header>
			<Hero scrollToMap={scrollToMap}/>
		</header>
		
        <main>
            
			<div className="content">
                <ViewContributeForm onSubmit={handleFormSubmit} />
				<Map locations={data} mode={mapMode} currentSelection={handleCurrentSelection}/>
				<AddFeatureForm mode={mapMode} selectionCoordinates={selectionCoordinates}/>
			</div>

			<div className="content">
				
			</div>
        </main>

        <footer>
			
        </footer>
        </>
    )
}