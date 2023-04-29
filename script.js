// import { Chart } from 'chart.js'; 

const ctx = document.getElementById('inputChart');
const ctx2 = document.getElementById('outputChart');
const csvFile = document.getElementById("csv-file");

const inputData = []
const inputTime = []
const maxWidth = 500;
const maxFrequency = 1000;

class Slider {
  constructor(id, frequencyMin, frequencyMax, value, min, max, step) {
    this.id = id;
    this.frequencyMin = 0;
    this.frequencyMax = 0;
    this.value = value;
    this.min = min;
    this.max = max;
    this.step = step;
    this.name = id.split("-").slice(2).join(" ");
  }
}

class Equalizer {
  constructor() {
    this.sliders = [];
    this.inputData = [];
    this.inputTime = [];
    this.outputData = [];
    this.outputTime = [];
    this.maxWidth = 500;
    this.maxFrequency = 1000;
  }
}

class UniformRangeEqulizer extends Equalizer {
  constructor() {
    super();
    this.sliders = []
  }

  initSliders() {
    for (const slider of this.sliders) {
      const sliderMainContainer = document.getElementById("sliders");
      const sliderContainer = document.createElement("div");
      sliderContainer.classList.add("slider");

      const sliderElement = document.createElement("input");
      const sliderLabel = document.createElement("p");
      sliderLabel.textContent = slider.name;

      const sliderValue = document.createElement("p");
      sliderValue.textContent = slider.value;

      const sliderMax = document.createElement("p");
      sliderMax.textContent = slider.max;

      const sliderMin = document.createElement("p");
      sliderMin.textContent = slider.min;

      sliderElement.classList.add("slide");
      sliderElement.type = "range";
      sliderElement.id = slider.id;
      sliderElement.min = slider.min;
      sliderElement.max = slider.max;
      sliderElement.step = slider.step;
      sliderElement.value = slider.value;
      sliderElement.addEventListener("input", () => {
        sliderValue.textContent = sliderElement.value;
      
        this.updateSliders();
        this.updateChart();
      });

      
      sliderContainer.appendChild(sliderValue);
      sliderContainer.appendChild(sliderMax);
      sliderContainer.appendChild(sliderElement);
      sliderContainer.appendChild(sliderMin);
      sliderContainer.appendChild(sliderLabel);
      sliderMainContainer.appendChild(sliderContainer);
    }
  }

  addSliders() {
    const frequencyStep = this.maxFrequency / 10;
    for (let i = 0; i < 10; i++) {
      const slider = new Slider(
        `uniform-range-slider-${i}`,
        i*frequencyStep,
        (i+1)*frequencyStep,
        0,
        -20,
        20,
        1
      );
      this.sliders.push(slider);
    }
  }

  updateSliders() {
    for (const slider of this.sliders) {
      const sliderElement = document.getElementById(slider.id);
      slider.value = sliderElement.value;
    }
    this.equalize();
  }

  updateChart() {
    const uniformRange = [];
    for (const slider of this.sliders) {
      uniformRange.push(slider.value);
    }
    this.outputData = this.inputData.map((value, index) => {
      return value * uniformRange[index % uniformRange.length];
    });
    this.outputTime = this.inputTime;
    outputChart.data.labels = this.outputTime;
    outputChart.data.datasets[0].data = this.outputData;
    outputChart.update();
  }

