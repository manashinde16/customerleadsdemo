# Customer Leads Demo - Nitro Form Embed Integration

A React + TypeScript customer website that demonstrates embedding Nitro forms using the Nitro Form Embed Widget.

## 🎯 Overview

This project is a **customer-facing demo site** that:
- Loads and displays Nitro-hosted forms dynamically
- Submits form data to Nitro's API
- Demonstrates the end-to-end form embed flow

## 🏗️ Architecture

```
Customer Site (This Project)
    ↓
Embed Widget (embed.js)
    ↓
Nitro API (Form Schema + Submissions)
```

## 🚀 Features

- ✅ Dynamic form loading from Nitro
- ✅ Domain allowlist validation
- ✅ Form field rendering (text, email, number, textarea)
- ✅ Form submission with proper payload format
- ✅ Success/error handling
- ✅ Responsive UI

## 📦 Tech Stack

- **React 19** + **TypeScript**
- **Vite** (build tool)
- **React Router** (routing)
- **Axios** (HTTP client)

## 🛠️ Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔧 Configuration

Update the Nitro API base URL in `src/config/env.ts`:

```typescript
export const NITRO_BASE_URL = 'http://localhost:8000'; // Change to your Nitro instance
```

## 📝 Usage

### Embedding a Form

1. Get your form ID from Nitro
2. Update the `formId` in `src/pages/Home.tsx`:

```tsx
const formId = 'your_form_id_here';
```

3. The form will automatically load and render

### Embed Code

The embed code format is:

```html
<div data-nitro-form="FORM_ID"></div>
<script src="/embed.js"></script>
```

## 📁 Project Structure

```
src/
├── pages/
│   └── Home.tsx              # Main page with form embed
├── components/
│   └── NitroFormEmbed.tsx     # React component for loading embed script
├── services/
│   └── nitroApi.ts            # Nitro API client
├── config/
│   └── env.ts                 # Environment configuration
└── App.tsx                     # Main app component

public/
└── embed.js                    # Embed widget script (loads forms dynamically)
```

## 🔌 API Integration

### Form Schema Endpoint

```
GET /api/forms/:formId
```

Returns form schema with fields, status, and allowed domains.

### Submission Endpoint

```
POST /api/forms/:formId/submit
```

Payload format:
```json
{
  "Name": "John Doe",
  "Email": "john@example.com",
  "data": {
    "Name": "John Doe",
    "Email": "john@example.com"
  },
  "originDomain": "localhost:5173"
}
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically

## 🔒 Security

- Domain allowlist validation (enforced by Nitro)
- CORS headers handled by Nitro
- No sensitive data stored client-side

## 📚 Related Documentation

- [Nitro Form Platform Blueprint](./nitro_form_platform_poc_master_blueprint.md)
- Nitro API Documentation

## 🐛 Troubleshooting

### Form not loading?

- Check browser console for errors
- Verify form ID is correct
- Ensure form is published in Nitro
- Check domain allowlist in Nitro

### Submission failing?

- Check Network tab for API errors
- Verify payload format matches Nitro's expectations
- Ensure form fields match schema

## 📄 License

MIT

## 👥 Contributors

- Built as part of Nitro Form Platform POC

---

**Note:** This is a demo project for showcasing Nitro form embedding capabilities.
