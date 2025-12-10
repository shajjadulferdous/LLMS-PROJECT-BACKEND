import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollService } from '../../services/enrollService';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import Loading from '../../components/shared/Loading';
import { BookOpen, Award, Play, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const MyCourses = () => {
    const [loading, setLoading] = useState(true);
    const [enrollments, setEnrollments] = useState([]);
    const [filter, setFilter] = useState('all'); // all, in-progress, completed

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const response = await enrollService.getMyEnrollments();
            setEnrollments(response.data || []);
        } catch (error) {
            toast.error('Failed to load your courses');
        } finally {
            setLoading(false);
        }
    };

    const downloadCertificate = async (enrollmentId) => {
        try {
            const blob = await enrollService.getCertificate(enrollmentId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificate-${enrollmentId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Certificate downloaded!');
        } catch (error) {
            toast.error('Failed to download certificate');
        }
    };

    const filteredEnrollments = enrollments.filter(enrollment => {
        if (filter === 'all') return true;
        if (filter === 'in-progress') return enrollment.status === 'in-progress';
        if (filter === 'completed') return enrollment.status === 'completed';
        return true;
    });

    if (loading) {
        return <Loading fullScreen />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
                    <p className="text-gray-600">Continue your learning journey</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex space-x-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setFilter('all')}
                        className={`pb-3 px-4 font-medium transition-colors ${filter === 'all'
                                ? 'border-b-2 border-primary-600 text-primary-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        All Courses ({enrollments.length})
                    </button>
                    <button
                        onClick={() => setFilter('in-progress')}
                        className={`pb-3 px-4 font-medium transition-colors ${filter === 'in-progress'
                                ? 'border-b-2 border-primary-600 text-primary-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        In Progress ({enrollments.filter(e => e.status === 'in-progress').length})
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`pb-3 px-4 font-medium transition-colors ${filter === 'completed'
                                ? 'border-b-2 border-primary-600 text-primary-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Completed ({enrollments.filter(e => e.status === 'completed').length})
                    </button>
                </div>

                {/* Courses List */}
                {filteredEnrollments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEnrollments.map((enrollment) => (
                            <div key={enrollment._id} className="card hover:shadow-xl transition-shadow">
                                <div className="relative">
                                    <img
                                        src={enrollment.course?.thumbnail || 'https://via.placeholder.com/400x200'}
                                        alt={enrollment.course?.title}
                                        className="w-full h-48 object-cover rounded-lg mb-4"
                                    />
                                    {enrollment.status === 'completed' && (
                                        <div className="absolute top-2 right-2 badge-success">
                                            <Award className="h-4 w-4 inline mr-1" />
                                            Completed
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {enrollment.course?.title}
                                </h3>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {enrollment.course?.description}
                                </p>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Progress</span>
                                        <span className="text-sm font-medium text-primary-600">
                                            {enrollment.progress || 0}%
                                        </span>
                                    </div>
                                    <div className="bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${enrollment.progress || 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Enrollment Date */}
                                <p className="text-xs text-gray-500 mb-4">
                                    Enrolled on {new Date(enrollment.createdAt).toLocaleDateString()}
                                </p>

                                {/* Actions */}
                                <div className="space-y-2">
                                    <Link
                                        to={`/student/course-viewer/${enrollment.course?._id}`}
                                        className="w-full btn-primary flex items-center justify-center space-x-2"
                                    >
                                        <Play className="h-4 w-4" />
                                        <span>Continue Learning</span>
                                    </Link>

                                    {enrollment.certificateIssued && (
                                        <button
                                            onClick={() => downloadCertificate(enrollment._id)}
                                            className="w-full btn-secondary flex items-center justify-center space-x-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span>Download Certificate</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-12">
                        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg mb-2">No courses found</p>
                        <p className="text-gray-500 text-sm mb-6">
                            {filter === 'all'
                                ? "You haven't enrolled in any courses yet"
                                : `No ${filter} courses`}
                        </p>
                        <Link to="/student/courses" className="btn-primary inline-block">
                            Browse Courses
                        </Link>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default MyCourses;
