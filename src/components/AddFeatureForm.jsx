import React, { useState, useEffect } from "react";
import { getDatabase, ref, set as firebaseSet, push } from 'firebase/database'
//import FilterForm from './FilterForm'
import { getTimestampAK } from "../functions";

export default function AddFeatureForm( {mode, selectionCoordinates, onEdit, onReset, submitSwap} ) {
    const [form, setForm] = useState({
        latitude: "",
        longitude: "",
        type: "",
        image: "",
        details: "",
        sharing: "public",
        reviewed: false,
        account: "anon"
    });

    function imageToBase64(img) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve(reader.result);
            };
            reader.onerror = (error) => {
              reject(error);
            };
            reader.readAsDataURL(img);
          });
    }

    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value}
        });
    }

    useEffect(() => {
        if (mode === 'view') { //clears form when swapped to view mode
            updateForm({ type: "", details: "" });
        } else {
            document.getElementById('image').addEventListener('change', async (event) => {
                const file = event.target.files[0];
                try {
                    const base64String = await imageToBase64(file);
                    console.log('Base64 string:', base64String);
                    updateForm({ image: base64String });

                } catch (error) {
                    console.error('Error converting image to Base64:', error);
                }
            });
        }
    }, [mode]); //fire this whenever the mode changes

    useEffect(() => {
        if (selectionCoordinates[1] === 'map') {
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
        e.preventDefault();
        console.log(getTimestampAK());
        if (form.latitude !== "" && form.longitude !== "" && form.type !== "" && form.details !== "") {
            const db = getDatabase();
            const locRef = ref(db, "features");
            const newLoc = { ...form, timestamp: getTimestampAK()};
            console.log(newLoc);
            const newLocRef = push(locRef, newLoc);
            updateForm({ latitude: "", longitude: "",
                type: "", details: "", image: "" });
            //onEdit(["", ""]);
            document.getElementById('image').value = "";
            onReset();
            submitSwap();
        } else {
            //test error message
            document.getElementById('error').classList.remove('hide');
        }
    }

    //add style to "sharing-buttons": style={{ border: "2px solid black", borderRadius: "6px", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "white" }}
    if (mode === 'contribute') {
        return (
            <div className="add-location-form">
                <h2>Add Location</h2>
                <form id="newLocationForm" onSubmit={onSubmit}>
                    <label htmlFor="latitude">Latitude:</label>
                    <br></br>
                    <input
                        type="number"
                        min="54.5"
                        max="60"
                        step="any"
                        className="location"
                        id="latitude"
                        name="latitude"
                        value={parseFloat(parseFloat(form.latitude).toFixed(6))}
                        onChange={(e) => {
                            onEdit([e.target.value, form.longitude]);
                            updateForm({ latitude: e.target.value });
                        }}
                    />
                    <br></br>
                    <label htmlFor="longitude">Longitude:</label>
                    <br></br>
                    <input
                        type="number"
                        min="-140"
                        max="-130.25"
                        step="any"
                        className="location"
                        id="longitude"
                        name="longitude"
                        value={parseFloat(parseFloat(form.longitude).toFixed(6))}
                        onChange={(e) => {
                            onEdit([form.latitude, e.target.value]);
                            updateForm({ longitude: e.target.value });
                        }}
                    />
                    <br></br>
                    <label htmlFor="type">Type:</label>
                    <br></br>
                    <input
                        type="text"
                        id="type"
                        name="type"
                        value={form.type}
                        onChange={(e) => updateForm({ type: e.target.value }, '')}
                    />
                    <br></br>
                    <label htmlFor="details">Details:</label>
                    <br></br>
                    <textarea
                        id="details"
                        name="details"
                        rows="3"
                        value={form.details}
                        onChange={(e) => updateForm({ details: e.target.value }, '')}
                    />
                    <br></br>
                    <label htmlFor="sharing">Sharing:</label>
                    <div className="sharing-buttons">
                        <div className="interactive menu-item">
                            <input type="radio" className="sharing-input" id="public" name="sharing-type" value="public" defaultChecked onChange={(e) => updateForm({ sharing: "public" })}/>
                            <label className="sharing" htmlFor="public">Everyone</label>
                        </div>
                        <div className="interactive menu-item">
                            <input type="radio" className="sharing-input" id="sealaska" name="sharing-type" value="sealaska" onChange={(e) => updateForm({ sharing: "sealaska" })}/>
                            <label className="sharing" htmlFor="sealaska">Sealaska</label>
                        </div>
                    </div>
                    <br></br>
                    <label for="image">Choose a photo (optional):</label>
                    <br></br>
                    <div className="interactive">
                        <input type="file" id="image" name="image" accept="image/png, image/jpeg"/>
                    </div>
                    <br></br>
                    <button className="interactive addLocation" type="submit">Submit your Location</button>
                    <div id="error" className="hide">
                        <p>error</p>
                    </div>
                </form>
            </div>
        )
    }
}