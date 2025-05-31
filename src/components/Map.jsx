import React, { useRef, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function Map( {locations, mode, target, selectionCoordinates, onSelect, onTemp, sidebars}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-103);
  const [lat, setLat] = useState(27);
  const [zoom, setZoom] = useState(2);
  const [featureLocations, setFeatureLocations] = useState([]);
  const [timer, setTimer] = useState([]);
  const [styleSwap, setStyleSwap] = useState();
  const [searchParams, setSearchParams] = useSearchParams();
  const [marker, setMarker] = useState(new mapboxgl.Marker({
    id: 'marker',
    draggable: true
  }));
  const [popup, setPopup] = useState(new mapboxgl.Popup({
    closeOnClick: false,
    closeButton: false
  }));

  const paramValue = searchParams.get('mapStyle');

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
      let lngDelta = Math.abs(map.current.getCenter().lng - coordinates[0]);
      let latDelta = Math.abs(map.current.getCenter().lat - coordinates[1]);
      let zoomLevel = map.current.getZoom();
      let flyDuration = 1000 + (lngDelta * 20) + (latDelta * 20) + (zoomLevel * 300);
      map.current.flyTo({center: [coordinates[0], coordinates[1]],
        essential: true, duration: flyDuration})
      setLng(coordinates[0]);
      setLat(coordinates[1]);
      setZoom(map.current.getZoom());
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
    if (map.current) {
      var classes = document.getElementById("mapContainer").classList;
      if ((sidebars[0] && classes.contains("left")) || (!sidebars[0] && !classes.contains("left"))) {
        classes.toggle("left");
        console.log("hi left")
      }
      if ((sidebars[1] && classes.contains("right")) || (!sidebars[1] && !classes.contains("right"))) {
        classes.toggle("right");
        console.log("hi right")
      }
      map.current.resize();
    }
  }, [sidebars])

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
      marker.remove();
      onSelect([]);
    }
  const onRightClickRef = useRef(onRightClick);

  //click on point places popup
  const onPopup = 
    (point) => {
      onTemp(point.features[0].id);
      handlePopup(point.features[0]);
    }
  const onPopupRef = useRef(onPopup);

  //cursor becomes pointer when hovering over point
  const popupPointer =
    () => {
      map.current.getCanvas().style.cursor = "pointer";

      //const coordinates = point.features[0].geometry.coordinates.slice();
      //const name = point.features[0].properties.name;
      //const type = point.features[0].properties.type.charAt(0).toUpperCase()
      //  + point.features[0].properties.type.slice(1);

      //while (Math.abs(point.lngLat.lng - coordinates[0]) > 180) {
      //  coordinates[0] += point.lngLat.lng > coordinates[0] ? 360 : -360;
      //}
    }
  const popupPointerRef = useRef(popupPointer);

  //cursor returns to defualt when exiting point
  const defaultPointer =
    () => {
      map.current.getCanvas().style.cursor = "";
    }
  const defaultPointerRef = useRef(defaultPointer);

  //click outside of point removes popup
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
        let targetFeature;
        for (let i = 0; i < featureLocations.length; i++) {
          if (featureLocations[i].id === parseInt(target[0])) {
            targetFeature = featureLocations[i];
          }
        }
        handlePopup(targetFeature);
      } else {
        popup.remove();
      }
    }
  }, [target]);

  useEffect(() => {
    mapboxgl.accessToken =
    "pk.eyJ1IjoiamFrb2J6aGFvIiwiYSI6ImNpcms2YWsyMzAwMmtmbG5icTFxZ3ZkdncifQ.P9MBej1xacybKcDN_jehvw";
    if (map.current) return; // initialize map only once

    var style;
    searchParams.get("mapStyle") ? style = "mapbox://styles/mapbox/" + 
      searchParams.get("mapStyle") : style = "mapbox://styles/mapbox/satellite-streets-v12";
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: style,
      center: [lng, lat],
      zoom: zoom
    });

    map.current.on('mousemove', (e) => {
      let mouseLat = e.lngLat.lat;
      let mouseLng = e.lngLat.lng;
      document.getElementById('info').innerHTML =
          // displays latitude, longitude of click/hover
          Math.abs(parseFloat(JSON.stringify(mouseLat)).toFixed(4)) + ((mouseLat >= 0) ? "°N" : "°S") +
            ", " + Math.abs(parseFloat(JSON.stringify(mouseLng)).toFixed(4)) + ((mouseLng >= 0) ? "°E" : "°W");
    });

    let close = document.getElementById("location-close");
    close.onclick = () => {
      let update = document.getElementById("update");
      update.classList.toggle("hide");
    };

    var menu1 = document.getElementById("menu-icon");
    var menu2 = document.getElementById('menu-container').getElementsByTagName('div');
    var legend1 = document.getElementById("legend-icon");
    var legend2 = document.getElementById('legend-container').getElementsByTagName('div');
    menu1.onclick = () => {
      for (let item of menu2) {
        item.classList.toggle("hide");
      }
      for (let item of legend2) {
        if (!item.classList.contains("hide")) {
          item.classList.toggle("hide");
        }
      }
    }
    legend1.onclick = () => {
      for (let item of legend2) {
        item.classList.toggle("hide");
      }
      for (let item of menu2) {
        if (!item.classList.contains("hide")) {
          item.classList.toggle("hide");
        }
      }
    }

    let inputs = document.getElementById('basemap-menu').getElementsByTagName('input');
    for (let input of inputs) {
      input.onclick = (layer) => {
       let layerId = layer.target.id;
        if (!map.current.style.globalId.includes(layerId)) {
          setStyleSwap(layerId);
          if (layerId === 'satellite-streets-v12') {
            map.current.setStyle('mapbox://styles/mapbox/satellite-streets-v12');
            searchParams.delete('mapStyle');
            setSearchParams(searchParams);
          } else {
            map.current.setStyle('mapbox://styles/mapbox/' + layerId);
            setSearchParams({ mapStyle: layerId});
          }
        }
      };
    }

    map.current.on('load', function () {
      //add center for map animation
      map.current.addSource('center', {
        type: 'geojson',
        data: {
            type: 'Point',
            coordinates: [-94, 40]
        }
      });

      //initial map animation
      setTimeout(() => {
        map.current.flyTo({zoom: 6, center: [-134.5, 57.2], bearing: 10,
          essential: true, duration: 10000})
        setLng(-134.5);
        setLat(57.2);
        setZoom(6.0);
      }, 1000);
    });

    map.current.on("style.load", () => {

      if (map.current.getStyle().name.includes("Outdoors") || map.current.getStyle().name.includes("Satellite")) {
        //custom atmosphere styling for outdoor map
        if (map.current.getStyle().name.includes("Outdoors")) {
          map.current.setFog({
            'color': 'rgb(247, 193, 193)', // Pink fog / lower atmosphere
            'high-color': 'rgb(36, 92, 223)', // Blue sky / upper atmosphere
            'horizon-blend': 0.1 // Exaggerate atmosphere (default is .1)
          });
        }
        //elevation model for outdoor and satellite maps
        map.current.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.terrain-rgb'
        });
        map.current.setTerrain({
            'source': 'mapbox-dem',
            'exaggeration': 1
        });
      }

      //taxblocks layer
      map.current.addSource('taxblocks', {
          'type': 'geojson',
          'data': 'https://services7.arcgis.com/q9QUA4QfbvUGfm76/ArcGIS/rest/services/Tax_Blocks_(geojson)/FeatureServer/0/query?where=1%3D1&outSR=4326&outFields=SURFOWNER&outFields=TAX_NAME&f=pgeojson'
      });
      map.current.addLayer({
        'id': 'taxblocks_layer',
        'type': 'fill',
        'source': 'taxblocks',
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
            ]
        }
      });
      //map.current.addLayer({
      //  id: 'taxblock_labels',
      //  type: 'symbol',
      //  source: 'taxblocks',
      //  layout: {
      //    'text-field': ['get', 'SURFOWNER'],
      //    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
      //    'text-radial-offset': 0.5,
      //    'text-justify': 'auto',
      //    //'icon-image': ['get', 'icon']
      //  }
      //});

      //roads layer
      map.current.addSource("roads", {
        'type': 'geojson',
        'data': 'https://services7.arcgis.com/q9QUA4QfbvUGfm76/arcgis/rest/services/Roads_16May_(geojson)/FeatureServer/0/query?where=1%3D1&outSR=4326&outFields=RD_OWNER&f=pgeojson'
      })
      map.current.addLayer({
        'id': 'roads_layer',
        'type': 'fill',
        'source': 'roads',
        'paint': {
          'color': [
              'match',
              ['get', 'RD_OWNER'],
              'Sealaska',
              'rgba(250, 100, 100, 0.2)',
              'rgba(200, 100, 240, 0.2)'
            ],
        }
      });


      //locations layer + transparent layer (easier click)
      map.current.addSource("locations", {
        'type': "geojson",
        'data': {
          'type': "FeatureCollection",
          'features': featureLocations,
        }
      });
      map.current.addLayer({
        'id': "locations_layer",
        'type': "circle",
        'source': "locations",
        'paint': {
          "circle-radius": 6,
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
        }
      });
      map.current.addLayer({
        'id': "transparent_layer",
        'type': "circle",
        'source': "locations",
        'paint': {
          "circle-radius": 20,
          'circle-opacity': 0
        }
      });
    });

    //redirect user to google maps for more info
    //map.current.on("click", "locations_layer", (point) => {
    //  const coordinates = point.features[0].geometry.coordinates.slice();
    //  const url = `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`;
    //  window.open(url, "_blank");
    //});
    map.current.addControl(new mapboxgl.NavigationControl());

    return () => {
      map.current.remove();
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (map.current.getSource("locations")) {
        //update the source of the features on the map
        const source = map.current.getSource("locations");
        source.setData({
          type: "FeatureCollection",
          features: featureLocations,
        });
      }
    }, 200);
  }, [featureLocations, styleSwap]); //everytime the featureLocations state or map style is changed

  useEffect(() => {

    let layerList = ["locations_layer", "transparent_layer"];
    if (mode === 'view') { //added/removed from map in view mode
      //map.current.getCanvas().style.cursor = ""
      map.current.off('click', addPointsRef.current);
      marker.off('dragend', dragEndRef.current);
      marker.remove();
      removePopupRef.current = removePopup;
      map.current.on('click', removePopupRef.current);
      //removePopupRefTest.current = removePopupTest;
      //popup.on('close', removePopupRefTest.current);
      onPopupRef.current = onPopup;
      for (let i = 1; i < layerList.length; i++) {
        map.current.on('click', layerList[i], onPopupRef.current);
        popupPointerRef.current = popupPointer;
        map.current.on("mouseenter", layerList[i], popupPointerRef.current);
        defaultPointerRef.current = defaultPointer;
        map.current.on("mouseleave", layerList[i], defaultPointerRef.current);
      }

      onSelect([]);
    } else { //added/removed from map in contribute mode
      //map.current.getCanvas().style.cursor = "pointer"
      addPointsRef.current = addPoints;
      map.current.on('click', addPointsRef.current);
      dragEndRef.current = onDragEnd
      marker.on('dragend', dragEndRef.current);
      onRightClickRef.current = onRightClick;
      marker.on('contextmenu', onRightClickRef.current);
      map.current.off('click', removePopupRef.current);
      for (let i = 1; i < layerList.length; i++) {
        map.current.off('click', layerList[i], onPopupRef.current);
        map.current.off("mouseenter", layerList[i], popupPointerRef.current);
        map.current.off("mouseleave", layerList[i], defaultPointerRef.current);
        popup.remove();
      }
    }
  }, [mode]);

  return (
    <>
      <div id="mapContainer" ref={mapContainer} />
      <div id="info">Hover to see coordinates!</div>
      <div id="update" className="hide">
        <div id="location-msg">Locations Updated</div>
        <div id="location-close">CLOSE</div>
      </div>
      <div id="menu-legend" className="flex-vertical">
        <div id="menu-container">
          <img id="menu-icon" alt="Image from icons.com" src="https://images.icon-icons.com/2030/PNG/512/layers_icon_124022.png"></img>
          <div id="basemap-menu" className="flex-vertical hide">
            <div id="menu-item">
              <input id="satellite-streets-v12" type="radio" name="rtoggle" value="satellite" defaultChecked={!searchParams.get("mapStyle")}/>
              <label for="satellite-streets-v12">Satellite</label>
            </div>
            <div id="menu-item">
              <input id="outdoors-v12" type="radio" name="rtoggle" value="outdoors" defaultChecked={paramValue === "outdoors-v12"}/>
              <label for="outdoors-v12">Outdoors</label>
            </div>
            <div id="menu-item">
              <input id="dark-v11" type="radio" name="rtoggle" value="dark" defaultChecked={paramValue === "dark-v11"}/>
              <label for="dark-v11">Dark</label>
            </div>
            <div id="menu-item">
              <input id="light-v11" type="radio" name="rtoggle" value="light" defaultChecked={paramValue === "light-v11"}/>
              <label for="light-v11">Light</label>
            </div>
          </div>
          <div id="layer-menu" className="flex-vertical hide">
            <div id="menu-item">
              <input id="posts" type="checkbox" name="rtoggle" value="posts" defaultChecked/>
              <label for="posts">Posts</label>
            </div>
            <div id="menu-item">
              <input id="sealaska-lands" type="checkbox" name="rtoggle" value="sealaska-lands" defaultChecked/>
              <label for="sealaska-lands">Lands</label>
            </div>
            <div id="menu-item">
              <input id="roads" type="checkbox" name="rtoggle" value="roads" defaultChecked/>
              <label for="roads">Roads</label>
            </div>
          </div>
        </div>
        <div id="legend-container">
          <img id="legend-icon" alt="Image from freeiconspng.com" src="https://www.freeiconspng.com/uploads/black-key-icon-7.png"></img>
          <div id="legend" className="flex-vertical hide">
            <div id="legend-item">
              <h2>hello world!</h2>
            </div>
          </div>
        </div>
      </div>
      <div id="alt-title">Sealaska Data Portal</div>
    </>
  );
}