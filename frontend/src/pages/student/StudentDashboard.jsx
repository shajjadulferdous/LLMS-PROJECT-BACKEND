import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { courseService } from '../../services/courseService';
import { enrollService } from '../../services/enrollService';
import { bankService } from '../../services/bankService';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import Loading from '../../components/shared/Loading';
import { BookOpen, TrendingUp, Award, DollarSign, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        enrolledCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        certificates: 0,
    });
    const [recentCourses, setRecentCourses] = useState([]);
    const [bankAccount, setBankAccount] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch enrollments with better error handling
            let enrollmentsResponse;
            try {
                enrollmentsResponse = await enrollService.getMyEnrollments();
            } catch (err) {
                console.error('Error fetching enrollments:', err);
                enrollmentsResponse = { data: [] };
            }

            console.log('Enrollments response:', enrollmentsResponse);

            // Handle different response structures
            const enrollments = Array.isArray(enrollmentsResponse.data)
                ? enrollmentsResponse.data
                : (enrollmentsResponse.data?.data || []);

            console.log('Enrollments:', enrollments);

            setStats({
                enrolledCourses: enrollments.length,
                completedCourses: enrollments.filter(e => e.status === 'completed').length,
                inProgressCourses: enrollments.filter(e => e.status === 'in-progress').length,
                certificates: enrollments.filter(e => e.certificateIssued).length,
            });

            setRecentCourses(enrollments.slice(0, 4));

            // Fetch bank account
            try {
                const bankResponse = await bankService.getAccount();
                const bankData = bankResponse.data?.data || bankResponse.data;
                setBankAccount(bankData);
            } catch (error) {
                console.log('No bank account found');
                setBankAccount(null);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading fullScreen />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user?.fullName}!
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Continue your learning journey
                    </p>
                </div>

                {/* Bank Account Alert */}
                {!bankAccount && (
                    <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-yellow-800 font-medium">Set up your bank account</h3>
                                <p className="text-yellow-700 text-sm mt-1">
                                    You need to set up a bank account to purchase courses
                                </p>
                            </div>
                            <Link to="/student/bank-setup" className="btn-primary">
                                Setup Now
                            </Link>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Enrolled Courses</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.enrolledCourses}</p>
                            </div>
                            <BookOpen className="h-12 w-12 text-primary-600" />
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">In Progress</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.inProgressCourses}</p>
                            </div>
                            <TrendingUp className="h-12 w-12 text-blue-600" />
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Completed</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedCourses}</p>
                            </div>
                            <Award className="h-12 w-12 text-green-600" />
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Certificates</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.certificates}</p>
                            </div>
                            <Award className="h-12 w-12 text-yellow-600" />
                        </div>
                    </div>
                </div>

                {/* Bank Balance Card */}
                {bankAccount && (
                    <div className="card mb-8 bg-gradient-to-r from-primary-600 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Bank Balance</p>
                                <p className="text-4xl font-bold mt-2">
                                    ${bankAccount.balance?.toFixed(2) || '0.00'}
                                </p>
                                <p className="text-blue-100 text-sm mt-2">
                                    Account: {bankAccount.accountNo}
                                </p>
                            </div>
                            <DollarSign className="h-16 w-16 opacity-50" />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Courses */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">My Recent Courses</h2>
                            <Link to="/student/my-courses" className="text-primary-600 hover:text-primary-700 font-medium">
                                View All
                            </Link>
                        </div>

                        {recentCourses.length > 0 ? (
                            <div className="space-y-4">
                                {recentCourses.map((enrollment) => (
                                    <div key={enrollment._id} className="card hover:shadow-lg transition-shadow">
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={enrollment.course?.thumbnail || 'https://via.placeholder.com/100'}
                                                alt={enrollment.course?.title}
                                                className="h-20 w-20 rounded-lg object-cover"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{enrollment.course?.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Progress: {enrollment.progress || 0}%
                                                </p>
                                                <div className="mt-2 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-primary-600 h-2 rounded-full"
                                                        style={{ width: `${enrollment.progress || 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <Link
                                                to={`/student/course-viewer/${enrollment.course?._id}`}
                                                className="btn-primary"
                                            >
                                                Continue
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="card text-center py-12">
                                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet</p>
                                <Link to="/student/courses" className="btn-primary inline-flex items-center space-x-2">
                                    <Plus className="h-5 w-5" />
                                    <span>Browse Courses</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-4">
                            <Link to="/student/courses" className="card hover:shadow-lg transition-shadow block">
                                <div className="flex items-center space-x-3">
                                    <BookOpen className="h-8 w-8 text-primary-600" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Browse Courses</p>
                                        <p className="text-sm text-gray-600">Explore new courses</p>
                                    </div>
                                </div>
                            </Link>

                            <Link to="/student/my-courses" className="card hover:shadow-lg transition-shadow block">
                                <div className="flex items-center space-x-3">
                                    <TrendingUp className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="font-semibold text-gray-900">My Courses</p>
                                        <p className="text-sm text-gray-600">Continue learning</p>
                                    </div>
                                </div>
                            </Link>

                            <Link to="/student/bank-setup" className="card hover:shadow-lg transition-shadow block">
                                <div className="flex items-center space-x-3">
                                    <DollarSign className="h-8 w-8 text-green-600" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Bank Account</p>
                                        <p className="text-sm text-gray-600">Manage your balance</p>
                                    </div>
                                </div>
                            </Link>

                            <Link to="/student/profile" className="card hover:shadow-lg transition-shadow block">
                                <div className="flex items-center space-x-3">
                                    <Award className="h-8 w-8 text-yellow-600" />
                                    <div>
                                        <p className="font-semibold text-gray-900">My Profile</p>
                                        <p className="text-sm text-gray-600">View certificates</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default StudentDashboard;
