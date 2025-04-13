import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../styles/map.css';
import OptionsMenu from './OptionsMenu';

mapboxgl.accessToken = "";

// The main component in the UI is the map component!
const MapComponent = () => {
    // map container
    const mapContainer = useRef(null);
    // the map itself
    const map = useRef(null);
    // initialize user location
    var userLocation = null;

    // these are the initialized states of the checkboxes under "surroundings" in the 
    // top right hand corner
    const [layerOptions, setLayerOptions] = useState([
        {id: "activeThreat", label: "Active Threats", checked: false},
        {id: "pastThreat", label: "Past Threats", checked: false},
        {id: "emergencyCalls", label: "911 Calls", checked: false}
    ]);

    // clicking on "surroundings" makes this true and makes the dropdown menu appear.
    const [showOptions, setShowOptions] = useState(false);
    // the crime data from loading in simulated data from the JSON file (crimes.json), which is found 
    // in /public/data/*
    const [crimeData, setCrimeData] = useState(null);
    // 911 call data from loading in simulated data from the emergency_calls.json
    const [emergencyCallsData, setEmergencyCallsData] = useState(null);

    // function for organizing the json data when it comes in
    const normalizeData = (data) => {
        return data.map(item => ({
            lon: item.location.longitude,
            lat: item.location.latitude,
            locationName: item.locationName,
            description: item.description || " ",
            date: item.date || "Unknown",
            time: item.time || "Unknown",
            active: item.active ?? false
        }))
    }

    // initializing the arrays of markers on the map!
    const markerLayers = useRef({
        activeThreat: [],
        pastThreat: [],
        emergencyCalls: []
    })

    // I chose to have the surrounding crime/emergency data loaded immediately after the map itself loads.
    useEffect(() => {
        // if map not loaded yet
        if (!map.current) {
            // get the user's location and assign to var userLocation (initialized above)!
            navigator.geolocation.getCurrentPosition((position) => {

                userLocation = [position.coords.longitude, position.coords.latitude];

                // make a map!
                map.current = new mapboxgl.Map({
                    container: mapContainer.current,
                    style: "mapbox://styles/mapbox/streets-v12",
                    center: userLocation,
                    zoom: 14,
                });

                // add map nav (top right corner)
                map.current.addControl(new mapboxgl.NavigationControl());

                // making and adding the marker for the user's location
                new mapboxgl.Marker({ color: 'teal' })
                    .setLngLat(userLocation)
                    .setPopup(new mapboxgl.Popup().setText(" My Location "))
                    .addTo(map.current);

                // loading in the simulated data from the json files
                Promise.all([
                    // make into a json!
                    fetch("/data/crimes.json").then(res => res.json()),
                    // make into a json!
                    fetch("/data/emergency_calls.json").then(res => res.json()),
                ]).then(([crimes, calls]) => {
                    // organize the data from crimes.json
                    const normalizedCrimeData = normalizeData(crimes);
                    // organize the data from emergency_calls.json
                    const normalizedEmergencyCallData = normalizeData(calls)
                    // update the initial crimeData state with the new data!
                    setCrimeData(normalizedCrimeData);
                    // update the initial emergencyCallsData state with the new data!
                    setEmergencyCallsData(normalizedEmergencyCallData);
                })

            }, (error) => {
                console.log(error);
                alert("Problem getting location. Turn of your VPN or check your browser settings \
                      for location permissions.")
                // If for some reason location isn't working (I found this can be a little 
                // tricky with vpn), the map will default to being centered at the Flatiron 
                // building.
                const fallbackLocation = [-73.989699, 40.741061];

                // making the map (again), this time if the location fails
                map.current = new mapboxgl.Map({
                    container: mapContainer.current,
                    style: "mapbox://styles/mapbox/streets-v12",
                    center: fallbackLocation,
                    zoom: 14
                });

                // adding nav (again) 
                map.current.addControl(new mapboxgl.NavigationControl())
                // making location accurate
                // if the program takes longer than 10s to find location, then it will throw an error
                // and default to the fallback location
                // maximumAge set to 0 means that the program will not cache the user's location
                // but always find the updated one
            }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0}
            );
        }
    }, []);

    // this handles the crime data
    const handleCrimeDataReady = (crimeData) => {
        // making sure activeThreat and pastThreat are empty (see lines 48-51)
        markerLayers.current.activeThreat = [];
        markerLayers.current.pastThreat = [];

        // for each crime instance, make a marker with the following popup format
        crimeData.forEach((crime) => {
            var status = null;

            if (crime.active) {
                status = "Active";
            } else {
                status = "Inactive";
            };

            const popup = new mapboxgl.Popup().setHTML(`
                <div>
                    <strong> Date and Time: </strong> ${crime.time} <br/>
                    <strong> Location: </strong> ${crime.locationName} <br/>
                    <strong> Status: </strong> ${status} <br/>
                    <strong> Description: </strong> ${crime.description} <br/>
                </div>
            `)

            // assigning this popup to corresponding marker
            const marker = new mapboxgl.Marker({
                // if crime is active, marker will be red; if not, it will be orange
                color: crime.active ? "red" : "orange",
                // assign marker and popup correspond lat + lon
            }).setLngLat([crime.lon, crime.lat]).setPopup(popup);

            // if active crime, add to activeThreat array at the beginning (line 20-23)
            if (crime.active) {
                markerLayers.current.activeThreat.push(marker);
            // if not, add to pastThreat
            } else {
                markerLayers.current.pastThreat.push(marker);
            }
        });

    // setting booleans (if Active Threat (checkbox) is checked, then this will be set to true)
    // otherwise this will be false by default as defined in the original state
    // this is just finding the layer option with id "activeThreat"
    const activeChecked = layerOptions.find(opt => opt.id === "activeThreat")?.checked;
    // if Past Threat (checkbox) is checked, this will be set to true
    const pastChecked = layerOptions.find(opt => opt.id === "pastThreat")?.checked;

    // if checked, then add the markers to map (for both active and past crimes)
    if (activeChecked) {
        markerLayers.current.activeThreat.forEach(marker => marker.addTo(map.current));
    } if (pastChecked) {
        markerLayers.current.pastThreat.forEach(marker => marker.addTo(map.current));
    }

};

    // this handles the 911 call data
    const handleEmergencyCallDataReady = (emergencyCallData) => {
        // making sure array (see lines 48-51) is empty
        markerLayers.current.emergencyCalls = [];

        // assigning each emergency call instance a popup with the following style
        emergencyCallData.forEach((call) => {
            var status = null;
            if (call.active) {
                status = "Active"
            } else {
                status = "Inactive"
            };
            const popup = new mapboxgl.Popup().setHTML(`
                <div>
                    <strong> Date and Time: </strong> ${call.time} <br/>
                    <strong> Location: </strong> ${call.locationName} <br/>
                    <strong> Status: </strong> ${status} <br/>
                    <strong> Description: </strong> ${call.description} <br/>
                </div>
            `)
        
        // assigning corresponding popup to marker
        const marker = new mapboxgl.Marker({color: "purple"})
                .setLngLat([call.lon, call.lat]).setPopup(popup);
            // adding marker to marker layers emergencyCalls array
            markerLayers.current.emergencyCalls.push(marker);
        });

        // keeping track of if the check box for 911 calls is checked
        const emergencyChecked = layerOptions.find(opt => opt.id === "emergencyCalls")?.checked;
        // if it is checked, add the markers to the page!
        if (emergencyChecked) {
            markerLayers.current.emergencyCalls.forEach(marker => marker.addTo(map.current));
        }
    };

    // async (promise) because this depends on if the crime data is loaded
    // so if it's loaded and the check box is checked, then add the markers to the array
    useEffect(() => {
        if (crimeData) {
            handleCrimeDataReady(crimeData)
        }
    }, [crimeData])

    // same idea here
    useEffect(() => {
        if (emergencyCallsData) {
            handleEmergencyCallDataReady(emergencyCallsData)
        }
    }, [emergencyCallsData]);

    // this handles the checking/unchecking of the boxes
    const toggleLayer = (layerId) => {
        setLayerOptions((prevOptions) => {
            // change to opposite of original state on click of each check box
            const show = !prevOptions.find((opt) => opt.id === layerId).checked;
        
            // show or hide the layer markers depending on if the checkbox is checked or not
            markerLayers.current[layerId].forEach((marker) =>
              show ? marker.addTo(map.current) : marker.remove()
            );
        
            // return the updated options
            return prevOptions.map((opt) =>
              opt.id === layerId ? { ...opt, checked: show } : opt
            );
          });
    }

    return (
        <div>
            <div 
                id = "toggle-layers"
                onClick = {() => setShowOptions((prev) => !prev)}> ☰ Surroundings </div>
                <div onClick = {() => setShowOptions(false)}>
                    {showOptions && (
                        <div id = "dropdown">
                            <OptionsMenu options = {layerOptions} onToggle = {toggleLayer} />
                        </div>
                )}
            </div>
            <div id = "toggle-news" onClick = {() => alert("This would show the news!")}> News </div>
            <div ref = {mapContainer} style = {{ width: '100%', height: '100vh'}}/>
        </div>
    );
};

export default MapComponent;