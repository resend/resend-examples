# Resend Webhook with Flask

This example shows how to use Resend with [Flask](https://flask.palletsprojects.com/en/2.3.x/).

## Prerequisites

To get the most out of this guide, you’ll need to:

* [Create an API key](https://resend.com/api-keys)
* [Verify your domain](https://resend.com/domains)
* Install [Ngrok](https://ngrok.com/).
* Install `virtualenv` by running `pip install virtualenv`

## Instructions

1. Create and activate a new virtual env with:

```sh
virtualenv venv
source venv/bin/activate
```

2. Install dependencies:

```sh
pip install -r requirements.txt
```

3. Run your Flask API with

```sh
python app.py
```

4. Expose your local Flask API through Ngrok by running.

```sh
ngrok http 5000
```

This will get you a public url similar to: `https://b009-2804-1b0-f385-8a68-98ee-361f-7cd1-3195.ngrok-free.app`

5. Add your webhook url on Resend [Webhook Dashboard](https://resend.com/webhooks).

`https://b009-2804-1b0-f385-8a68-98ee-361f-7cd1-3195.ngrok-free.app/webhook`

Note the trailing `/webhook` url path.

6. Send some emails and see the requests coming through from Resend.

## License

MIT License