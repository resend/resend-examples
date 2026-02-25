<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>We received your message</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Thank you for reaching out!</h1>
    </div>

    <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="margin-top: 0;">Hi {{ $name }},</p>

        <p>We've received your message and wanted to let you know that our team will review it shortly.</p>

        <p>You can expect to hear back from us within 1-2 business days.</p>

        <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>What happens next?</strong><br>
                Our team will review your message and get back to you with a response as soon as possible.
            </p>
        </div>

        <p>In the meantime, feel free to explore our resources or reach out if you have any urgent questions.</p>

        <p style="margin-bottom: 0;">
            Best regards,<br>
            <strong>The Acme Team</strong>
        </p>
    </div>

    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
        <p style="margin: 0;">This is an automated confirmation email.</p>
        <p style="margin: 5px 0 0 0;">&copy; {{ date('Y') }} Acme Inc. All rights reserved.</p>
    </div>
</body>
</html>
