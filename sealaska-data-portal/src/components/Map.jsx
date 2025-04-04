import React, { useRef, useState, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function Map( {locations, mode, reset, selectionCoordinates, onSelect}) {
  //let locations = props.locations;

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-103);
  const [lat, setLat] = useState(27);
  const [zoom, setZoom] = useState(2);
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

  //updates marker coordinates to drop location, or rejects drop and returns marker to existing selection
  const onDragEnd = 
    () => {
      const lngLat = marker.getLngLat();
      if (lngLat.lat >= 54.5 && lngLat.lat <= 60 && 
          lngLat.lng >= -140 && lngLat.lng <= -130.25) {
        //setMarker(marker);
        onSelect([lngLat.lat, lngLat.lng]);
      } else {
        marker.remove();
        onSelect([]);
      }
    }

  const dragEndRef = useRef(onDragEnd);

  //adds or updates marker coordinates to click location
  const addPoints = 
    (event) => { //change to function (e)?
      console.log("hi!");
      event.preventDefault();
      coordinates = event.lngLat;
      if (coordinates.lat >= 54.5 && coordinates.lat <= 60 && 
         coordinates.lng >= -140 && coordinates.lng <= -130.25) {
          marker.setLngLat(coordinates).addTo(map.current);
          //setMarker(marker);
          onSelect([coordinates.lat, coordinates.lng]);
         }
    }

  const addPointsRef = useRef(addPoints);
  
  useEffect(() => {
      if (mode === 'contribute') { //stuff that happens when map is swapped to contribute mode
        addPointsRef.current = addPoints;
        map.current.on('click', addPointsRef.current);
        dragEndRef.current = onDragEnd
        marker.on('dragend', dragEndRef.current);
        //setMarker(marker);
        
      } else if (reset !== 0 && mode === 'view') { //stuff that happens when map is swapped to view mode
        map.current.off('click', addPointsRef.current);
        marker.off('dragend', dragEndRef.current);
        marker.remove();
        //setMarker(marker);
        onSelect([]);
      }
  }, [mode]); //fire this whenever the mode changes

  useEffect(() => {
    if (selectionCoordinates[1] == 'box') {
      if (selectionCoordinates[0][0] >= 54.5 && selectionCoordinates[0][0] <= 60 && 
        selectionCoordinates[0][1] >= -140 && selectionCoordinates[0][1] <= -130.25) {
          marker.setLngLat([selectionCoordinates[0][1], selectionCoordinates[0][0]]).addTo(map.current);
        } else {
          marker.remove();
        }
      console.log("wiwi")
    }
    console.log("wawa")
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
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [lng, lat],
      zoom: zoom,
      //maxBounds: bounds
    });

    map.current.on('mousemove', (e) => {
      document.getElementById('info').innerHTML =
          // displays latitude, longitude of click/hover
          parseFloat(JSON.stringify(e.lngLat.lat)).toFixed(7) + ", " + parseFloat(JSON.stringify(e.lngLat.lng)).toFixed(7);
    });
    
    map.current.on('style.load', () => {
      // Custom atmosphere styling
      map.current.setFog({
          'color': 'rgb(220, 159, 159)', // Pink fog / lower atmosphere
          'high-color': 'rgb(36, 92, 223)' // Blue sky / upper atmosphere
      });

      map.current.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.terrain-rgb'
      });

      map.current.setTerrain({
          'source': 'mapbox-dem',
          'exaggeration': 1.5
      });
    });

    map.current.on("load", () => {

      //add center for map animation
      map.current.addSource('center', {
        'type': 'geojson',
        'data': {
            'type': 'Point',
            'coordinates': [-94, 40]
        }
      });

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

    setTimeout(() => {
      map.current.flyTo({zoom: 5.5, center: [-134.5, 57.2],
        essential: true, duration: 6000})
      setLng(-134.5);
      setLat(57.2);
      setZoom(5.5);
    }, 1000);
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
      <div className="map">
        <div ref={mapContainer} style={{ height: "100%", width: "100%"}} />
        <pre id="info">Hover to see coordinates!</pre>
      </div>
    </>
  );
}