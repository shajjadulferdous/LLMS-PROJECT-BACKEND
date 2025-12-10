import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { enrollService } from '../../services/enrollService';
import Navbar from '../../components/shared/Navbar';
import Loading from '../../components/shared/Loading';
import { ChevronLeft, CheckCircle, Circle, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseViewer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [currentMaterialIndex, setCurrentMaterialIndex] = useState(0);
    const [completedMaterials, setCompletedMaterials] = useState([]);

    useEffect(() => {
        fetchCourseData();
    }, [id]);

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            const courseResponse = await courseService.getCourseById(id);
            const courseData = courseResponse.data?.data || courseResponse.data;
            setCourse(courseData);

            // Try to fetch enrollment to get progress
            try {
                const enrollmentsResponse = await enrollService.getMyEnrollments();
                const enrollmentsData = enrollmentsResponse.data || [];
                const currentEnrollment = enrollmentsData.find(
                    e => e.course?._id === id
                );
                if (currentEnrollment) {
                    setEnrollment(currentEnrollment);
                    setCompletedMaterials(currentEnrollment.completedMaterials || []);
                } else {
                    toast.error('You are not enrolled in this course');
                    navigate('/student/courses/' + id);
                }
            } catch (error) {
                console.error('Failed to fetch enrollment:', error);
                toast.error('Could not load enrollment data. Please try again.');
            }
        } catch (error) {
            console.error('Failed to load course:', error);
            toast.error('Failed to load course');
            navigate('/student/my-courses');
        } finally {
            setLoading(false);
        }
    };

    const markMaterialComplete = async (materialId) => {
        if (!enrollment) {
            toast.error('Enrollment not found. Please enroll in this course first.');
            navigate('/student/my-courses');
            return;
        }

        if (completedMaterials.includes(materialId)) {
            toast.info('This material is already marked as complete');
            return;
        }

        try {
            const response = await enrollService.updateProgress(enrollment._id, {
                completedMaterial: materialId,
            });

            const updatedCompleted = response.data?.completedMaterials || [...completedMaterials, materialId];
            setCompletedMaterials(updatedCompleted);

            // Check if all materials are completed
            if (updatedCompleted.length === course.materials.length) {
                toast.success('Congratulations! You completed the course!');
                await enrollService.completeCourse(enrollment._id);
                
                // Refresh enrollment data
                await fetchCourseData();
            } else {
                toast.success('Material marked as complete!');
            }
        } catch (error) {
            console.error('Progress update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update progress');
        }
    };

    if (loading) {
        return <Loading fullScreen />;
    }

    if (!course || !course.materials || course.materials.length === 0) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">No course materials available</p>
                        <button onClick={() => navigate('/student/my-courses')} className="btn-primary">
                            Back to My Courses
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentMaterial = course.materials[currentMaterialIndex];
    const progress = ((completedMaterials.length / course.materials.length) * 100).toFixed(0);

    return (
        <div className="min-h-screen flex flex-col bg-gray-900">
            <Navbar />

            <div className="flex-1 flex">
                {/* Sidebar - Course Materials */}
                <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
                    <div className="p-6 border-b border-gray-200">
                        <button
                            onClick={() => navigate('/student/my-courses')}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ChevronLeft className="h-5 w-5" />
                            <span>Back to Courses</span>
                        </button>

                        <h2 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h2>

                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                <span className="text-sm font-medium text-primary-600">{progress}%</span>
                            </div>
                            <div className="bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                            Course Content
                        </h3>
                        <div className="space-y-2">
                            {course.materials.map((material, index) => {
                                const isCompleted = completedMaterials.includes(material._id);
                                const isCurrent = index === currentMaterialIndex;

                                return (
                                    <button
                                        key={material._id}
                                        onClick={() => setCurrentMaterialIndex(index)}
                                        className={`w-full text-left p-3 rounded-lg transition-colors ${isCurrent
                                            ? 'bg-primary-100 border-2 border-primary-500'
                                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            {isCompleted ? (
                                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${isCurrent ? 'text-primary-700' : 'text-gray-900'}`}>
                                                    {index + 1}. {material.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {material.type} {material.duration && `• ${material.duration} min`}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                    {/* Material Viewer */}
                    <div className="flex-1 bg-black flex items-center justify-center p-8">
                        <div className="w-full max-w-6xl">
                            {currentMaterial.type === 'video' ? (
                                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                                    {(() => {
                                        let videoUrl = currentMaterial.url || currentMaterial.videoFile;

                                        // Get base backend URL without /api/v1
                                        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
                                        const backendUrl = apiUrl.replace('/api/v1', '');

                                        // Handle different URL formats
                                        if (videoUrl && !videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
                                            if (videoUrl.startsWith('/')) {
                                                videoUrl = `${backendUrl}${videoUrl}`;
                                            } else if (videoUrl.startsWith('uploaded/')) {
                                                const filename = videoUrl.replace('uploaded/', '');
                                                videoUrl = `${backendUrl}/temp/${filename}`;
                                            } else {
                                                videoUrl = `${backendUrl}/temp/${videoUrl}`;
                                            }
                                        }

                                        const isYouTube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be');

                                        if (isYouTube) {
                                            const match = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                                            const youtubeId = match ? match[1] : null;

                                            if (youtubeId) {
                                                return (
                                                    <iframe
                                                        className="w-full h-full rounded-lg"
                                                        src={`https://www.youtube.com/embed/${youtubeId}`}
                                                        title={currentMaterial.title}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    ></iframe>
                                                );
                                            }
                                        }

                                        return (
                                            <video
                                                key={currentMaterial._id}
                                                controls
                                                className="w-full h-full rounded-lg"
                                                src={videoUrl}
                                                onError={(e) => {
                                                    console.error('Video load error:', e);
                                                    console.error('Video URL:', videoUrl);
                                                }}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        );
                                    })()}
                                </div>
                            ) : currentMaterial.type === 'Document' ? (
                                <div className="bg-white rounded-lg p-8 max-h-[70vh] overflow-y-auto">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                        {currentMaterial.title}
                                    </h2>
                                    <div className="prose max-w-none">
                                        <p className="text-gray-700">
                                            Document content will be displayed here or can be downloaded from:{' '}
                                            <a href={currentMaterial.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                                View Document
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            ) : currentMaterial.type === 'link' ? (
                                <div className="bg-white rounded-lg p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                        {currentMaterial.title}
                                    </h2>
                                    <a
                                        href={currentMaterial.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary inline-block"
                                    >
                                        Open Resource
                                    </a>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                        {currentMaterial.title}
                                    </h2>
                                    <p className="text-gray-600">Quiz content coming soon...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-white border-t border-gray-200 p-6">
                        <div className="max-w-6xl mx-auto flex items-center justify-between">
                            <button
                                onClick={() => setCurrentMaterialIndex(Math.max(0, currentMaterialIndex - 1))}
                                disabled={currentMaterialIndex === 0}
                                className="btn-secondary disabled:opacity-50"
                            >
                                Previous
                            </button>

                            <div className="flex items-center space-x-4">
                                {!completedMaterials.includes(currentMaterial._id) && (
                                    <button
                                        onClick={() => markMaterialComplete(currentMaterial._id)}
                                        className="btn-primary flex items-center space-x-2"
                                    >
                                        <CheckCircle className="h-5 w-5" />
                                        <span>Mark as Complete</span>
                                    </button>
                                )}

                                {completedMaterials.length === course.materials.length && (
                                    <div className="flex items-center space-x-2 text-green-600 font-medium">
                                        <Award className="h-6 w-6" />
                                        <span>Course Completed!</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setCurrentMaterialIndex(Math.min(course.materials.length - 1, currentMaterialIndex + 1))}
                                disabled={currentMaterialIndex === course.materials.length - 1}
                                className="btn-secondary disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseViewer;
