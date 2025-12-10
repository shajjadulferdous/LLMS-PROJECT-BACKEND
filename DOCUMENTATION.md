# LMS Platform - Complete Project Documentation

## 🎯 Project Overview

A full-stack Learning Management System with integrated banking simulation for course transactions. Built with Node.js, Express, MongoDB, React, and Tailwind CSS.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Requirements](#system-requirements)
3. [Installation Guide](#installation-guide)
4. [API Documentation](#api-documentation)
5. [Database Schema](#database-schema)
6. [Banking System](#banking-system)
7. [Course Workflow](#course-workflow)
8. [Deployment Guide](#deployment-guide)
9. [Testing Guide](#testing-guide)
10. [FAQ](#faq)

---

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   React    │  │  Tailwind  │  │   Vite     │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTP/HTTPS (REST API)
                            │
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Node.js   │  │  Express   │  │    JWT     │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                               │
│  ┌─────────────────────────────────────────────┐            │
│  │  Controllers → Services → Models → DB       │            │
│  └─────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            │
                         MongoDB
                            │
┌─────────────────────────────────────────────────────────────┐
│                        Database                              │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │Users │  │Courses│  │Bank  │  │Enroll│  │Payment│         │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18.2
- Vite 5.0
- Tailwind CSS 3.3
- React Router DOM 6.21
- Axios 1.6
- React Hot Toast

**Backend:**
- Node.js (v16+)
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- bcrypt
- Cloudinary (file uploads)

---

## 💻 System Requirements

### Development Environment
- Node.js v16.x or higher
- npm v8.x or higher
- MongoDB v5.x or higher
- Git
- Code editor (VS Code recommended)

### Production Environment
- Node.js v16.x or higher
- MongoDB Atlas or MongoDB server
- 512MB RAM minimum (2GB recommended)
- SSL certificate (for HTTPS)

---

## 📦 Installation Guide

### Complete Setup Instructions

#### 1. Clone the Repository

```powershell
git clone <repository-url>
cd project
```

#### 2. Backend Setup

```powershell
# Navigate to src directory
cd src

# Install dependencies
npm install

# Create .env file
Copy-Item .env.example .env

# Edit .env with your configuration
notepad .env
```

**Required Environment Variables:**

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/lms
CORS_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=your-access-token-secret-key-here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key-here
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

**Start Backend:**

```powershell
npm run dev
```

Backend will run on `http://localhost:8000`

#### 3. Frontend Setup

```powershell
# Navigate to frontend directory
cd ..\frontend

# Install dependencies
npm install

# Create .env file
Copy-Item .env.example .env

# Edit .env
notepad .env
```

**Frontend Environment Variables:**

```env
VITE_API_URL=http://localhost:8000/api/v1
```

**Start Frontend:**

```powershell
npm run dev
```

Frontend will run on `http://localhost:3000`

#### 4. Database Setup

**Start MongoDB:**

```powershell
# If using local MongoDB
mongod
```

**Or use MongoDB Atlas:**
- Create account at mongodb.com
- Create cluster
- Get connection string
- Update MONGODB_URI in backend .env

---

## 🔌 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /users/register
Content-Type: multipart/form-data

Body:
- username: string (required)
- email: string (required)
- fullName: string (required)
- password: string (required)
- education: string (required)
- role: string (optional, default: "student")
- profilePicture: file (optional)

Response: 201 Created
{
  "statusCode": 201,
  "data": { user object },
  "message": "Registration successful"
}
```

#### Login
```http
POST /users/login
Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "statusCode": 200,
  "data": {
    "user": { user object },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  },
  "message": "Login successful"
}
```

#### Logout
```http
POST /users/logout
Authorization: Bearer {accessToken}

Response: 200 OK
```

#### Get Current User
```http
GET /users/me
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "statusCode": 200,
  "data": { user object }
}
```

### Course Endpoints

#### Get All Courses
```http
GET /courses

Response: 200 OK
{
  "statusCode": 200,
  "data": [course array]
}
```

#### Get Course by ID
```http
GET /courses/:id

Response: 200 OK
{
  "statusCode": 200,
  "data": { course object }
}
```

#### Create Course (Instructor)
```http
POST /courses
Authorization: Bearer {accessToken}
Content-Type: application/json

Body:
{
  "title": "Course Title",
  "description": "Course description",
  "price": 99.99,
  "category": "Development",
  "thumbnail": "url"
}

Response: 201 Created
```

#### Add Material to Course
```http
POST /courses/:id/materials
Authorization: Bearer {accessToken}

Body:
{
  "title": "Lesson 1",
  "type": "video",
  "url": "video-url",
  "duration": 30
}

Response: 200 OK
```

### Bank Endpoints

#### Create Bank Account
```http
POST /bank
Authorization: Bearer {accessToken}

Body:
{
  "accountNo": "1234567890",
  "password": "1234"
}

Response: 201 Created
```

#### Get Bank Account
```http
GET /bank/me
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "statusCode": 200,
  "data": {
    "accountNo": "1234567890",
    "balance": 1000,
    "history": []
  }
}
```

#### Deposit
```http
POST /bank/deposit
Authorization: Bearer {accessToken}

Body:
{
  "amount": 500,
  "password": "1234"
}

Response: 200 OK
```

#### Withdraw
```http
POST /bank/withdraw
Authorization: Bearer {accessToken}

Body:
{
  "amount": 200,
  "password": "1234"
}

Response: 200 OK
```

### Enrollment Endpoints

#### Enroll in Course
```http
POST /enroll
Authorization: Bearer {accessToken}

Body:
{
  "courseId": "course-id",
  "password": "bank-pin"
}

Response: 201 Created
```

#### Get My Enrollments
```http
GET /enroll/my-enrollments
Authorization: Bearer {accessToken}

Response: 200 OK
```

### Admin Endpoints

#### Approve Course
```http
POST /courses/admin/:id/approve
Authorization: Bearer {accessToken}

Response: 200 OK
```

#### Block User
```http
POST /users/admin/users/:id/block
Authorization: Bearer {accessToken}

Response: 200 OK
```

---

## 🗄️ Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  fullName: String,
  password: String (hashed),
  role: String (enum: ["student", "instructor", "admin"]),
  education: String,
  profilePicture: String,
  enrollCourse: [CourseId],
  ownerCourse: [CourseId],
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Course Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  price: Number,
  thumbnail: String,
  instructor: [UserId],
  materials: [{
    title: String,
    type: String (enum: ["video", "Document", "link", "quiz"]),
    url: String,
    duration: Number
  }],
  status: String (enum: ["pending", "approved", "rejected"]),
  createdAt: Date,
  updatedAt: Date
}
```

### Bank Model
```javascript
{
  _id: ObjectId,
  user: UserId,
  accountNo: String (unique),
  password: String (hashed),
  balance: Number,
  history: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Enrollment Model
```javascript
{
  _id: ObjectId,
  user: UserId,
  course: CourseId,
  status: String (enum: ["in-progress", "completed"]),
  progress: Number,
  completedMaterials: [MaterialId],
  certificateIssued: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 💳 Banking System

### Banking Flow Diagram

```
1. Student Creates Bank Account
   ↓
2. Student Adds Funds (Deposit)
   ↓
3. Student Browses Courses
   ↓
4. Student Purchases Course
   ↓
5. Payment Deducted from Student Account
   ↓
6. LMS Receives Payment
   ↓
7. Instructor Gets Payout Notification
   ↓
8. Instructor Withdraws Earnings
```

### Transaction Types

1. **Deposit** - Add funds to account
2. **Withdrawal** - Remove funds from account
3. **Course Purchase** - Student pays for course
4. **Instructor Payout** - Instructor receives payment

### Security Features

- PIN-based authentication
- Hashed passwords (bcrypt)
- Transaction history logging
- Balance verification before transactions

---

## 📚 Course Workflow

### Course Creation Flow

```
Instructor Creates Course
   ↓
Course Status: "pending"
   ↓
Admin Reviews Course
   ↓
Admin Approves/Rejects
   ↓
If Approved → Status: "approved" → Visible to Students
If Rejected → Status: "rejected" → Not visible
```

### Enrollment Flow

```
Student Views Course
   ↓
Student Clicks "Enroll"
   ↓
Payment Modal Opens
   ↓
Student Enters Bank PIN
   ↓
Payment Processed
   ↓
Enrollment Created
   ↓
Student Can Access Course Content
```

### Progress Tracking

```
Student Opens Course Viewer
   ↓
Watches/Reads Materials
   ↓
Marks Material Complete
   ↓
Progress Updated
   ↓
All Materials Complete?
   ↓ Yes
Certificate Issued
```

---

## 🚀 Deployment Guide

### Backend Deployment (Example: Heroku)

```powershell
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create lms-backend-app

# Set environment variables
heroku config:set MONGODB_URI=<your-mongodb-uri>
heroku config:set ACCESS_TOKEN_SECRET=<secret>
heroku config:set REFRESH_TOKEN_SECRET=<secret>

# Deploy
git push heroku main

# Open app
heroku open
```

### Frontend Deployment (Example: Vercel)

```powershell
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Set environment variables in Vercel dashboard
# VITE_API_URL = your-backend-url
```

### Production Checklist

- [ ] Set strong JWT secrets
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up MongoDB backups
- [ ] Enable rate limiting
- [ ] Set up error monitoring
- [ ] Configure CDN for static assets
- [ ] Enable compression
- [ ] Set up logging

---

## 🧪 Testing Guide

### Manual Testing

**Test Student Flow:**
1. Register as student
2. Login
3. Create bank account
4. Deposit funds
5. Browse courses
6. Purchase course
7. View course content
8. Complete course
9. Download certificate

**Test Instructor Flow:**
1. Register as instructor
2. Login
3. Create course
4. Add materials
5. Wait for admin approval
6. View payouts

**Test Admin Flow:**
1. Login as admin
2. View pending courses
3. Approve/reject courses
4. Manage users
5. View system stats

### API Testing

Use the provided Postman collection or create one:

```json
{
  "info": {
    "name": "LMS API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/users/register"
          }
        }
      ]
    }
  ]
}
```

---

## ❓ FAQ

### Q: How do I reset a user's password?
A: Use the forgot password flow or update directly in database.

### Q: Can instructors also be students?
A: Yes, role-based access allows instructors to enroll in other courses.

### Q: How is course payment split?
A: Payment goes to LMS, which then pays instructor (configurable).

### Q: What file types are supported for course materials?
A: Video, documents (PDF), external links, and quizzes.

### Q: How long are JWT tokens valid?
A: Access token: 1 day, Refresh token: 10 days (configurable).

### Q: Can I customize the UI?
A: Yes, modify Tailwind config and React components.

### Q: Is there a mobile app?
A: Currently web-only, but responsive design works on mobile browsers.

---

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Email: support@lms.com
- Documentation: /docs

---

**Last Updated:** December 2024
**Version:** 1.0.0
**Status:** Production Ready (Core Features Complete)
