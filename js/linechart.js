const ctx = document.getElementById('myLineChart').getContext('2d');
        
const data = {
    labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'],
    datasets: [
        {
            label: 'RTC',
            data: [2264,2437,2462,2641,2785,2288,2553,2725],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: false,
            tension: 0.1
        },
        {
            label: 'SSC',
            data: [2452,2797,3701,4085,3975,3669,4327,4786],
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            fill: false,
            tension: 0.1
        },
        {
            label: 'Fire',
            data: [10005,9854,10485,11167,9437,9382,8476,10187],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: false,
            tension: 0.1
        }
    ]
};

const config = {
    type: 'line',
    data: data,
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            tooltip: {
                enabled: true,
            },
            title: {
                display: true,
                text: 'Annual Trends in RTC, SSC, and Fire Incidents (2015-2022)',
                font: {
                    size: 16
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Year'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Count'
                }
            }
        }
    }
};

const myLineChart = new Chart(ctx, config);
