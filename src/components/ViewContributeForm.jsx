import React, { useState, useEffect } from "react";

export default function ViewContributeForm( {mode, onSubmit} ) {
    
    useEffect(() => {
        document.getElementById(mode).checked = true;
        console.log("lalala")
    }, [mode]); //fire this whenever the mode changes

    //returns the value that is filled in the form to Home.
    document.querySelectorAll('input[type="radio"][name="map-mode"]').forEach(e => {
        e.addEventListener('change', function() {
            onSubmit(this.value);
        })
      })

    return (
        <form>
            <div className="select-type">
                <input type="radio" className="mode-input" id="view" name="map-mode" value="view" defaultChecked/>
                <label className="mode" for="view">View</label>
                <input type="radio" className="mode-input" id="contribute" name="map-mode" value="contribute"/>
                <label className="mode" for="contribute">Contribute</label>
            </div>
        </form>
    )
}


//style={{ border: "2px solid #CD202D", borderRadius: "6px", padding: "10px", display: "flex", alignItems: "center",
//justifyContent: "center", background: "#f2f2f2", width: "250px", margin: "auto", marginTop: "10px", marginBottom: "10px"}}