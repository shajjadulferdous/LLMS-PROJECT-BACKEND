# LMS Frontend - Learning Management System with Banking Integration

A modern, full-featured Learning Management System frontend built with React, Vite, and Tailwind CSS, featuring integrated banking simulation for seamless course transactions.

## 🚀 Features

### Student Features
- ✅ **User Authentication** - Register, Login, Forgot Password, Reset Password
- ✅ **Course Catalog** - Browse and search courses with filters
- ✅ **Course Details** - Detailed course information with enrollment
- ✅ **Course Viewer** - Interactive course content viewer with progress tracking
- ✅ **My Courses** - View enrolled courses and progress
- ✅ **Bank Account** - Create account, deposit, withdraw, transaction history
- ✅ **Course Purchase** - Secure payment flow with bank integration
- ✅ **Certificates** - Download certificates upon course completion
- ✅ **Dashboard** - Personalized student dashboard with stats

### Instructor Features
- ✅ **Instructor Dashboard** - View course stats and earnings
- 🔄 **Create Course** - Course creation form (placeholder)
- 🔄 **Manage Courses** - Edit and manage courses (placeholder)
- 🔄 **Payouts** - View earnings and withdrawal history (placeholder)
- ✅ **Bank Integration** - Receive payments from course sales

### Admin Features
- 🔄 **Admin Dashboard** - System overview (placeholder)
- 🔄 **User Management** - Manage users and instructors (placeholder)
- 🔄 **Course Approval** - Approve/deny courses (placeholder)
- 🔄 **System Settings** - Configure platform settings (placeholder)

### Core Features
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **Role-Based Access** - Student, Instructor, Admin roles
- ✅ **Protected Routes** - Secure route protection
- ✅ **Toast Notifications** - User-friendly notifications
- ✅ **Loading States** - Smooth loading experiences
- ✅ **Error Handling** - Comprehensive error handling
- ✅ **Token Refresh** - Automatic JWT token refresh

