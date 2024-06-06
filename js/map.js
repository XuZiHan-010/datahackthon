var map = L.map('map').setView([52.4862, -1.8904], 10);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 18,
    minZoom: 10,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var geojsonData;
var boroughLayer;
var incidentLayer;
var animationInterval;
var isPaused = false;

// Function to get color based on borough
function getColor(borough) {
    switch (borough) {
        case 'Birmingham': return '#66c2a5';
        case 'Coventry': return '#fc8d62';
        case 'Dudley': return '#8da0cb';
        case 'Sandwell': return '#e78ac3';
        case 'Solihull': return '#a6d854';
        case 'Walsall': return '#ffd92f';
        case 'Wolverhampton': return '#e5c494';
        default: return '#D9D9D9';
    }
}

// Function to style borough boundaries
function style(feature) {
    return {
        fillColor: getColor(feature.properties.ctyua16nm),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// Function to load GeoJSON data with a backup URL
function loadData(url, backupUrl, callback) {
    $.getJSON(url, callback).fail(function() {
        console.log("Failed to load primary URL, trying backup URL...");
        $.getJSON(backupUrl, callback).fail(function() {
            console.error("Failed to load data from both primary and backup URLs.");
        });
    });
}

// Load GeoJSON data for the boundaries of the boroughs
loadData(
    'https://raw.githubusercontent.com/XuZiHan-010/datahackthon/main/data/West_Midlands.geojson',
    './data/West_Midlands.geojson', // Backup local path
    function(data) {
        boroughLayer = L.geoJson(data, {
            style: style,
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<strong>' + feature.properties.ctyua16nm + '</strong>');
            }
        }).addTo(map);
    }
);

// Function to get color based on incident type
function getIncidentColor(type) {
    switch (type) {
        case 'FIRE': return '#e41a1c';
        case 'RTC': return '#377eb8';
        case 'SSC': return '#4daf4a';
    }
}

const baseRadius = 2.7;
const referenceZoom = 20;

// Function to style incident points based on zoom level
function incidentStyle(feature) {
    var currentZoom = map.getZoom();
    var radius = baseRadius * (currentZoom / referenceZoom);
    return {
        radius: radius,
        fillColor: getIncidentColor(feature.properties.type),
        color: getIncidentColor(feature.properties.type),
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
}

// Load json data points for fire accidents through github link first if fail try local one 
loadData(
    'https://raw.githubusercontent.com/XuZiHan-010/datahackthon/main/data/West_Midlands_Incidents.json',
    './data/West_Midlands_Incidents.json', // Backup local path
    function(data) {
        geojsonData = data;
        var years = new Set();
        var types = new Set();

        data.features.forEach(function(feature) {
            years.add(feature.properties.year);
            types.add(feature.properties.type);
        });

        var yearSelector = document.getElementById('years');
        var typeSelector = document.getElementById('types');

        years = Array.from(years).sort();
        types = Array.from(types).sort();

        years.forEach(function(year) {
            var option = document.createElement('option');
            option.value = year;
            option.text = year;
            yearSelector.appendChild(option);
        });

        types.forEach(function(type) {
            var option = document.createElement('option');
            option.value = type;
            option.text = type;
            typeSelector.appendChild(option);
        });

        document.getElementById('years').value = '2015';
        document.getElementById('types').value = 'all';
        updateMap('2015', 'all');
    }
);

// Function to update the map based on the selected filters
function updateMap(year, type) {
    if (incidentLayer) {
        map.removeLayer(incidentLayer);
    }
    incidentLayer = L.geoJson(geojsonData, {
        filter: function(feature, layer) {
            var yearMatch = (year === 'all' || feature.properties.year === parseInt(year));
            var typeMatch = (type === 'all' || feature.properties.type === type);
            return yearMatch && typeMatch;
        },
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, incidentStyle(feature));
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup('<strong>Type:</strong> ' + feature.properties.type + '<br>' +
                            '<strong>Year:</strong> ' + feature.properties.year + '<br>' +
                            '<strong>Call Seconds:</strong> ' + feature.properties.call_seconds + '<br>' +
                            '<strong>Reaction Seconds:</strong> ' + feature.properties.reaction_seconds + '<br>' +
                            '<strong>Driving Seconds:</strong> ' + feature.properties.driving_seconds);
        }
    }).addTo(map);
    updateStationMarkers(year, type);
}

// Add event listeners for filters
document.getElementById('years').addEventListener('change', function() {
    updateMap(this.value, document.getElementById('types').value);
});

document.getElementById('types').addEventListener('change', function() {
    updateMap(document.getElementById('years').value, this.value);
});

// Add legend to the map at the left bottom position
var incidentLegend = L.control({position: 'bottomleft'});

