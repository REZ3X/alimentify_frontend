# Alimentify Frontend

Modern, responsive nutrition tracking web application built with Next.js 14 (App Router), React, and Tailwind CSS. Features AI-powered food scanning, comprehensive nutrition search, and USDA food database integration.

## 🚀 Tech Stack

- **Next.js 14** - React framework with App Router
- **React 18** - UI library with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Context API** - State management for authentication
- **MediaDevices API** - Camera access for food scanning
- **Fetch API** - HTTP client for backend communication

## 📋 Prerequisites

- Node.js 18+ and npm
- Alimentify backend running on `http://localhost:4000`

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd alimentify_frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
alimentify_frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.js             # Public landing page
│   │   ├── layout.js           # Root layout with fonts
│   │   ├── globals.css         # Global styles
│   │   ├── auth/               # Authentication pages
│   │   │   ├── login/          # Login page
│   │   │   ├── register/       # Registration page
│   │   │   ├── callback/       # OAuth callback handler
│   │   │   └── verify-email/   # Email verification page
│   │   ├── my/                 # Protected user area
│   │   │   ├── page.js         # Dashboard
│   │   │   ├── scan/           # Food scanner (camera + upload)
│   │   │   ├── nutrition/      # Nutrition search (API Ninjas)
│   │   │   └── food-wiki/      # USDA Food Database search
│   │   └── profile/            # User profile page
│   ├── contexts/
│   │   └── AuthContext.js      # Authentication context provider
│   └── lib/
│       └── api.js              # API client with all endpoints
├── public/                     # Static assets
├── .env.local                  # Environment variables (not in git)
├── package.json                # Dependencies
├── next.config.mjs             # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── README.md                   # This file
```

## 📚 Features & Pages

### 🏠 Landing Page (`/`)

- **Public** - No authentication required
- Hero section with CTA
- Feature highlights
- OAuth callback handler (processes `?token=` parameter)
- Redirects authenticated users to dashboard

### 🔐 Authentication Pages

#### Login (`/auth/login`)

- Google OAuth integration
- Redirects to backend OAuth flow
- Returns to `/my` after successful login

#### Register (`/auth/register`)

- Future: Custom registration form
- Currently redirects to OAuth

#### Email Verification (`/auth/verify-email`)

- Processes email verification token from URL
- Shows success/error message
- Redirects to dashboard after verification

### 📊 Dashboard (`/my`)

- **Protected** - Requires authentication
- User profile summary with avatar fallback
- Account stats (verification status, member since)
- Quick action cards:
  - **Scan Food** - AI-powered food analysis
  - **Nutrition Search** - Global nutrition lookup
  - **Food Wiki** - USDA database search
- Profile dropdown menu with logout

### 📸 Food Scanner (`/my/scan`)

- **Protected** - Requires authentication
- **Features:**

  - Camera capture (with device selection)
  - File upload from gallery
  - Image preview before analysis
  - Mobile camera flip (front/back)
  - Desktop camera selector dropdown
  - AI analysis via Gemini API
  - Nutritional breakdown display
  - Export/share results

- **Camera Features:**
  - Auto-detect available cameras
  - Fallback for permission errors
  - Mobile-responsive controls
  - Touch-friendly buttons

**Usage:**

1. Click "Use Camera" or "Upload Image"
2. Capture photo or select file
3. Click "Analyze Food"
4. View nutritional analysis

### 🥗 Nutrition Search (`/my/nutrition`)

- **Protected** - Requires authentication
- **Primary nutrition lookup tool** (API Ninjas)
- **Features:**
  - Natural language queries (e.g., "100g chicken breast")
  - Instant search results
  - Comprehensive nutrition facts:
    - Calories, protein, carbs, fat
    - Sodium, potassium, cholesterol
    - Fiber, sugar
    - Serving size
  - Multiple food results
  - Mobile-optimized cards
  - Premium feature indicators (free tier limitations)

**Usage:**

```
Search: "200g apple"
Search: "1 cup rice"
Search: "chicken breast 150g"
```

### 📖 Food Wiki (`/my/food-wiki`)

- **Protected** - Requires authentication
- **USDA FoodData Central integration** (US-focused)
- **Features:**
  - Comprehensive food database search
  - Pagination (20 results per page)
  - Detailed food information:
    - Official descriptions
    - Brand information
    - Ingredients lists
    - Detailed nutrient breakdown
    - Serving size conversions
  - Split-screen design (search + details)
  - Food type badges (Branded, Foundation, SR Legacy)

**Usage:**

1. Enter food name in search
2. Browse paginated results
3. Click food item for detailed view
4. View complete nutritional profile

### 👤 Profile (`/profile`)

- **Protected** - Requires authentication
- User profile management
- Account settings
- Email verification status

## 🔐 Authentication Flow

### Google OAuth Flow

1. User clicks "Login with Google" on `/auth/login`
2. Frontend calls `api.getGoogleAuthUrl()`
3. Backend returns Google OAuth URL
4. User redirects to Google authorization page
5. User grants permission
6. Google redirects to `http://localhost:4000/api/auth/google/callback?code=...`
7. Backend validates code and creates/updates user
8. Backend generates JWT token
9. Backend redirects to `http://localhost:3000/?token=JWT&user=...`
10. Landing page (`/`) processes token:

    ```javascript
    // Extract from URL params
    const token = searchParams.get("token");
    const userData = JSON.parse(searchParams.get("user"));

    // Store in localStorage via AuthContext
    login(token, userData);

    // Redirect to dashboard
    router.push("/my");
    ```

