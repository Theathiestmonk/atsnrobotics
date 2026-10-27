# International Phone Number Support - Setup Guide

## Overview
Your contact form now supports international phone numbers with country selection, automatic formatting, and E.164 validation. Users can select their country, and the phone number will be validated according to that country's numbering rules.

## What's Changed

### 1. Dependencies Added
- **intl-tel-input** (v24.0.0): Provides a searchable country dropdown with flags, country names, and international dialing codes
- **libphonenumber-js** (v1.10.56): Handles phone number validation and formatting according to international standards

### 2. Frontend Changes

#### TalkToUs.tsx Component
- **Country Selection**: Displays a searchable dropdown with country flags and dialing codes
- **Default Country**: India (+91) is pre-selected
- **Preferred Countries**: India, US, UK, Germany, France, Australia, and Canada appear at the top for quick access
- **Auto-Formatting**: Phone numbers are automatically formatted as users type
- **Real-time Validation**: Error messages update when the country changes
- **E.164 Format**: Valid phone numbers are automatically converted to international format (e.g., +919876543210)

#### Styling
- The intl-tel-input library is styled to match your dark theme
- Responsive design for mobile and desktop
- Accessible color contrast with your existing color scheme (#c9a962 accent color)

### 3. Backend Changes

#### API Validation (route.ts)
- **E.164 Validation**: Verifies the phone number is in E.164 format (+countrycode...)
- **Country-Specific Validation**: Uses libphonenumber-js to validate numbers according to the selected country's rules
- **Secure Processing**: All validation happens server-side; SMTP credentials are never exposed to the frontend
- **Error Handling**: Returns clear error messages if validation fails

#### Email Template
- The email now displays the international phone number with the country code
- Format: `+919876543210 (IN)` where IN is the ISO country code

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

This will install the intl-tel-input and libphonenumber-js packages added to package.json.

### 2. Environment Variables (Already Configured)
Your existing `.env.local` file already has the SMTP configuration:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_FORM_TO=services@atsnai.com
```

No additional environment variables are needed.

## How It Works

### Frontend Flow
1. User opens the contact form
2. A searchable country dropdown appears with flags
3. User selects their country (India is default)
4. User enters their phone number
5. The number is automatically formatted according to the selected country's rules
6. On submit, the number is validated:
   - Is it a valid format for the selected country?
   - Does it have the correct number of digits?
7. The valid number is converted to E.164 format (e.g., +919876543210)
8. The form is submitted with the E.164 number and country code

### Backend Flow
1. Receives the E.164 formatted phone number and country code
2. Validates the phone number:
   - Checks if it starts with `+`
   - Verifies it's a valid E.164 format
   - Confirms it matches the selected country
3. If validation fails, returns a 400 error
4. If validation succeeds:
   - Prepares the inquiry email with the international phone number
   - Sends the email via SMTP
   - Returns a success message

## Supported Countries

The form supports **ALL countries** with their international dialing codes. The intl-tel-input library includes:
- 249+ countries and territories
- Phone number validation for each country
- Local and international format support
- Automatic formatting rules

### Preferred Countries (Quick Access)
These appear at the top of the dropdown:
- 🇮🇳 India (+91)
- 🇺🇸 United States (+1)
- 🇬🇧 United Kingdom (+44)
- 🇩🇪 Germany (+49)
- 🇫🇷 France (+33)
- 🇦🇺 Australia (+61)
- 🇨🇦 Canada (+1)

Users can type to search for any other country.

## Phone Number Examples

Here are examples of valid phone numbers for different countries:

- **India**: 9876543210 → +919876543210
- **USA**: (123) 456-7890 → +11234567890
- **UK**: 20 7946 0958 → +442079460958
- **Germany**: 30 12345678 → +493012345678
- **France**: 1 42 34 56 78 → +33142345678
- **Australia**: 2 1234 5678 → +61212345678
- **Canada**: (416) 555-0123 → +14165550123

## Field Requirements

### Required Fields
- Full name *
- Email *
- Contact Number *

### Optional Fields
- Company name
- Address
- City
- State / Province
- Country

## Error Messages

The form displays clear error messages for:
- Empty phone number: "Contact number cannot be empty"
- Invalid format: "Invalid phone number for IN. Please check and try again."
- Backend validation errors: "Unable to process your request. Please try again."

## Testing

### Local Testing
1. Run your development server: `npm run dev`
2. Navigate to `/talk-to-us`
3. Try different countries:
   - India: Enter "9876543210"
   - USA: Enter "1234567890"
   - UK: Enter "2079460958"
4. Verify error messages appear for invalid numbers
5. Check that the email is received with the correct phone format

### Test Email
The email should show:
```
Contact number: +919876543210 (IN)
```

## Troubleshooting

### Issue: "Cannot find module 'libphonenumber-js'"
**Solution**: Run `npm install` to ensure dependencies are installed.

### Issue: Intl-tel-input styles not loading
**Solution**: The CSS is imported in `app/layout.tsx`. Ensure the import statement:
```typescript
import "intl-tel-input/build/css/intlTelInput.css";
```
is present and the server is restarted.

### Issue: Phone validation always fails
**Possible causes**:
- User selected the wrong country
- Phone number is missing country code (frontend should handle this)
- Phone number format doesn't match the selected country's rules
- Try with a known valid number for that country

### Issue: Email not sending
**Check**:
- SMTP credentials in `.env.local` are correct
- Gmail app-specific password (not regular password) if using Gmail
- Two-factor authentication is enabled on your email account

## Security Considerations

### Frontend
- Phone validation happens before submission
- User selection of country is displayed to user for verification

### Backend
- Phone numbers are validated server-side (not just client-side)
- SMTP credentials are stored in environment variables only
- No sensitive information is exposed to the frontend
- All validation uses well-tested libphonenumber-js library

## Customization

### Change Preferred Countries
Edit `TalkToUs.tsx` line 20:
```typescript
preferredCountries: ["in", "us", "gb", "de", "fr", "au", "ca"],
```

### Change Default Country
Edit `TalkToUs.tsx` line 19:
```typescript
initialCountry: "in",
```

### Change Styling
Edit the `<style>` tag in `TalkToUs.tsx` (lines 249-297) to customize:
- Colors
- Fonts
- Spacing
- Borders

## File Changes Summary

1. **package.json**: Added intl-tel-input and libphonenumber-js
2. **app/layout.tsx**: Imported intl-tel-input CSS
3. **app/talk-to-us/TalkToUs.tsx**: Complete rewrite with international phone support
4. **app/api/talk-to-us/route.ts**: Added backend validation for E.164 format
5. **app/order/flex/page.tsx**: Button text changed to "Let's Connect"

## Next Steps

1. Install dependencies: `npm install`
2. Restart your development server: `npm run dev`
3. Test the form at `/talk-to-us`
4. Deploy to production when ready

## Support

For issues with:
- **intl-tel-input**: https://github.com/jackocnr/intl-tel-input
- **libphonenumber-js**: https://github.com/catamphetamine/libphonenumber-js
