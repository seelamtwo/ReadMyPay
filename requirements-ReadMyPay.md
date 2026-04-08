# AI Finance Document Explainer — Full Production Requirements

> **Purpose:** This document is a complete technical specification for building and deploying a privacy-first AI SaaS that explains financial documents in plain English. It is structured to be fed directly into an AI app builder (Cursor, Bolt, Lovable, v0, etc.).

---

## 1. Product Overview

**Product name:** Read My Pay  
**Tagline:** "Upload your pay stub, bank statement, or tax document — get a plain-English explanation in seconds."  
**Core value prop:** Non-technical users (Gen Z, immigrants, retirees) upload confusing financial documents and receive a clear, jargon-free explanation with actionable savings nudges.  
**Privacy promise:** Zero document storage. No financial data ever persists on servers.

### Target Users
- Gen Z first-jobbers confused by pay stubs and W-2s
- Recent immigrants unfamiliar with US financial documents
- Retirees receiving Social Security statements, Medicare summaries
- Anyone receiving a financial document they don't understand

### Monetisation
| Tier | Price | Limits |
|------|-------|--------|
| Free | $0/mo | 2 documents/month |
| Personal | $9/mo | 20 documents/month |
| Family | $19/mo | 5 users, unlimited documents |

---

## 2. Privacy Architecture (Non-Negotiable)

### What is NEVER stored
- Raw document file (PDF, image, any binary)
- Extracted text content from documents
- Any financial figures, account numbers, SSNs, tax IDs
- AI-generated explanation text
- API prompt or request body content
- Any server-side logs containing document data

### What IS stored (only)
- User email address (hashed, encrypted at rest)
- Hashed password (bcrypt, cost factor 12)
- Subscription tier (free / personal / family)
- Stripe customer ID (never raw card data)
- Monthly document usage count (integer only, no content)
- Account creation timestamp
- Last login timestamp

### Processing Model
```
User browser
  → PDF.js extracts text client-side (file never leaves browser as binary)
  → Extracted text sent via HTTPS POST to edge function
  → Edge function calls AI API with store:false
  → AI response streamed directly back to browser
  → Edge function terminates (no writes, no logs)
  → Browser displays explanation
  → Session ends: all in-memory content cleared
```

### AI API Configuration
- Provider: OpenAI (primary) or Anthropic Claude (fallback)
- **Always set `store: false` in every API request body**
- Enable Zero Data Retention (ZDR) at the organisation level in OpenAI dashboard
- Never enable fine-tuning features (requires data retention)
- Disable request logging at the API gateway level

---

## 3. Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **UI components:** shadcn/ui
- **PDF processing:** PDF.js (client-side, in-browser extraction)
- **Image OCR:** Send image directly to OpenAI Vision API (no client-side OCR needed)
- **Auth UI:** NextAuth.js v5
- **Payments UI:** Stripe.js + @stripe/react-stripe-js

