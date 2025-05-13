import React, { useRef, useState, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function Map( {locations, mode, target, selectionCoordinates, onSelect, onTemp}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-103);
  const [lat, setLat] = useState(27);
  const [zoom, setZoom] = useState(2);
  const [featureLocations, setFeatureLocations] = useState([]);
  const [timer, setTimer] = useState([]);
  const [marker, setMarker] = useState(new mapboxgl.Marker({
    id: 'marker',
    draggable: true
  }));
  const [popup, setPopup] = useState(new mapboxgl.Popup({
    closeOnClick: false,
    closeButton: false
  }));

  //begins popup construction with or without image
  function handlePopup(feature) {
    let coordinates = feature.geometry.coordinates.slice();
    let type = feature.properties.type.charAt(0).toUpperCase()
      + feature.properties.type.slice(1);
    let details = feature.properties.details;
    let reviewed = feature.properties.reviewed === "true";
    let timestamp = feature.properties.timestamp;
    if (typeof timestamp === "string") {
      timestamp = JSON.parse(timestamp);
    }

    if (target[1] === 'list') {
      map.current.flyTo({center: [coordinates[0], coordinates[1]],
      essential: true, duration: 3000})
      setLng(coordinates[0]);
      setLat(coordinates[1]);
      //setZoom(6.0);
    }

    if (feature.properties.image !== "") {
      const img = new Image();
      img.src = feature.properties.image;
      img.onload = () => { // Perform actions with the loaded image
        const imgStr = img.outerHTML;
        buildPopup(coordinates, type, details, reviewed, timestamp, imgStr);
      }
    } else {
      buildPopup(coordinates, type, details, reviewed, timestamp, "");
    }
  }
  
  //constructs a reviewed/unreviewed popup using provided parameters
  function buildPopup(coordinates, type, details, reviewed, timestamp, img) {
    if (reviewed) {
      popup
        .setLngLat(coordinates)
        .setHTML("<strong><h2>" + type + "</h2></strong>" + img + "<h6>" + details + "</h6>" + timestamp.time + " · " + timestamp.date)
        .addTo(map.current);
    } else {
      popup
        .setLngLat(coordinates)
        .setHTML("Awaiting manual review")
        .addTo(map.current);
    }
  }

  useEffect(() => {
    if (locations) {
      let update = document.getElementById("update");
      if (!update.classList.contains("hide")) { // case 1: update msg is visible because of recent refresh -> reset popup
        update.classList.toggle("hide");
        setTimeout(() => {
          update.classList.toggle("hide");
        }, 100)
      } else { // case 2: update msg is hidden -> make visible
        update.classList.toggle("hide");
      }
      if (timer.length !== 0) { //restart update msg hide timer if ongoing
        clearTimeout(timer);
      }
      setTimer(setTimeout(() => { //set update msg hide timer
        if (!update.classList.contains("hide")) {
          update.classList.toggle("hide");
        }
      }, 7000));

      popup.remove();
      setFeatureLocations(locations); //setState of features to jsonified features
    }
  }, [locations]); //fire this whenever the features put into the map change

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
    (e) => {
      e.preventDefault();
      let coordinates = e.lngLat;
      if (coordinates.lat >= 54.5 && coordinates.lat <= 60 && 
         coordinates.lng >= -140 && coordinates.lng <= -130.25) {
          marker.setLngLat(coordinates).addTo(map.current);
          //setMarker(marker);
          onSelect([coordinates.lat, coordinates.lng]);
         }
    }
  const addPointsRef = useRef(addPoints);

  //right click removes marker
  const onRightClick = 
    () => {
      //console.log("hello world!");
      marker.remove();
      onSelect([]);
    }
  const onRightClickRef = useRef(onRightClick);

  const onPopup = 
    (point) => {
      onTemp(point.features[0].id);
      handlePopup(point.features[0]);
    };
  
  const onPopupRef = useRef(onPopup);

  const popupPointer =
    () => {
      map.current.getCanvas().style.cursor = "pointer";
    }
  const popupPointerRef = useRef(popupPointer);

  const defaultPointer =
    () => {
      map.current.getCanvas().style.cursor = "";
    }
  const defaultPointerRef = useRef(defaultPointer);

  const removePopup =
    () => {
      onTemp(-1);
      popup.remove();
    }
  const removePopupRef = useRef(removePopup);

  //const removePopupTest =
  //  () => {
  //    console.log('hello');
  //  }
  //const removePopupRefTest = useRef(removePopupTest);

  useEffect(() => {
      if (mode === 'contribute') { //stuff that happens when map is swapped to contribute mode
        //map.current.getCanvas().style.cursor = "pointer"
        addPointsRef.current = addPoints;
        map.current.on('click', addPointsRef.current);
        dragEndRef.current = onDragEnd
        marker.on('dragend', dragEndRef.current);
        onRightClickRef.current = onRightClick;
        marker.on('contextmenu', onRightClickRef.current);
        //setMarker(marker);
      } else if (map.current && mode === 'view') { //stuff that happens when map is swapped to view mode
        //map.current.getCanvas().style.cursor = ""
        map.current.off('click', addPointsRef.current);
        marker.off('dragend', dragEndRef.current);
        marker.remove();
        //setMarker(marker);
        onSelect([]);
      }
  }, [mode]); //fire this whenever the mode changes

  useEffect(() => {
    if (selectionCoordinates[1] === 'box') {
      if (selectionCoordinates[0][0] >= 54.5 && selectionCoordinates[0][0] <= 60 && 
        selectionCoordinates[0][1] >= -140 && selectionCoordinates[0][1] <= -130.25) {
          marker.setLngLat([selectionCoordinates[0][1], selectionCoordinates[0][0]]).addTo(map.current);
        } else {
          marker.remove();
        }
    }
  }, [selectionCoordinates]); //fires whenever a coordinate is changed

  useEffect(() => {
    if (mode === 'view' && (target[1] === 'list' || target[1] === 'reset')) {
      if (target[0] !== -1) {
        console.log(target)
        let targetFeature;
        for (let i = 0; i < featureLocations.length; i++) {
          if (featureLocations[i].id === parseInt(target[0])) {
            targetFeature = featureLocations[i];
          }
        }
        handlePopup(targetFeature);
      } else {
        popup.remove();
        console.log("lalala")
      }
    }
  }, [target]);

  mapboxgl.accessToken =
    "pk.eyJ1IjoiamFrb2J6aGFvIiwiYSI6ImNpcms2YWsyMzAwMmtmbG5icTFxZ3ZkdncifQ.P9MBej1xacybKcDN_jehvw";
  useEffect(() => {
    let close = document.getElementById("location-close");
    close.addEventListener("click", () => {
      let update = document.getElementById("update");
      update.classList.toggle("hide");
    });

    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [lng, lat],
      zoom: zoom,
      //maxBounds: bounds
    });

    map.current.on('mousemove', (e) => {
      let mouseLat = e.lngLat.lat;
      let mouseLng = e.lngLat.lng;
      document.getElementById('info').innerHTML =
          // displays latitude, longitude of click/hover
          Math.abs(parseFloat(JSON.stringify(mouseLat)).toFixed(4)) + ((mouseLat >= 0) ? "°N" : "°S") +
            ", " + Math.abs(parseFloat(JSON.stringify(mouseLng)).toFixed(4)) + ((mouseLng >= 0) ? "°E" : "°W");
    });

    //map.current.on('load', function () {
      
    //});

    //map.current.on('style.load', () => {
    //});

    map.current.on("style.load", () => {
      // Custom atmosphere styling
      map.current.setFog({
        'color': 'rgb(247, 193, 193)', // Pink fog / lower atmosphere
        'high-color': 'rgb(36, 92, 223)', // Blue sky / upper atmosphere
        'horizon-blend': 0.1 // Exaggerate atmosphere (default is .1)
      });

      map.current.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.terrain-rgb'
      });

      map.current.setTerrain({
          'source': 'mapbox-dem',
          'exaggeration': 1.5
      });

      //add center for map animation
      map.current.addSource('center', {
        type: 'geojson',
        data: {
            type: 'Point',
            coordinates: [-94, 40]
        }
      });

      setTimeout(() => {
        map.current.flyTo({zoom: 6.0, center: [-134.5, 57.2],
          essential: true, duration: 10000})
        setLng(-134.5);
        setLat(57.2);
        setZoom(6.0);
      }, 1000);

      map.current.addLayer({
        'id': 'taxblocks',
        'type': 'fill',
        'source': {
            'type': 'geojson',
            'data': 'https://services7.arcgis.com/q9QUA4QfbvUGfm76/ArcGIS/rest/services/Tax_Blocks_(geojson)/FeatureServer/0/query?where=1%3D1&outSR=4326&outFields=SURFOWNER&f=pgeojson'
        },
        'paint': {
            'fill-color': [
              'match',
              ['get', 'SURFOWNER'],
              'Sealaska',
              'rgba(250, 100, 100, 0.2)',
              'rgba(200, 100, 240, 0.2)'
            ],
            'fill-outline-color': 
            [
              'match',
              ['get', 'SURFOWNER'],
              'Sealaska',
              'rgba(250, 100, 100, 1)',
              'rgba(200, 100, 240, 1)'
            ],
        }
    });

      map.current.addSource("locations", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: featureLocations,
        }
      });

      map.current.addLayer({
        id: "locations_layer",
        type: "circle",
        source: "locations",
        paint: {
          "circle-radius": 7,
          "circle-stroke-width": 2,
          'circle-color': [
                        'match',
                        ['get', 'reviewed'],
                        'true',
                        'orange',
                        'false',
                        '#ccc',
                        'white'
                    ],
          "circle-stroke-color": "white"
        },
      });
    });

    //redirect user to google maps for more info
    //map.current.on("click", "locations_layer", (point) => {
    //  const coordinates = point.features[0].geometry.coordinates.slice();
    //  const url = `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`;
    //  window.open(url, "_blank");
    //});
  }, []);

  useEffect(() => {
    if (map.current.getSource("locations")) {
      //update the source of the features on the map
      //console.log(featureLocations);
      const source = map.current.getSource("locations");
      source.setData({
        type: "FeatureCollection",
        features: featureLocations,
      });
    }
  }, [featureLocations]); // everytime the featureLocations state is changed

  //note: consider moving this section
  useEffect(() => {
    if (mode === 'view') {
      removePopupRef.current = removePopup;
      map.current.on('click', removePopupRef.current);
      //removePopupRefTest.current = removePopupTest;
      //popup.on('close', removePopupRefTest.current);
      onPopupRef.current = onPopup;
      map.current.on('click', "locations_layer", onPopupRef.current);
      popupPointerRef.current = popupPointer;
      map.current.on("mouseenter", "locations_layer", popupPointerRef.current);
      defaultPointerRef.current = defaultPointer;
      map.current.on("mouseleave", "locations_layer", defaultPointerRef.current);
    } else {
      map.current.off('click', removePopupRef.current);
      map.current.off('click', "locations_layer", onPopupRef.current);
      map.current.off("mouseenter", "locations_layer", popupPointerRef.current);
      map.current.off("mouseleave", "locations_layer", defaultPointerRef.current);
      popup.remove();
    }
  }, [mode])

  return (
    <>
      <div className="map">
        <div ref={mapContainer} style={{ height: "100%", width: "100%"}} />
        <div id="info">Hover to see coordinates!</div>
        <div id="update" className="hide">
          <div id="location-msg">Locations Updated</div>
          <div id="location-close">CLOSE</div>
        </div>
      </div>
    </>
  );
}