## 📁 Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── shared/
│   │   │   ├── Navbar.jsx          # Navigation component
│   │   │   ├── Footer.jsx          # Footer component
│   │   │   ├── Loading.jsx         # Loading spinner
│   │   │   └── Modal.jsx           # Modal component
│   │   └── ProtectedRoute.jsx      # Route protection
│   ├── contexts/
│   │   └── AuthContext.jsx         # Authentication context
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Register.jsx        # Registration page
│   │   │   ├── ForgotPassword.jsx  # Password recovery
│   │   │   └── ResetPassword.jsx   # Password reset
│   │   ├── student/
│   │   │   ├── StudentDashboard.jsx    # Student dashboard
│   │   │   ├── CourseCatalog.jsx       # Browse courses
│   │   │   ├── CourseDetails.jsx       # Course details
│   │   │   ├── MyCourses.jsx           # Enrolled courses
│   │   │   ├── CourseViewer.jsx        # Course player
│   │   │   └── BankSetup.jsx           # Banking management
│   │   ├── instructor/
│   │   │   ├── InstructorDashboard.jsx # Instructor dashboard
│   │   │   ├── CreateCourse.jsx        # Create course
│   │   │   ├── ManageCourses.jsx       # Manage courses
│   │   │   ├── EditCourse.jsx          # Edit course
│   │   │   └── InstructorPayouts.jsx   # Payouts
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx      # Admin dashboard
│   │   │   ├── UserManagement.jsx      # User management
│   │   │   ├── CourseApproval.jsx      # Course approval
│   │   │   └── SystemSettings.jsx      # Settings
│   │   ├── LandingPage.jsx         # Landing page
│   │   └── Profile.jsx             # User profile
│   ├── services/
│   │   ├── api.js                  # Axios instance
│   │   ├── authService.js          # Auth API calls
│   │   ├── courseService.js        # Course API calls
│   │   ├── bankService.js          # Bank API calls
│   │   ├── enrollService.js        # Enrollment API calls
│   │   └── adminService.js         # Admin API calls
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── .env.example                    # Environment variables
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running (default: http://localhost:8000)

### Step 1: Install Dependencies

```powershell
cd frontend
npm install
```

### Step 2: Environment Configuration

Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

### Step 3: Run Development Server

```powershell
npm run dev
```

The application will open at `http://localhost:3000`

### Step 4: Build for Production

```powershell
npm run build
```

The build output will be in the `dist/` directory.

### Step 5: Preview Production Build

```powershell
npm run preview
```

## 🎨 Tech Stack

- **React 18.2** - UI library
- **Vite 5.0** - Build tool
- **Tailwind CSS 3.3** - Styling
- **React Router DOM 6.21** - Routing
- **Axios 1.6** - HTTP client
- **React Hot Toast 2.4** - Notifications
- **Lucide React 0.294** - Icons

## 🔐 Authentication Flow

1. **Registration** - Users register with email, username, password, and role
2. **Login** - JWT tokens (access + refresh) are issued
3. **Token Storage** - Access token in localStorage, refresh token in httpOnly cookie
4. **Auto Refresh** - Axios interceptor automatically refreshes expired tokens
5. **Logout** - Tokens are cleared from storage

## 💳 Banking Flow

1. **Account Creation** - Users create bank account with account number and PIN
2. **Initial Deposit** - Set initial balance during account creation
3. **Deposit/Withdraw** - Manage funds with PIN verification
4. **Course Purchase** - Funds transferred from student to LMS to instructor
5. **Transaction History** - All transactions recorded and displayed

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

## 🔒 Security Features

- JWT token authentication
- Automatic token refresh
- Protected routes
- Role-based access control
- Secure password inputs
- XSS protection
- CORS configuration

## 🚦 API Integration

### Base URL Configuration
The API base URL is configured in `src/services/api.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
```

### Service Files
- **authService.js** - User authentication endpoints
- **courseService.js** - Course CRUD operations
- **bankService.js** - Banking operations
- **enrollService.js** - Course enrollment
- **adminService.js** - Admin operations

### Example API Call

```javascript
import { courseService } from '../services/courseService';

const fetchCourses = async () => {
  const response = await courseService.getAllCourses();
  console.log(response.data);
};
```

## 🎯 Component Architecture

### Shared Components
- **Navbar** - Dynamic navigation based on user role
- **Footer** - Site footer with links
- **Loading** - Loading states
- **Modal** - Reusable modal dialogs

### Context Providers
- **AuthContext** - Global authentication state

### Protected Routes
Routes are protected based on user roles:

```jsx
<Route path="/student" element={<ProtectedRoute allowedRoles={['student']} />}>
  <Route path="dashboard" element={<StudentDashboard />} />
</Route>
```

## 🎨 Styling System

### Tailwind Custom Classes

```css
.btn-primary    /* Primary button */
.btn-secondary  /* Secondary button */
.btn-danger     /* Danger button */
.input-field    /* Input field */
.card           /* Card container */
.badge          /* Badge */
.badge-success  /* Success badge */
.badge-warning  /* Warning badge */
.badge-danger   /* Danger badge */
```

### Color Scheme

```javascript
primary: {
  50: '#f0f9ff',
  600: '#0ea5e9',
  700: '#0369a1',
  // ...
}
```

## 📊 State Management

- **Local State** - useState for component state
- **Context API** - AuthContext for global auth state
- **No Redux** - Keeping it simple with Context API

## 🔄 Data Flow

```
User Action → Component → Service → API
                ↓
            Update State → Re-render
```

## 🧪 Testing Accounts

```
Student:
Email: student@test.com
Password: password

Instructor:
Email: instructor@test.com
Password: password

Admin:
Email: admin@test.com
Password: password
```

## 📝 Todo / Remaining Features

### High Priority
- [ ] Complete instructor course creation form
- [ ] Complete instructor course management
- [ ] Complete admin dashboard
- [ ] Complete admin user management
- [ ] Complete admin course approval system
- [ ] Profile page implementation

### Medium Priority
- [ ] Real-time notifications
- [ ] Course reviews and ratings
- [ ] Discussion forums
- [ ] File upload progress indicators
- [ ] Advanced search filters
- [ ] Certificate PDF generation

### Low Priority
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] Social media sharing
- [ ] Course recommendations

## 🐛 Troubleshooting

### Issue: CORS errors
**Solution:** Ensure backend CORS is configured to allow frontend origin

### Issue: Token refresh fails
**Solution:** Check if refresh token endpoint is working properly

### Issue: Images not loading
**Solution:** Check Cloudinary configuration in backend

### Issue: Build fails
**Solution:** Clear node_modules and reinstall:
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for the blazing fast build tool
- Tailwind CSS for the utility-first CSS framework
- All contributors and supporters

---

**Status:** ✅ Core features implemented | 🔄 Additional features in progress

For questions or support, please open an issue on GitHub.
