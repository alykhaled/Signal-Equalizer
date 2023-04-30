from flask import Flask, request, Response
from flask_cors import CORS, cross_origin

import matplotlib.pyplot as plt
from io import BytesIO
import pylab

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/spectrogram', methods=['POST'])
@cross_origin()
def spectrogram():
    # Get data from request body as json
    data = request.get_json()['data']
    print(data)
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
