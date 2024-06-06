(function() {
    // Set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 40, left: 50}, // Adjusted margins for better layout
        width = 420 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;
    
    // Append the svg object to the body of the page
    var svg = d3.select("#averagedata")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // Define the remote github link and the fallback local path
    const remoteUrl = "https://raw.githubusercontent.com/XuZiHan-010/datahackthon/main/data/driving_seconds.csv";
    const localUrl = "./data/driving_seconds.csv";
    
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
        var allGroup = ["Fire", "Road Traffic Collision", "Special Service Call"];
    
        // Add the options to the button
        d3.select("#selectButton")
            .selectAll('myOptions')
            .data(allGroup)
            .enter()
            .append('option')
            .text(function(d) { return d; }) // text shown in the menu
            .attr("value", function(d) { return d; }); // corresponding value returned by the button
    
        var x = d3.scaleLinear()
            .domain(d3.extent(data, function(d) { return d.year; }))
            .range([0, width]);
    
        var y = d3.scaleLinear()
            .range([height, 0]);
    
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
    
        // Add Y axis label Driving Seconds
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -margin.top)
            .text("Driving Seconds");
    
        var line = svg.append('g')
            .append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function(d) { return x(d.year); })
                    .y(function(d) { return y(d.FIRE); }) // Initial line is for FIRE
                );
    
        function update(selectedGroup) {
            var dataFilter = data.map(function(d) { return {year: d.year, value: d[selectedGroup]}; });
    
            // Update y-axis domain dynamically based on selected group
            y.domain([0, d3.max(dataFilter, function(d) { return +d.value; }) + 10]);
            yAxis.transition().duration(1000).call(d3.axisLeft(y));
    
            line.datum(dataFilter)
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .x(function(d) { return x(d.year); })
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
