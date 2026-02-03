<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm your subscription</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; padding: 40px 20px;">
        <h1 style="color: #333; margin-bottom: 10px;">
            {{ $welcomeText }}
        </h1>
        <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
            Please confirm your subscription to our newsletter by clicking the button below.
        </p>
        <a href="{{ $confirmUrl }}"
           style="display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Confirm Subscription
        </a>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
            If you didn't request this subscription, you can safely ignore this email.
        </p>
    </div>
</body>
</html>
