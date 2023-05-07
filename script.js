const ctx                 = document.getElementById("inputChart");
const ctx2                = document.getElementById("outputChart");
const fileInput           = document.getElementById("csv-file");
const inputSpectrogram    = document.getElementById("inputSpectrogram");
const outputSpectrogram   = document.getElementById("outputSpectrogram");
const playButton          = document.getElementById("play-button");
const pauseButton         = document.getElementById("pause-button");
const stopButton          = document.getElementById("stop-button");
const hideSpectrogramBtn  = document.getElementById("spectrogramBtn"); //Checkbox for hiding spectrogram
const speedSlider         = document.getElementById("speed");
const speedLabel          = document.getElementById("speed-label");
const dropdowns           = document.querySelectorAll('[data-dropdown-toggle]');
const collapses           = document.querySelectorAll('[data-collapse-toggle]');
const modeMenu            = document.getElementById("modesMenu");
const modeMenuItems       = modeMenu.querySelectorAll("li");
const inputCtx            = inputSpectrogram.getContext("2d");
const outputCtx           = outputSpectrogram.getContext("2d");

inputCtx.fillStyle = '#000000';
inputCtx.fillRect(0, 0, inputSpectrogram.width, inputSpectrogram.height);
outputCtx.fillStyle = '#000000';
outputCtx.fillRect(0, 0, outputSpectrogram.width, outputSpectrogram.height);

var isPlaying       = false;
var intervalId      = null;
var updateInterval  = 5; // milliseconds
var currentIndex    = 0;

let audioFile       = null;
let inputData       = [];
let inputTime       = [];
let outputData      = [];
let outputTime      = [];
const maxWidth      = 20000;
const maxFrequency  = 1000;

const inputChart    = new Chart(ctx, {
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
    },
  },
});

const outputChart   = new Chart(ctx2, {
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
    },
  },
});

/////////////////////////////////////////////////////////////////////////////////////

