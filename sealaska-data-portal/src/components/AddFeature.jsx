import React, { useState, useEffect } from "react";
//import { getDatabase, ref, set as firebaseSet, push } from 'firebase/database'
//import FilterForm from './FilterForm'

export default function AddFeatureForm( {mode, selectionCoordinates, onEdit} ) {
    const [form, setForm] = useState({
        latitude: "",
        longitude: "",
        type: "",
        details: "",
        sharing: "",
    });

    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value}
        });
    }

    useEffect(() => {
        console.log(selectionCoordinates)
        if (selectionCoordinates == []) {
            updateForm({ latitude: "", 
                         longitude: "" });
        } else {
        updateForm({ latitude: selectionCoordinates[0], 
                     longitude: selectionCoordinates[1] });
        }
    }, [selectionCoordinates]); //fires whenever a marker is placed/moved

    async function onSubmit(e) {
        e.preventDefault();
        if (form.latitude != "" && form.longitude != "" && form.type != "" && form.details != "") {
            //const db = getDatabase();
            //const bikerackRef = ref(db, "racks")
            //const newBikeRack = { ...form };
            //const newbikeRef = push(bikerackRef, newBikeRack);
        } else {
            //test error message
            console.error("Error: one or more fields incomplete.")
        }
    }

    //add style to "sharing-buttons": style={{ border: "2px solid black", borderRadius: "6px", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "white" }}
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
                    onChange={(e) => updateForm({ type: e.target.value }, '')}
                />

                <label htmlFor="details">Details:</label>
                <input
                    type="text"
                    id="details"
                    name="details"
                    value={form.details}
                    onChange={(e) => updateForm({ details: e.target.value }, '')}
                />

                <div className="sharing-buttons" >
                    <label htmlFor="sharing"><b>Sharing:</b></label>
                    <label htmlFor="uncovered">Share to public: </label>
                    <input style={{width: '20px', height: '20px', marginRight: '10px' }} type="radio" id="public" name="sharing-type" value="public" defaultChecked onChange={(e) => updateForm({ sharing: "public" })}/>
                    <label htmlFor="public">For Sealaska use only: </label>
                    <input style={{width: '20px', height: '20px', marginRight: '10px' }} type="radio" id="sealaska" name="sharing-type" value="sealaska" onChange={(e) => updateForm({ sharing: "sealaska" })}/>
                </div>

                <button className="addLocation" type="submit">Submit your Location</button>
            </form>
        </div>
    )
}