incidentLegend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend');
    var labels = ['<strong>Incident Types</strong>'];
    var types = ['Fire', 'Road Traffic Collision', 'Special Service Call'];
    var colors = ['#e41a1c', '#377eb8', '#4daf4a'];

    for (var i = 0; i < types.length; i++) {
        labels.push('<div class="legend-item"><i style="background:' + colors[i] + '"></i> ' + types[i] + '</div>');
    }

    div.innerHTML = labels.join('');
    return div;
};

incidentLegend.addTo(map);

var stationLegend = L.control({position: 'bottomright'});

stationLegend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend');
    var labels = ['<strong>Station Average Driving Seconds</strong>'];
    labels.push('<div class="legend-item"><img src="./image/fire_station.png" style="width: 20px; height: 20px;">&nbspAverage Driving Seconds< 250s</div>');
    labels.push('<div class="legend-item"><img src="./image/image.png" style="width: 20px; height: 20px;">&nbspAverage Driving Seconds: 250s - 400s</div>');
    labels.push('<div class="legend-item"><img src="./image/fire_icon.png" style="width: 20px; height: 20px;">&nbspAverage Driving Seconds> 400s</div>');
    
    div.innerHTML = labels.join('');
    return div;
};

stationLegend.addTo(map);

map.on('zoomend', function() {
    updateMap(document.getElementById('years').value, document.getElementById('types').value);
});

function startYearAnimation() {
    var years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022]; // Define the range of years
    var index = 0; // Start at the first year
    isPaused = false;

    if (animationInterval) {
        clearInterval(animationInterval);
    }

    animationInterval = setInterval(function() {
        if (!isPaused) {
            document.getElementById('years').value = years[index]; // Set the year
            updateMap(years[index], document.getElementById('types').value); // Update the map with the new year

            index++; // Move to the next year
            if (index >= years.length) { // If the last year is reached
                index = 0; // Restart from the first year
            }
        }
    }, 1000); 
}

function pauseYearAnimation() {
    isPaused = true;
}

// Add buttons to control the animation
var controlButtons = L.control({position: 'topright'});

controlButtons.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'control-buttons');
    div.innerHTML = '<button onclick="startYearAnimation()">Play Animation</button><button onclick="pauseYearAnimation()">Stop Animation</button>';
    return div;
};

controlButtons.addTo(map);

// Function to convert Easting/Northing to Lat/Lng
function convertToLatLng(easting, northing) {
    var firstProjection = "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +datum=OSGB36 +units=m +no_defs";
    var secondProjection = proj4.defs('EPSG:4326');
    return proj4(firstProjection, secondProjection, [easting, northing]);
}

// Load the CSV data for the fire stations
var stationData;

function loadStations(url) {
    $.get(url, function(data) {
        if ($.csv && $.csv.toObjects) {
            stationData = $.csv.toObjects(data);
            updateStationMarkers(document.getElementById('years').value, document.getElementById('types').value);
        } else {
            console.error("CSV parsing library not loaded.");
        }
    });
}

function updateStationMarkers(year, type) {
    stationData.forEach(function(station) {
        var latLng = convertToLatLng(parseFloat(station.Easting), parseFloat(station.Northing));
        
        var drivingSeconds;
        if (type === 'all') {
            drivingSeconds = station['Overall_avg_seconds_' + year];
        } else {
            drivingSeconds = station[type.toUpperCase() + '_avg_seconds_' + year];
        }

        var iconUrl;
        if (drivingSeconds > 400) {
            iconUrl = './image/fire_icon.png'; // Use the appropriate path for your icon
        } else if (drivingSeconds > 250) {
            iconUrl = './image/image.png'; // Use the appropriate path for your icon
        } else {
            iconUrl = './image/fire_station.png'; // Use the appropriate path for your icon
        }

        var marker = L.marker([latLng[1], latLng[0]], {
            icon: L.icon({
                iconUrl: iconUrl,
                iconSize: [20, 20]
            })
        }).addTo(map);

        var popupContent = '<strong>' + station['Station name'] + '</strong><br>PRL Count: ' + station.PRL_Count + '<br>BRV Count: ' + station.BRV_Count;
        if (type === 'all') {
            popupContent += '<br>Average Driving Seconds (' + year + '): ' + drivingSeconds + '<br>Average Reaction Seconds (' + year + '): ' + station['Overall_response_avg_seconds_' + year];
        } else {
            popupContent += '<br>Average Driving Seconds (' + year + ' ' + type + '): ' + drivingSeconds;
            popupContent += '<br>Average Reaction Seconds (' + year + ' ' + type + '): ' + station[type.toUpperCase() + '_response_avg_seconds_' + year];
        }
        marker.bindPopup(popupContent);
    });
}

loadStations('./data/updated_station_locations.csv');