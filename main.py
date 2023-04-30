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
    if not audio_file:
        return Response('No file provided', status=400)

    # Load audio data using librosa
    audio_data, sample_rate = librosa.load(audio_file)

    # Calculate frequency ranges and gains
    freq_ranges = np.linspace(0, sample_rate / 2, num=11)
    # get gains from request body form data as gain = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    # remove first [ and last ]
    gains = request.form.get('gains')[1:-1]
    # split by comma
    gains = gains.split(',')
    # remove every "
    gains = [gain.replace('"', '') for gain in gains]
    print(gains)
    gains = [float(gain) for gain in gains]
    print(gains)
    # Apply equalization
    eq_data = np.zeros_like(audio_data)
    for i in range(10):
        start_idx = int(freq_ranges[i] / sample_rate * len(audio_data))
        end_idx = int(freq_ranges[i+1] / sample_rate * len(audio_data))
        print(start_idx, end_idx)
        eq_data[start_idx:end_idx] = audio_data[start_idx:end_idx] * gains[i]

    # Return equalized data as json
    return Response(json.dumps(eq_data.tolist()), mimetype='application/json')

