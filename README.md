# Alimentify Frontend

Modern, responsive nutrition tracking and meal management web application built with Next.js 16, React 19, and Tailwind CSS 4. Features AI-powered nutrition analysis, meal logging, health tracking, recipe discovery, and an intelligent chatbot assistant.

## 🚀 Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - Latest UI library with enhanced features
- **Tailwind CSS 4** - Modern utility-first CSS framework
- **Framer Motion** - Animation library for smooth transitions
- **Chart.js** - Data visualization for nutrition analytics
- **Context API** - Global state management for authentication
- **MediaDevices API** - Camera access for food scanning
- **Fetch API** - HTTP client for backend communication

## 📋 Prerequisites

- **Node.js 18+** and npm
- **Alimentify Backend** running on `http://localhost:4000`
- Modern browser with camera support (for food scanning)

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
NODE_ENV=development
BACKEND_URL=http://localhost:4000
API_KEY=your_api_key_here
```

> **Note:** The `API_KEY` should match one of the keys configured in the backend's `.env.local` file.

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at:

- **Local:** [http://localhost:3000](http://localhost:3000)
- **Network:** `http://0.0.0.0:3000` (accessible from other devices on your network)

## 🏗️ Project Structure

```
alimentify_frontend/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.js               # Public landing page
│   │   ├── layout.js             # Root layout with global providers
│   │   ├── globals.css           # Global Tailwind styles
│   │   ├── not-found.js          # Custom 404 page
│   │   ├── auth/                 # Authentication pages
│   │   │   ├── page.js           # Redirects /auth to /auth/login
│   │   │   ├── login/            # Login page with Google OAuth
│   │   │   ├── register/         # Registration page
│   │   │   ├── callback/         # OAuth callback handler
│   │   │   ├── verify-email/     # Email verification page
│   │   │   └── check-email/      # Email verification prompt
│   │   ├── my/                   # Protected user dashboard
│   │   │   ├── page.js           # Main dashboard with stats
│   │   │   ├── chat/             # AI chatbot sessions
│   │   │   ├── scan/             # Food scanner (camera + upload)
│   │   │   ├── nutrition/        # Nutrition search (API Ninjas)
│   │   │   ├── food-wiki/        # USDA Food Database search
│   │   │   ├── recipes/          # Recipe discovery (MealDB)
│   │   │   ├── meals/            # Meal logging and tracking
│   │   │   ├── reports/          # Analytics and reports
│   │   │   ├── progress/         # Progress tracking
│   │   │   ├── health-survey/    # Initial health profile setup
│   │   │   ├── profile-edit/     # Profile editing
│   │   │   └── notifications/    # Notification center
│   │   └── profile/              # Public profile view
│   ├── components/               # Reusable React components
│   │   ├── Navbar.js             # Navigation bar
│   │   ├── ChatBubble.js         # Floating AI chat button
│   │   ├── MealCard.js           # Meal display card
│   │   ├── MealModal.js          # Meal details modal
│   │   ├── DailyStats.js         # Daily nutrition statistics
│   │   ├── DateSelector.js       # Date picker component
│   │   ├── NutritionCharts.js    # Chart.js nutrition visualizations
│   │   ├── MarkdownRenderer.js   # Markdown content renderer
│   │   ├── Toast.js              # Toast notifications
│   │   └── MobileFeatures.js     # Mobile feature showcase
│   ├── contexts/
│   │   └── AuthContext.js        # Authentication context provider
│   └── lib/
│       ├── api.js                # Comprehensive API client
│       ├── allergyChecker.js     # Allergy detection utilities
│       └── notifications.js      # Notification helpers
├── public/                       # Static assets
│   ├── images/                   # App images
│   └── assets/                   # Additional assets
├── .env.local                    # Environment variables (not in git)
├── .env.example                  # Example environment configuration
├── package.json                  # Dependencies and scripts
├── next.config.mjs               # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.mjs            # PostCSS configuration
├── biome.json                    # Biome linter/formatter config
└── README.md                     # This file
```

## 📚 Features & Pages

### 🏠 Landing Page (`/`)

**Public** - No authentication required

- Beautiful hero section with animated CTAs
- Feature showcase with icons
- Mobile-responsive design
- OAuth callback handler (processes `?token=` parameter)
- Auto-redirects authenticated users to dashboard

### 🔐 Authentication

#### Login (`/auth/login`)

- Google OAuth integration
- Redirects to backend OAuth flow
- Automatic token handling
- Returns to `/my` after successful login
- Chat bubble hidden on auth pages

