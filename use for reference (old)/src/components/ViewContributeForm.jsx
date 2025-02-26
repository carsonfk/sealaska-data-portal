import React from "react";

export default function ViewContributeForm( {onSubmit} ) {
    //returns the value that is filled in the form to Home.
    const handleSubmit = (event) => { //change to function (e)?
        event.preventDefault();
        const selectedMode = event.target.elements['map-mode'].value[0];
        onSubmit(selectedMode);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="select-type">
                <label htmlFor="map-mode"><b>Map mode: </b></label>
                <label htmlFor="view">View</label>
                <input type="radio" id="view" name="map-mode" value="view"/>
                <label htmlFor="contribute">Contribute</label>
                <input type="radio" id="contribute" name="map-mode" value="contribute"/>
                <input type="submit" value="Swap mode"/>
            </div>
      </form>
    )
}