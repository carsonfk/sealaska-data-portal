import React, { useState, useEffect } from "react";
import { getDatabase, ref, set as firebaseSet, push } from 'firebase/database'
//import FilterForm from './FilterForm'

export default function AddFeatureForm( {mode, selectionCoordinates, onEdit, onReset} ) {
    const [form, setForm] = useState({
        latitude: "",
        longitude: "",
        type: "",
        image: "",
        details: "",
        sharing: "public",
        reviewed: false
    });

    function getTimestampAK() {
        const timestamp = new Date(); // Current date and time

        // Format the date and time in a specific time zone
        const formattedTimestamp = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Juneau',
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(timestamp);

        let timestampSplit = formattedTimestamp.split(', ');
        return {date: timestampSplit[0], time: timestampSplit[1]};
    }

    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value}
        });
    }

    useEffect(() => {
          if (mode === 'view') { //clears form when swapped to view mode
            updateForm({ type: "", details: "" });
          }
      }, [mode]); //fire this whenever the mode changes

    useEffect(() => {
        if (selectionCoordinates[1] === "map") {
            if (selectionCoordinates[0].length === 0) {
                updateForm({ latitude: "", 
                            longitude: "" });
            } else {
                updateForm({ latitude: selectionCoordinates[0][0], 
                            longitude: selectionCoordinates[0][1] });
            }
        }
    }, [selectionCoordinates]); //fires whenever a marker is placed/moved

    async function onSubmit(e) {
        console.log(getTimestampAK());
        e.preventDefault();
        if (form.latitude !== "" && form.longitude !== "" && form.type !== "" && form.details !== "") {
            const db = getDatabase();
            const locRef = ref(db, "features")
            const newLoc = { ...form, timestamp: getTimestampAK()};
            console.log(newLoc);
            const newLocRef = push(locRef, newLoc);
            updateForm({ latitude: "", longitude: "",
                type: "", details: "" });
            onEdit(["", ""]);
            onReset();
        } else {
            //test error message
            console.error("Error: one or more fields incomplete.")
        }
    }

    //add style to "sharing-buttons": style={{ border: "2px solid black", borderRadius: "6px", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "white" }}
    if (mode === 'contribute') {
        return (
            <div className="add-location-form">
                <h2>Add New Location</h2>
                <form id="newLocationForm" onSubmit={onSubmit}>
                    <label htmlFor="latitude">Latitude:</label>
                    <input
                        type="number"
                        min="54.5"
                        max="60"
                        step="any"
                        className="location"
                        id="latitude"
                        name="latitude"
                        value={parseFloat(form.latitude).toFixed(6)}
                        onChange={(e) => {
                            onEdit([e.target.value, form.longitude]);
                            updateForm({ latitude: e.target.value });
                        }}
                    />
                    <br></br>
                    <label htmlFor="longitude">Longitude:</label>
                    <input
                        type="number"
                        min="-140"
                        max="-130.25"
                        step="any"
                        className="location"
                        id="longitude"
                        name="longitude"
                        value={parseFloat(form.longitude).toFixed(6)}
                        onChange={(e) => {
                            onEdit([form.latitude, e.target.value]);
                            updateForm({ longitude: e.target.value });
                        }}
                    />
                    <br></br>
                    <label htmlFor="type">Type:</label>
                    <input
                        type="text"
                        id="type"
                        name="type"
                        value={form.type}
                        onChange={(e) => updateForm({ type: e.target.value }, '')}
                    />
                    <br></br>
                    <label htmlFor="details">Details:</label>
                    <input
                        type="text"
                        id="details"
                        name="details"
                        value={form.details}
                        onChange={(e) => updateForm({ details: e.target.value }, '')}
                    />
                    <br></br>
                    <div className="sharing-buttons" >
                        <label htmlFor="sharing"><b>Sharing:</b></label>
                        <label htmlFor="public">Share to public: </label>
                        <input style={{width: '20px', height: '20px', marginRight: '10px' }} type="radio" className="sharing" id="public" name="sharing-type" value="public" defaultChecked onChange={(e) => updateForm({ sharing: "public" })}/>
                        <label htmlFor="sealaska">For Sealaska use only: </label>
                        <input style={{width: '20px', height: '20px', marginRight: '10px' }} type="radio" className="sharing" id="sealaska" name="sharing-type" value="sealaska" onChange={(e) => updateForm({ sharing: "sealaska" })}/>
                    </div>

                    <button className="addLocation" type="submit">Submit your Location</button>
                </form>
            </div>
        )
    }
}