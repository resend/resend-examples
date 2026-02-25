package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
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

	r := gin.Default()

	r.GET("/health", healthHandler)
	r.POST("/send", sendHandler)
	r.POST("/webhook", webhookHandler)
	r.POST("/double-optin/subscribe", doubleOptinSubscribeHandler)
	r.POST("/double-optin/webhook", doubleOptinWebhookHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	fmt.Printf("Gin server running on http://localhost:%s\n", port)
	r.Run(":" + port)
}

func healthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func sendHandler(c *gin.Context) {
	var body struct {
		To      string `json:"to"`
		Subject string `json:"subject"`
		Message string `json:"message"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if body.To == "" || body.Subject == "" || body.Message == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields: to, subject, message"})
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "id": sent.Id})
}

func webhookHandler(c *gin.Context) {
	svixID := c.GetHeader("svix-id")
	svixTimestamp := c.GetHeader("svix-timestamp")
	svixSignature := c.GetHeader("svix-signature")

	if svixID == "" || svixTimestamp == "" || svixSignature == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing webhook headers"})
		return
	}

	webhookSecret := os.Getenv("RESEND_WEBHOOK_SECRET")
	if webhookSecret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Webhook secret not configured"})
		return
	}

	payload, err := c.GetRawData()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	wh, err := svix.NewWebhook(webhookSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid webhook secret"})
		return
	}

	err = wh.Verify(payload, c.Request.Header)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid webhook signature"})
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

	c.JSON(http.StatusOK, gin.H{"received": true, "type": eventType})
}

func doubleOptinSubscribeHandler(c *gin.Context) {
	var body struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if body.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required field: email"})
		return
	}

	audienceID := os.Getenv("RESEND_AUDIENCE_ID")
	if audienceID == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "RESEND_AUDIENCE_ID not configured"})
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

	contactParams := &resend.CreateContactRequest{
		AudienceId:   audienceID,
		Email:        body.Email,
		FirstName:    body.Name,
		Unsubscribed: true,
	}

	contact, err := client.Contacts.Create(contactParams)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

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
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"message":    "Confirmation email sent",
		"contact_id": contact.Id,
		"email_id":   sent.Id,
	})
}

func doubleOptinWebhookHandler(c *gin.Context) {
	webhookSecret := os.Getenv("RESEND_WEBHOOK_SECRET")
	if webhookSecret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Webhook secret not configured"})
		return
	}

	payload, err := c.GetRawData()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	wh, err := svix.NewWebhook(webhookSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid webhook secret"})
		return
	}

	err = wh.Verify(payload, c.Request.Header)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid webhook signature"})
		return
	}

	var event map[string]interface{}
	json.Unmarshal(payload, &event)

	eventType, _ := event["type"].(string)
	if eventType != "email.clicked" {
		c.JSON(http.StatusOK, gin.H{
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "No recipient in webhook data"})
		return
	}
	recipientEmail, _ := toList[0].(string)

	contacts, err := client.Contacts.List(audienceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var contactID string
	for _, contact := range contacts.Data {
		if contact.Email == recipientEmail {
			contactID = contact.Id
			break
		}
	}

	if contactID == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contact not found"})
		return
	}

	updateParams := &resend.UpdateContactRequest{
		AudienceId:   audienceID,
		Id:           contactID,
		Unsubscribed: false,
	}

	_, err = client.Contacts.Update(updateParams)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"received":   true,
		"type":       eventType,
		"confirmed":  true,
		"email":      recipientEmail,
		"contact_id": contactID,
	})
}
