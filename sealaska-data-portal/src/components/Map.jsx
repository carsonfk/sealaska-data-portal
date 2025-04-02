import React, { useRef, useState, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function Map( {locations, mode, reset, selectionCoordinates, onSelect}) {
  //let locations = props.locations;

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-134.5);
  const [lat, setLat] = useState(57.2);
  const [zoom, setZoom] = useState(6.4);
  const [featureLocations, setFeatureLocations] = useState([]);
  const [marker, setMarker] = useState(new mapboxgl.Marker({
    id: 'marker',
    draggable: true
  }));
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });

  let coordinates;

  const geojson = {
    'type': 'FeatureCollection',
    'features': [
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [-122.414, 37.776]
        },
        'properties': {
          'title': 'Mapbox',
          'description': 'San Francisco, California'
        }
      }
    ]
  };

  /*
  useEffect(() => {
    if (locations) {
      let newLocations = []; // create an empty array to add all the new geoJSON stuff
      locations.forEach((row) => {
        // for every feature, create a geoJSON format object and add it to the newLocations arr
        const newLoc = `{"type":"Feature","properties":{"name":"${
          row.val().locationName
        }","type":"${
          row.val().type
        }"},"geometry":{"type":"Point","coordinates":[${row.val().longitude},${
          row.val().latitude
        }]}}`;
        newLocations.push(newLoc);
      });
      setFeatureLocations(newLocations); //setState of features to this string array of to-be-jsonified features
    }
  }, [locations]); //fire this whenever the features put into the map change
  */

  //updates marker coordinates to drop location
  function onDragEnd() {
    const lngLat = marker.getLngLat();
    if (lngLat.lat >= 54.5 && lngLat.lat <= 60 && 
        lngLat.lng >= -140 && lngLat.lng <= 130.25) {
      console.log([selectionCoordinates[0][1], selectionCoordinates[0][0]])
      onSelect([lngLat.lat, lngLat.lng]);
    } else {
      console.log([selectionCoordinates[0][1], selectionCoordinates[0][0]])
      marker.setLngLat([selectionCoordinates[0][1], selectionCoordinates[0][0]]).addTo(map.current);
      setMarker(marker);
      onSelect([selectionCoordinates[0][0], selectionCoordinates[0][1]]);
    }
    
  }
  marker.on('dragend', onDragEnd);

  //adds or updates marker coordinates to click location
  const addPoints = 
    (event) => { //change to function (e)?
      event.preventDefault();
      coordinates = event.lngLat;
      if (coordinates.lat >= 54.5 && coordinates.lat <= 60 && 
         coordinates.lng >= -140 && coordinates.lng <= 130.25) {
          marker.setLngLat(coordinates).addTo(map.current);
          setMarker(marker);
          onSelect([coordinates.lat, coordinates.lng]);
         }
    }

  const addPointsRef = useRef(addPoints)

  useEffect(() => {
      if (mode === 'contribute') { //stuff that happens when map is swapped to contribute mode
        addPointsRef.current = addPoints
        map.current.on('click', addPointsRef.current);
        
      } else if (reset !== 0 && mode === 'view') { //stuff that happens when map is swapped to view mode
        map.current.off('click', addPointsRef.current);
        marker.remove();
        onSelect([[], 'none']);
      }
  }, [mode]); //fire this whenever the mode changes

  useEffect(() => {
    console.log(selectionCoordinates)
    if (selectionCoordinates[1] == 'box') {
      marker.setLngLat({lng: selectionCoordinates[0][1], lat: selectionCoordinates[0][0]}).addTo(map.current);
    }
  }, [selectionCoordinates]); //fires whenever a coordinate is changed

  mapboxgl.accessToken =
    "pk.eyJ1IjoiamFrb2J6aGFvIiwiYSI6ImNpcms2YWsyMzAwMmtmbG5icTFxZ3ZkdncifQ.P9MBej1xacybKcDN_jehvw";
  //const bounds = [
  //  [-140, 54.5], // southwest coordinates
  //  [-130.25, 60] // northeast coordinates
  //];
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
      //maxBounds: bounds
    });

    map.current.on("load", () => {
      map.current.addSource("locations", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: JSON.parse(`[${featureLocations}]`),
        },
      });

      map.current.addLayer({
        id: "locations_layer",
        type: "circle",
        source: "locations",
        paint: {
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-color": "#67d339",
          "circle-stroke-color": "white",
        },
      });
    });

    //add popup when cursor enters feature
    map.current.on("mouseenter", "locations_layer", (point) => {
      map.current.getCanvas().style.cursor = "pointer";

      const coordinates = point.features[0].geometry.coordinates.slice();
      const name = point.features[0].properties.name;
      const type = point.features[0].properties.type.charAt(0).toUpperCase()
        + point.features[0].properties.type.slice(1);

      while (Math.abs(point.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += point.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      popup
        .setLngLat(coordinates)
        .setHTML("<strong><h2>" + name + "</h2></strong> Type: " + type)
        .addTo(map.current);
    });

    //remove popup when cursor leaves feature
    map.current.on("mouseleave", "locations_layer", () => {
      map.current.getCanvas().style.cursor = "";
      popup.remove();
    });

    //redirect user to google maps for more info
    map.current.on("click", "locations_layer", (point) => {
      const coordinates = point.features[0].geometry.coordinates.slice();
      const url = `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`;
      window.open(url, "_blank");
    })
  }, []);

  useEffect(() => {
    if (map.current.getSource("locations")) {
      //update the source of the features on the map
      const source = map.current.getSource("locations");
      source.setData({
        type: "FeatureCollection",
        features: JSON.parse(`[${featureLocations}]`),
      });
    }
  }, [featureLocations]); // everytime the featureLocations state is changed

  return (
    <>
      <div ref={mapContainer} style={{ height: "100%", width: "100%"}} />
    </>
  );
}