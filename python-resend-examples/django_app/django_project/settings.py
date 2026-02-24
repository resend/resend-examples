import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "django-insecure-example-key-change-in-production"
DEBUG = True
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "resend_app",
]

MIDDLEWARE = [
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "django_project.urls"
WSGI_APPLICATION = "django_project.wsgi.application"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Resend configuration
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
EMAIL_FROM = os.environ.get("EMAIL_FROM", "Acme <onboarding@resend.dev>")
RESEND_WEBHOOK_SECRET = os.environ.get("RESEND_WEBHOOK_SECRET", "")
RESEND_AUDIENCE_ID = os.environ.get("RESEND_AUDIENCE_ID", "")
CONFIRM_REDIRECT_URL = os.environ.get("CONFIRM_REDIRECT_URL", "https://example.com/confirmed")
