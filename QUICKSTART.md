# 🚀 Quick Start Guide - LMS Platform

Get your LMS platform up and running in 5 minutes!

## Prerequisites

- ✅ Node.js v16+ installed
- ✅ MongoDB installed or MongoDB Atlas account
- ✅ Git installed

## Step-by-Step Setup

### 1️⃣ Install Backend Dependencies

```powershell
cd c:\Users\HP\OneDrive\Dokumen\Desktop\backend\project\src
npm install
```

### 2️⃣ Configure Backend Environment

Create `.env` file in `src` directory:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/lms
CORS_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-refresh-secret-key-change-this-too
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=demo
CLOUDINARY_API_SECRET=demo
```

### 3️⃣ Start Backend Server

```powershell
npm run dev
```

✅ Backend running on `http://localhost:8000`

### 4️⃣ Install Frontend Dependencies

Open a new terminal:

```powershell
cd c:\Users\HP\OneDrive\Dokumen\Desktop\backend\project\frontend
npm install
```

### 5️⃣ Configure Frontend Environment

Create `.env` file in `frontend` directory:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 6️⃣ Start Frontend Server

```powershell
npm run dev
```

✅ Frontend running on `http://localhost:3000`

## 🎉 You're Ready!

Open your browser and navigate to: `http://localhost:3000`

## 🧪 Test Accounts

You'll need to register new accounts, but here's what roles to use:

### Student Account
```
Role: student
Email: student@test.com
Password: password123
```

### Instructor Account
```
Role: instructor  
Email: instructor@test.com
Password: password123
```

### Admin Account
```
Role: admin (set in backend or database)
Email: admin@test.com
Password: password123
```

## 📱 Quick Feature Tour

### As a Student:
1. 📝 Register → Login
2. 💳 Setup Bank Account (sidebar menu)
3. 💰 Deposit funds ($1000 recommended)
4. 📚 Browse Courses
5. 🛒 Purchase a course
6. 📖 Watch course content
7. 🎓 Complete course → Get certificate

### As an Instructor:
1. 📝 Register as instructor
2. 💼 Create a course
3. 📝 Add materials
4. ⏳ Wait for admin approval
5. 💵 View payouts

### As an Admin:
1. 👥 View all users
2. ✅ Approve/reject courses
3. 🔧 Manage system

## 🐛 Common Issues

### Issue: Cannot connect to MongoDB
```powershell
# Start MongoDB service
net start MongoDB
```

### Issue: Port already in use
```powershell
# Change PORT in backend .env to 8001
# Update VITE_API_URL in frontend .env to :8001
```

### Issue: CORS errors
- Make sure CORS_ORIGIN in backend .env matches frontend URL
- Default: `http://localhost:3000`

## 📁 Project Structure

```
project/
├── src/                    # Backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   └── app.js
│
└── frontend/               # Frontend
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── services/
    │   └── contexts/
    └── package.json
```

## 🔧 Development Commands

### Backend
```powershell
npm run dev      # Start development server
npm start        # Start production server
```

### Frontend
```powershell
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 📚 Next Steps

1. ✅ Read full [DOCUMENTATION.md](./DOCUMENTATION.md)
2. ✅ Read frontend [README.md](./frontend/README.md)
3. ✅ Customize UI colors in `tailwind.config.js`
4. ✅ Add more courses and test workflows
5. ✅ Deploy to production

## 💡 Pro Tips

- Use Chrome DevTools Network tab to debug API calls
- Check browser console for frontend errors
- Check terminal for backend errors
- Use MongoDB Compass to view database

## 🆘 Need Help?

- Check [DOCUMENTATION.md](./DOCUMENTATION.md) for detailed info
- Review API endpoints in documentation
- Check error messages in terminal
- Verify all environment variables are set

## 🎯 Learning Path

1. **Day 1:** Setup & Registration
2. **Day 2:** Banking System
3. **Day 3:** Course Creation
4. **Day 4:** Course Enrollment
5. **Day 5:** Admin Features

---

**Happy Learning! 🚀📚**

*Last Updated: December 2024*
