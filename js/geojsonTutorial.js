
// creates variable "geojsonFeature"
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

// creates a GeoJSON layer from the "geojsonFeature" variable, and adds it to the map div
L.geoJSON(geojsonFeature).addTo(map);

// creates variable "myLines"
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

// creates variable "myStyle" to define style of "myLines" variable in final GeoJSON layer
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

// creates GeoJSON layer from the "myLines" linestrings variable, and adds it to the map div
L.geoJSON(myLines, {
    style: myStyle
}).addTo(map);

// creates variable "states" as a set of feature variables
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

// creates GeoJSON layer from "states" variable
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);

// creates variable "geojsonMarkerOptions" to define style parameters for a GeoJSON point layer
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

// creates GeoJSON layer, returns the layer as a circleMarker point with the style from the "geojsonMarkerOptions" variable
L.geoJSON(someGeojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);

// creates a function to check whether a feature has property "popupContent"
function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

// creates "geojsonFeature2" point feature variable
var geojsonFeature2 = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

// creates GeoJSON layer from the "geojsonFeature2" layer, attaches a popup to the point feature when clicked
L.geoJSON(geojsonFeature2, {
    onEachFeature: onEachFeature
}).addTo(map);

// creates variable "someFeatures2" with two features with boolean attribute "show_on_map"
var someFeatures2 = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

// creates GeoJSON layer from "someFeatures2" variable, filtering features based on their boolean value from attribute "show_on_map" to determine whether they are added the map
L.geoJSON(someFeatures2, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(map);