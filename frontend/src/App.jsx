import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'

// Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Student
import StudentDashboard from './pages/student/StudentDashboard'
import CourseCatalog from './pages/student/CourseCatalog'
import CourseDetails from './pages/student/CourseDetails'
import MyCourses from './pages/student/MyCourses'
import CourseViewer from './pages/student/CourseViewer'
import CourseView from './pages/student/CourseView'
import BankSetup from './pages/student/BankSetup'

// Instructor
import InstructorDashboard from './pages/instructor/InstructorDashboard'
import CreateCourse from './pages/instructor/CreateCourse'
import ManageCourses from './pages/instructor/ManageCourses'
import EditCourse from './pages/instructor/EditCourse'
import InstructorPayouts from './pages/instructor/InstructorPayouts'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import CourseApproval from './pages/admin/CourseApproval'
import SystemSettings from './pages/admin/SystemSettings'

// Profile
import Profile from './pages/Profile'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <div className="min-h-screen">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                        <Route path="/course/:id" element={<CourseView />} />

                        {/* Student Routes */}
                        <Route path="/student" element={<ProtectedRoute allowedRoles={['student', 'instructor']} />}>
                            <Route path="dashboard" element={<StudentDashboard />} />
                            <Route path="courses" element={<CourseCatalog />} />
                            <Route path="courses/:id" element={<CourseDetails />} />
                            <Route path="my-courses" element={<MyCourses />} />
                            <Route path="course-viewer/:id" element={<CourseViewer />} />
                            <Route path="bank-setup" element={<BankSetup />} />
                            <Route path="profile" element={<Profile />} />
                        </Route>

                        {/* Instructor Routes */}
                        <Route path="/instructor" element={<ProtectedRoute allowedRoles={['instructor']} />}>
                            <Route path="dashboard" element={<InstructorDashboard />} />
                            <Route path="create-course" element={<CreateCourse />} />
                            <Route path="my-courses" element={<ManageCourses />} />
                            <Route path="all-courses" element={<CourseCatalog />} />
                            <Route path="courses/:id" element={<CourseDetails />} />
                            <Route path="courses/edit/:id" element={<EditCourse />} />
                            <Route path="payouts" element={<InstructorPayouts />} />
                            <Route path="bank-setup" element={<BankSetup />} />
                            <Route path="profile" element={<Profile />} />
                        </Route>

                        {/* Admin Routes */}
                        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="users" element={<UserManagement />} />
                            <Route path="courses" element={<CourseApproval />} />
                            <Route path="settings" element={<SystemSettings />} />
                            <Route path="profile" element={<Profile />} />
                        </Route>

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            duration: 3000,
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            duration: 4000,
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
            </AuthProvider>
        </Router>
    )
}

export default App
