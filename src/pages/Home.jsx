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
    const [mapMode, setMapMode] = useState("v");

    const handleFormSubmit = (selectedMode) => { //this has to do with updating filter value when the filter form is submitted
		setMapMode(selectedMode);
	};






    return (
        <>
		<header>
			<Hero scrollToMap={scrollToMap}/>
		</header>
		
        <main>
            
			<div className="content">
                <ViewContributeForm onSubmit={handleFormSubmit} />
				<Map locations={data}/>
				<AddFeatureForm />
			</div>

			<div className="content">
				
			</div>
        </main>

        <footer>
			
        </footer>
        </>
    )
}