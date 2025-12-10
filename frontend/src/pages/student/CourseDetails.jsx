import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { enrollService } from '../../services/enrollService';
import { bankService } from '../../services/bankService';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import Loading from '../../components/shared/Loading';
import Modal from '../../components/shared/Modal';
import { BookOpen, Clock, Users, Award, DollarSign, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [bankAccount, setBankAccount] = useState(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchCourseDetails();
        fetchBankAccount();
    }, [id]);

    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            const response = await courseService.getCourseById(id);
            setCourse(response.data);
        } catch (error) {
            toast.error('Failed to load course details');
            navigate('/student/courses');
        } finally {
            setLoading(false);
        }
    };

    const fetchBankAccount = async () => {
        try {
            const response = await bankService.getAccount();
            setBankAccount(response.data);
        } catch (error) {
            setBankAccount(null);
        }
    };

    const handleEnroll = async () => {
        if (!bankAccount) {
            toast.error('Please set up your bank account first');
            navigate('/student/bank-setup');
            return;
        }

        if (course.price > 0) {
            setShowPaymentModal(true);
        } else {
            // Free course - enroll directly
            await processEnrollment();
        }
    };

    const processEnrollment = async () => {
        try {
            setProcessing(true);

            const enrollmentData = {
                courseId: course._id,
                bankPassword: password, // Backend expects 'bankPassword', not 'password'
            };

            const response = await enrollService.enrollCourse(course._id, enrollmentData);
            toast.success('Successfully enrolled! You now have access to all course materials.');
            setShowPaymentModal(false);

            // Refresh the course data to show enrolled status
            await fetchCourseDetails();

            // Navigate to course view so student can access materials immediately
            setTimeout(() => {
                navigate(`/course/${course._id}`);
            }, 1000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Enrollment failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <Loading fullScreen />;
    }

    if (!course) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-primary-600 to-blue-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                                <p className="text-xl text-blue-100 mb-6">{course.description}</p>

                                <div className="flex flex-wrap gap-4 mb-6">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-5 w-5" />
                                        <span>{course.duration || '8'} weeks</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <BookOpen className="h-5 w-5" />
                                        <span>{course.materials?.length || 0} lessons</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-5 w-5" />
                                        <span>{course.enrolledStudents || 0} students</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Award className="h-5 w-5" />
                                        <span>Certificate included</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="text-4xl font-bold">
                                        ${course.price?.toFixed(2)}
                                    </div>
                                    {course.price === 0 && <span className="badge-success text-lg">FREE</span>}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-6 text-gray-900">
                                <img
                                    src={course.thumbnail || 'https://via.placeholder.com/600x400'}
                                    alt={course.title}
                                    className="w-full h-64 object-cover rounded-lg mb-4"
                                />
                                <button
                                    onClick={handleEnroll}
                                    className="w-full btn-primary text-lg py-3"
                                >
                                    Enroll Now
                                </button>
                                <p className="text-sm text-gray-600 text-center mt-4">
                                    30-day money-back guarantee
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            {/* What You'll Learn */}
                            <div className="card mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">What you'll learn</h2>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <li className="flex items-start space-x-2">
                                        <span className="text-green-600 mt-1">✓</span>
                                        <span>Master the fundamentals</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="text-green-600 mt-1">✓</span>
                                        <span>Build real-world projects</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="text-green-600 mt-1">✓</span>
                                        <span>Get industry-ready skills</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="text-green-600 mt-1">✓</span>
                                        <span>Earn a certificate</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Course Description */}
                            <div className="card mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Description</h2>
                                <p className="text-gray-700 leading-relaxed">{course.description}</p>
                            </div>

                            {/* Course Materials */}
                            {course.materials && course.materials.length > 0 && (
                                <div className="card">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Content</h2>
                                    <div className="space-y-3">
                                        {course.materials.map((material, index) => (
                                            <div key={material._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <span className="font-semibold text-gray-600">{index + 1}.</span>
                                                    <BookOpen className="h-5 w-5 text-primary-600" />
                                                    <span className="font-medium">{material.title}</span>
                                                </div>
                                                <span className="text-sm text-gray-600">{material.type}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div>
                            {/* Instructor Info */}
                            <div className="card mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Instructor</h3>
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={course.instructor?.[0]?.profilePicture || 'https://via.placeholder.com/60'}
                                        alt="Instructor"
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {course.instructor?.[0]?.fullName || 'Expert Instructor'}
                                        </p>
                                        <p className="text-sm text-gray-600">Course Creator</p>
                                    </div>
                                </div>
                            </div>

                            {/* Course Features */}
                            <div className="card">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">This course includes:</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center space-x-2">
                                        <BookOpen className="h-5 w-5 text-primary-600" />
                                        <span>Lifetime access</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <Award className="h-5 w-5 text-primary-600" />
                                        <span>Certificate of completion</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <Users className="h-5 w-5 text-primary-600" />
                                        <span>Community support</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <DollarSign className="h-5 w-5 text-primary-600" />
                                        <span>30-day money-back guarantee</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Payment Modal */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title="Complete Purchase"
                size="md"
            >
                <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600">Course:</span>
                            <span className="font-semibold">{course.title}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-semibold text-2xl text-primary-600">
                                ${course.price?.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Your Balance:</span>
                            <span className="font-semibold">
                                ${bankAccount?.balance?.toFixed(2) || '0.00'}
                            </span>
                        </div>
                    </div>

                    {bankAccount && bankAccount.balance >= course.price ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter Bank PIN
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your bank PIN"
                                        className="input-field"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={processEnrollment}
                                disabled={processing || !password}
                                className="w-full btn-primary"
                            >
                                {processing ? 'Processing...' : 'Confirm Purchase'}
                            </button>
                        </>
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 font-medium">Insufficient Balance</p>
                            <p className="text-red-700 text-sm mt-2">
                                You need ${(course.price - (bankAccount?.balance || 0)).toFixed(2)} more to purchase this course.
                            </p>
                            <button
                                onClick={() => navigate('/student/bank-setup')}
                                className="mt-4 w-full btn-primary"
                            >
                                Add Funds
                            </button>
                        </div>
                    )}
                </div>
            </Modal>

            <Footer />
        </div>
    );
};

export default CourseDetails;