#### Register (`/auth/register`)

- Google OAuth signup
- Automatic account creation
- Email verification requirement

#### Email Verification

- Email verification required for full access
- Token-based verification via email link
- Success/error messaging

### 📊 Dashboard (`/my`)

**Protected** - Requires authentication

- Personalized welcome message
- Health profile summary
- Daily nutrition statistics with Chart.js visualizations
- Quick access cards to all features:
  - 🤖 **AI Chat** - Nutrition assistant
  - 📸 **Scan Food** - AI-powered analysis
  - 🥗 **Nutrition Info** - Quick lookup
  - 📖 **Food Wiki** - Comprehensive database
  - 🍳 **Recipe Discovery** - Meal ideas
  - 🍽️ **Meal Tracker** - Daily logging
  - 📊 **Reports** - Analytics dashboard
  - 📈 **Progress** - Track your journey
- Responsive navigation bar with profile menu

### 🤖 AI Chatbot (`/my/chat`)

**Protected** - Multi-session AI assistant powered by Gemini

- Create unlimited chat sessions
- Nutrition advice and meal planning
- Food recommendations
- Health tips and guidance
- Session management (view all, delete)
- Markdown message rendering
- Persistent chat history
- Floating chat bubble on all pages (except auth/chat/404)

### 📸 Food Scanner (`/my/scan`)

**Protected** - AI-powered food analysis

- **Dual Input Methods:**
  - Live camera capture with device selection
  - Image upload from device gallery
- **Camera Features:**
  - Auto-detect available cameras
  - Front/back camera switching (mobile)
  - Camera selector dropdown (desktop)
  - Permission handling and fallbacks
- **AI Analysis:**
  - Gemini Vision API integration
  - Comprehensive nutritional breakdown
  - Ingredient identification
  - Portion estimation
- Mobile-optimized interface

### 🥗 Nutrition Search (`/my/nutrition`)

**Protected** - Quick nutrition lookup (API Ninjas)

- Natural language food queries
- Instant results with comprehensive data:
  - Calories, macros (protein, carbs, fat)
  - Micronutrients (sodium, potassium, cholesterol)
  - Fiber and sugar content
  - Serving size information
- Multiple results per query
- Mobile-friendly cards
- Copy/export functionality

### 📖 Food Wiki (`/my/food-wiki`)

**Protected** - USDA FoodData Central database

- Comprehensive food database search
- Detailed food information:
  - Official descriptions and brands
  - Complete ingredient lists
  - Full nutrient breakdown
  - Multiple serving sizes
- Pagination support (20 results/page)
- Food type categorization (Branded, Foundation, SR Legacy)
- Split-screen interface (search + details)

### 🍳 Recipe Discovery (`/my/recipes`)

**Protected** - Recipe browsing powered by MealDB

- Search recipes by name
- Browse by category or cuisine
- Random recipe suggestions
- Detailed recipe information:
  - Ingredients with measurements
  - Step-by-step instructions
  - Recipe images
  - Cuisine and category tags
- Recipe saving and favorites

### 🍽️ Meal Tracker (`/my/meals`)

**Protected** - Daily meal logging and tracking

- Log meals by type (breakfast, lunch, dinner, snacks)
- Date-based meal viewing
- Daily nutrition summary
- Visual calorie and macro tracking
- Meal editing and deletion
- Integration with health goals
- Chart.js visualizations

### 📊 Reports & Analytics (`/my/reports`)

**Protected** - Comprehensive nutrition analytics

- Generate custom date range reports:
  - Daily summaries
  - Weekly analysis
  - Monthly trends
- Visual data representations
- Email report delivery
- Report history and management
- Export capabilities
- Progress insights

### 📈 Progress Tracking (`/my/progress`)

**Protected** - Long-term health monitoring

- Weight tracking
- Goal progress visualization
- Historical data charts
- Milestone celebrations
- Trend analysis
- Comparison tools

### 🏥 Health Survey (`/my/health-survey`)

**Protected** - Initial health profile setup

- Required for new users
- Collect health data:
  - Age, gender, height, weight
  - Activity level
  - Dietary restrictions
  - Health goals
  - Allergies
- Calculate personalized nutrition targets
- One-time setup (redirects if incomplete)

### 👤 Profile Management

#### Profile View (`/profile`)

**Protected** - View user profile

- Profile information display
- Account statistics
- Verification status

#### Profile Edit (`/my/profile-edit`)

