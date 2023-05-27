from flask import Flask, request, Response
from flask_cors import CORS, cross_origin
import numpy as np
import matplotlib.pyplot as plt
from io import BytesIO
from scipy import signal
import wave
import json
import pylab

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/spectrogram', methods=['POST'])
@cross_origin()
def spectrogram():
    # Get data from request body as json
    # data = request.get_json()['data']
    audio_file = request.files.get('file')
    if not audio_file:
        return Response('No file provided', status=400)
    
    # Load audio data using wave
    wav = wave.open(audio_file, 'rb')
    sr = wav.getframerate()
    nframes = wav.getnframes()
    data = np.fromstring(wav.readframes(nframes), dtype=np.int16)
    data = data[::2]
    # print(data)
    
    # sample_rate = request.get_json()['sample_rate']
    # Create spectrogram image
    pylab.rcParams['axes.facecolor'] = 'black'
    pylab.rc('axes', edgecolor='w')
    pylab.rc('xtick', color='w')
    pylab.rc('ytick', color='w')
    pylab.rcParams['savefig.facecolor'] = 'black'
    pylab.rcParams["figure.autolayout"] = True

    fig, ax = plt.subplots()
    ax.specgram(data, Fs=sr)

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

    # print(gains)
    # freq_ranges = [[0, 100], [100, 500], [500, 1000], [1000, 5000], [5000, 10000], [10000, 22050]]
    # get the freq_ranges and convert to json
    freq_ranges = request.form.get('freqRanges')
    # convert to list
    # print(freq_ranges)
    freq_ranges = json.loads(freq_ranges)
    freq_ranges = [[float(freq_range[0]), float(freq_range[1])] for freq_range in freq_ranges]
    # print(freq_ranges)

    if not audio_file:
        return Response('No file provided', status=400)

    # Load audio data using wave
    wav = wave.open(audio_file, 'rb')
    channel = wav.getnchannels()
    sr = wav.getframerate()
    nframes = wav.getnframes()
    y = np.frombuffer(wav.readframes(nframes), dtype=np.int16)
    if channel == 2:
        y = y[::2]
    
    if gains == []:
        return Response(audio_file, mimetype='audio/wav')

    # Compute the FFT of the audio signal
    y_fft = np.fft.fft(y)

    freqs = np.fft.fftfreq(len(y_fft),d=1/sr)
    gain = np.ones_like(y_fft)
    gain[:] = -20
    for fmin, fmax in freq_ranges:
        idx = np.argwhere(np.logical_and(freqs >= fmin, freqs <= fmax)).flatten()
        gain[idx] = gains[freq_ranges.index([fmin, fmax])]

    gain += 20
    gain /= 20

    # Apply the gain
    filtered_data = np.real(np.fft.ifft(y_fft * gain))
    filtered_data = filtered_data.astype(np.int16)
    # print(filtered_data)

    
    # Make wav file
    wav_bytes = BytesIO()
    with wave.open(wav_bytes, 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(44100)
        wav_file.writeframes(filtered_data.astype(np.int16))
    
    wav_bytes.seek(0)

    # print bytes size
    print('bytes size: ', wav_bytes.getbuffer().nbytes)
    # Return wav file as response
    return Response(wav_bytes, mimetype='audio/wav')