class Slider {
  constructor(id, frequencyMin, frequencyMax, value, min, max, step) {
    this.id = id;
    this.frequencyMin = frequencyMin;
    this.frequencyMax = frequencyMax;
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
    this.sampleRate = 44100;
    this.maxWidth = 1500;
    this.maxFrequency = 1000;
    this.audioBufferSourceNode = null;
  }
  initSliders() {
    const sliderMainContainer = document.getElementById("sliders");
    // clear sliders
    sliderMainContainer.innerHTML = "";
    for (var slider of this.sliders) {
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

  updateData(inputData, inputTime) {
    this.inputData = inputData;
    this.inputTime = inputTime;
  }

  updateSliders() {
    for (const slider of this.sliders) {
      const sliderElement = document.getElementById(slider.id);
      slider.value = sliderElement.value;
    }
    this.equalize();
  }

  updateSpectrogram() {
    drawSpectrogram(this.outputData,outputSpectrogram);
  }

  equalize(){
    const gains = [];
    const freqRanges = [];
    for (const slider of this.sliders) {
      // convert slider value to float
      gains.push(parseFloat(slider.value));
      freqRanges.push([slider.frequencyMin, slider.frequencyMax]);
    }

    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('gains', JSON.stringify(gains));
    formData.append('freqRanges', JSON.stringify(freqRanges));
    // send audio file to server
    fetch('http://127.0.0.1:5000/equalize', {
      method: 'POST',
      body: formData
    }).then((response) => {
      return response.json();
    }).then((data) => {
      this.outputTime = inputTime
      this.outputData = data['data'];
      for (let i = 0; i < data.length; i++) {
        this.outputData.push(data['data'][i]);
      }
      outputChart.data.labels = this.outputTime;
      outputChart.data.datasets[0].data = data['data'];
      outputData = this.outputData;
      outputTime = this.outputTime;
      console.log(data);

      outputChart.update();
      this.updateSpectrogram();
      
    });
  }

  read() {
    const gains = [];
    const freqRanges = [];

    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('gains', JSON.stringify(gains));
    formData.append('freqRanges', JSON.stringify(freqRanges));
    // send audio file to server
    fetch('http://127.0.0.1:5000/equalize', {
      method: 'POST',
      body: formData
    }).then((response) => {
      return response.json();
    }).then((data) => {
      this.inputData = data["data"];
      this.sampleRate = data["sample_rate"];
      console.log(this.inputTime);
      console.log(this.inputData);
      inputChart.data.labels = inputTime;
      inputChart.data.datasets[0].data = this.inputData;
      inputChart.update();
      drawSpectrogram(this.inputData,inputSpectrogram);

    });
  }

  playSound() {
    const audioContext = new AudioContext();
    console.log(this.inputData);
    const audioBuffer = audioContext.createBuffer(1, this.inputData.length, this.sampleRate);
    this.audioBufferSourceNode = audioContext.createBufferSource();
    audioBuffer.getChannelData(0).set(this.inputData);
    this.audioBufferSourceNode.buffer = audioBuffer;
    this.audioBufferSourceNode.connect(audioContext.destination);
    this.audioBufferSourceNode.start();aZZZZZ
  }

  pauseSound() {
    audioBufferSourceNode.stop();
  }


}

class UniformRangeEqualizer extends Equalizer {
  constructor(inputData, inputTime) {
    super(inputData, inputTime);
    this.addSliders();
    this.initSliders();

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
}

class VowelsEqualizer extends Equalizer{
  constructor(inputData, inputTime) {
    super(inputData, inputTime);
    this.addSliders();
    this.initSliders();
  }

  addSliders() {
    const vowels = ["a", "e", "i", "o", "u"];
    const minFrequency = [730, 500, 270, 400, 250];
    const maxFrequency = [1090, 1700, 2290, 800, 595];
    for (let i = 0; i < vowels.length; i++) {
      const slider = new Slider(
        `vowels-slider-${vowels[i]}`,
        minFrequency[i],
        maxFrequency[i],
        1,
        -20,
        20,
        1
      );
      this.sliders.push(slider);
    }
  }

}

class MusicalInstrumentsEqualizer extends Equalizer{
  constructor(inputData, inputTime) {
    super(inputData, inputTime);
    this.addSliders();
    this.initSliders();
  }

  addSliders() {
    const instruments = ["flute", "violin", "trumpet", "clarinet"];
    const minFrequency = [730, 500, 270, 400, 250];
    const maxFrequency = [1090, 1700, 2290, 800, 595];
    for (let i = 0; i < instruments.length; i++) {
      const slider = new Slider(
        `instruments-slider-${instruments[i]}`,
        minFrequency[i],
        maxFrequency[i],
        1,
        -20,
        20,
        1
      );
      this.sliders.push(slider);
    }
  }

}

class BiologicalSignalAbnormalitiesEqualizer extends Equalizer{
  constructor(inputData, inputTime) {
    super(inputData, inputTime);
    this.addSliders();
    this.initSliders();
  }

  addSliders() {
    const abnormalities = ["extrasystole", "murmur", "normal", "extrahls", "murmurhls"];
    const minFrequency = [730, 500, 270, 400, 250];
    const maxFrequency = [1090, 1700, 2290, 800, 595];
    for (let i = 0; i < abnormalities.length; i++) {
      const slider = new Slider(
        `abnormalities-slider-${abnormalities[i]}`,
        minFrequency[i],
        maxFrequency[i],
        1,
        -20,
        20,
        1
      );
      this.sliders.push(slider);
    }
  }

}
const biologicalSignalAbnormalitiesEqualizer = new BiologicalSignalAbnormalitiesEqualizer(inputData, inputTime);
const musicalInstrumentsEqualizer = new MusicalInstrumentsEqualizer(inputData, inputTime);
const vowelsEqualizer = new VowelsEqualizer(inputData, inputTime);
const uniformRangeEqualizer = new UniformRangeEqualizer(inputData, inputTime);

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

fileInput.addEventListener('change', async (event) => {
  audioFile = event.target.files[0];

  var reader = new FileReader();
  reader.onload =  function() {
    // plot audio file in input chart
    const audioContext = new AudioContext();
    audioContext.decodeAudioData(reader.result).then(async (buffer) => {
      const rawData = buffer.getChannelData(0);
      const sampleRate = buffer.sampleRate;
      const time = [];
      for (let i = 0; i < rawData.length; i++) {
        // flotation point precision
        time.push((i/sampleRate).toFixed(4));
      }
      inputTime = time;
      inputData = rawData;
      // uniformRangeEqualizer.updateData(inputData, inputTime);
      uniformRangeEqualizer.read();
      uniformRangeEqualizer.equalize();

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
    uniformRangeEqualizer.playSound();
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

modeMenuItems.forEach((item) => {
  item.addEventListener("click", function () {
    const mode = this.querySelector("a").textContent;
    const modeButton = document.getElementById("dropdownNavbarLink");
    const modeLabel = modeButton.querySelector("p");
    modeLabel.textContent = mode;
    if (mode === "Uniform Range Mode") {
      uniformRangeEqualizer.initSliders();
      uniformRangeEqualizer.equalize();
    } else if (mode === "Vowels Mode") {
      vowelsEqualizer.initSliders();
      vowelsEqualizer.equalize();
    }
    else if (mode === "Musical Instruments Mode") {
      musicalInstrumentsEqualizer.initSliders();
      musicalInstrumentsEqualizer.equalize();
    }
    else if (mode === "Biological Signal Abnormalities"){
      biologicalSignalAbnormalitiesEqualizer.initSliders();
      biologicalSignalAbnormalitiesEqualizer.equalize();
    }

  });
});