**Protected** - Update profile information

- Edit personal details
- Update health information
- Manage dietary restrictions
- Save changes with validation

### 🔔 Notifications (`/my/notifications`)

**Protected** - Notification center

- System notifications
- Achievement alerts
- Meal reminders
- Mark as read functionality

### 🤖 Chat Bubble Component

**Global floating assistant button**

- Available on all pages except:
  - Authentication pages (`/auth/login`, `/auth/register`)
  - Chat pages (`/my/chat/*`)
  - 404 Not Found page
- Quick access to create new chat
- View all chat sessions
- Login prompt for unauthenticated users

## 🔐 Authentication Flow

### Google OAuth Flow

1. User visits `/auth/login` (or just `/auth` - auto-redirects)
2. Clicks "Login with Google"
3. Frontend calls `api.getGoogleAuthUrl()`
4. Backend returns Google OAuth authorization URL
5. User redirects to Google's consent screen
6. User grants permissions
7. Google redirects to backend callback: `http://localhost:4000/api/auth/google/callback?code=...`
8. Backend:
   - Validates authorization code
   - Fetches user info from Google
   - Creates/updates user in MongoDB
   - Generates JWT token
   - Redirects to frontend with token: `http://localhost:3000/?token=JWT_TOKEN`
9. Frontend landing page processes OAuth callback:
   ```javascript
   const token = searchParams.get("token");
   if (token) {
     api.setToken(token);
     const userData = await api.getCurrentUser();
     login(token, userData);
     router.push("/my");
   }
   ```
10. User redirected to dashboard

### Protected Routes

**All routes under `/my/*` require authentication:**

```javascript
const { user, loading } = useAuth();

useEffect(() => {
  if (!loading && !user) {
    router.push("/auth/login");
  }
}, [user, loading, router]);
```

**Health Survey Requirement:**

- New users redirected to `/my/health-survey` on first login
- Must complete health profile before accessing other features
- Health profile includes goals, restrictions, allergies, etc.

### Token Management

- **Storage:** Token stored in `localStorage` as `auth_token`
- **Transmission:** Automatically included in all API requests:
  ```javascript
  headers: {
    'Authorization': `Bearer ${token}`
  }
  ```
- **Persistence:** Survives page refreshes
- **Cleanup:** Removed on logout
- **Validation:** Backend validates JWT signature and expiration

### Authentication Context

Global auth state managed via React Context (`AuthContext.js`):

```javascript
const { user, loading, login, logout } = useAuth();

// user: Current user object or null
// loading: Boolean indicating auth state loading
// login(token, userData): Store auth data
// logout(): Clear auth data and redirect
```

## 📡 API Client (`src/lib/api.js`)

Centralized API client with comprehensive backend integration:

### Authentication

```javascript
// Get Google OAuth URL
await api.getGoogleAuthUrl();

// Get current authenticated user
await api.getCurrentUser();

// Logout and clear session
await api.logout();

// Verify email with token
await api.verifyEmail(token);
```

### Food Analysis (Gemini AI)

```javascript
// Analyze food image with AI
await api.analyzeFoodImage(imageFile);

// Analyze food from text description
await api.analyzeFoodText("grilled chicken with rice");

// Quick food check (faster, less detailed)
await api.quickFoodCheck(imageFile);
```

### Nutrition Info (API Ninjas)

```javascript
// Search nutrition information
await api.searchNutrition("100g chicken breast");
await api.getNutritionInfo("apple 200g");
```

### Food Wiki (USDA FDC)

```javascript
// Search food database
await api.searchFoods("apple", {
  pageNumber: 1,
  pageSize: 20,
  dataType: "Branded", // or "Foundation", "SR Legacy"
});

// Get detailed food information
await api.getFoodDetails(fdcId);

// Get multiple foods at once
await api.getFoods([fdcId1, fdcId2, fdcId3]);
```

### Recipes (MealDB)

```javascript
// Search recipes
await api.searchRecipes("pasta");

// Get recipe by ID
await api.getRecipeById(mealId);

// Get random recipes
await api.getRandomRecipes(6);

// Filter by category
await api.filterRecipesByCategory("Seafood");

// Filter by area/cuisine
await api.filterRecipesByArea("Italian");
```

### Health Profile

```javascript
// Create health profile (first-time setup)
await api.createHealthProfile({
  age: 25,
  gender: "male",
  weight: 70,
  height: 175,
  activityLevel: "moderate",
  dietaryRestrictions: ["vegetarian"],
  allergies: ["peanuts"],
  healthGoals: ["weight_loss", "muscle_gain"],
});

// Get current health profile
await api.getHealthProfile();
```

