package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
	"github.com/resend/resend-go/v2"
	svix "github.com/svix/svix-webhooks/go"
)

var client *resend.Client

func main() {
	_ = godotenv.Load()

	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		log.Fatal("RESEND_API_KEY environment variable is required")
	}

	client = resend.NewClient(apiKey)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/health", healthHandler)
	r.Post("/send", sendHandler)
	r.Post("/webhook", webhookHandler)
	r.Post("/double-optin/subscribe", doubleOptinSubscribeHandler)
	r.Post("/double-optin/webhook", doubleOptinWebhookHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	fmt.Printf("Chi server running on http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

func jsonResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	jsonResponse(w, http.StatusOK, map[string]string{"status": "ok"})
}

func sendHandler(w http.ResponseWriter, r *http.Request) {
	var body struct {
		To      string `json:"to"`
		Subject string `json:"subject"`
		Message string `json:"message"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	if body.To == "" || body.Subject == "" || body.Message == "" {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "Missing required fields: to, subject, message"})
		return
	}

	from := os.Getenv("EMAIL_FROM")
	if from == "" {
		from = "Acme <onboarding@resend.dev>"
	}

	params := &resend.SendEmailRequest{
		From:    from,
		To:      []string{body.To},
		Subject: body.Subject,
		Html:    fmt.Sprintf("<p>%s</p>", body.Message),
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	jsonResponse(w, http.StatusOK, map[string]interface{}{"success": true, "id": sent.Id})
}

func webhookHandler(w http.ResponseWriter, r *http.Request) {
	svixID := r.Header.Get("svix-id")
	svixTimestamp := r.Header.Get("svix-timestamp")
	svixSignature := r.Header.Get("svix-signature")

	if svixID == "" || svixTimestamp == "" || svixSignature == "" {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "Missing webhook headers"})
		return
	}

	webhookSecret := os.Getenv("RESEND_WEBHOOK_SECRET")
	if webhookSecret == "" {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": "Webhook secret not configured"})
		return
	}

	// Read and verify the webhook payload
	var payload []byte
	payload, err := readBody(r)
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "Failed to read body"})
		return
	}

	wh, err := svix.NewWebhook(webhookSecret)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": "Invalid webhook secret"})
		return
	}

	err = wh.Verify(payload, r.Header)
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "Invalid webhook signature"})
		return
	}

	var event map[string]interface{}
	json.Unmarshal(payload, &event)

	eventType, _ := event["type"].(string)
	log.Printf("Received webhook event: %s", eventType)

	switch eventType {
	case "email.received":
		data, _ := event["data"].(map[string]interface{})
		log.Printf("New email from: %v", data["from"])
	case "email.delivered":
		data, _ := event["data"].(map[string]interface{})
		log.Printf("Email delivered: %v", data["email_id"])
	case "email.bounced":
		data, _ := event["data"].(map[string]interface{})
		log.Printf("Email bounced: %v", data["email_id"])
	}

	jsonResponse(w, http.StatusOK, map[string]interface{}{"received": true, "type": eventType})
}

func doubleOptinSubscribeHandler(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	if body.Email == "" {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "Missing required field: email"})
		return
	}

	audienceID := os.Getenv("RESEND_AUDIENCE_ID")
	if audienceID == "" {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": "RESEND_AUDIENCE_ID not configured"})
		return
	}

	confirmURL := os.Getenv("CONFIRM_REDIRECT_URL")
	if confirmURL == "" {
		confirmURL = "https://example.com/confirmed"
	}

	from := os.Getenv("EMAIL_FROM")
	if from == "" {
		from = "Acme <onboarding@resend.dev>"
	}

	// Create contact with unsubscribed=true
	contactParams := &resend.CreateContactRequest{
		AudienceId:   audienceID,
		Email:        body.Email,
		FirstName:    body.Name,
		Unsubscribed: true,
	}

	contact, err := client.Contacts.Create(contactParams)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	// Send confirmation email
	greeting := "Welcome!"
	if body.Name != "" {
		greeting = fmt.Sprintf("Welcome, %s!", body.Name)
	}

	html := fmt.Sprintf(`<div style="text-align: center; padding: 40px 20px; font-family: Arial, sans-serif;">
  <h1>%s</h1>
  <p>Please confirm your subscription to our newsletter.</p>
  <a href="%s" style="background-color: #18181b; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Confirm Subscription</a>
</div>`, greeting, confirmURL)

	emailParams := &resend.SendEmailRequest{
		From:    from,
		To:      []string{body.Email},
		Subject: "Confirm your subscription",
		Html:    html,
	}

	sent, err := client.Emails.Send(emailParams)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"success":    true,
		"message":    "Confirmation email sent",
		"contact_id": contact.Id,
		"email_id":   sent.Id,
	})
}

func doubleOptinWebhookHandler(w http.ResponseWriter, r *http.Request) {
	webhookSecret := os.Getenv("RESEND_WEBHOOK_SECRET")
	if webhookSecret == "" {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": "Webhook secret not configured"})
		return
	}

	payload, err := readBody(r)
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "Failed to read body"})
		return
	}

	wh, err := svix.NewWebhook(webhookSecret)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": "Invalid webhook secret"})
		return
	}

	err = wh.Verify(payload, r.Header)
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "Invalid webhook signature"})
		return
	}

	var event map[string]interface{}
	json.Unmarshal(payload, &event)

	eventType, _ := event["type"].(string)
	if eventType != "email.clicked" {
		jsonResponse(w, http.StatusOK, map[string]interface{}{
			"received": true,
			"type":     eventType,
			"message":  "Event type ignored",
		})
		return
	}

	audienceID := os.Getenv("RESEND_AUDIENCE_ID")
	data, _ := event["data"].(map[string]interface{})
	toList, _ := data["to"].([]interface{})
	if len(toList) == 0 {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "No recipient in webhook data"})
		return
	}
	recipientEmail, _ := toList[0].(string)

	// Find and update contact
	contacts, err := client.Contacts.List(audienceID)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	var contactID string
	for _, c := range contacts.Data {
		if c.Email == recipientEmail {
			contactID = c.Id
			break
		}
	}

	if contactID == "" {
		jsonResponse(w, http.StatusNotFound, map[string]string{"error": "Contact not found"})
		return
	}

	updateParams := &resend.UpdateContactRequest{
		AudienceId:   audienceID,
		Id:           contactID,
		Unsubscribed: false,
	}

	_, err = client.Contacts.Update(updateParams)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"received":   true,
		"type":       eventType,
		"confirmed":  true,
		"email":      recipientEmail,
		"contact_id": contactID,
	})
}

func readBody(r *http.Request) ([]byte, error) {
	var buf [1024 * 64]byte
	n, err := r.Body.Read(buf[:])
	if err != nil && err.Error() != "EOF" {
		return nil, err
	}
	return buf[:n], nil
}
