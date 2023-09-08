import os
import json
from flask import Flask, jsonify, request
from svix.webhooks import Webhook, WebhookVerificationError

app = Flask(__name__)

if not os.environ["WEBHOOK_SECRET"]:
    raise EnvironmentError("WEBHOOK_SECRET is missing")


@app.route('/webhook', methods = ['POST'])
def index():
    headers = request.headers
    payload = request.get_data()

    try:
        wh = Webhook(os.environ["WEBHOOK_SECRET"])
        msg = wh.verify(payload, headers)
    except WebhookVerificationError as e:
        return ('', 400)

    print(msg)
    return jsonify(success=True)


if __name__ == "__main__":
    app.run(port=5000)
