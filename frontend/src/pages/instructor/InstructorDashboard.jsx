import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { courseService } from '../../services/courseService';
import { bankService } from '../../services/bankService';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import Loading from '../../components/shared/Loading';
import { BookOpen, DollarSign, Users, TrendingUp, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const InstructorDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCourses: 0,
        publishedCourses: 0,
        pendingCourses: 0,
        totalEarnings: 0,
    });
    const [courses, setCourses] = useState([]);
    const [bankAccount, setBankAccount] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch instructor courses with better error handling
            let coursesResponse;
            try {
                coursesResponse = await courseService.getAllCourses({ limit: 100 });
            } catch (err) {
                console.error('Error fetching courses:', err);
                coursesResponse = { data: [] };
            }

            console.log('Courses response:', coursesResponse);

            // Handle paginated response structure
            const allCourses = Array.isArray(coursesResponse.data)
                ? coursesResponse.data
                : (coursesResponse.data?.items || coursesResponse.data?.data || []);

            console.log('All courses:', allCourses);

            // Filter courses where current user is instructor
            const instructorCourses = allCourses.filter(course => {
                const instructorIds = course.instructor?.map(inst =>
                    typeof inst === 'string' ? inst : inst._id
                ) || [];
                return instructorIds.includes(user?._id);
            });

            console.log('Instructor courses:', instructorCourses);

            setCourses(instructorCourses.slice(0, 4));

            // Fetch bank account
            let bankData = null;
            let totalEarnings = 0;
            try {
                const bankResponse = await bankService.getAccount();
                bankData = bankResponse.data?.data || bankResponse.data;
                setBankAccount(bankData);

                // Calculate total earnings from bank history
                if (bankData?.history) {
                    totalEarnings = bankData.history.reduce((sum, entry) => {
                        if (entry.startsWith('ENROLLMENT:')) {
                            const amount = parseFloat(entry.split(':')[1]);
                            return sum + amount;
                        }
                        return sum;
                    }, 0);
                }
            } catch (error) {
                console.log('No bank account found');
                setBankAccount(null);
            }

            setStats({
                totalCourses: instructorCourses.length,
                publishedCourses: instructorCourses.filter(c => c.status === 'approved').length,
                pendingCourses: instructorCourses.filter(c => c.status === 'pending').length,
                totalEarnings: totalEarnings,
            });
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Instructor Dashboard
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage your courses and track your earnings
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Courses</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCourses}</p>
                            </div>
                            <BookOpen className="h-12 w-12 text-primary-600" />
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Published</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.publishedCourses}</p>
                            </div>
                            <TrendingUp className="h-12 w-12 text-green-600" />
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Pending Approval</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingCourses}</p>
                            </div>
                            <Users className="h-12 w-12 text-yellow-600" />
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Earnings</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">${stats.totalEarnings}</p>
                            </div>
                            <DollarSign className="h-12 w-12 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Bank Balance */}
                {bankAccount && (
                    <div className="card mb-8 bg-gradient-to-r from-primary-600 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Available Balance</p>
                                <p className="text-4xl font-bold mt-2">
                                    ${bankAccount.balance?.toFixed(2) || '0.00'}
                                </p>
                            </div>
                            <Link to="/instructor/payouts" className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
                                View Payouts
                            </Link>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Courses */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
                            <Link to="/instructor/courses" className="text-primary-600 hover:text-primary-700 font-medium">
                                View All
                            </Link>
                        </div>

                        {courses.length > 0 ? (
                            <div className="space-y-4">
                                {courses.map((course) => (
                                    <div key={course._id} className="card hover:shadow-lg transition-shadow">
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={course.thumbnail || 'https://via.placeholder.com/100'}
                                                alt={course.title}
                                                className="h-20 w-20 rounded-lg object-cover"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{course.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">${course.price}</p>
                                                <span className={`badge mt-2 ${course.status === 'approved' ? 'badge-success' :
                                                    course.status === 'pending' ? 'badge-warning' : 'badge-danger'
                                                    }`}>
                                                    {course.status}
                                                </span>
                                            </div>
                                            <Link
                                                to={`/instructor/courses/edit/${course._id}`}
                                                className="btn-primary"
                                            >
                                                Edit
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="card text-center py-12">
                                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 mb-4">You haven't created any courses yet</p>
                                <Link to="/instructor/create-course" className="btn-primary inline-flex items-center space-x-2">
                                    <Plus className="h-5 w-5" />
                                    <span>Create Course</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-4">
                            <Link to="/instructor/create-course" className="card hover:shadow-lg transition-shadow block">
                                <div className="flex items-center space-x-3">
                                    <Plus className="h-8 w-8 text-primary-600" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Create Course</p>
                                        <p className="text-sm text-gray-600">Start a new course</p>
                                    </div>
                                </div>
                            </Link>

                            <Link to="/instructor/courses" className="card hover:shadow-lg transition-shadow block">
                                <div className="flex items-center space-x-3">
                                    <BookOpen className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Manage Courses</p>
                                        <p className="text-sm text-gray-600">Edit your courses</p>
                                    </div>
                                </div>
                            </Link>

                            <Link to="/instructor/payouts" className="card hover:shadow-lg transition-shadow block">
                                <div className="flex items-center space-x-3">
                                    <DollarSign className="h-8 w-8 text-green-600" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Payouts</p>
                                        <p className="text-sm text-gray-600">View earnings</p>
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

export default InstructorDashboard;
