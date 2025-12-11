import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { Users, Award, TrendingUp, BookOpen, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseStudents = () => {
    const { courseId } = useParams();
    const [loading, setLoading] = useState(true);
    const [courseData, setCourseData] = useState(null);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        fetchCourseStudents();
    }, [courseId]);

    const fetchCourseStudents = async () => {
        try {
            setLoading(true);
            const response = await courseService.getCourseStudents(courseId);
            setCourseData(response.data.course);
            setStudents(response.data.students);
        } catch (error) {
            console.error('Error fetching course students:', error);
            toast.error('Failed to load course students');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full border-blue-600 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading students...</p>
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
                {/* Back Button */}
                <Link
                    to="/instructor/my-courses"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Back to My Courses
                </Link>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">{courseData?.title}</h1>
                    <p className="text-gray-600 mt-2">{courseData?.description}</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-600 rounded-lg">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-green-50 to-green-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-600 rounded-lg">
                                <Award className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Points Earned</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {students.reduce((sum, s) => sum + s.totalPoints, 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-600 rounded-lg">
                                <TrendingUp className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Avg Progress</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {students.length > 0
                                        ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length)
                                        : 0}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Students List */}
                <div className="card">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Students & Points</h2>

                    {students.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                No Students Enrolled Yet
                            </h3>
                            <p className="text-gray-500">
                                Students will appear here once they enroll and you validate their payment
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rank
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Points
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Progress
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quizzes
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {students.map((student, index) => (
                                        <tr key={student.enrollmentId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-500' :
                                                            index === 1 ? 'text-gray-400' :
                                                                index === 2 ? 'text-orange-500' :
                                                                    'text-gray-600'
                                                        }`}>
                                                        #{index + 1}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img
                                                        src={student.student?.profilePicture || 'https://via.placeholder.com/40'}
                                                        alt={student.student?.fullName}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/40?text=Student';
                                                        }}
                                                    />
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {student.student?.fullName || student.student?.username}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {student.student?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Award className="h-5 w-5 text-yellow-500" />
                                                    <span className="text-lg font-bold text-gray-900">
                                                        {student.totalPoints}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${student.progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {student.progress}%
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {student.completedMaterials}/{student.totalMaterials} materials
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {student.quizScores.length} completed
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {student.quizScores.filter(q => q.score > 0).length} correct
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {student.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CourseStudents;
