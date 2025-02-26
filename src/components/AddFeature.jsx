import React, { useState } from "react";
import { getDatabase, ref, set as firebaseSet, push } from 'firebase/database'
//import FilterForm from './FilterForm'

export default function AddFeatureForm( {mode, selectionCoordinates} ) {
    const [form, setForm] = useState({
        latitude: "",
        longitude: "",
        type: "",
        details: ""
    });

    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value}
        });
    }

    useEffect(() => {
        updateForm({ latitude: selectionCoordinates.latitude, 
                     longitude: selectionCoordinates.longitude });
    }, [selectionCoordinates]); //fires whenever a marker is placed

    async function onSubmit(e) {
        e.preventDefault();
        if (form.name != "" && form.latitude != "" && form.longitude != "" && form.type != "") {
            const db = getDatabase();
            const bikerackRef = ref(db, "racks")
            const newBikeRack = { ...form };
            const newbikeRef = push(bikerackRef, newBikeRack);
        } else {
            //test error message
            console.error("Error: one or more fields incomplete.")
        }
    }

    return (
        <div className="add-location-form">
            <h2>Add New Location</h2>
            <form id="newLocationForm" onSubmit={onSubmit}>
                <label htmlFor="latitude">Latitude:</label>
                <input
                    type="number"
                    min="-90"
                    max="90"
                    step="any"
                    id="latitude"
                    name="latitude"
                    value={form.latitude}
                    onChange={(e) => updateForm({ latitude: e.target.value })}
                />

                <label htmlFor="longitude">Longitude:</label>
                <input
                    type="number"
                    min="-180"
                    max="180"
                    step="any"
                    id="longitude"
                    name="longitude"
                    value={form.longitude}
                    onChange={(e) => updateForm({ longitude: e.target.value })}
                />
                <label htmlFor="type">Type:</label>
                <input
                    type="text"
                    id="type"
                    name="type"
                    value={form.type}
                    onChange={(e) => updateForm({ latitude: e.target.value })}
                />

                <label htmlFor="details">Details:</label>
                <input
                    type="text"
                    id="details"
                    name="details"
                    value={form.details}
                    onChange={(e) => updateForm({ longitude: e.target.value })}
                />

                <button className="addLocation" type="submit">Add Location</button>
            </form>
        </div>
    )
}