### Backend
- **Runtime:** Vercel Edge Functions (stateless, no persistent runtime)
- **API routes:** Next.js Route Handlers (app/api/*)
- **Auth:** NextAuth.js v5 with JWT strategy (no database sessions)
- **Database:** Supabase (PostgreSQL) — stores ONLY user/billing data (see Section 2)
- **ORM:** Prisma
- **Payments:** Stripe (subscriptions, webhooks)
- **Email:** Resend (transactional only: signup confirmation, billing receipts)

### Infrastructure
- **Hosting:** Vercel (Edge Network)
- **Database hosting:** Supabase (managed PostgreSQL)
- **File handling:** None — documents are never stored
- **CDN:** Vercel Edge Network (automatic)
- **SSL:** Automatic via Vercel
- **Environment secrets:** Vercel Environment Variables

### AI
- **Primary model:** `gpt-4o` via OpenAI API
- **Vision (images):** `gpt-4o` with vision input
- **Streaming:** Yes — use OpenAI streaming API for real-time explanation display
- **ZDR:** `store: false` on every request

---

## 4. Database Schema (Prisma)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  emailVerified     DateTime?
  hashedPassword    String?
  name              String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  subscription      Subscription?
  accounts          Account[]
  sessions          Session[]
}

model Subscription {
  id                   String   @id @default(cuid())
  userId               String   @unique
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  stripeCustomerId     String   @unique
  stripeSubscriptionId String?
  stripePriceId        String?
  tier                 Tier     @default(FREE)
  docsUsedThisMonth    Int      @default(0)
  billingPeriodStart   DateTime @default(now())
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  access_token      String? @db.Text
  refresh_token     String? @db.Text
  expires_at        Int?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

enum Tier {
  FREE
  PERSONAL
  FAMILY
}
```

---

## 5. Project File Structure

```
read-my-pay/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    ← main upload + explain screen
│   │   └── account/
│   │       └── page.tsx                ← subscription management
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── explain/
│   │   │   └── route.ts                ← CORE: stateless edge function
│   │   ├── stripe/
│   │   │   ├── checkout/
│   │   │   │   └── route.ts
│   │   │   └── webhook/
│   │   │       └── route.ts
│   │   └── usage/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── page.tsx                        ← landing page
│   └── globals.css
├── components/
│   ├── upload/
│   │   ├── UploadZone.tsx              ← drag-drop PDF/image upload
│   │   ├── PrivacyPill.tsx             ← "Never stored" indicator
│   │   └── ProcessingSteps.tsx
│   ├── explanation/
│   │   ├── ExplanationStream.tsx       ← real-time streamed output
│   │   ├── SavingsNudge.tsx
│   │   └── DownloadButton.tsx
│   ├── ui/                             ← shadcn/ui components
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── trust/
│       ├── TrustBanner.tsx
│       └── PrivacyTable.tsx
├── lib/
│   ├── auth.ts                         ← NextAuth config
│   ├── db.ts                           ← Prisma client singleton
│   ├── openai.ts                       ← OpenAI client (store:false enforced)
│   ├── stripe.ts                       ← Stripe client
│   ├── pdf-extract.ts                  ← client-side PDF.js wrapper
│   └── usage.ts                        ← usage counting logic
├── hooks/
│   ├── useExplain.ts                   ← main document explain hook
│   └── useUsage.ts
├── types/
│   └── index.ts
├── middleware.ts                        ← auth protection for dashboard routes
├── prisma/
│   └── schema.prisma
├── public/
├── .env.local                          ← local dev secrets (never commit)
├── .env.example                        ← template for all required env vars
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 6. Core API Route: `/api/explain`

This is the most critical file. It must be a stateless edge function that never writes data.

```typescript
// app/api/explain/route.ts
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import OpenAI from 'openai'

export const runtime = 'edge'  // CRITICAL: stateless edge, no persistent runtime

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are a friendly financial literacy assistant. 
Your job is to explain financial documents in plain English to people who are not financial experts.

Rules:
- Use simple, clear language. Avoid jargon.
- Break down every number and explain what it means in practical terms.
- If you see deductions, explain what each one is and why it exists.
- End with 1-3 specific, actionable savings or financial tips based on what you see.
- Never make investment recommendations.
- If you see sensitive data like SSNs or account numbers, acknowledge the document type but do NOT repeat those numbers in your explanation.
- Format your response with clear sections using markdown headings.
- Be warm and reassuring — many users feel anxious about financial documents.`

export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 2. Check usage limits
  const subscription = await prisma.subscription.findUnique({
    where: { user: { email: session.user.email } },
  })

  const limits = { FREE: 2, PERSONAL: 20, FAMILY: Infinity }
  const tier = subscription?.tier ?? 'FREE'
  const used = subscription?.docsUsedThisMonth ?? 0

  if (used >= limits[tier]) {
    return new Response('Usage limit reached', { status: 429 })
  }

  // 3. Get extracted text from request body
  // The client sends extracted text, NOT the raw file
  const { extractedText, documentType } = await req.json()

  if (!extractedText || extractedText.length < 10) {
    return new Response('No content extracted from document', { status: 400 })
  }

  if (extractedText.length > 15000) {
    return new Response('Document too large', { status: 413 })
  }

  // 4. Increment usage count BEFORE AI call (prevent abuse)
  await prisma.subscription.upsert({
    where: { user: { email: session.user.email } },
    update: { docsUsedThisMonth: { increment: 1 } },
    create: {
      user: { connect: { email: session.user.email } },
      stripeCustomerId: `pending_${Date.now()}`,
      docsUsedThisMonth: 1,
    },
  })

  // 5. Stream AI response — store: false is critical
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    store: false,          // NEVER store this request
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Please explain this ${documentType ?? 'financial document'} in plain English:\n\n${extractedText}`,
      },
    ],
    max_tokens: 1500,
    temperature: 0.3,
  })

  // 6. Return stream directly — nothing is written to any storage
  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? ''
          if (text) controller.enqueue(new TextEncoder().encode(text))
        }
        controller.close()
      },
    }),
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  )
}
```

---

## 7. Client-Side PDF Extraction

```typescript
// lib/pdf-extract.ts
// Runs entirely in the browser — file never sent to server

export async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
  // Copy pdf.worker.min.js from node_modules/pdfjs-dist/build/ to /public/

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
    fullText += pageText + '\n'
  }

  return fullText.trim()
}

export async function extractTextFromImage(file: File): Promise<string> {
  // For images, we send the base64 to OpenAI Vision directly from client
  // Still no file stored — just base64 in memory
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function detectDocumentType(filename: string, text: string): string {
  const lower = (filename + text).toLowerCase()
  if (lower.includes('w-2') || lower.includes('wage')) return 'W-2 tax form'
  if (lower.includes('1099')) return '1099 tax form'
  if (lower.includes('pay stub') || lower.includes('earnings statement')) return 'pay stub'
  if (lower.includes('bank statement') || lower.includes('account summary')) return 'bank statement'
  if (lower.includes('social security')) return 'Social Security statement'
  if (lower.includes('medicare')) return 'Medicare statement'
  if (lower.includes('mortgage')) return 'mortgage statement'
  if (lower.includes('1040')) return 'tax return'
  return 'financial document'
}
```

---

## 8. Environment Variables

### `.env.example` (commit this to repo)

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# OpenAI — ZDR must be enabled at org level in dashboard
OPENAI_API_KEY="sk-..."

# Stripe
STRIPE_SECRET_KEY="sk_live_..."         # use sk_test_ for dev
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_PERSONAL="price_..."       # $9/mo price ID
STRIPE_PRICE_FAMILY="price_..."         # $19/mo price ID
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Resend (email)
RESEND_API_KEY="re_..."
EMAIL_FROM="hello@yourdomain.com"

# App
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Never commit `.env.local` — add to `.gitignore`

---

## 9. Authentication Config

```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },  // JWT, not database sessions
  pages: {
    signIn: '/login',
    signUp: '/signup',
    error: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user?.hashedPassword) return null
        const valid = await bcrypt.compare(credentials.password, user.hashedPassword)
        return valid ? user : null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
  },
}
```

---

## 10. Stripe Integration

### Checkout session creation
```typescript
// app/api/stripe/checkout/route.ts
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

  const { priceId } = await req.json()

  // Get or create Stripe customer
  let subscription = await prisma.subscription.findUnique({
    where: { user: { email: session.user.email } },
  })

  let customerId = subscription?.stripeCustomerId
  if (!customerId || customerId.startsWith('pending_')) {
    const customer = await stripe.customers.create({ email: session.user.email })
    customerId = customer.id
    await prisma.subscription.upsert({
      where: { user: { email: session.user.email } },
      update: { stripeCustomerId: customerId },
      create: {
        user: { connect: { email: session.user.email } },
        stripeCustomerId: customerId,
      },
    })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
    allow_promotion_codes: true,
  })

  return Response.json({ url: checkoutSession.url })
}
```

### Webhook handler
```typescript
// app/api/stripe/webhook/route.ts
import Stripe from 'stripe'
import { prisma } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  const tierMap: Record<string, 'FREE' | 'PERSONAL' | 'FAMILY'> = {
    [process.env.STRIPE_PRICE_PERSONAL!]: 'PERSONAL',
    [process.env.STRIPE_PRICE_FAMILY!]: 'FAMILY',
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const priceId = sub.items.data[0].price.id
      await prisma.subscription.update({
        where: { stripeCustomerId: sub.customer as string },
        data: {
          stripeSubscriptionId: sub.id,
          stripePriceId: priceId,
          tier: tierMap[priceId] ?? 'FREE',
        },
      })
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await prisma.subscription.update({
        where: { stripeCustomerId: sub.customer as string },
        data: { tier: 'FREE', stripeSubscriptionId: null, stripePriceId: null },
      })
      break
    }
    case 'invoice.payment_failed': {
      // Optionally downgrade to free or send email via Resend
      break
    }
  }

  return new Response('OK', { status: 200 })
}
```

---

## 11. Usage Reset (Monthly Cron)

```typescript
// app/api/cron/reset-usage/route.ts
// Schedule this via Vercel Cron: runs on the 1st of each month

export const runtime = 'edge'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  await prisma.subscription.updateMany({
    data: { docsUsedThisMonth: 0, billingPeriodStart: new Date() },
  })

  return new Response('Usage reset', { status: 200 })
}
```

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/reset-usage",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

---

## 12. Key UI Components

### UploadZone.tsx (core upload screen)
```tsx
// components/upload/UploadZone.tsx
'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { extractTextFromPDF, extractTextFromImage, detectDocumentType } from '@/lib/pdf-extract'
import { useExplain } from '@/hooks/useExplain'

export function UploadZone() {
  const [status, setStatus] = useState<'idle' | 'extracting' | 'explaining'>('idle')
  const { explain, explanation, isStreaming } = useExplain()

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return

    setStatus('extracting')
    let text = ''
    const isPDF = file.type === 'application/pdf'

    if (isPDF) {
      text = await extractTextFromPDF(file)
    } else {
      // Image: send base64 to explain endpoint which uses vision
      text = await extractTextFromImage(file)
    }

    const docType = detectDocumentType(file.name, text)
    setStatus('explaining')
    await explain({ extractedText: text, documentType: docType, isImage: !isPDF })
    setStatus('idle')
  }, [explain])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <input {...getInputProps()} />
        <p className="font-medium text-gray-900">
          {status === 'extracting' ? 'Reading your document...' :
           status === 'explaining' ? 'Generating explanation...' :
           isDragActive ? 'Drop it here' : 'Upload your document'}
        </p>
        <p className="text-sm text-gray-500 mt-1">PDF, JPG, or PNG · Max 10MB</p>
        <PrivacyPill />
      </div>
      {explanation && <ExplanationDisplay text={explanation} isStreaming={isStreaming} />}
    </div>
  )
}
```

### PrivacyPill.tsx
```tsx
// components/upload/PrivacyPill.tsx
export function PrivacyPill() {
  return (
    <div className="inline-flex items-center gap-2 mt-3 bg-green-50 border border-green-200 rounded-full px-3 py-1">
      <div className="w-2 h-2 rounded-full bg-green-500" />
      <span className="text-xs text-green-700 font-medium">
        Never stored · Processed in memory only · Deleted after explanation
      </span>
    </div>
  )
}
```

### useExplain hook
```typescript
// hooks/useExplain.ts
'use client'
import { useState } from 'react'

export function useExplain() {
  const [explanation, setExplanation] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const explain = async ({
    extractedText,
    documentType,
    isImage,
  }: {
    extractedText: string
    documentType: string
    isImage: boolean
  }) => {
    setExplanation('')
    setIsStreaming(true)

    const res = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extractedText, documentType, isImage }),
    })

    if (!res.ok) {
      const msg = await res.text()
      setExplanation(`Error: ${msg}`)
      setIsStreaming(false)
      return
    }

    const reader = res.body?.getReader()
    const decoder = new TextDecoder()

    while (reader) {
      const { done, value } = await reader.read()
      if (done) break
      setExplanation((prev) => prev + decoder.decode(value))
    }

    setIsStreaming(false)
  }

  return { explain, explanation, isStreaming }
}
```

---

## 13. Middleware (Route Protection)

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: { signIn: '/login' },
})

export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*', '/api/explain', '/api/stripe/checkout'],
}
```

---

## 14. Security Headers

```javascript
// next.config.js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",  // Next.js requires unsafe-eval
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://api.openai.com https://api.stripe.com",
      "frame-src https://js.stripe.com",
    ].join('; '),
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

module.exports = nextConfig
```

---

## 15. Package Dependencies

```json
{
  "dependencies": {
    "next": "14.2.x",
    "react": "^18",
    "react-dom": "^18",
    "typescript": "^5",
    "tailwindcss": "^3",
    "@tailwindcss/typography": "^0.5",
    "next-auth": "^5.0.0-beta",
    "@auth/prisma-adapter": "^2",
    "prisma": "^5",
    "@prisma/client": "^5",
    "openai": "^4",
    "stripe": "^16",
    "@stripe/stripe-js": "^4",
    "@stripe/react-stripe-js": "^2",
    "resend": "^3",
    "bcryptjs": "^2",
    "pdfjs-dist": "^4",
    "react-dropzone": "^14",
    "react-markdown": "^9",
    "zod": "^3",
    "lucide-react": "^0.400"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/bcryptjs": "^2",
    "eslint": "^8",
    "eslint-config-next": "14.2.x"
  }
}
```

---

## 16. Deployment: Vercel

### Step-by-step

1. Push code to GitHub (private repo)
2. Connect repo to Vercel at vercel.com/new
3. Set all environment variables from `.env.example` in Vercel dashboard → Settings → Environment Variables
4. Set `NEXTAUTH_URL` to your production domain
5. Deploy — Vercel auto-detects Next.js

### Supabase setup
1. Create project at supabase.com
2. Copy `DATABASE_URL` (connection pooler URL, port 6543) to Vercel env vars
3. Run `npx prisma db push` from local machine after setting DATABASE_URL
4. Enable Row Level Security on all tables in Supabase dashboard

### Stripe setup
1. Create products and prices in Stripe dashboard
2. Copy price IDs to env vars
3. Set up webhook: Stripe dashboard → Webhooks → Add endpoint
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### OpenAI ZDR setup
1. Log into platform.openai.com
2. Go to Settings → Data Controls
3. Enable "Zero Data Retention" for your organisation
4. Confirm API requests will not be used for training

### Custom domain
1. Vercel dashboard → Settings → Domains → Add domain
2. Add DNS records at your registrar (Vercel provides exact records)
3. SSL auto-provisioned via Let's Encrypt

---

## 17. Privacy Policy — Plain Language Template

**What we collect:**
- Your email address (to log you in)
- Your subscription plan and monthly usage count (for billing)
- Payment processing is handled entirely by Stripe — we never see your card number

**What we never collect:**
- The documents you upload
- Any financial data, account numbers, or figures from your documents
- The AI-generated explanations we produce for you
- Any logs or records of your document processing sessions

**How your documents are processed:**
Your document is read directly in your web browser or sent securely over HTTPS to our processing server. The text is immediately passed to the AI, which generates your explanation. We do not write your document or its contents to any database, file system, or log. After your session ends, nothing remains.

**Third parties:**
- OpenAI processes your document text to generate the explanation. We use their Zero Data Retention API, which means OpenAI does not store or train on your data.
- Stripe processes your payments. We share only your email with Stripe.
- Vercel hosts our application infrastructure.

**Your rights:**
You can delete your account at any time from the Account page. This removes your email, usage history, and subscription record. There is no other data to delete because we never collected it.

---

## 18. Launch Checklist

### Before going live
- [ ] All env vars set in Vercel production environment
- [ ] Stripe webhook verified and receiving events
- [ ] OpenAI ZDR confirmed enabled
- [ ] `store: false` verified in every OpenAI API call
- [ ] Prisma migrations run on production database (`prisma db push`)
- [ ] Row Level Security enabled on Supabase tables
- [ ] Privacy policy page live at `/privacy`
- [ ] Terms of service page live at `/terms`
- [ ] Custom domain connected and SSL active
- [ ] Test full flow: signup → upload → explanation → subscribe → billing portal
- [ ] Test usage limits (free tier hits limit at 2 docs)
- [ ] Test monthly cron reset (manually trigger via Vercel dashboard)
- [ ] `robots.txt` and `sitemap.xml` in `/public`
- [ ] Google Search Console verified
- [ ] Error monitoring: add Sentry (free tier) — `npm install @sentry/nextjs`

### After launch
- [ ] Set up Vercel Analytics (built-in, free)
- [ ] Submit sitemap to Google Search Console
- [ ] Post on IndieHackers, r/SideProject, r/personalfinance
- [ ] Activate AppSumo listing for LTD deal

---

## 19. Supported Document Types

| Document | Key data extracted | Explanation focus |
|---|---|---|
| Pay stub | Gross pay, deductions, net pay, YTD | What each line item means, why deductions exist |
| W-2 | Wages, federal/state tax withheld, box codes | Tax filing implications, refund estimation |
| 1099 | Income type, payer, amount | Tax obligations, quarterly payment guidance |
| Bank statement | Balance, transactions, fees | Spending patterns, fee avoidance |
| Social Security statement | Estimated benefits, earnings record | Retirement planning basics |
| Mortgage statement | Principal, interest, escrow, balance | Amortisation explanation |
| Medicare summary | Benefits used, amounts billed, coverage | What was covered and why |
| Tax return (1040) | AGI, taxable income, credits, refund | What drove their tax situation |

---

*End of requirements. Feed this entire document to your AI app builder as the system context.*