  equalize() {
    const fftSize = 2 ** Math.ceil(Math.log2(this.inputData.length));
    // Compute sample rate
    const sampleRate = this.inputData.length / this.inputTime[this.inputData.length - 1];
    
    const fft = new FFT(fftSize, sampleRate);
    const mag = new Float32Array(fftSize / 2);
    fft.forward(this.inputData, mag);
    
    const magRanges = new Float32Array(this.sliders.length);
    for (let i = 0; i < this.sliders.length; i++) {
      const slider = this.sliders[i];
      const start = Math.floor(slider.frequencyMin / sampleRate * fftSize);
      const end = Math.floor(slider.frequencyMax / sampleRate * fftSize);
      let sum = 0;
      for (let j = start; j < end; j++) {
        sum += mag[j];
      }
      magRanges[i] = sum / (end - start);
    }

    // Apply the gains or attenuations set by the user on each slider
    for (let i = 0; i < this.sliders.length; i++) {
      const slider = this.sliders[i];
      const gain = Math.pow(10, slider.value / 20);
      const start = Math.floor(slider.frequencyMin / sampleRate * fftSize);
      const end = Math.floor(slider.frequencyMax / sampleRate * fftSize);
      for (let j = start; j < end; j++) {
        mag[j] *= gain;
      }
    }

    // Inverse FFT
    const ifft = new FFT(fftSize, sampleRate);
    const ifftData = new Float32Array(fftSize);
    ifft.inverse(mag, ifftData);

    // Normalize the output
    const max = Math.max(...ifftData);
    const min = Math.min(...ifftData);
    const range = max - min;
    for (let i = 0; i < ifftData.length; i++) {
      ifftData[i] = (ifftData[i] - min) / range;
    }

    this.outputData = ifftData;
    this.outputTime = this.inputTime;

    outputChart.data.labels = this.outputTime;
    outputChart.data.datasets[0].data = this.outputData;
    outputChart.update();

    // Update the sliders


  }
}

class VowelsEqulizer extends Equalizer{
  constructor() {
    super();
    this.sliders = []
  }

  initSliders() {
    for (const slider of this.sliders) {
      const sliderMainContainer = document.getElementById("sliders");
      const sliderContainer = document.createElement("div");
      sliderContainer.classList.add("slider");

      const sliderElement = document.createElement("input");
      const sliderLabel = document.createElement("p");
      sliderLabel.textContent = slider.name;

      const sliderValue = document.createElement("p");
      sliderValue.textContent = slider.value;

      const sliderMax = document.createElement("p");
      sliderMax.textContent = slider.max;

      const sliderMin = document.createElement("p");
      sliderMin.textContent = slider.min;

      sliderElement.classList.add("slide");
      sliderElement.type = "range";
      sliderElement.id = slider.id;
      sliderElement.min = slider.min;
      sliderElement.max = slider.max;
      sliderElement.step = slider.step;
      sliderElement.value = slider.value;
      sliderElement.addEventListener("input", () => {
        sliderValue.textContent = sliderElement.value;
      
        this.updateSliders();
        this.updateChart();
      });

      
      sliderContainer.appendChild(sliderValue);
      sliderContainer.appendChild(sliderMax);
      sliderContainer.appendChild(sliderElement);
      sliderContainer.appendChild(sliderMin);
      sliderContainer.appendChild(sliderLabel);
      sliderMainContainer.appendChild(sliderContainer);
    }
  }

  addSliders() {
    const vowels = ["a", "e", "i", "o", "u"];
    const minFrequency = [500, 1000, 1500, 2000, 2500];
    const maxFrequency = [1000, 1500, 2000, 2500, 3000];
    for (let i = 0; i < vowels.length; i++) {
      const slider = new Slider(
        `vowels-slider-${vowels[i]}`,
        minFrequency[i],
        maxFrequency[i],
        0,
        -20,
        20,
        1
      );
      this.sliders.push(slider);
    }
  }

  updateSliders() {
    for (const slider of this.sliders) {
      const sliderElement = document.getElementById(slider.id);
      slider.value = sliderElement.value;
    }
  }

  updateChart() {
    const vowels = [];
    for (const slider of this.sliders) {
      vowels.push(slider.value);
    }
    this.outputData = this.inputData.map((value, index) => {
      return value * vowels[index % vowels.length];
    });
    this.outputTime = this.inputTime;
    outputChart.data.labels = this.outputTime;
    outputChart.data.datasets[0].data = this.outputData;
    outputChart.update();
  }
}

