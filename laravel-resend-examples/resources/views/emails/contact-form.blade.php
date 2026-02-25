<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>New Contact Form Submission</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #e3f2fd; border: 1px solid #90caf9; padding: 12px; border-radius: 6px; margin-bottom: 20px;">
        <strong style="color: #1565c0;">New contact form submission</strong>
    </div>

    <h2 style="color: #333;">Message from {{ $senderName }}</h2>

    <div style="background: #f5f5f5; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #666;"><strong>From:</strong> {{ $senderName }}</p>
        <p style="margin: 8px 0 0; color: #666;"><strong>Email:</strong> {{ $senderEmail }}</p>
        <p style="margin: 8px 0 0; color: #666;"><strong>Received:</strong> {{ $submittedAt }}</p>
    </div>

    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

    <p style="color: #666; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Message:</p>
    <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">{{ $message }}</p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

    <a href="mailto:{{ $senderEmail }}?subject=Re: Your message"
       style="display: inline-block; background: #000; color: #fff; padding: 10px 20px;
              text-decoration: none; border-radius: 6px;">
        Reply to {{ $senderName }}
    </a>
</body>
</html>
