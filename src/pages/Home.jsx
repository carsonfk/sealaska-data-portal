import React, {useState, useEffect, useRef} from "react";
import AddFeatureForm from "../components/AddFeature";
import Map from "../components/Map";
import FilterForm from "../components/FilterForm";
import {getDatabase, ref, onValue, get, orderByChild, equalTo, query } from 'firebase/database'
import Hero from "../components/Hero";

export default function Home(props){
	const [data, setData] = useState()
	//const [filter, setFilter] = useState('null')
	const [reset, setReset] = useState(0);
	const mapRef = useRef(null);
    const [statusVC, setStatusVC] = useState("v");








    return (
        <>
		<header>
			<Hero scrollToMap={scrollToMap}/>
		</header>
		
        <main>
            
			<div className="content">
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