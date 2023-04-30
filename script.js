const ctx = document.getElementById("inputChart");
const ctx2 = document.getElementById("outputChart");
const fileInput = document.getElementById("csv-file");
const inputSpectrogram = document.getElementById("inputSpectrogram");
const outputSpectrogram = document.getElementById("outputSpectrogram");
const inputCtx = inputSpectrogram.getContext("2d");
const outputCtx = outputSpectrogram.getContext("2d");
const playButton = document.getElementById("play-button");
const pauseButton = document.getElementById("pause-button");
const stopButton = document.getElementById("stop-button");
const hideSpectrogramBtn = document.getElementById("spectrogramBtn"); //Checkbox for hiding spectrogram
const speedSlider = document.getElementById("speed");
const speedLabel = document.getElementById("speed-label");
const dropdowns = document.querySelectorAll('[data-dropdown-toggle]');
const collapses = document.querySelectorAll('[data-collapse-toggle]');

inputCtx.fillStyle = '#000000';
inputCtx.fillRect(0, 0, inputSpectrogram.width, inputSpectrogram.height);
outputCtx.fillStyle = '#000000';
outputCtx.fillRect(0, 0, outputSpectrogram.width, outputSpectrogram.height);

var isPlaying = false;
var intervalId = null;
var updateInterval = 5; // milliseconds
var currentIndex = 0;

let audioFile = null;
let inputData = [];
let inputTime = [];
let outputData = [];
let outputTime = [];
const maxWidth = 500;
const maxFrequency = 1000;

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

/////////////////////////////////////////////////////////////////////////////////////


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
  constructor(inputData, inputTime) {
    this.sliders = [];
    this.inputData = inputData;
    this.inputTime = inputTime;
    this.outputData = [];
    this.outputTime = [];
    this.maxWidth = 500;
    this.maxFrequency = 1000;
  }
  equalize(sliders)
  {
    const gains = [];
    for (const slider of sliders) {
      gains.push(slider.value);
    }

    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('gains', JSON.stringify(gains));

    // send audio file to server
    fetch('http://127.0.0.1:5000/equalize', {
      method: 'POST',
      body: formData
    }).then((response) => {
      return response.json();
    }).then((data) => {
      this.outputTime = inputTime
      this.outputData = [];
      for (let i = 0; i < data.length; i++) {
        this.outputData.push(data[i].toFixed(8));
      }
      outputChart.data.labels = this.outputTime;
      outputChart.data.datasets[0].data = this.outputData;
      console.log(this.outputData);
      console.log(this.outputTime);
      outputData = this.outputData;
      outputTime = this.outputTime;

      outputChart.update();
      
    });
  }
}

class UniformRangeEqulizer extends Equalizer {
  constructor(inputData, inputTime) {
    super(inputData, inputTime);
    this.sliders = []
    this.addSliders();
    this.initSliders();

  }

  initSliders() {
    for (var slider of this.sliders) {
      console.log(slider);
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
        slider.value = sliderElement.value;
        this.updateSliders();
        // this.updateChart();
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
        1,
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
    
  }
  
  updateSpectrogram() {
    drawSpectrogram(outputData,outputSpectrogram);
  }

  equalize() {
    super.equalize(this.sliders);
    console.log(this.outputData);
    this.updateSpectrogram();
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

  }
}

const uniformRangeEqulizer = new UniformRangeEqulizer(inputData, inputTime);


fileInput.addEventListener('change', async (event) => {
  audioFile = event.target.files[0];

  var reader = new FileReader();
  reader.onload =  function() {
    // plot audio file in input chart
    const audioContext = new AudioContext();
    audioContext.decodeAudioData(reader.result).then(async (buffer) => {
      const rawData = buffer.getChannelData(0);
      const sampleRate = buffer.sampleRate;
      const duration = buffer.duration;
      const time = [];
      const data = [];
      for (let i = 0; i < rawData.length; i++) {
        // flotation point precision
        time.push((i / sampleRate).toFixed(4));
        data.push(rawData[i].toFixed(4));
      }
      inputData = data;
      inputTime = time;
      inputChart.data.labels = time;
      inputChart.data.datasets[0].data = data;
      console.log(data);
      inputChart.update();
      drawSpectrogram(data,inputSpectrogram);
      

    });
  };
  reader.readAsArrayBuffer(audioFile);
});

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

      outputChart.data.datasets[0].data.shift();
      outputChart.data.labels.shift();
      outputChart.data.labels.push(outputTime[currentIndex]);
      outputChart.data.datasets[0].data.push(outputData[currentIndex]);
      outputChart.update();

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

  outputChart.data.datasets[0].data = outputData.slice(0);
  outputChart.data.labels = outputTime.slice(0);
  outputChart.update();
});

// Update the speed label's text when the slider value changes
speedSlider.addEventListener("input", () => {
 speedLabel.textContent = speedSlider.value;
});

function map(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

async function drawSpectrogram(data, canvas) {
  // make post request to server
  // response is image so take it and view it
  data = data.map((d) => {
    // Remove NaN values
    if (isNaN(d)) {
      return 0;
    }

    return d;
  });
  const url = "http://127.0.0.1:5000/spectrogram";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: `{"data": [${data}]}`
  };
  fetch(url, options)
  .then(function(response) {
    return response.blob();
  })
  .then(function(blob) {
    var url = URL.createObjectURL(blob);
    var img = new Image();
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      // Add padding to the canvas
      canvas.height += 20;
      canvas.getContext('2d').drawImage(img, 0, 0);

    };
    img.src = url;
  });

}
// function drawSpectrogram(data, canvas) {
//   var width = canvas.width;
//   var height = canvas.height;
//   // canvas.width = width;
//   // canvas.height = height;
//   var ctx = canvas.getContext("2d");
//   const gradient = ctx.createLinearGradient(0, 0, 0, height);
//   gradient.addColorStop(1, "#0000ff");
//   gradient.addColorStop(0.5, "#00ffff");
//   gradient.addColorStop(0, "#ffffff");
//   // fill the canvas with black
//   ctx.fillStyle = "#000000";
//   ctx.fillRect(0, 0, width, height);

//   const fftSize = 1024; // FFT size (power of 2)
//   const binCount = 256; // number of frequency bins (half of FFT size)

//   const fft = new FFT(fftSize, 44100);
//   // data = data.map((value) => {
//   //     return map(value, -1, 1, 0, 255);
//   // });
//   // Make sure the data array is the same size as the FFT size.
//   // If it is smaller, then zero-pad it.
//   data = data.map((value) => {
//     return value.value;
//   });
//   while (data.length < fftSize) {
//     data.push(0);
//   }
//   // if it is larger, then truncate it
//   if (data.length > fftSize) {
//       data = data.slice(0, fftSize);
//   }
//   fft.forward(data);
//   const spectrum = fft.spectrum;
//   const sliceWidth = width / spectrum.length;
//   let x = 0;
//   // get max of spectrum data
//   const maxS = Math.max(...spectrum);
//   for (let i = 0; i < spectrum.length; i++) {
//     const h = map(spectrum[i], 0, maxS, 0, height);
//     ctx.fillStyle = gradient;
//     ctx.fillRect(x, height - h, sliceWidth, h);
//     x += sliceWidth;
//   }
// }


hideSpectrogramBtn.addEventListener("click", (e) => {
  if (hideSpectrogramBtn.checked) {
    inputSpectrogram.classList.remove("hidden");
    outputSpectrogram.classList.remove("hidden");
  } else {
    inputSpectrogram.classList.add("hidden");
    outputSpectrogram.classList.add("hidden");
  }
});

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
