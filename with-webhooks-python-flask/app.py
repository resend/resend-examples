import os
import json
from flask import Flask, jsonify, request

app = Flask(__name__)


@app.route('/webhook', methods = ['POST'])
def index():
    data = json.loads(request.data)
    print(data)
    resp = jsonify(success=True)
    return resp


if __name__ == "__main__":
    app.run(port=5000)
