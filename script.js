// import { Chart } from 'chart.js'; 

const ctx = document.getElementById('myChart');
const ctx2 = document.getElementById('myChart2');

const inputChart = new Chart(ctx, {
type: 'bar',
data: {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [{
    label: '# of Votes',
    data: [12, 19, 3, 5, 2, 3],
    borderWidth: 1
    }]
},
options: {
    scales: {
    y: {
        beginAtZero: true
    }
    }
}
});

const outputChart = new Chart(ctx2, {
type: 'bar',
data: {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [{
    label: '# of Votes',
    data: [12, 19, 3, 5, 2, 3],
    borderWidth: 1
    }]
},
options: {
    scales: {
    y: {
        beginAtZero: true
    }
    }
}
});




const dropdowns = document.querySelectorAll('[data-dropdown-toggle]');
const collapses = document.querySelectorAll('[data-collapse-toggle]');

dropdowns.forEach(dropdown => {
    dropdown.addEventListener('click', function() {
    const dropdownId = this.getAttribute('data-dropdown-toggle');
    const dropdown = document.getElementById(dropdownId);
    dropdown.classList.toggle('hidden');
    });
});

collapses.forEach(collapse => {
    collapse.addEventListener('click', function() {
    const collapseId = this.getAttribute('data-collapse-toggle');
    const collapse = document.getElementById(collapseId);
    collapse.classList.toggle('hidden');
    });
});

