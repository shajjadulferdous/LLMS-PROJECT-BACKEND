import { useState, useEffect } from 'react';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { adminService } from '../../services/adminService';
import { courseService } from '../../services/courseService';
import toast from 'react-hot-toast';

const CourseApproval = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // pending, approved, denied, all
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            // Pass showAll=true to get all courses including pending ones
            const response = await courseService.getAllCourses({ limit: 1000, showAll: 'true' });
            console.log('Courses response:', response);

            // Backend returns { items: [...], total, page, pages }
            const coursesData = response.data?.items || [];

            setCourses(coursesData);
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveCourse = async (courseId) => {
        try {
            const response = await adminService.approveCourse(courseId);
            toast.success('Course approved successfully');

            // Update local state immediately - remove approve button
            setCourses(prevCourses =>
                prevCourses.map(course =>
                    course._id === courseId
                        ? { ...course, status: 'approved' }
                        : course
                )
            );
        } catch (error) {
            console.error('Error approving course:', error);
            toast.error(error.response?.data?.message || 'Failed to approve course');
        }
    };

    const handleDenyCourse = async (courseId, reason = 'Does not meet quality standards') => {
        try {
            await adminService.denyCourse(courseId, reason);
            toast.success('Course denied');
            fetchCourses();
            setShowModal(false);
        } catch (error) {
            console.error('Error denying course:', error);
            toast.error(error.response?.data?.message || 'Failed to deny course');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            return;
        }

        try {
            await adminService.deleteCourse(courseId);
            toast.success('Course deleted successfully');
            fetchCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
            toast.error(error.response?.data?.message || 'Failed to delete course');
        }
    };

    const filteredCourses = courses.filter(course => {
        if (filter === 'all') return true;
        return course.status === filter;
    });

    const openDenyModal = (course) => {
        setSelectedCourse(course);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full border-blue-600 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading courses...</p>
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
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Course Approval</h1>
                    <p className="text-gray-600">Review and manage course submissions</p>
                </div>

                {/* Filter Tabs */}
                <div className="card mb-6">
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'pending'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Pending ({courses.filter(c => c.status === 'pending').length})
                        </button>
                        <button
                            onClick={() => setFilter('approved')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'approved'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Approved ({courses.filter(c => c.status === 'approved').length})
                        </button>
                        <button
                            onClick={() => setFilter('denied')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'denied'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Denied ({courses.filter(c => c.status === 'denied').length})
                        </button>
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            All ({courses.length})
                        </button>
                    </div>
                </div>

                {/* Courses Grid */}
                {filteredCourses.length === 0 ? (
                    <div className="card text-center py-12">
                        <p className="text-gray-500">No courses found</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredCourses.map((course) => (
                            <div key={course._id} className="card">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${course.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        course.status === 'denied' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {course.status}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteCourse(course._id)}
                                        className="text-red-600 hover:text-red-800"
                                        title="Delete Course"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                                <p className="text-gray-600 mb-3 line-clamp-2">{course.description}</p>

                                <div className="mb-3 text-sm text-gray-600">
                                    <p>👨‍🏫 {course.instructor?.map(i => i.fullName || i.username).join(', ') || 'Unknown'}</p>
                                    <p>💰 ${course.price}</p>
                                    {course.materials && course.materials.length > 0 && (
                                        <p>📚 {course.materials.length} materials</p>
                                    )}
                                </div>

                                {course.status === 'pending' && (
                                    <div className="flex gap-2 pt-3 border-t">
                                        <button
                                            onClick={() => handleApproveCourse(course._id)}
                                            className="btn bg-green-600 hover:bg-green-700 text-white flex-1"
                                        >
                                            ✓ Approve
                                        </button>
                                        <button
                                            onClick={() => openDenyModal(course)}
                                            className="btn bg-red-600 hover:bg-red-700 text-white flex-1"
                                        >
                                            ✗ Deny
                                        </button>
                                    </div>
                                )}

                                {course.status === 'denied' && (
                                    <button
                                        onClick={() => handleApproveCourse(course._id)}
                                        className="btn bg-green-600 hover:bg-green-700 text-white w-full"
                                    >
                                        Reconsider & Approve
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Deny Modal */}
                {showModal && selectedCourse && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold mb-4">Deny Course</h3>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to deny "{selectedCourse.title}"?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleDenyCourse(selectedCourse._id)}
                                    className="btn bg-red-600 hover:bg-red-700 text-white flex-1"
                                >
                                    Confirm Deny
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="btn bg-gray-300 hover:bg-gray-400 text-gray-700 flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default CourseApproval;
