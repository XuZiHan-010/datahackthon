// Initialize the map
var map = L.map('map').setView([52.4862, -1.8904], 10); // Centered on West Midlands

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var geojsonData;
var currentLayer = L.geoJson(null).addTo(map);

// Function to get color based on incident type
function getColor(type) {
    switch (type) {
        case 'FIRE': return 'red';
        case 'RTC': return 'green';
        case 'SSC': return 'blue';
  
    }
}

// Function to style features
function style(feature) {
    return {
        radius: 5,
        fillColor: getColor(feature.properties.type),
        color: getColor(feature.properties.type),
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
}

// Function to update the map based on the selected filters
function updateMap(year, type) {
    if (currentLayer) {
        map.removeLayer(currentLayer);
    }
    currentLayer = L.geoJson(geojsonData, {
        filter: function(feature, layer) {
            var yearMatch = (year === 'all' || feature.properties.year === parseInt(year));
            var typeMatch = (type === 'all' || feature.properties.type === type);
            return yearMatch && typeMatch;
        },
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, style(feature));
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup('<strong>Type:</strong> ' + feature.properties.type + '<br>' +
                            '<strong>Year:</strong> ' + feature.properties.year + '<br>' +
                            '<strong>Call Seconds:</strong> ' + feature.properties.call_seconds + '<br>' +
                            '<strong>Reaction Seconds:</strong> ' + feature.properties.reaction_seconds);
        }
    }).addTo(map);
}

// Load GeoJSON data and populate the filters
$.getJSON('./data/West_Midlands_Incidents.geojson', function(data) {
    geojsonData = data;

    // Populate year filter
    var years = new Set();
    data.features.forEach(function(feature) {
        years.add(feature.properties.year);
    });
    years = Array.from(years).sort();
    var yearSelector = document.getElementById('years');
    years.forEach(function(year) {
        var option = document.createElement('option');
        option.value = year;
        option.text = year;
        yearSelector.appendChild(option);
    });

    // Populate type filter
    var types = new Set();
    data.features.forEach(function(feature) {
        types.add(feature.properties.type);
    });
    types = Array.from(types).sort();
    var typeSelector = document.getElementById('types');
    types.forEach(function(type) {
        var option = document.createElement('option');
        option.value = type;
        option.text = type;
        typeSelector.appendChild(option);
    });

    // Set default values
    document.getElementById('years').value = '2015';
    document.getElementById('types').value = 'ALL';

    updateMap('2015', 'ALL');
});

// Event listeners for filters
document.getElementById('years').addEventListener('change', function() {
    var selectedYear = this.value;
    var selectedType = document.getElementById('types').value;
    updateMap(selectedYear, selectedType);
});

document.getElementById('types').addEventListener('change', function() {
    var selectedType = this.value;
    var selectedYear = document.getElementById('years').value;
    updateMap(selectedYear, selectedType);
});

// Add legend to the map
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend');
    var types = ['FIRE', 'RTC', 'SSC'];
    var labels = ['<strong>Incident Types</strong>'];
    var colors = ['red', 'green', 'blue'];

    for (var i = 0; i < types.length; i++) {
        labels.push(
            '<i style="background:' + colors[i] + '"></i> ' +
            types[i]
        );
    }
    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(map);