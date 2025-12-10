import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { adminService } from '../../services/adminService';
import { courseService } from '../../services/courseService';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalInstructors: 0,
        totalCourses: 0,
        pendingCourses: 0,
        approvedCourses: 0,
        blockedUsers: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [pendingCourses, setPendingCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch data with better error handling
            let usersResponse, coursesResponse, pendingCoursesResponse;

            try {
                usersResponse = await adminService.getAllUsers({ limit: 100 });
            } catch (err) {
                console.error('Error fetching users:', err);
                usersResponse = { data: { users: [] } };
            }

            try {
                coursesResponse = await courseService.getAllCourses({ limit: 100 });
            } catch (err) {
                console.error('Error fetching courses:', err);
                coursesResponse = { data: { courses: [] } };
            }

            try {
                pendingCoursesResponse = await adminService.getPendingCourses();
            } catch (err) {
                console.error('Error fetching pending courses:', err);
                pendingCoursesResponse = { data: [] };
            }

            console.log('Users response:', usersResponse);
            console.log('Courses response:', coursesResponse);
            console.log('Pending courses:', pendingCoursesResponse);

            // Process users data - backend returns { users: [...] }
            const users = usersResponse.data?.users || [];
            const students = users.filter(u => u.role === 'student');
            const instructors = users.filter(u => u.role === 'instructor');
            const blocked = users.filter(u => u.isBlocked);

            // Process courses data - backend returns { items: [...] }
            const courses = coursesResponse.data?.items || [];
            const approved = courses.filter(c => c.status === 'approved');

            // Process pending courses - use same source as CourseApproval page
            const pending = pendingCoursesResponse.data || [];

            setStats({
                totalUsers: users.length,
                totalStudents: students.length,
                totalInstructors: instructors.length,
                totalCourses: courses.length,
                pendingCourses: pending.length, // Now uses same data source
                approvedCourses: approved.length,
                blockedUsers: blocked.length
            });

            // Get 5 most recent users
            const sortedUsers = [...users].sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            setRecentUsers(sortedUsers.slice(0, 5));

            // Get 5 most recent pending courses
            setPendingCourses(pending.slice(0, 5));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickApprove = async (courseId) => {
        try {
            await adminService.approveCourse(courseId);
            toast.success('Course approved successfully');
            fetchDashboardData();
        } catch (error) {
            console.error('Error approving course:', error);
            toast.error('Failed to approve course');
        }
    };

    const handleQuickDeny = async (courseId) => {
        try {
            await adminService.denyCourse(courseId, 'Denied from dashboard');
            toast.success('Course denied');
            fetchDashboardData();
        } catch (error) {
            console.error('Error denying course:', error);
            toast.error('Failed to deny course');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full border-blue-600 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading dashboard...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">System overview and management</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Total Users</p>
                                <h3 className="text-3xl font-bold">{stats.totalUsers}</h3>
                                <p className="text-blue-100 text-xs mt-1">
                                    {stats.totalStudents} students, {stats.totalInstructors} instructors
                                </p>
                            </div>
                            <svg className="w-12 h-12 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Total Courses</p>
                                <h3 className="text-3xl font-bold">{stats.totalCourses}</h3>
                                <p className="text-green-100 text-xs mt-1">
                                    {stats.approvedCourses} approved
                                </p>
                            </div>
                            <svg className="w-12 h-12 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                            </svg>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm">Pending Approval</p>
                                <h3 className="text-3xl font-bold">{stats.pendingCourses}</h3>
                                <p className="text-yellow-100 text-xs mt-1">Courses awaiting review</p>
                            </div>
                            <svg className="w-12 h-12 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm">Blocked Users</p>
                                <h3 className="text-3xl font-bold">{stats.blockedUsers}</h3>
                                <p className="text-red-100 text-xs mt-1">Restricted accounts</p>
                            </div>
                            <svg className="w-12 h-12 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link to="/admin/users" className="card hover:shadow-lg transition-shadow text-center p-6 border-2 border-transparent hover:border-blue-500">
                        <svg className="w-16 h-16 mx-auto mb-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <h3 className="font-bold text-lg mb-1">User Management</h3>
                        <p className="text-gray-600 text-sm">Manage users and roles</p>
                    </Link>

                    <Link to="/admin/courses" className="card hover:shadow-lg transition-shadow text-center p-6 border-2 border-transparent hover:border-green-500">
                        <svg className="w-16 h-16 mx-auto mb-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <h3 className="font-bold text-lg mb-1">Course Approval</h3>
                        <p className="text-gray-600 text-sm">Review and approve courses</p>
                    </Link>

                    <Link to="/admin/settings" className="card hover:shadow-lg transition-shadow text-center p-6 border-2 border-transparent hover:border-purple-500">
                        <svg className="w-16 h-16 mx-auto mb-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3 className="font-bold text-lg mb-1">System Settings</h3>
                        <p className="text-gray-600 text-sm">Configure system</p>
                    </Link>
                </div>

                {/* Recent Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Users */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Recent Users</h2>
                            <Link to="/admin/users" className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                                View All →
                            </Link>
                        </div>
                        {recentUsers.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No users yet</p>
                        ) : (
                            <div className="space-y-3">
                                {recentUsers.map((user) => (
                                    <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold">
                                                    {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-semibold">{user.fullName || user.username}</p>
                                                <p className="text-sm text-gray-600">{user.email}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'instructor' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pending Courses */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Pending Courses</h2>
                            <Link to="/admin/courses" className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                                View All →
                            </Link>
                        </div>
                        {pendingCourses.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No pending courses</p>
                        ) : (
                            <div className="space-y-3">
                                {pendingCourses.map((course) => (
                                    <div key={course._id} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{course.title}</h4>
                                                <p className="text-sm text-gray-600 line-clamp-1">{course.description}</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    by {course.instructor?.map(i => i.fullName || i.username).join(', ')}
                                                </p>
                                            </div>
                                            <span className="text-lg font-bold text-blue-600 ml-2">
                                                ${course.price}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => handleQuickApprove(course._id)}
                                                className="btn btn-sm bg-green-600 hover:bg-green-700 text-white flex-1"
                                            >
                                                ✓ Approve
                                            </button>
                                            <button
                                                onClick={() => handleQuickDeny(course._id)}
                                                className="btn btn-sm bg-red-600 hover:bg-red-700 text-white flex-1"
                                            >
                                                ✗ Deny
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AdminDashboard;
