from flask import Flask, request, Response
from flask_cors import CORS, cross_origin
import numpy as np
import matplotlib.pyplot as plt
from io import BytesIO
from scipy import signal
import librosa
import json
import pylab

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/spectrogram', methods=['POST'])
@cross_origin()
def spectrogram():
    # Get data from request body as json
    data = request.get_json()['data']
    # sample_rate = request.get_json()['sample_rate']
    # Create spectrogram image
    pylab.rcParams['axes.facecolor'] = 'black'
    pylab.rc('axes', edgecolor='w')
    pylab.rc('xtick', color='w')
    pylab.rc('ytick', color='w')
    pylab.rcParams['savefig.facecolor'] = 'black'
    pylab.rcParams["figure.autolayout"] = True

    fig, ax = pylab.subplots()
    ax.specgram(data, Fs=2)

    # Convert image to bytes
    buffer = BytesIO()
    fig.savefig(buffer, format='png')
    buffer.seek(0)
    image_bytes = buffer.getvalue()

    # Return image as response
    return Response(image_bytes, mimetype='image/png')

@app.route('/equalize', methods=['POST'])
@cross_origin()
def equalize():
    # Get audio file from request body
    audio_file = request.files.get('file')
    gains = request.form.get('gains')
    gains = json.loads(gains)
    
    print(gains)
    # freq_ranges = [[0, 100], [100, 500], [500, 1000], [1000, 5000], [5000, 10000], [10000, 22050]]
    # get the freq_ranges and convert to json
    freq_ranges = request.form.get('freqRanges')
    # convert to list
    print(freq_ranges)
    freq_ranges = json.loads(freq_ranges)
    freq_ranges = [[float(freq_range[0]), float(freq_range[1])] for freq_range in freq_ranges]
    print(freq_ranges)
    if not audio_file:
        return Response('No file provided', status=400)

    # Load audio data using librosa
    y, sr = librosa.load(audio_file)

    # Compute the FFT of the audio signal
    y_fft = np.fft.fft(y)

    # Get the magnitude and phase spectra
    mag = np.abs(y_fft)
    phase = np.angle(y_fft)

    # Modify the magnitude spectrum based on the desired gain for each range
    freqs = np.fft.fftfreq(len(y), 1/sr)
    for freq_range, gain in zip(freq_ranges, gains):
        idx_start = np.abs(freqs - freq_range[0]).argmin()
        idx_stop = np.abs(freqs - freq_range[1]).argmin()
        mag[idx_start:idx_stop] *= gain

    # Reconstruct the FFT from the modified magnitude and phase spectra
    y_fft_eq = mag * np.exp(1j*phase)

    # Inverse transform the FFT back to the time domain
    y_eq = np.fft.ifft(y_fft_eq).real

    # Write the equalized audio data to a file
    # librosa.output.write_wav('equalized_audio.wav', y_eq, sr=sr)

    # return y_eq
    res = {
        'data': y_eq.tolist(),
        'sample_rate': sr
    }
    return Response(json.dumps(res), mimetype='application/json')

