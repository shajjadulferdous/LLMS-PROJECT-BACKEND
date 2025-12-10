import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import toast from 'react-hot-toast';

const CourseView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResults, setQuizResults] = useState({});
    const [submittingQuiz, setSubmittingQuiz] = useState({});
    const [enrollmentRequired, setEnrollmentRequired] = useState(false);

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const response = await courseService.getCourseById(id);
            const courseData = response.data?.data || response.data;
            setCourse(courseData);
            setEnrollmentRequired(courseData.enrollmentRequired || false);

            // If enrollment is required, show message
            if (courseData.enrollmentRequired) {
                toast.error('Please enroll in this course to access the materials');
            }
        } catch (error) {
            console.error('Error fetching course:', error);
            toast.error(error.response?.data?.message || 'Failed to load course');
        } finally {
            setLoading(false);
        }
    };

    const handleQuizSubmit = async (materialId) => {
        const selectedAnswer = quizAnswers[materialId];

        if (selectedAnswer == null) {
            toast.error('Please select an answer');
            return;
        }

        try {
            setSubmittingQuiz(prev => ({ ...prev, [materialId]: true }));

            const response = await courseService.submitQuizAnswer(id, materialId, selectedAnswer);
            const result = response.data;

            setQuizResults(prev => ({ ...prev, [materialId]: result }));

            if (result.isCorrect) {
                toast.success('Correct! +1 point 🎉');
            } else {
                toast.error('Incorrect answer');
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            toast.error(error.response?.data?.message || 'Failed to submit quiz');
        } finally {
            setSubmittingQuiz(prev => ({ ...prev, [materialId]: false }));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full border-blue-600 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading course...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <p className="text-gray-600">Course not found</p>
                </main>
                <Footer />
            </div>
        );
    }

    // Separate materials by type
    const videos = course.materials?.filter(m => m.type === 'video') || [];
    const documents = course.materials?.filter(m => m.type === 'Document') || [];
    const links = course.materials?.filter(m => m.type === 'link') || [];
    const quizzes = course.materials?.filter(m => m.type === 'quiz') || [];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
                {/* Course Header */}
                <div className="card mb-6">
                    <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                    <p className="text-gray-600 mb-4">{course.description}</p>
                    <div className="flex gap-4 text-sm text-gray-600 mb-4">
                        <span>👨‍🏫 {course.instructor?.map(i => i.fullName || i.username).join(', ')}</span>
                        <span>💰 ${course.price}</span>
                        <span>📚 {course.materialsCount || course.materials?.length || 0} materials</span>
                    </div>

                    {/* Enrollment Status */}
                    {enrollmentRequired && (
                        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Enrollment Required
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>You must enroll in this course to access all videos, documents, links, and quizzes.</p>
                                    </div>
                                    <div className="mt-4">
                                        <button
                                            onClick={() => navigate('/student/courses')}
                                            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm font-medium"
                                        >
                                            Go to Courses & Enroll
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {course.isEnrolled && (
                        <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-400 rounded">
                            <p className="text-sm text-green-800 flex items-center gap-2">
                                <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                ✓ You are enrolled in this course
                            </p>
                        </div>
                    )}
                </div>

                {/* Show materials only if enrolled or no enrollment required */}
                {!enrollmentRequired && (
                    <>
                        {/* Videos Section */}
                        {videos.length > 0 && (
                            <div className="card mb-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    🎥 Videos
                                    <span className="text-sm font-normal text-gray-600">({videos.length})</span>
                                </h2>
                                <div className="space-y-4">
                                    {videos.map((video, index) => {
                                        let videoUrl = video.url || video.videoFile;

                                        // Get base backend URL without /api/v1
                                        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
                                        const backendUrl = apiUrl.replace('/api/v1', '');

                                        // Handle different URL formats (for backward compatibility)
                                        if (videoUrl && !videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
                                            // Not an absolute URL - handle relative paths
                                            if (videoUrl.startsWith('/')) {
                                                videoUrl = `${backendUrl}${videoUrl}`;
                                            } else if (videoUrl.startsWith('uploaded/')) {
                                                const filename = videoUrl.replace('uploaded/', '');
                                                videoUrl = `${backendUrl}/temp/${filename}`;
                                            } else {
                                                videoUrl = `${backendUrl}/temp/${videoUrl}`;
                                            }
                                        }
                                        // Cloudinary URLs and other absolute URLs are used as-is

                                        const isYouTube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be');
                                        const isVimeo = videoUrl?.includes('vimeo.com');

                                        // Extract YouTube video ID
                                        let youtubeId = null;
                                        if (isYouTube) {
                                            const match = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                                            youtubeId = match ? match[1] : null;
                                        }

                                        return (
                                            <div key={video._id} className="p-4 bg-gray-50 rounded-lg border">
                                                <h3 className="font-bold text-lg mb-3">{index + 1}. {video.title}</h3>
                                                {video.duration && (
                                                    <p className="text-sm text-gray-600 mb-3">⏱️ {video.duration} minutes</p>
                                                )}

                                                {/* Debug info - remove after testing */}
                                                <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-100 rounded">
                                                    <p><strong>Video URL:</strong> {videoUrl}</p>
                                                    <p><strong>Original:</strong> {video.url || video.videoFile}</p>
                                                </div>

                                                {/* YouTube Embed */}
                                                {isYouTube && youtubeId ? (
                                                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                                        <iframe
                                                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                                                            src={`https://www.youtube.com/embed/${youtubeId}`}
                                                            title={video.title}
                                                            frameBorder="0"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        ></iframe>
                                                    </div>
                                                ) : isVimeo ? (
                                                    /* Vimeo or other video link */
                                                    <div className="flex gap-3">
                                                        <a
                                                            href={videoUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-primary"
                                                        >
                                                            ▶️ Watch Video on Vimeo
                                                        </a>
                                                    </div>
                                                ) : videoUrl ? (
                                                    /* Direct video file or other URL */
                                                    <div className="space-y-3">
                                                        <video
                                                            controls
                                                            className="w-full rounded-lg"
                                                            style={{ maxHeight: '500px' }}
                                                            onError={(e) => {
                                                                console.error('Video load error:', e);
                                                                toast.error('Failed to load video. Check console for details.');
                                                            }}
                                                        >
                                                            <source src={videoUrl} type="video/mp4" />
                                                            <source src={videoUrl} type="video/webm" />
                                                            <source src={videoUrl} type="video/ogg" />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                        <a
                                                            href={videoUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-primary btn-sm"
                                                        >
                                                            🔗 Open in New Tab
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <p className="text-red-600">No video URL available</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Documents/PDFs Section */}
                        {documents.length > 0 && (
                            <div className="card mb-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    📄 PDFs & Documents
                                    <span className="text-sm font-normal text-gray-600">({documents.length})</span>
                                </h2>
                                <div className="space-y-4">
                                    {documents.map((doc, index) => {
                                        let docUrl = doc.url || doc.documentFile;

                                        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

                                        // Handle different URL formats (for backward compatibility)
                                        if (docUrl && !docUrl.startsWith('http://') && !docUrl.startsWith('https://')) {
                                            // Not an absolute URL - handle relative paths
                                            if (docUrl.startsWith('/')) {
                                                docUrl = `${backendUrl}${docUrl}`;
                                            } else if (docUrl.startsWith('uploaded/')) {
                                                const filename = docUrl.replace('uploaded/', '');
                                                docUrl = `${backendUrl}/temp/${filename}`;
                                            } else {
                                                docUrl = `${backendUrl}/temp/${docUrl}`;
                                            }
                                        }
                                        // Cloudinary URLs and other absolute URLs are used as-is

                                        return (
                                            <div key={doc._id} className="p-4 bg-gray-50 rounded-lg border">
                                                <div className="flex gap-4">
                                                    <img
                                                        src={doc.CoursePicture}
                                                        alt={doc.title}
                                                        className="w-24 h-24 object-cover rounded"
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/96?text=PDF'; }}
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-lg mb-1">{index + 1}. {doc.title}</h3>
                                                        <p className="text-sm text-gray-600 mb-2">📋 PDF Document</p>
                                                        {docUrl && (
                                                            <a
                                                                href={docUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn bg-red-600 hover:bg-red-700 text-white btn-sm"
                                                            >
                                                                📥 View PDF
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Links Section */}
                        {links.length > 0 && (
                            <div className="card mb-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    🔗 External Links
                                    <span className="text-sm font-normal text-gray-600">({links.length})</span>
                                </h2>
                                <div className="space-y-4">
                                    {links.map((link, index) => (
                                        <div key={link._id} className="p-4 bg-gray-50 rounded-lg border">
                                            <div className="flex gap-4">
                                                <img
                                                    src={link.CoursePicture}
                                                    alt={link.title}
                                                    className="w-24 h-24 object-cover rounded"
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/96?text=Link'; }}
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg mb-1">{index + 1}. {link.title}</h3>
                                                    <p className="text-sm text-gray-600 mb-2 truncate">{link.url}</p>
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn bg-purple-600 hover:bg-purple-700 text-white btn-sm"
                                                    >
                                                        🌐 Visit Link
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quizzes Section */}
                        {quizzes.length > 0 && (
                            <div className="card mb-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    📝 Quizzes
                                    <span className="text-sm font-normal text-gray-600">({quizzes.length})</span>
                                </h2>
                                <div className="space-y-6">
                                    {quizzes.map((quiz, index) => {
                                        const question = quiz.quizQuestions?.[0];
                                        const result = quizResults[quiz._id];
                                        const isSubmitting = submittingQuiz[quiz._id];

                                        if (!question) return null;

                                        return (
                                            <div key={quiz._id} className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                                                <div className="flex gap-4 mb-4">
                                                    <img
                                                        src={quiz.CoursePicture}
                                                        alt={quiz.title}
                                                        className="w-20 h-20 object-cover rounded"
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=Quiz'; }}
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-xl mb-1">Quiz {index + 1}: {quiz.title}</h3>
                                                        <p className="text-sm text-gray-600">⏱️ Time Limit: {question.timeLimit} seconds</p>
                                                    </div>
                                                </div>

                                                <div className="bg-white p-4 rounded-lg mb-4">
                                                    <p className="font-semibold text-lg mb-4">{question.question}</p>

                                                    <div className="space-y-3">
                                                        {question.options.map((option, optIndex) => {
                                                            const isSelected = quizAnswers[quiz._id] === optIndex;
                                                            const isCorrect = result?.correctAnswer === optIndex;
                                                            const isWrong = result && result.selectedAnswer === optIndex && !result.isCorrect;

                                                            return (
                                                                <label
                                                                    key={optIndex}
                                                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${isCorrect && result ? 'bg-green-100 border-green-500' :
                                                                        isWrong ? 'bg-red-100 border-red-500' :
                                                                            isSelected ? 'bg-blue-100 border-blue-500' :
                                                                                'bg-gray-50 border-gray-300 hover:border-blue-300'
                                                                        } ${result ? 'cursor-not-allowed' : ''}`}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name={`quiz-${quiz._id}`}
                                                                        value={optIndex}
                                                                        checked={isSelected}
                                                                        onChange={() => !result && setQuizAnswers(prev => ({ ...prev, [quiz._id]: optIndex }))}
                                                                        disabled={!!result}
                                                                        className="w-5 h-5"
                                                                    />
                                                                    <span className="font-semibold text-gray-700">{String.fromCharCode(65 + optIndex)}.</span>
                                                                    <span className="flex-1">{option}</span>
                                                                    {isCorrect && result && <span className="text-green-600 font-bold">✓ Correct</span>}
                                                                    {isWrong && <span className="text-red-600 font-bold">✗ Wrong</span>}
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {!result ? (
                                                    <button
                                                        onClick={() => handleQuizSubmit(quiz._id)}
                                                        disabled={isSubmitting || quizAnswers[quiz._id] == null}
                                                        className="btn btn-primary w-full"
                                                    >
                                                        {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                                                    </button>
                                                ) : (
                                                    <div className={`p-4 rounded-lg text-center ${result.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        <p className="font-bold text-lg">
                                                            {result.isCorrect ? '🎉 Correct! +1 Point' : '❌ Incorrect'}
                                                        </p>
                                                        {!result.isCorrect && (
                                                            <p className="mt-2">
                                                                The correct answer was: <strong>Option {String.fromCharCode(65 + result.correctAnswer)}</strong>
                                                            </p>
                                                        )}
                                                        {result.alreadyAnswered && (
                                                            <p className="mt-2 text-sm">You have already answered this quiz</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* No Materials */}
                        {!enrollmentRequired && course.materials?.length === 0 && (
                            <div className="card text-center py-12">
                                <p className="text-gray-500">No materials available yet</p>
                            </div>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default CourseView;