### Meal Tracking

```javascript
// Log a meal
await api.logMeal({
  meal_type: "lunch",
  food_items: ["chicken", "rice"],
  calories: 450,
  protein: 30,
  carbs: 50,
  fat: 12,
  meal_time: "2025-12-14T12:30:00Z",
});

// Get meals for specific date
await api.getDailyMeals("2025-12-14");

// Update existing meal
await api.updateMeal(mealId, { calories: 500 });

// Delete meal
await api.deleteMeal(mealId);

// Get period statistics
await api.getPeriodStats("2025-12-01", "2025-12-14");
```

### Reports & Analytics

```javascript
// Generate nutrition report
await api.generateReport(
  "weekly", // type: daily, weekly, monthly
  "2025-12-01", // start date
  "2025-12-07", // end date
  true // send via email
);

// Get user's report history
await api.getUserReports(50);

// Get specific report
await api.getReportById(reportId);

// Delete report
await api.deleteReport(reportId);
```

### AI Chatbot

```javascript
// Create new chat session
await api.createChatSession("How many calories should I eat?");

// Get all chat sessions
await api.getChatSessions();

// Get specific session with messages
await api.getChatSession(sessionId);

// Send message in session
await api.sendChatMessage(sessionId, "What about protein?");

// Send message with image
await api.sendChatMessage(
  sessionId,
  "What food is this?",
  base64ImageData,
  "image/jpeg"
);

// Get messages from session
await api.getChatMessages(sessionId);

// Delete chat session
await api.deleteChatSession(sessionId);
```

### Generic API Methods

```javascript
// Generic GET request
await api.get("/custom/endpoint");

// Generic POST request
await api.post("/custom/endpoint", { data: "value" });

// Generic PUT request
await api.put("/custom/endpoint", { data: "updated" });

// Generic DELETE request
await api.delete("/custom/endpoint");
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

This creates an optimized production build in the `.next` folder.

### Start Production Server

```bash
npm start
```

### Environment Variables

Update `.env.local` for production:

```env
NODE_ENV=production
BACKEND_URL=https://api.yourdomain.com
API_KEY=your_production_api_key
```

## 🌐 Deployment

### Vercel (Recommended for Next.js)

1. Push code to GitHub/GitLab
2. Import project in Vercel
3. Configure environment variables:
   - `NODE_ENV`: `production`
   - `BACKEND_URL`: Your production backend URL
   - `API_KEY`: Your production API key
4. Deploy automatically on push

**Vercel Configuration:**

- Automatically detects Next.js
- Zero-config deployment
- Automatic HTTPS
- Edge network CDN
- Preview deployments for PRs

### Other Platforms

#### Netlify

```bash
npm run build
# Deploy .next folder
# Configure redirects for Next.js routes
```

#### Railway

```bash
# Automatically uses package.json scripts
# Detects Next.js and builds appropriately
```

#### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app files
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t alimentify-frontend .
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e BACKEND_URL=https://api.yourdomain.com \
  -e API_KEY=your_key \
  alimentify-frontend
```

### Deployment Checklist

**Backend Configuration:**

- [ ] Update `BACKEND_URL` to production backend URL
- [ ] Ensure backend CORS allows production frontend origin
- [ ] Backend `DEV_FRONTEND_ORIGIN` / `PRODUCTION_FRONTEND_ORIGIN` configured
- [ ] API key matches between frontend and backend
- [ ] Backend HOST and PORT configured correctly

**Frontend Configuration:**

- [ ] Environment variables set in hosting platform
- [ ] Test build locally before deploying: `npm run build && npm start`
- [ ] Verify all assets load correctly
- [ ] Check for console errors

**Feature Testing:**

- [ ] Test Google OAuth flow end-to-end
- [ ] Verify email verification works
- [ ] Test camera permissions on mobile devices
- [ ] Verify all API endpoints function correctly
- [ ] Test file upload functionality
- [ ] Check responsive design on multiple devices
- [ ] Test chat sessions and AI responses

**Optional Enhancements:**

- [ ] Configure custom domain with SSL
- [ ] Set up analytics (Google Analytics, Plausible, etc.)
- [ ] Enable error tracking (Sentry, LogRocket)
- [ ] Set up monitoring and uptime checks
- [ ] Configure CDN for static assets
- [ ] Enable compression and caching headers

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