const uniformRangeEqulizer = new UniformRangeEqulizer();
uniformRangeEqulizer.addSliders();
uniformRangeEqulizer.initSliders();
const inputSpectrogram = document.getElementById("inputSpectrogram");
const outputSpectrogram = document.getElementById("outputSpectrogram");
const inputCtx = inputSpectrogram.getContext("2d");
const outputCtx = outputSpectrogram.getContext("2d");
inputCtx.fillStyle = '#000000';
inputCtx.fillRect(0, 0, inputSpectrogram.width, inputSpectrogram.height);
outputCtx.fillStyle = '#000000';
outputCtx.fillRect(0, 0, outputSpectrogram.width, outputSpectrogram.height);
csvFile.addEventListener("change", function() {
  console.log("file changed");
  const file = csvFile.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
      const data = event.target.result;
      const lines = data.split("\n");
      let samples = [];
      inputChart.data.labels = [];
      inputChart.data.datasets[0].data = [];
      for (const line of lines) {
          const values = line.split(",");
          const time = parseFloat(values[0]).toFixed(3);
          const value = parseFloat(values[1]).toFixed(8);
          inputTime.push(time);
          inputChart.data.labels.push(time);
          inputChart.data.datasets[0].data.push(value);
          // adjust time floating point to 3 decimal places
          inputData.push(value);
          const dataa = {
            time: time,
            value: value
          };
          samples.push(dataa);

      }
      // Remove the first element
      samples.shift();

      drawSpectrogram(samples, inputSpectrogram);
      drawSpectrogram(samples, outputSpectrogram);
      inputChart.update();
  };

  reader.readAsText(file);
});

const inputChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Signal',
      data: [],
      borderWidth: 1,
      radius: 0,
    }]
  },
  options: {
    animation: false,
    scales: {
      x:
      {
          max: maxWidth,
          min: 0,

      },
      yAxes: [{
        ticks: {
          min: -1,
          max: 1,
          stepSize: 0.1
        }
      }]
    }
  }
});

const outputChart = new Chart(ctx2, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Signal',
      data: [],
      borderWidth: 1,
      radius: 0,
    }]
  },
  options: {
    animation: false,
    scales: {
      x:
      {
          max: maxWidth,
          min: 0,

      },
      yAxes: [{
        ticks: {
          min: -1,
          max: 1,
          stepSize: 0.1
        }
      }]
    }
  }
});


function map(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

function drawSpectrogram(data,canvas) {
  var width = canvas.width;
  var height = canvas.height;
  // canvas.width = width;
  // canvas.height = height;
  var ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(1, '#0000ff');
  gradient.addColorStop(0.5, '#00ffff');
  gradient.addColorStop(0, '#ffffff');
  // fill the canvas with black
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  const fftSize = 1024; // FFT size (power of 2)
  const binCount = 256; // number of frequency bins (half of FFT size)
  
  const fft = new FFT(fftSize, 44100);
  // data = data.map((value) => {
  //     return map(value, -1, 1, 0, 255);
  // });
  // Make sure the data array is the same size as the FFT size.
  // If it is smaller, then zero-pad it.
  data = data.map((value) => {
    return value.value;
  });
  while (data.length < fftSize) {
      data.push(0);
  }
  // if it is larger, then truncate it
  data.length = fftSize;

  
  console.log(data);

  fft.forward(data);
  const spectrum = fft.spectrum;
  const sliceWidth = width / spectrum.length;
  let x = 0;
  // get max of spectrum data
  console.log(data);
  const maxS = Math.max(...spectrum);
  for (let i = 0; i < spectrum.length; i++) {
    const h = map(spectrum[i], 0, maxS, 0, height);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, height - h, sliceWidth, h);
    x += sliceWidth;
  }
  

}

const playButton = document.getElementById("play-button");
const pauseButton = document.getElementById("pause-button");
var isPlaying = false;
var intervalId = null;
var updateInterval = 50; // milliseconds

playButton.addEventListener("click", (e) => {
  if (isPlaying) {
    clearInterval(intervalId);
    isPlaying = false;
    // change button text
    e.target.textContent = "Play";
  } else {
    var currentIndex = 0;
    intervalId = setInterval(function () {
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
        // change button text
        e.target.textContent = "Pause";
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

