import { useRef, useState, useEffect, useCallback } from "react";
import { useQueryParams, capitalizeFirst } from "../functions";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function Map( {locations, mode, target, selectionCoordinates, sidebars, onSelect, onTemp}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const { getParam, setParam } = useQueryParams();
  const [lng, setLng] = useState(-103);
  const [lat, setLat] = useState(27);
  const [zoom, setZoom] = useState(2);
  const [featureLocations, setFeatureLocations] = useState([]);
  const [styleSwap, setStyleSwap] = useState();
  const [marker, setMarker] = useState(new mapboxgl.Marker({
    id: 'marker',
    draggable: true
  }));
  const [popup, setPopup] = useState(new mapboxgl.Popup({
    closeOnClick: false,
    closeButton: false
  }));

  //initializes menu & legend click event
  function menuLegendClick(selected, other) {
    document.getElementById(selected.id + "-icon").onclick = () => {
      for (let item of selected.getElementsByTagName('div')) {
        item.classList.toggle("hide");
      }
      for (let item of other.getElementsByTagName('div')) {
        if (!item.classList.contains("hide")) {
          item.classList.toggle("hide");
        }
      }
    }
  }

  //handles flying to provided coordinates
  function flyTo(coordinates) {
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
  }
  
  //begins popup construction and fly with or without image
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
    flyTo(coordinates);

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

  //if legend subgroup doesnt already exist, builds and adds to legend element
  function buildLegend(name, items, colors) {
    let legend = document.getElementById('legend');
    if (!legend.querySelector('#' + name)) {
      let legendSubgroup = document.createElement('div');
      legendSubgroup.id = name;
      legendSubgroup.className = 'flex-vertical menu-legend-subgroup hide'
      legend.appendChild(legendSubgroup);
      let subtitle = document.createElement('h4');
      subtitle.innerHTML = capitalizeFirst(name);
      legendSubgroup.appendChild(subtitle);
      items.forEach((layer, i) =>{
        const color = colors[i];
        const item = document.createElement('div');
        const key = document.createElement('span');
        key.className = 'legend-key';
        key.id = name + '-key';
        key.style.backgroundColor = color;
        key.style.color = color;

        const value = document.createElement('span');
        value.innerHTML = `${layer}`;
        item.appendChild(key);
        item.appendChild(value);
        legendSubgroup.appendChild(item);
      });
    }
  }

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
    if (map.current) {
      var classes = document.getElementById("mapContainer").classList;
      if ((sidebars[0] && classes.contains("no-left")) || (!sidebars[0] && !classes.contains("no-left"))) {
        classes.toggle("no-left");
        document.getElementById("alt-title").classList.toggle("no-left");
      }
      if ((sidebars[1] && classes.contains("no-right")) || (!sidebars[1] && !classes.contains("no-right"))) {
        classes.toggle("no-right");
        document.getElementById("menu-legend").classList.toggle("no-right");
      }
      map.current.resize();
    }
  }, [sidebars]);

  useEffect(() => {
    if (locations) {
      popup.remove();
      setFeatureLocations(locations); //setState of features to jsonified features
    }
  }, [locations]); //fire this whenever the features put into the map change

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
    getParam("mapStyle") ? style = "mapbox://styles/mapbox/" + 
      getParam("mapStyle") : style = "mapbox://styles/mapbox/satellite-streets-v12";
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

    var menu = document.getElementById('menu');
    var legend = document.getElementById('legend');
    menuLegendClick(menu, legend);
    menuLegendClick(legend, menu);

    let inputs = document.getElementById('basemap-menu').getElementsByTagName('input');
    let mapElement = document.getElementById("map");
    for (let input of inputs) {
      if (input.checked) {
        if (input.classList.contains("light")) {
          mapElement.classList.add("light");
        } else {
          mapElement.classList.remove("light");
        }
      }
      input.onclick = (layer) => {
        let layerId = layer.target.id;
        if (!map.current.style.globalId.includes(layerId)) {
          setStyleSwap(layerId);
          if (layerId === 'satellite-streets-v12') {
            map.current.setStyle('mapbox://styles/mapbox/satellite-streets-v12');
            setParam('mapStyle', null);
          } else {
            map.current.setStyle('mapbox://styles/mapbox/' + layerId);
            setParam('mapStyle', layerId);
          }

          if (input.classList.contains("light")) {
            mapElement.classList.add("light");
          } else {
            mapElement.classList.remove("light");
          }
        }
      };
    }

    map.current.on('load', function () {
      //add map controls
      map.current.addControl(new mapboxgl.NavigationControl());

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
                        'case',
                        ['==', ['get', 'account'], 'anon'],
                        ['match', ['get', 'reviewed'], 'true', 'orange', 'false', '#ccc', '#808080'],
                        ['==', ['get', 'account'], 'sealaska'],
                        ['match', ['get', 'reviewed'], 'true', '#CD202D', 'false', '#CD202D', '#808080'],
                        'white' // Default color
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


      //build legend based on enabled layers
      const locationsItems = [
        'Reviewed',
        'Unreviewed',
        'Sealaska'
      ];

      const locationsColors = [
        'orange',
        '#ccc',
        '#CD202D'
      ];

      const projectsItems = [
        'Stream Restoration',
        'Construction',
        'Other'
      ];

      const projectsColors = [
        'blue',
        'yellow'
      ];

      const taxBlocksItems = [
        'Sealaska',
        'Village Corporation'
      ];

      const taxBlocksColors = [
        'rgba(250, 100, 100, 0.2)',
        'rgba(200, 100, 240, 0.2)'
      ];

      const roadsItems = [
        'Existing',
        'Closed',
        'Unknown'
      ];

      const roadsColors = [
        'black',
        'gray'
      ];

      buildLegend('locations', locationsItems, locationsColors);
      buildLegend('projects', projectsItems, projectsColors);
      buildLegend('lands', taxBlocksItems, taxBlocksColors);
      buildLegend('roads', roadsItems, roadsColors);
    });

    //redirect user to google maps for more info
    //map.current.on("click", "locations_layer", (point) => {
    //  const coordinates = point.features[0].geometry.coordinates.slice();
    //  const url = `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`;
    //  window.open(url, "_blank");
    //});

    return () => {
      map.current.remove();
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (map.current.getSource('locations')) {
        //update the source of the features on the map
        const source = map.current.getSource("locations");
        source.setData({
          type: 'FeatureCollection',
          features: featureLocations,
        });
      }
    }, 200);
  }, [featureLocations, styleSwap]); //everytime the featureLocations state or map style is changed

  useEffect(() => {
    let layerList = ['locations_layer', 'transparent_layer'];
    if (mode === 'view') { //events added and removed from map in view mode
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
        map.current.on('mouseenter', layerList[i], popupPointerRef.current);
        defaultPointerRef.current = defaultPointer;
        map.current.on('mouseleave', layerList[i], defaultPointerRef.current);
      }
      onSelect([]); //figure out how to not call on initialization

    } else { //events added and removed from map in contribute mode
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
        map.current.off('mouseenter', layerList[i], popupPointerRef.current);
        map.current.off('mouseleave', layerList[i], defaultPointerRef.current);
        popup.remove();
      }
    }
  }, [mode]);

  return (
    <>
      <div id="mapContainer" ref={mapContainer} />
      <div id="alt-title" className="main-container">Sealaska Data Portal</div>
      <div id="info" className="main-container map-element">Hover to see coordinates!</div>
      <div id="menu-legend" className="flex-vertical map-element">
        <div id="menu" className="main-container">
          <img id="menu-icon" className="interactive icon" alt="From icons.com" src="https://images.icon-icons.com/2030/PNG/512/layers_icon_124022.png"></img>
          <div id="basemap-menu" className="flex-vertical menu-legend-subgroup hide">
            <div className="interactive menu-item">
              <input id="satellite-streets-v12" type="radio" name="rtoggle" value="satellite" defaultChecked={!getParam("mapStyle")}/>
              <label for="satellite-streets-v12">Satellite</label>
            </div>
            <div className="interactive menu-item">
              <input id="outdoors-v12" className="light" type="radio" name="rtoggle" value="outdoors" defaultChecked={getParam('mapStyle') === "outdoors-v12"}/>
              <label for="outdoors-v12">Outdoors</label>
            </div>
            <div className="interactive menu-item">
              <input id="dark-v11" type="radio" name="rtoggle" value="dark" defaultChecked={getParam('mapStyle') === "dark-v11"}/>
              <label for="dark-v11">Dark</label>
            </div>
            <div className="interactive menu-item">
              <input id="light-v11" className="light" type="radio" name="rtoggle" value="light" defaultChecked={getParam('mapStyle') === "light-v11"}/>
              <label for="light-v11">Light</label>
            </div>
          </div>
          <div id="layer-menu" className="flex-vertical menu-legend-subgroup hide">
            <div className="interactive menu-item">
              <input id="posts" type="checkbox" name="rtoggle" value="posts" defaultChecked/>
              <label for="posts">Posts</label>
            </div>
            <div className="interactive menu-item">
              <input id="projects" type="checkbox" name="rtoggle" value="projects" defaultChecked/>
              <label for="projects">Projects</label>
            </div>
            <div className="interactive menu-item">
              <input id="lands" type="checkbox" name="rtoggle" value="lands" defaultChecked/>
              <label for="lands">Lands</label>
            </div>
            <div className="interactive menu-item">
              <input id="roads" type="checkbox" name="rtoggle" value="roads" defaultChecked/>
              <label for="roads">Roads</label>
            </div>
          </div>
        </div>
        <div id="legend" className="main-container">
          <img id="legend-icon" className="icon interactive" alt="From freeiconspng.com" src="https://www.freeiconspng.com/uploads/black-key-icon-7.png"></img>
        </div>
      </div>
    </>
  );
}