### Protected Routes

All routes under `/my/*` require authentication:

```javascript
// In each protected page:
const { user, loading } = useAuth();

useEffect(() => {
  if (!loading && !user) {
    router.push("/auth/login");
  }
}, [user, loading, router]);
```

### Token Management

- Token stored in `localStorage` as `auth_token`
- Automatically included in API requests:
  ```javascript
  headers: {
    'Authorization': `Bearer ${token}`
  }
  ```
- Removed on logout
- Persists across page refreshes

## 📡 API Client (`src/lib/api.js`)

Centralized API client with all backend endpoints:

### Authentication

```javascript
// Get Google OAuth URL
await api.getGoogleAuthUrl();

// Get current user
await api.getCurrentUser();

// Logout
await api.logout();

// Verify email
await api.verifyEmail(token);
```

### Nutrition (Gemini AI)

```javascript
// Analyze food image
await api.analyzeFoodImage(imageFile);

// Quick food check
await api.quickFoodCheck(imageFile);
```

### Nutrition Info (API Ninjas)

```javascript
// Search nutrition info
await api.searchNutrition("100g chicken breast");
```

### Food Wiki (USDA FDC)

```javascript
// Search foods
await api.searchFoods("apple", {
  pageNumber: 1,
  pageSize: 20,
  dataType: "Branded",
});

// Get food details
await api.getFoodDetails(fdcId);

// Get multiple foods
await api.getFoods([fdcId1, fdcId2]);
```

## 🎨 Styling

### Tailwind CSS

- Utility-first approach
- Responsive breakpoints: `sm`, `md`, `lg`, `xl`
- Custom color palette (green/blue gradient theme)
- Dark mode ready (not yet implemented)

### Component Patterns

**Gradient Cards:**

```jsx
<div className="bg-gradient-to-br from-green-50 to-blue-50">
  {/* Content */}
</div>
```

**Responsive Grid:**

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

**Loading States:**

```jsx
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
```

## 📱 Mobile Optimization

### Responsive Design

- **Mobile-first approach**
- Breakpoints:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

### Mobile-Specific Features

1. **Camera Controls:**

   - Flip camera button (front/back)
   - Touch-friendly large buttons
   - Full-width capture area

