// Store our API endpoint inside queryUrl
var today = new Date();
var start = Date(today.setDate(today.getDate()-30));

function buildUrl(){
    let
        domain = "earthquake.usgs.gov",
        endpoint = "/fdsnws/event/1/query",
        format = "geojson",
        starttime = start.toISOString().slice(0,10),
        endtime = today.toISOString().slice(0,10),
        maxLon = -69.52148437,
        minLon = -123.83789062,
        maxLat = 48.74894534,
        minLat = 25.16517337;

    return `https://${domain}${endpoint}?format=${format}&starttime=${starttime}&endtime=${endtime}&maxlongitude=${maxLon}&minlongitude=${minLon}&maxlatitude=${maxLat}&minlatitude=${minLat}`;
}


console.log(start)
console.log(today);
// url = buildUrl()
// console.log(url);

// create size and color scale for magnitude 
function markerSize(mag) {
    return mag * 25000;
  }
  
  function markerColor(mag) {
    if (mag <= 1) {
        return "#FFEDA0";
    } else if (mag <= 2) {
        return "#FEB24C";
    } else if (mag <= 3) {
        return "#FD8D3C";
    } else if (mag <= 4) {
        return "#E31A1C";
    } else if (mag <= 5) {
        return "#BD0026";
    } else {
        return "#800026";
    };
  }

function createFeatures(earthquakeData) {

    var earthquakes = L.geoJSON(earthquakeData, {
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
   onEachFeature : function (feature, layer) {
        //for each data item add pop up with info
      layer.bindPopup("<p> Location: " + feature.properties.place + "</p>" +
        "<p> Date Time: " + new Date(feature.properties.time) + "</p>" + 
        "<p> Magnitude: " +  feature.properties.mag + "</p>" + 
        "<p> Type: " +  feature.properties.type + "</p>")
      },     pointToLayer: function (feature, latlng) {
        // return circle with markerzise and color dependent on magnitude
        return new L.circle(latlng,
          {radius: markerSize(feature.properties.mag),
          fillColor: markerColor(feature.properties.mag),
          fillOpacity: 1,
          stroke: false,
      })
    }
    });
      
  
  
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
  }

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    const streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.streets",
            accessToken: API_KEY
    });

    const darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.dark",
            accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    const baseMaps = {
            "Street Map": streetmap,
            "Dark Map": darkmap
    };

    // Create overlay object to hold our overlay layer
    const overlayMaps = {
            Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    const myMap = L.map("map", {
            center: [37.09, -95.71],
            zoom: 5,
            layers: [streetmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
    }).addTo(myMap);

    //add legend
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
    
      var div = L.DomUtil.create('div', 'info legend'),
          magnitudes = [0, 1, 2, 3, 4, 5];
  
      for (var i = 0; i < magnitudes.length; i++) {
          div.innerHTML +=
              '<i style="background:' + markerColor(magnitudes[i] + 1) + '"></i>  ' + 
      + magnitudes[i] + (magnitudes[i + 1] ? ' - ' + magnitudes[i + 1] + '<br>' : ' + ');
      }
  
      return div;
  };
  
  legend.addTo(myMap);
}
// function to pull data and wait for response
(async function(){
    const queryUrl = buildUrl();
    const data = await d3.json(queryUrl);
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
})()