#### Connection Issues

**"Failed to fetch" / Network Errors:**

- Verify backend is running: `http://localhost:4000`
- Check `BACKEND_URL` in `.env.local` matches backend address
- Ensure backend CORS is configured to allow frontend origin
- Check browser console for CORS errors
- Verify firewall isn't blocking the connection

**"Unauthorized" / 401 Errors:**

- Token may have expired (default: 24 hours)
- Clear localStorage: Open DevTools → Application → Local Storage → Clear
- Log out and log in again
- Verify `JWT_SECRET` matches between frontend and backend
- Check `API_KEY` is correctly configured

#### Authentication Issues

**OAuth redirect loop:**

- Clear browser cookies and localStorage
- Check `GOOGLE_REDIRECT_URI` in backend `.env.local`
- Verify Google OAuth credentials are valid
- Check backend logs for OAuth errors

**Email verification not working:**

- Check Brevo SMTP configuration in backend
- Verify email was sent (check spam folder)
- Check token hasn't expired
- Review backend logs for email service errors

**Stuck on health survey redirect:**

- Complete the health survey form
- Check backend for profile creation errors
- Verify `has_completed_health_survey` flag in database

#### Feature-Specific Issues

**Camera not working:**

- Browser doesn't support MediaDevices API (update browser)
- Camera permissions denied (check browser settings)
- Camera already in use (close other apps like Zoom, Teams)
- HTTPS required in production (camera API restriction)
- Try different camera if multiple are available

**Chat not responding:**

- Check Gemini API key in backend `.env.local`
- Verify API quota hasn't been exceeded
- Check backend logs for Gemini service errors
- Ensure session was created successfully

**Food analysis failing:**

- Check image file size (backend may have limits)
- Verify image format is supported (JPEG, PNG)
- Check Gemini API key and quota
- Review backend logs for analysis errors

**Recipes not loading:**

- MealDB API may be temporarily unavailable
- Check internet connection
- Verify backend can reach external APIs
- Check backend logs for MealDB service errors

#### UI/Styling Issues

**Styles not applying:**

- Clear Next.js cache: Delete `.next` folder and rebuild
- Run `npm run dev` to rebuild with Tailwind
- Clear browser cache (Ctrl+Shift+Delete)
- Check for Tailwind class name typos
- Verify `tailwind.config.js` is correct

**Charts not rendering:**

- Check Chart.js is installed: `npm list chart.js`
- Verify data is being fetched correctly
- Check browser console for Chart.js errors
- Ensure canvas element exists in DOM

**Animations laggy:**

- Disable browser extensions
- Check device performance
- Reduce Framer Motion animations
- Use Chrome DevTools Performance tab to profile

#### Development Issues

**Hot reload not working:**

- Restart development server
- Check for syntax errors in code
- Verify file is saved correctly
- Try different port: `npm run dev -- --port 3001`

**Build failures:**

- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors (if applicable)
- Review build error messages carefully

**Module not found errors:**

- Run `npm install` to ensure all dependencies installed
- Check import paths are correct (case-sensitive)
- Verify file extensions are included where needed
- Check `jsconfig.json` path aliases

### Debug Tips

**Enable verbose logging:**

```javascript
// Add to any component
console.log("User:", user);
console.log("Loading:", loading);
console.log("API Response:", response);
```

**Check localStorage:**

```javascript
// In browser console
console.log(localStorage.getItem("auth_token"));
console.log(localStorage.getItem("auth_user"));
```

**Clear all stored data:**

