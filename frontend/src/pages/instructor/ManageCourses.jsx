import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import toast from 'react-hot-toast';

const ManageCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        try {
            setLoading(true);
            console.log('Fetching instructor courses for user:', user?._id);
            // Fetch all courses and filter by current user
            const response = await courseService.getAllCourses({ limit: 100 });
            console.log('All courses response:', response);

            const allCourses = response.data?.items || response.data || [];
            console.log('All courses:', allCourses);

            // Filter courses where current user is an instructor
            const myCourses = allCourses.filter(course => {
                const instructorIds = course.instructor?.map(inst =>
                    typeof inst === 'string' ? inst : inst._id
                ) || [];
                return instructorIds.includes(user?._id);
            });

            console.log('My courses after filtering:', myCourses);
            setCourses(myCourses);
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) {
            return;
        }

        try {
            await courseService.deleteCourse(courseId);
            toast.success('Course deleted successfully');
            fetchMyCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
            toast.error(error.response?.data?.message || 'Failed to delete course');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            approved: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            denied: 'bg-red-100 text-red-800'
        };
        return styles[status] || styles.pending;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full border-blue-600 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading your courses...</p>
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
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">My Courses</h1>
                    <Link
                        to="/instructor/create-course"
                        className="btn btn-primary"
                    >
                        + Create New Course
                    </Link>
                </div>

                {courses.length === 0 ? (
                    <div className="card text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                        <p className="text-gray-600 mb-4">Create your first course to start teaching</p>
                        <Link to="/instructor/create-course" className="btn btn-primary">
                            Create Course
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <div key={course._id} className="card hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(course.status)}`}>
                                        {course.status}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/instructor/courses/${course._id}/edit`)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Edit"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course._id)}
                                            className="text-red-600 hover:text-red-800"
                                            title="Delete"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                                <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                                <div className="flex justify-between items-center pt-4 border-t">
                                    <span className="text-2xl font-bold text-blue-600">
                                        ${course.price}
                                    </span>
                                    <Link
                                        to={`/instructor/courses/${course._id}`}
                                        className="text-blue-600 hover:text-blue-800 font-semibold"
                                    >
                                        View Details →
                                    </Link>
                                </div>

                                {course.materials && course.materials.length > 0 && (
                                    <div className="mt-3 text-sm text-gray-500">
                                        📚 {course.materials.length} material{course.materials.length !== 1 ? 's' : ''}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default ManageCourses;
