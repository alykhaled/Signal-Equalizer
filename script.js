// import { Chart } from 'chart.js';

const ctx = document.getElementById("inputChart");
const ctx2 = document.getElementById("outputChart");
const csvFile = document.getElementById("csv-file");

const inputData = [];
const inputTime = [];
const maxWidth = 500;

const uniformRangeSliders = [
  "uniform-range-slider-1",
  "uniform-range-slider-2",
  "uniform-range-slider-3",
  "uniform-range-slider-4",
  "uniform-range-slider-5",
  "uniform-range-slider-6",
  "uniform-range-slider-7",
  "uniform-range-slider-8",
  "uniform-range-slider-9",
  "uniform-range-slider-10",
];

const uniformRangeValues = [0, 0, 0, 0, 0, 0, 0, 0];

const vowelsSliders = [
  "vowels-slider-a",
  "vowels-slider-e",
  "vowels-slider-i",
  "vowels-slider-o",
  "vowels-slider-u",
];

const vowelsValues = [0, 0, 0, 0, 0];

const musicalInstrumentsSliders = [
  "musical-instruments-slider-piano",
  "musical-instruments-slider-violin",
  "musical-instruments-slider-trumpet",
  "musical-instruments-slider-guitar",
];

const musicalInstrumentsValues = [0, 0, 0, 0];

const inputChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Signal",
        data: [],
        borderWidth: 1,
        radius: 0,
      },
    ],
  },
  options: {
    animation: false,
    scales: {
      x: {
        max: maxWidth,
        min: 0,
      },

      yAxes: [
        {
          //make the y axis read the lowest value and maximum value of the imported data

          ticks: {
            min: 0,
            max: 1,
            stepSize: 0.1,
          },
        },
      ],
    },
  },
});

const outputChart = new Chart(ctx2, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Signal",
        data: [],
      },
    ],
  },
  options: {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  },
});

csvFile.addEventListener("change", function () {
  console.log("file changed");
  const file = csvFile.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    const data = event.target.result;
    const lines = data.split("\n");
    inputChart.data.labels = [];
    inputChart.data.datasets[0].data = [];
    for (const line of lines) {
      const values = line.split(",");
      inputChart.data.labels.push(values[0]);
      inputChart.data.datasets[0].data.push(values[1]);
      inputTime.push(values[0]);
      inputData.push(values[1]);
    }

    inputChart.update();
  };

  reader.readAsText(file);
});

const playButton = document.getElementById("play-button");
const pauseButton = document.getElementById("pause-button");
const stopButton = document.getElementById("stop-button");
var isPlaying = false;
var intervalId = null;
var updateInterval = 100; // milliseconds
var currentIndex = 0;

playButton.addEventListener("click", (e) => {
  if (!isPlaying) {
    intervalId = setInterval(function () {
      currentIndex = 0;
      currentIndex++;
      if (currentIndex >= inputChart.data.datasets[0].data.length) {
        currentIndex = 0;
      }
      inputChart.data.datasets[0].data.shift();
      inputChart.data.labels.shift();
      inputChart.data.labels.push(inputTime[currentIndex]);
      inputChart.data.datasets[0].data.push(inputData[currentIndex]);
      inputChart.update();
    }, updateInterval);

    isPlaying = true;
  }
});

//Pause Button
pauseButton.addEventListener("click", () => {
  clearInterval(intervalId);
  isPlaying = false;
});

//Stop Button
 stopButton.addEventListener("click", () => {
   clearInterval(intervalId);
   currentIndex = 0;
   isPlaying = false;
   inputChart.data.datasets[0].data = inputData.slice(0);
   inputChart.data.labels = inputTime.slice(0);
   inputChart.update();
 });


const speedSlider = document.getElementById("speed");
const speedLabel = document.getElementById("speed-label");

// Update the speed label's text when the slider value changes
speedSlider.addEventListener("input", () => {
 speedLabel.textContent = speedSlider.value;
});

const dropdowns = document.querySelectorAll("[data-dropdown-toggle]");
const collapses = document.querySelectorAll("[data-collapse-toggle]");

dropdowns.forEach((dropdown) => {
  dropdown.addEventListener("click", function () {
    const dropdownId = this.getAttribute("data-dropdown-toggle");
    const dropdown = document.getElementById(dropdownId);
    dropdown.classList.toggle("hidden");
  });
});

collapses.forEach((collapse) => {
  collapse.addEventListener("click", function () {
    const collapseId = this.getAttribute("data-collapse-toggle");
    const collapse = document.getElementById(collapseId);
    collapse.classList.toggle("hidden");
  });
});