2. **Navigation:**

   - Hamburger menu (planned)
   - Bottom navigation (planned)
   - Swipe gestures (planned)

3. **Typography:**
   - Larger font sizes on mobile
   - Readable line heights
   - Proper spacing

## 🧪 Testing

### Manual Testing

**Test Authentication:**

1. Visit http://localhost:3000
2. Click "Get Started" or "Sign In"
3. Complete Google OAuth
4. Verify redirect to dashboard

**Test Camera Scanner:**

1. Navigate to `/my/scan`
2. Click "Use Camera"
3. Grant camera permissions
4. Capture photo
5. Analyze and view results

**Test Nutrition Search:**

1. Navigate to `/my/nutrition`
2. Search "100g apple"
3. Verify nutrition facts display
4. Test multiple searches

**Test Food Wiki:**

1. Navigate to `/my/food-wiki`
2. Search "chicken"
3. Click on result
4. View detailed information
5. Test pagination

### Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Mobile browsers (camera API support varies)

## 🚀 Production Build

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables

Update `.env.local` for production:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your production API URL
4. Deploy

### Other Platforms

- **Netlify:** Configure `next build` and `next start`
- **Railway:** Add `package.json` scripts
- **Docker:**
  ```dockerfile
  FROM node:18-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build
  CMD ["npm", "start"]
  ```

### Deployment Checklist

- [ ] Update `NEXT_PUBLIC_API_URL` to production backend
- [ ] Ensure backend CORS allows production frontend origin
- [ ] Test all authentication flows
- [ ] Verify camera permissions on mobile
- [ ] Test API endpoints with production keys
- [ ] Configure custom domain (optional)
- [ ] Set up analytics (optional)
- [ ] Enable error tracking (Sentry, etc.)

## 🛠️ Development Tips

### Hot Reload

Next.js automatically reloads on file changes. No configuration needed.

### Debug Mode

Enable verbose logging:

```javascript
// In any component
console.log("User:", user);
console.log("Loading:", loading);
```

### Clear LocalStorage

If authentication issues persist:

```javascript
// In browser console:
localStorage.clear();
location.reload();
```

### Camera Troubleshooting

**Camera not working:**

1. Check browser permissions (Settings → Privacy → Camera)
2. Close other apps using camera (Zoom, Teams, etc.)
3. Try different browser
4. Check HTTPS (camera requires secure context in production)

**Black screen:**

1. Wait for camera initialization
2. Try switching cameras
3. Check console for errors
4. Grant permissions when prompted

## 📊 Performance

### Optimization Techniques

1. **Image Optimization:**

   - Use Next.js `<Image>` component
   - Lazy loading for images
   - WebP format support

2. **Code Splitting:**

   - Automatic route-based splitting
   - Dynamic imports for heavy components

3. **Caching:**
   - API responses cached in memory
   - Static assets cached by browser

### Performance Metrics

- **FCP (First Contentful Paint):** < 1.5s
- **LCP (Largest Contentful Paint):** < 2.5s
- **TTI (Time to Interactive):** < 3.5s
- **CLS (Cumulative Layout Shift):** < 0.1

## 🐛 Troubleshooting

### Common Issues

**"Failed to fetch":**

- Check backend is running on port 4000
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS configuration in backend

**"Unauthorized" errors:**

- Token may be expired
- Clear localStorage and login again
- Check JWT_SECRET matches backend

**Camera not detected:**

- Browser doesn't support MediaDevices API
- Camera permissions denied
- Camera in use by another application
- Try HTTPS (required for camera in production)

**Styles not applying:**

- Run `npm run dev` to rebuild Tailwind
- Clear browser cache
- Check for CSS class typos

## 📄 License

MIT License - feel free to use this project as you wish.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues or questions:

- Open an issue in the repository
- Check browser console for errors
- Verify backend is running and accessible
- Review network tab for failed requests

## 🔗 Related Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MediaDevices API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
- [Backend API Documentation](../alimentify_backend/README.md)
