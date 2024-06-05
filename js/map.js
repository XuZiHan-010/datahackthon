// Initialize the map
var map = L.map('map').setView([52.4862, -1.8904], 10); // Centered on West Midlands

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var geojsonData;
var boroughLayer;
var incidentLayer;

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

// Load GeoJSON data for the boundaries of the boroughs
$.getJSON('./data/West_Midlands.geojson', function(data) {
    boroughLayer = L.geoJson(data, {
        style: style,
        onEachFeature: function (feature, layer) {
            layer.bindPopup('<strong>' + feature.properties.ctyua16nm + '</strong>');
        }
    }).addTo(map);
});

// Function to get color based on incident type
function getIncidentColor(type) {
    switch (type) {
        case 'FIRE': return '#e41a1c';
        case 'RTC': return '#377eb8';
        case 'SSC': return '#4daf4a';
    }
}
const baseRadius = 2; 
const referenceZoom = 10;
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

// Function to update the map based on the selected filters
function updateMap(year, type) {
    if (incidentLayer) {
        map.removeLayer(incidentLayer);
    }
    incidentLayer = L.geoJson(geojsonData, {
        filter: function(feature, layer) {
            return (year === 'all' || feature.properties.year === parseInt(year)) &&
                   (type === 'all' || feature.properties.type === type);
        },
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, incidentStyle(feature));
        }
    }).addTo(map);
}

// Load GeoJSON data for incidents and populate the filters
$.getJSON('./data/West_Midlands_Incidents.geojson', function(data) {
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
});

// Add event listeners for filters
document.getElementById('years').addEventListener('change', function() {
    updateMap(this.value, document.getElementById('types').value);
});

document.getElementById('types').addEventListener('change', function() {
    updateMap(document.getElementById('years').value, this.value);
});

// Add legend to the map at the left bottom position
var legend = L.control({position: 'bottomleft'});

legend.onAdd = function (map) {
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

legend.addTo(map);
map.on('zoomend', function() {
    updateMap(document.getElementById('years').value, document.getElementById('types').value);
});