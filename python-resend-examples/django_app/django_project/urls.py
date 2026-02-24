from django.urls import path

from resend_app import views

urlpatterns = [
    path("health", views.health, name="health"),
    path("send", views.send_email, name="send_email"),
    path("send-attachment", views.send_attachment, name="send_attachment"),
    path("send-cid", views.send_cid, name="send_cid"),
    path("send-scheduled", views.send_scheduled, name="send_scheduled"),
    path("send-template", views.send_template, name="send_template"),
    path("webhook", views.webhook, name="webhook"),
    path("domains", views.list_domains, name="list_domains"),
    path("domains/create", views.create_domain, name="create_domain"),
    path("audiences/contacts", views.list_contacts, name="list_contacts"),
    path("double-optin/subscribe", views.double_optin_subscribe, name="double_optin_subscribe"),
    path("double-optin/webhook", views.double_optin_webhook, name="double_optin_webhook"),
]
