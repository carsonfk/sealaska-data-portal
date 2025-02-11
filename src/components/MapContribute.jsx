import React, { useRef, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function MapContribute(props) {
  //let locations = props.locations;

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-122.308);
  const [lat, setLat] = useState(47.655);
  const [zoom, setZoom] = useState(14.3);
  const [featureLocations, setFeatureLocations] = useState([]);
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });

}