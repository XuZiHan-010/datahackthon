(function() {
    // Set the dimensions and margins of the graph
    var margin = {top: 80, right: 30, bottom: 50, left: 80}, // Adjusted margins for better layout
    width = 560 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    
    // Append the svg object to the body of the page
    var svg = d3.select("#airquality")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // Define the remote github link and the fallback local path
    const remoteUrl = "https://raw.githubusercontent.com/XuZiHan-010/Casa003/main/data/AQI.csv";
    const localUrl = "data/AQI.csv";
    
    // Function to load data it will load from remote url first but if fails try the local one instead
    function loadData() {
    d3.csv(remoteUrl, d3.autoType).then(initializeChart).catch(function(error) {
        console.warn("Failed to load data from remote URL, trying local path...");
        d3.csv(localUrl, d3.autoType).then(initializeChart).catch(function(error) {
            console.error("Failed to load data from both remote and local sources");
        });
    });
    }
    
    // Function to initialize the chart with the loaded data
    function initializeChart(data) {
    // specify the columns used
    var allGroup = [ "Good Days", "Moderate Days", "Unhealthy Days" ];
    
    // Add the options to the button
    d3.select("#selectButton")
        .selectAll('myOptions')
        .data(allGroup)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text shown in the menu
        .attr("value", function (d) { return d; }); // corresponding value returned by the button
    
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.Year; }))
        .range([0, width]);
    
    var y = d3.scaleLinear()
        .range([height, 0]);
    
    // Compute the maximum value plus a buffer
    var maxY = d3.max(data, function(d) { return d.value; });
    y.domain([0, maxY + (0.1 * maxY)]); // Adds 10% buffer
    
    // Add X axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d"))); // Format as integers
    
    // Add Y axis
    var yAxis = svg.append("g").call(d3.axisLeft(y));
    
    // Add X axis label and put the label to the center
    svg.append("text")
        .attr("text-anchor", "middle")  // Center the text
        .attr("x", width / 2)  // Position at half the width of the graph
        .attr("y", height + 40)  // Adjust y position to below the x-axis
        .text("Year");  // Legend for the x-axis
    
    // Add Y axis label Days
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top)
        .text("Days");
    
    var line = svg.append('g')
        .append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function(d) { return x(d.Year); })
                .y(function(d) { return y(d.value); })
            );
    
    function update(selectedGroup) {
        var dataFilter = data.map(function(d) { return {Year: d.Year, value: d[selectedGroup]}; });
    
        y.domain([0, d3.max(dataFilter, function(d) { return +d.value; }) + (0.1 * d3.max(dataFilter, function(d) { return +d.value; }))]);
        yAxis.transition().duration(1000).call(d3.axisLeft(y));
    
        line.datum(dataFilter)
            .transition()
            .duration(1000)
            .attr("d", d3.line()
                .x(function(d) { return x(d.Year); })
                .y(function(d) { return y(d.value); })
            );
    }
    
    // Initialize the chart with the first group
    update(allGroup[0]);
    
    // When the button is changed, run the update function
    d3.select("#selectButton").on("change", function(event) {
        update(d3.select(this).property("value"));
    });
    }
    loadData();
    })();