import React, { useRef, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function Map( {locations, mode, onSelect}) {
  //let locations = props.locations;

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-134);
  const [lat, setLat] = useState(56);
  const [zoom, setZoom] = useState(4.3);
  const [featureLocations, setFeatureLocations] = useState([]);
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });

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

  let marker = new mapboxgl.Marker()
  let coordinates = [];

  //gets click coordinates and adds marker to map at click (needs to remove old point still)
  const addPoints = (event) => { //change to function (e)?
    event.preventDefault();
    if (coordinates.length != 0) {
      map.removeLayer(marker);
    }
    coordinates = event.lngLat;
    marker.setLngLat(coordinates)
      .addTo(map);
    onSelect(coordinates);
  }

  useEffect(() => {
      if (mode == 'c') { //stuff that happens when map is swapped to contribute mode
        map.current.addLayer({id: 'marker'})
        map.current.on('click', 'marker', addPoints);
        
      } else if (mode == 'v') { //stuff that happens when map is swapped to view mode (and on start)
        if (map.current.getLayer('marker')) {
          map.current.removeLayer('marker');
        }
  
        //map.off('click', addPoints);
        //marker.remove()
        //map.removeLayer(marker);
      }
  }, [mode]); //fire this whenever the mode changes

  mapboxgl.accessToken =
    "pk.eyJ1IjoiamFrb2J6aGFvIiwiYSI6ImNpcms2YWsyMzAwMmtmbG5icTFxZ3ZkdncifQ.P9MBej1xacybKcDN_jehvw";
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
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
      <div style={{ paddingBottom: "30px" }}>
        <div ref={mapContainer} style={{ height: "700px", width: "1400px" }} />
      </div>
    </>
  );
}