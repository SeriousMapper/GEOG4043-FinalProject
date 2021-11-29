
var mydata;
var map;
var geoJSON;
var selected = 0;
var selectedTracts = []
var timePeriods = ["August 2019", "Pandemic", "September 2020"]
var routeData = [0,0,0]
var selectedRoute;
var routes = true;
var info = L.control({position: 'topright'});
var yearInfo = L.control({position: 'bottomright'});
var layerHighlight;
var lastHighlight;

function jQueryAjax(){
    //define a variable to hold the data
    

    //basic jQuery ajax method
    //Loading route data...
    $.ajax("data/route_aug19.json", {
        dataType: "json",
        success: function(response){
            routeData[0] = response;
            console.log(routeData[0]);
        }
    });
    $.ajax("data/route_pan20.json", {
        dataType: "json",
        success: function(response){
            routeData[1] = response;
            console.log(routeData[1]);
        }
    });
    $.ajax("data/route_sep20dissolve.json", {
        dataType: "json",
        success: function(response){
            routeData[2] = response;
            console.log(routeData[2]);
        }
    });
    //Loading Tracts Data...
    $.ajax("data/TractsFinalGeoJson.json", {
        dataType: "json",
        success: function(response){
            mydata = response;
            console.log(mydata);
            renderMyMap();
        }
    });

    //check the data
    console.log(mydata);
};
function renderMyMap() {
    
    
    map = L.map('map').setView([39.7392, -104.9903], 9);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiamFzb25tOTExIiwiYSI6ImNrdGFtcXpjbTFudGgydnEyaG5xYjM2MWoifQ.Q8hEN8vl6gm4dwg-joBdzg'
    }).addTo(map);

    console.log("I loaded", mydata)
    geojson = L.geoJson(mydata, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
    selectedRoute = L.geoJson(routeData[selected], {
        style: route_style
    }).addTo(map);
    console.log(geoJSON);
    /* ----------------- L E G E N D ---------------------*/
    var legend = L.control({position: 'bottomleft'});
    
    legend.onAdd = function (map) {
    
    var div = L.DomUtil.create('div', 'info legend');
    labels = ['<p id="DS"><strong>Daily Stops</p><p id="PCT">(Per Census Tract)</strong></p>'],

    classes = [0,7,18,37,81];
    for (var i = 0; i < classes.length; i++) {
    
            div.innerHTML += 
            labels.push('<i style="background:' + getColor(classes[i] + 1) + '"></i>'+ classes[i] + (classes[i+1]?'&ndash;' + (classes[i+1]-1) + '  ' : "+")); 
    
        }
        div.innerHTML = labels.join('<br>');
    return div;
    };
    legend.addTo(map);
    info.addTo(map);
    yearInfo.addTo(map);
    
    /* ----------------- L E G E N D ---------------------*/
    /* ----------------- WATERMARK ----------------------*/
    L.Control.Watermark = L.Control.extend({
		onAdd: function(map) {
			var img = L.DomUtil.create('img');
			
			img.src = 'img/culogo.png';
			img.style.width = '225px';
			
			return img;
		},
		
		onRemove: function(map) {
			// Nothing to do here
		}
	});

	L.control.watermark = function(opts) {
		return new L.Control.Watermark(opts);
	}
	
	L.control.watermark({ position: 'bottomleft' }).addTo(map);
}
    /*----------------I N F O  B O X ---------------------*/
    
   
    info.onAdd = function (map) {
        //"this" returns to info. 
        this._div = L.DomUtil.create('div', 'info infoBox');
        //the following line calls info.update(props) function. Again, this refers to 'info' here
        this.update();
        return this._div;
    };
    
    //Update the info based on what state user has clicked on
    info.update = function (prop) {
        this._div.innerHTML = '<h4 id="TI">Tract Info</h4> <h3 id=TP>'+timePeriods[selected]+"</h3>" + (prop ?
            '<b class="stopText">' + prop + '</b> Stops/day'
            : 'Hover over an area.');
    };

    /*----------------I N F O  B O X ---------------------*/


    /*----------------Y e a r  C H O O S E R---------------------*/
    yearInfo.onAdd = function (map) {
        //"this" returns to info. 
        this._div = L.DomUtil.create('div', 'info infoBox');
        
        for (var i = 0; i < timePeriods.length; i++) {
            this._div.innerHTML += '<button class="yearButton" onclick="yearClick('+i+')">' + timePeriods[i] + "</button>";
        }
        this._div.innerHTML += '<button class="yearButton" onclick="toggleRoutes()">' + "Toggle Routes" + "</button>";
        //the following line calls info.update(props) function. Again, this refers to 'info' here
        return this._div;
    };
    function yearClick (index) {
        selected = index
        var layers = geojson.getLayers();
        info.update();
        if (routes == true) {
        changeRoute();
        }
        for (let i = 0; i <layers.length; i++) {
            var layer = layers[i];
                layer.setStyle(style(layer.feature));
                if (!L.Browser.ie && L.Browser.opera && !L.Browser.edge) {
                    layer.bringToFront();
                }
    
                }
    }
    
    /*----------------Y e a r  C H O O S E R---------------------*/

function getColor(d) {
    return       d > 80 ? '#08519c' : //81-253, 37-80
                    d > 36 ? '#3182bd' : //18-36
                        d > 17 ? '#6baed6' : //7-17
                            d > 6 ? '#bdd7e7' : //0-6
                                '#eff3ff';
}

function style(feature) {
    featureProp = findValue(feature);
    return {
        weight: 0.2,
        opacity: 1,
        color: 'black',
        fillOpacity: 0.8,
        fillColor: getColor(featureProp)
    };
}
function route_style(feature) {
    return {
        weight: 0.5,
        opacity: 1,
        color: 'red'
    };
}
function clear_route(feature) {
    return {
        weight: 0,
        opacity: 0,
    };
}
function toggleRoutes() {
    if (routes == true) {   
        routes = false;
        selectedRoute.clearLayers();
    }else {
        routes = true;
        changeRoute();
    }

}
function changeRoute() {
    selectedRoute.clearLayers();
    console.log(selected)
    selectedRoute = L.geoJson(routeData[selected], {
        style: route_style
    }).addTo(map);
    
}
function findValue(feature) {
    let featureProp;
    if (selected == 0) {
        featureProp = feature.properties.FREQAUG19D
    }else if (selected == 1) {
        featureProp = feature.properties.FREQPAND_1
    }else {
        featureProp = feature.properties.FREQSEP20D
    }
    return featureProp;
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: 'black',
        dashArray: '',
        fillOpacity: 0.6
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    featureProp = findValue(layer.feature)
    info.update(featureProp);
    layerHighlight = layer.feature.properties.TARGET_FID_12;
    
    highlightLine();
}


function resetHighlight(e) {
    geojson.resetStyle(e.target);
    let layer = e.target
    unhighlightLine();

    
    
}

function triggerHighlight() {
    var layers = geojson.getLayers();
    
    for (let i = 0; i <layers.length; i++) {
        var layer = layers[i];
        var currentLayer = layers[i].feature.properties.TARGET_FID_12
        
        if (selectedTracts.includes(currentLayer)) {
            
            
            
            layer.setStyle({ 
                weight:5,
                color: 'blue',
                dashArray: "",
                fillOpacity: 0.7
            });
        } else {
            layer.setStyle(style(layer.feature));
            
        }

    }
}
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
}
function initialize() {
    jQueryAjax();
    
}
$(document).ready(initialize);
