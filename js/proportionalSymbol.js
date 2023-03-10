//declare map variable globally so all functions have access
var map;
var minValue;
var dataStats = {};

//step 1 create map
function createMap(){

    //create the map
    map = L.map('map', {
        center: [0, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData();
};


function calculateMinValue(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var site of data.features){
        //loop through each year
        for(var date = 05; date <= 12; date+=1){
              //get population for current year    
              var value = site.properties["d2019_"+ String(date)];
              //add value to array
              if (value > 0)
              allValues.push(value);
        }
    }
    
    //get minimum value of our array
    var minValue = Math.min(...allValues)
console.log(minValue)
    return minValue;
}

function createPopupContent(properties, attribute){
    //add city to popup content string
    var popupContent = "<p><b>Site:</b> " + properties.site + "</p>";

    //add formatted attribute to panel content string
    var date = attribute.split("_")[1];
    popupContent += "<p><b>Depth to water on " + date + ":</b> " + properties[attribute] + " feet.</p>";

    return popupContent;
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    //Flannery Apperance Compensation formula
    if (attValue > 0)
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius
    else
    var radius = 7

    console.log(radius)

    return radius;
};

function calcStats(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var site of data.features){
        //loop through each year
        for(var date = 05; date <= 12; date+=1){
              //get population for current year
              var value = site.properties["d2019_"+ String(date)];
              //add value to array
              allValues.push(value);
        }
    }
    //get min, max, mean stats for our array
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    //calculate meanValue
    var sum = allValues.reduce(function(a, b){return a+b;});
    dataStats.mean = sum/ allValues.length;
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
    //check
    console.log(attribute)


    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);
    console.log(calcPropRadius(attValue))
    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = createPopupContent(feature.properties, attribute);
    //bind the popup to the circle marker    
    layer.bindPopup(popupContent, {  offset: new L.Point(0,-options.radius)    });
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//Create new sequence controls
function createSequenceControls(attributes){   
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">')

            //add skip buttons
            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="img/reverse.png"></button>'); 
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="img/forward.png"></button>');
            L.DomEvent.disableClickPropagation(container);

            return container;
        }});

    map.addControl(new SequenceControl());  
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;

            //Step 6: increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                //Step 7: if past the last attribute, wrap around to first attribute
                index = index > 7 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //Step 7: if past the first attribute, wrap around to last attribute
                index = index < 0 ? 7 : index;
            };

            //Step 8: update slider
            document.querySelector('.range-slider').value = index;
            updatePropSymbols(attributes[index]);
        })
    })

    //Step 5: input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){
        //Step 6: get the new index value
        var index = this.value;
        console.log(index)
        updatePropSymbols(attributes[index]);
    })

};    

function createLegend(attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            container.innerHTML = '<p class="temporalLegend">Depth to water in <span class="date">2019_5</span></p>';

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="130px" height="130px">';

            //array of circle names to base loop on
            var circles = ["max", "mean", "min"];
    
            //Step 2: loop to add each circle and text to svg string
            for (var i=0; i<circles.length; i++){

                //Step 3: assign the r and cy attributes            
                var radius = calcPropRadius(dataStats[circles[i]]);           
                var cy = 130 - radius;            
    
                //circle string            
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="65"/>';
    
                //evenly space out labels            
                var textY = i * 20 + 20;            
    
                //text string            
                svg += '<text id="' + circles[i] + '-text" x="65" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " million" + '</text>';
            };
    
            //close svg string
            svg += "</svg>";
    
            //add attribute legend svg to container
            container.insertAdjacentHTML('beforeend',svg);

            return container;
        }
    });

    map.addControl(new LegendControl());
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.legend-control-container').value;

            //Step 6: increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                //Step 7: if past the last attribute, wrap around to first attribute
                index = index > 7 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //Step 7: if past the first attribute, wrap around to last attribute
                index = index < 0 ? 7 : index;
            };

            //Step 8: update slider
            document.querySelector('.legend-control-container').value = index;
            updatePropSymbols(attributes[index]);
        })
    })
};

//Above Example 3.10...Step 3: build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;
    console.log(properties)
    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("d") > -1){
            attributes.push(attribute);
        };
    };
    console.log(attributes)
    return attributes;
};



//Step 2: Import GeoJSON data
function getData(){
    //load the data
    fetch("data/CentralSands.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //calculate minimum data value
            var attributes = processData(json);
            minValue = calculateMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
            createLegend(attributes);
            calcStats(response); 
        })
};

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    var date = attribute.split("_")[1];
    //update temporal legend
    document.querySelector("span.date").innerHTML = date;
    map.eachLayer(function(layer){
          //Example 3.18 line 4
          if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
             var popupContent = createPopupContent(props, attribute);    
    //update popup with new content    
    popup = layer.getPopup();    
    popup.setContent(popupContent).update();
        };
    });
};


document.addEventListener('DOMContentLoaded',createMap)