```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

**Inspect API calls:**

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by XHR/Fetch
4. Click on request to see headers, payload, response

**Check React Context:**

```javascript
// Add to component
const authContext = useAuth();
console.log("Auth Context:", authContext);
```

## 🧪 Testing

### Manual Testing Checklist

**Authentication Flow:**

- [ ] Landing page loads correctly
- [ ] Google OAuth login works
- [ ] Token is stored in localStorage
- [ ] Redirect to dashboard after login
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Logout clears token and redirects
- [ ] Email verification flow works

**Health Survey:**

- [ ] New users redirected to health survey
- [ ] Form validation works correctly
- [ ] Profile is created successfully
- [ ] Redirect to dashboard after completion
- [ ] Cannot skip survey without completing

**Food Scanning:**

- [ ] Camera permissions requested
- [ ] Camera feed displays correctly
- [ ] Can switch between cameras
- [ ] Image upload works
- [ ] AI analysis returns results
- [ ] Results display correctly

**Meal Tracking:**

- [ ] Can log new meals
- [ ] Date selector works
- [ ] Daily stats calculate correctly
- [ ] Can edit existing meals
- [ ] Can delete meals
- [ ] Charts render properly

**Chat Assistant:**

- [ ] Can create new chat sessions
- [ ] Messages send and receive
- [ ] Can upload images to chat
- [ ] Markdown renders correctly
- [ ] Can view all sessions
- [ ] Can delete sessions
- [ ] Chat bubble shows/hides appropriately

**Responsive Design:**

- [ ] Mobile layout works correctly
- [ ] Tablet layout adapts properly
- [ ] Desktop layout displays well
- [ ] Touch interactions work on mobile
- [ ] Navigation menu accessible

### Browser Compatibility

- ✅ **Chrome 90+** - Full support
- ✅ **Firefox 88+** - Full support
- ✅ **Safari 14+** - Full support
- ✅ **Edge 90+** - Full support
- ⚠️ **Mobile browsers** - Camera API support varies by browser and OS

### Performance Metrics

**Target Metrics:**

- **FCP (First Contentful Paint):** < 1.5s
- **LCP (Largest Contentful Paint):** < 2.5s
- **TTI (Time to Interactive):** < 3.5s
- **CLS (Cumulative Layout Shift):** < 0.1
- **FID (First Input Delay):** < 100ms

**Optimize with:**

- Next.js automatic code splitting
- Image optimization with Next.js Image component
- Lazy loading for heavy components
- Efficient React re-renders

## 📊 Available Scripts

```bash
# Start development server on 0.0.0.0:3000
npm run dev

# Build production-optimized version
npm run build

# Start production server
npm start

# Lint code with Biome
npm run lint

# Format code with Biome
npm run format
```

## 🔧 Configuration Files

- **`next.config.mjs`** - Next.js configuration
- **`tailwind.config.js`** - Tailwind CSS customization
- **`postcss.config.mjs`** - PostCSS plugins
- **`biome.json`** - Biome linter/formatter settings
- **`jsconfig.json`** - JavaScript path aliases and settings
- **`.env.local`** - Environment variables (not committed)
- **`.env.example`** - Example environment configuration

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow existing code style
   - Use Biome for formatting: `npm run format`
   - Test your changes thoroughly
4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Include screenshots for UI changes

### Code Style Guidelines

- Use functional React components with hooks
- Follow React best practices
- Use Tailwind CSS utility classes
- Keep components small and focused
- Add comments for complex logic
- Use meaningful variable and function names

## 📞 Support

**For issues or questions:**

- 🐛 **Bugs:** Open an issue on GitHub
- 💬 **Questions:** Check existing issues or open a discussion
- 📧 **Contact:** Reach out to the development team
- 📖 **Documentation:** Review this README and backend docs

**Debugging Resources:**

- Check browser console (F12) for errors
- Review Network tab for failed API requests
- Examine localStorage for auth token issues
- Check backend logs for API errors
- Use React DevTools for component inspection

## 🔗 Related Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs) - Framework docs
- [React Documentation](https://react.dev) - React library
- [Tailwind CSS](https://tailwindcss.com/docs) - CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Chart.js](https://www.chartjs.org/docs/) - Charting library

### APIs & Services

- [MediaDevices API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices) - Camera access
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2) - Authentication
- [Gemini AI API](https://ai.google.dev/docs) - AI analysis
- [USDA FoodData Central](https://fdc.nal.usda.gov/) - Food database
- [TheMealDB API](https://www.themealdb.com/api.php) - Recipe database

### Related Projects

- [Backend API Documentation](../alimentify_backend/README.md) - Rust backend
- [Project Documentation](../reference/) - Additional docs

## 🎯 Roadmap

**Planned Features:**

- [ ] Progressive Web App (PWA) support
- [ ] Offline mode with local storage
- [ ] Advanced analytics dashboard
- [ ] Social features (share meals, follow users)
- [ ] Barcode scanner integration
- [ ] Apple Health / Google Fit integration
- [ ] Dark mode theme
- [ ] Multiple language support (i18n)
- [ ] Custom meal templates
- [ ] Recipe meal planner

## 📈 Version History

**v0.1.0** - Current Version

- Next.js 16 with React 19
- Tailwind CSS 4
- Full feature implementation
- Production-ready build

---

**Built with ❤️ using Next.js, React, and Tailwind CSS**
