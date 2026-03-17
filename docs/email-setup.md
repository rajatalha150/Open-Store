# Email Configuration

Open Store sends transactional email through SMTP using Nodemailer.

## Env-Based Setup

Example:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="your-email@gmail.com"
```

Notes:
- `SMTP_SECURE=true` is usually for port `465`
- `SMTP_SECURE=false` is usually for port `587`
- `EMAIL_FROM` is the fallback sender email used by the app

## Admin-Based Setup

You can configure email in:
- `Admin > Settings > Email`

Admin email settings override env defaults.

## Common Providers

### Gmail

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

Use a Google App Password, not your regular password.

### SendGrid

```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASS="SG.xxxxx"
```

### Mailgun

```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="postmaster@your-domain.mailgun.org"
SMTP_PASS="your-mailgun-password"
```

### Amazon SES

```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-ses-user"
SMTP_PASS="your-ses-password"
```

## Test Email Flow

Use the admin page to:
- save SMTP settings
- test the SMTP connection
- send a test email

## Troubleshooting

### Mail does not send
- confirm host, port, user, and password
- confirm `SMTP_SECURE` matches the port
- check provider-specific requirements such as app passwords

### Mail lands in spam
- configure SPF, DKIM, and DMARC
- prefer a domain-based sender over a consumer mailbox
