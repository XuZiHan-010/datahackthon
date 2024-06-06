const remoteUrl = "https://raw.githubusercontent.com/XuZiHan-010/datahackthon/main/data/driving_seconds.csv";
const localUrl = "./data/driving_seconds.csv";

function fetchData(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        });
}

function parseCSV(data) {
    const lines = data.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const result = {};
        headers.forEach((header, index) => {
            result[header.trim()] = index === 0 ? values[index].trim() : parseFloat(values[index].trim());
        });
        return result;
    });
}

function loadData() {
    fetchData(remoteUrl)
        .then(data => initializeChart(parseCSV(data)))
        .catch(error => {
            console.warn("Failed to load data from remote URL, trying local path...");
            fetchData(localUrl)
                .then(data => initializeChart(parseCSV(data)))
                .catch(error => {
                    console.error("Failed to load data from both remote and local sources");
                });
        });
}

function initializeChart(data) {
    console.log(data); // Debugging: log the loaded data

    const labels = data.map(d => d.year);
    const fireData = data.map(d => d.Fire);
    const rtcData = data.map(d => d["Road Traffic Collision"]);
    const sscData = data.map(d => d["Special Service Call"]);

    const radarData = {
        labels: labels,
        datasets: [
            {
                label: 'Fire',
                data: fireData,
                fill: true,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgb(255, 99, 132)',
                pointBackgroundColor: 'rgb(255, 99, 132)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(255, 99, 132)'
            },
            
            {
                label: 'Special Service Call',
                data: sscData,
                fill: true,
                borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
                pointBackgroundColor: 'rgb(75, 192, 192)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(75, 192, 192)'
            },
            {
                label: 'Road Traffic Collision',
                data: rtcData,
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgb(75, 192, 192)',
                pointBackgroundColor: 'rgb(75, 192, 192)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(75, 192, 192)'
            }
        ]
    };

    const config = {
        type: 'radar',
        data: radarData,
        options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Average Driving Seconds for Fire, SSC, and RTC (2015-2022)',
                    font: {
                        size: 14
                    }
                }
            },
            elements: {
                line: {
                    borderWidth: 3
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 400
                }
            }
        }
    };

    const ctx = document.getElementById('radarChart').getContext('2d');
    new Chart(ctx, config);
}

loadData();