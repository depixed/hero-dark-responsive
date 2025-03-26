# Setting Up Email Verification with Supabase

This guide explains how to configure Supabase to properly send verification emails for your application.

## Prerequisites

1. A Supabase project (free tier or higher)
2. Access to the Supabase Dashboard for your project

## Configuration Steps

### 1. Enable Email Provider in Authentication Settings

1. Log in to your Supabase Dashboard
2. Navigate to your project
3. Go to **Authentication** → **Providers**
4. Make sure **Email** is enabled
5. Under "Email Provider," select **SMTP**
6. Configure your SMTP settings. You can use:
   - Free services like [SendGrid](https://sendgrid.com/) (100 emails/day free tier)
   - [Mailgun](https://www.mailgun.com/)
   - Your own SMTP server
   - For testing, you can use [Mailtrap](https://mailtrap.io/)

### 2. Configure SMTP Settings

Example SMTP configuration using Gmail (not recommended for production):
- Host: `smtp.gmail.com`
- Port: `587`
- User: `your-email@gmail.com`
- Password: Use an [App Password](https://support.google.com/accounts/answer/185833) if 2FA is enabled
- Secure: `STARTTLS`

Example with SendGrid:
- Host: `smtp.sendgrid.net`
- Port: `587`
- User: `apikey`
- Password: Your SendGrid API Key
- Secure: `STARTTLS`

### 3. Configure Email Templates

1. In the Authentication settings, navigate to **Email Templates**
2. Customize the **Magic Link** template
3. Make sure the variables like `{{ .ConfirmationURL }}` are preserved
4. Save your changes

### 4. Test the Email Flow

1. Use the app's signup form
2. Enter a real email address you can access
3. Submit the form
4. Check your email inbox (and spam folder) for the verification email

## Troubleshooting

If you're not receiving emails:

1. **Check Supabase Logs**: Go to Database → Logs to see any SMTP-related errors
2. **Verify SMTP Credentials**: Ensure your SMTP configuration is correct
3. **Check Spam Folder**: Verification emails might be marked as spam
4. **Test with Mailtrap**: For development, use Mailtrap to capture emails without sending them to real addresses
5. **Check Rate Limits**: Free SMTP providers often have rate limits

## Testing with Fake Emails

Since our application provides a fallback OTP mechanism:

1. You can use the random OTP code displayed on the screen
2. Or use the backup code "123456"

These testing options ensure you can develop without having to configure a real email service immediately.

## Production Considerations

For production environments:

1. Use a reliable transactional email service (SendGrid, Mailgun, Postmark, etc.)
2. Set up proper SPF and DKIM records for your domain to improve email deliverability
3. Monitor email delivery rates and bounce rates
4. Implement proper error handling for failed email deliveries 