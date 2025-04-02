import React from "react";

export default function ViewContributeForm( {onSubmit} ) {
    
    //returns the value that is filled in the form to Home.
    const handleSubmit = (event) => { //change to function (e)?
        event.preventDefault();
        const selectedMode = event.target.elements['map-mode'].value;
        onSubmit(selectedMode);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="select-type" style={{ border: "2px solid #CD202D", borderRadius: "6px", padding: "10px", display: "flex", alignItems: "center",
                                                  justifyContent: "center", background: "#f2f2f2", width: "400px", margin: "auto", marginTop: "10px", marginBottom: "10px"}}>
                <label htmlFor="map-mode"><b>Map mode: </b></label>
                <label htmlFor="view">View</label>
                <input type="radio" id="view" name="map-mode" value="view" defaultChecked/>
                <label htmlFor="contribute">Contribute</label>
                <input type="radio" id="contribute" name="map-mode" value="contribute"/>
                <input type="submit" value="Swap mode"/>
            </div>
      </form>
    )
}