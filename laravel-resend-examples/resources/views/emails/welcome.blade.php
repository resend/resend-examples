<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #333;">Welcome aboard, {{ $name }}!</h1>

    <p style="color: #666; line-height: 1.6;">
        We're thrilled to have you join us. Your account is all set up and ready to go.
    </p>

    <p style="color: #666; line-height: 1.6;">
        Click the button below to access your dashboard.
    </p>

    <a href="{{ $actionUrl }}"
       style="display: inline-block; background: #000; color: #fff; padding: 12px 24px;
              text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Go to Dashboard
    </a>

    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

    <p style="color: #999; font-size: 12px;">
        If you didn't create an account, you can safely ignore this email.
    </p>
</body>
</html>
