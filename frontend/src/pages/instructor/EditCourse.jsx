import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import toast from 'react-hot-toast';
import axios from 'axios';

const EditCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [course, setCourse] = useState(null);
    const [activeTab, setActiveTab] = useState('basic'); // basic, instructors, materials

    // Basic Info State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: ''
    });

    // Instructors State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    // Materials State
    const [materialForm, setMaterialForm] = useState({
        title: '',
        type: 'video',
        url: '',
        videoFile: '',
        documentFile: '',
        duration: '',
        CoursePicture: '',
        quizQuestions: [{
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            timeLimit: 60
        }]
    });
    const [showMaterialForm, setShowMaterialForm] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(Date.now());

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const response = await courseService.getCourseById(id);
            const courseData = response.data?.data || response.data;
            setCourse(courseData);
            setFormData({
                title: courseData.title,
                description: courseData.description,
                price: courseData.price
            });
        } catch (error) {
            console.error('Error fetching course:', error);
            toast.error('Failed to load course');
            navigate('/instructor/courses');
        } finally {
            setLoading(false);
        }
    };

    const handleBasicInfoChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveBasicInfo = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await courseService.updateCourse(id, formData);
            toast.success('Course updated successfully');
            fetchCourse();
        } catch (error) {
            console.error('Error updating course:', error);
            toast.error(error.response?.data?.message || 'Failed to update course');
        } finally {
            setSaving(false);
        }
    };

    const handleSearchInstructors = async () => {
        if (!searchQuery.trim()) return;

        try {
            setSearching(true);
            const response = await courseService.searchInstructors(searchQuery);
            const instructors = response.data?.data || response.data || [];
            setSearchResults(instructors);
        } catch (error) {
            console.error('Error searching instructors:', error);
            toast.error('Failed to search instructors');
        } finally {
            setSearching(false);
        }
    };

    const handleAddInstructor = async (instructorId) => {
        try {
            await courseService.updateCourse(id, {
                addInstructors: [instructorId]
            });
            toast.success('Instructor added successfully');
            setSearchQuery('');
            setSearchResults([]);
            fetchCourse();
        } catch (error) {
            console.error('Error adding instructor:', error);
            toast.error(error.response?.data?.message || 'Failed to add instructor');
        }
    };

    const handleRemoveInstructor = async (instructorId) => {
        if (course.instructor.length <= 1) {
            toast.error('Course must have at least one instructor');
            return;
        }

        if (!window.confirm('Are you sure you want to remove this instructor?')) {
            return;
        }

        try {
            await courseService.updateCourse(id, {
                removeInstructors: [instructorId]
            });
            toast.success('Instructor removed successfully');
            fetchCourse();
        } catch (error) {
            console.error('Error removing instructor:', error);
            toast.error(error.response?.data?.message || 'Failed to remove instructor');
        }
    };

    const handleMaterialFormChange = (e) => {
        const { name, value } = e.target;
        setMaterialForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type before upload
        if (fieldName === 'videoFile') {
            const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
            if (!validVideoTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
                toast.error('Please select a valid video file (MP4, WebM, OGG, MOV, AVI, MKV)');
                return;
            }
        }

        if (fieldName === 'documentFile') {
            if (file.type !== 'application/pdf' && !file.name.match(/\.pdf$/i)) {
                toast.error('Please select a PDF file');
                return;
            }
        }

        try {
            const loadingToast = toast.loading('Uploading file...');

            const formData = new FormData();
            formData.append('file', file);

            console.log('Uploading file:', file.name, 'Type:', file.type, 'Size:', file.size);

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/courses/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    withCredentials: true
                }
            );

            toast.dismiss(loadingToast);

            console.log('Upload response:', response.data);

            if (response.data?.data?.url) {
                const uploadedUrl = response.data.data.url;

                console.log('Setting file URL:', uploadedUrl);

                setMaterialForm(prev => ({ ...prev, [fieldName]: uploadedUrl }));

                // Reset file input
                setFileInputKey(Date.now());

                toast.success(`File uploaded: ${response.data.data.originalName}`);
            } else {
                throw new Error('Upload failed - no URL in response');
            }
        } catch (error) {
            toast.dismiss();
            console.error('Upload error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'File upload failed';
            toast.error(errorMsg);
        }

        // Uncomment below for Cloudinary upload (alternative implementation)
        /*
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'your_preset'); // Configure in Cloudinary

        try {
            toast.loading('Uploading file...');
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/${fieldName === 'videoFile' ? 'video' : 'raw'}/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );
            const data = await response.json();
            toast.dismiss();
            toast.success('File uploaded successfully');
            setMaterialForm(prev => ({ ...prev, [fieldName]: data.secure_url }));
        } catch (error) {
            toast.dismiss();
            console.error('Error uploading file:', error);
            toast.error('Failed to upload file');
        }
        */
    };

    const handleQuizQuestionChange = (index, field, value) => {
        setMaterialForm(prev => {
            const newQuestions = [...prev.quizQuestions];
            if (field === 'options') {
                newQuestions[index].options = value;
            } else {
                newQuestions[index][field] = value;
            }
            return { ...prev, quizQuestions: newQuestions };
        });
    };

    const handleAddQuizQuestion = () => {
        setMaterialForm(prev => ({
            ...prev,
            quizQuestions: [...prev.quizQuestions, {
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0,
                timeLimit: 60
            }]
        }));
    };

    const handleRemoveQuizQuestion = (index) => {
        setMaterialForm(prev => ({
            ...prev,
            quizQuestions: prev.quizQuestions.filter((_, i) => i !== index)
        }));
    };

    const handleAddMaterial = async (e) => {
        e.preventDefault();

        // Validate based on material type - STRICT RULES
        if (!materialForm.title) {
            toast.error('Please provide a material title');
            return;
        }

        console.log('Material form data:', materialForm);

        if (materialForm.type === 'video') {
            if (!materialForm.url && !materialForm.videoFile) {
                console.error('Validation failed: No video URL or file');
                console.log('videoFile:', materialForm.videoFile);
                console.log('url:', materialForm.url);
                toast.error('Please provide either a video URL or upload a video file');
                return;
            }
            // Skip validation for Cloudinary URLs and uploaded files
            if (materialForm.videoFile) {
                const isCloudinary = materialForm.videoFile.includes('cloudinary.com');
                const isUploadedFile = materialForm.videoFile.includes('/temp/');
                if (!isCloudinary && !isUploadedFile && !materialForm.videoFile.match(/\.(mp4|webm|ogg|mov|avi|mkv)($|\?)/i)) {
                    toast.error('Only video files are allowed (MP4, WebM, OGG, MOV, AVI, MKV)');
                    return;
                }
            }
            // If it's a URL, validate it (skip YouTube, Vimeo, Cloudinary)
            if (materialForm.url) {
                const isCloudinary = materialForm.url.includes('cloudinary.com');
                const isYouTube = materialForm.url.includes('youtube.com') || materialForm.url.includes('youtu.be');
                const isVimeo = materialForm.url.includes('vimeo.com');
                if (!isCloudinary && !isYouTube && !isVimeo && !materialForm.url.match(/\.(mp4|webm|ogg|mov|avi|mkv)($|\?)/i)) {
                    toast.error('Video URL must point to a video file or be from YouTube/Vimeo');
                    return;
                }
            }
        }

        if (materialForm.type === 'Document') {
            if (!materialForm.url && !materialForm.documentFile) {
                toast.error('Please provide either a PDF URL or upload a PDF file');
                return;
            }
            // Skip validation for Cloudinary URLs and uploaded files
            if (materialForm.documentFile) {
                const isCloudinary = materialForm.documentFile.includes('cloudinary.com');
                const isUploadedFile = materialForm.documentFile.includes('/temp/');
                if (!isCloudinary && !isUploadedFile && !materialForm.documentFile.match(/\.pdf($|\?)/i)) {
                    toast.error('Only PDF files are allowed');
                    return;
                }
            }
            if (materialForm.url) {
                const isCloudinary = materialForm.url.includes('cloudinary.com');
                if (!isCloudinary && !materialForm.url.match(/\.pdf($|\?)/i)) {
                    toast.error('Document URL must be a PDF file');
                    return;
                }
            }
        }

        if (materialForm.type === 'link') {
            if (!materialForm.url) {
                toast.error('Please provide a URL for the link');
                return;
            }
            if (!materialForm.url.match(/^https?:\/\//i)) {
                toast.error('Please provide a valid URL starting with http:// or https://');
                return;
            }
        }

        if (materialForm.type === 'quiz') {
            // Quiz must have EXACTLY ONE question
            if (materialForm.quizQuestions.length !== 1) {
                toast.error('Quiz must have exactly ONE question');
                return;
            }

            const q = materialForm.quizQuestions[0];
            if (!q.question || !q.question.trim()) {
                toast.error('Please enter the quiz question');
                return;
            }

            // Must have exactly 4 options, all filled
            if (q.options.length !== 4 || q.options.some(opt => !opt || !opt.trim())) {
                toast.error('Quiz must have exactly 4 options, all filled');
                return;
            }

            if (q.correctAnswer < 0 || q.correctAnswer > 3) {
                toast.error('Please select the correct answer (0-3)');
                return;
            }
        }

        try {
            const payload = {
                title: materialForm.title,
                type: materialForm.type
            };

            // Add type-specific fields
            if (materialForm.type === 'video') {
                if (materialForm.videoFile) payload.videoFile = materialForm.videoFile;
                if (materialForm.url) payload.url = materialForm.url;
            } else if (materialForm.type === 'Document') {
                if (materialForm.documentFile) payload.documentFile = materialForm.documentFile;
                if (materialForm.url) payload.url = materialForm.url;
            } else if (materialForm.type === 'link') {
                payload.url = materialForm.url;
            } else if (materialForm.type === 'quiz') {
                // Send only the ONE question
                payload.quizQuestions = [materialForm.quizQuestions[0]];
            }

            await courseService.addMaterial(id, payload);
            toast.success('Material added successfully');
            setMaterialForm({
                title: '',
                type: 'video',
                url: '',
                videoFile: '',
                documentFile: '',
                duration: '',
                CoursePicture: '',
                quizQuestions: [{
                    question: '',
                    options: ['', '', '', ''],
                    correctAnswer: 0,
                    timeLimit: 60
                }]
            });
            setFileInputKey(Date.now()); // Reset file input
            setShowMaterialForm(false);
            fetchCourse();
        } catch (error) {
            console.error('Error adding material:', error);
            toast.error(error.response?.data?.message || 'Failed to add material');
        }
    };

    const handleDeleteMaterial = async (materialId) => {
        if (!window.confirm('Are you sure you want to delete this material?')) {
            return;
        }

        try {
            await courseService.deleteMaterial(id, materialId);
            toast.success('Material deleted successfully');
            fetchCourse();
        } catch (error) {
            console.error('Error deleting material:', error);
            toast.error(error.response?.data?.message || 'Failed to delete material');
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

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Edit Course</h1>
                    <p className="text-gray-600">{course?.title}</p>
                </div>

                {/* Tabs */}
                <div className="card mb-6">
                    <div className="flex gap-4 border-b">
                        <button
                            onClick={() => setActiveTab('basic')}
                            className={`px-4 py-3 font-semibold transition-colors border-b-2 ${activeTab === 'basic'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Basic Info
                        </button>
                        <button
                            onClick={() => setActiveTab('instructors')}
                            className={`px-4 py-3 font-semibold transition-colors border-b-2 ${activeTab === 'instructors'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Instructors ({course?.instructor?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('materials')}
                            className={`px-4 py-3 font-semibold transition-colors border-b-2 ${activeTab === 'materials'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Materials ({course?.materials?.length || 0})
                        </button>
                    </div>
                </div>

                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Basic Information</h2>
                        <form onSubmit={handleSaveBasicInfo} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Course Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleBasicInfoChange}
                                    className="input w-full"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleBasicInfoChange}
                                    rows="6"
                                    className="input w-full"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price ($) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleBasicInfoChange}
                                    min="0"
                                    step="0.01"
                                    className="input w-full"
                                    required
                                />
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm text-yellow-800">
                                    ⚠️ Note: Updating course details will reset status to "pending" and require admin re-approval.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="btn btn-primary"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Instructors Tab */}
                {activeTab === 'instructors' && (
                    <div className="space-y-6">
                        {/* Current Instructors */}
                        <div className="card">
                            <h2 className="text-xl font-bold mb-4">Current Instructors</h2>
                            <div className="space-y-3">
                                {course?.instructor?.map((inst) => (
                                    <div key={inst._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                {inst.profilePicture ? (
                                                    <img
                                                        src={inst.profilePicture}
                                                        alt={inst.fullName}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-blue-600 font-semibold">
                                                        {inst.fullName?.charAt(0) || inst.username?.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{inst.fullName || inst.username}</p>
                                                <p className="text-sm text-gray-600">{inst.email}</p>
                                            </div>
                                        </div>
                                        {course.instructor.length > 1 && (
                                            <button
                                                onClick={() => handleRemoveInstructor(inst._id)}
                                                className="text-red-600 hover:text-red-800 text-sm font-semibold"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add Instructor */}
                        <div className="card">
                            <h2 className="text-xl font-bold mb-4">Add Co-Instructor</h2>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by name, username, or email"
                                        className="input flex-1"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearchInstructors()}
                                    />
                                    <button
                                        onClick={handleSearchInstructors}
                                        disabled={searching}
                                        className="btn btn-primary"
                                    >
                                        {searching ? 'Searching...' : 'Search'}
                                    </button>
                                </div>

                                {searchResults.length > 0 && (
                                    <div className="space-y-2">
                                        {searchResults.map((instructor) => {
                                            const isAlreadyAdded = course?.instructor?.some(
                                                (inst) => inst._id === instructor._id
                                            );
                                            return (
                                                <div
                                                    key={instructor._id}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            {instructor.profilePicture ? (
                                                                <img
                                                                    src={instructor.profilePicture}
                                                                    alt={instructor.fullName}
                                                                    className="w-10 h-10 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-blue-600 font-semibold">
                                                                    {instructor.fullName?.charAt(0) ||
                                                                        instructor.username?.charAt(0)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">
                                                                {instructor.fullName || instructor.username}
                                                            </p>
                                                            <p className="text-sm text-gray-600">{instructor.email}</p>
                                                        </div>
                                                    </div>
                                                    {isAlreadyAdded ? (
                                                        <span className="text-sm text-gray-500">Already added</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAddInstructor(instructor._id)}
                                                            className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white"
                                                        >
                                                            Add
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Materials Tab */}
                {activeTab === 'materials' && (
                    <div className="space-y-6">
                        {/* Add Material Button */}
                        <div className="card">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Course Materials</h2>
                                <button
                                    onClick={() => setShowMaterialForm(!showMaterialForm)}
                                    className="btn btn-primary"
                                >
                                    {showMaterialForm ? 'Cancel' : '+ Add Material'}
                                </button>
                            </div>

                            {/* Material Form */}
                            {showMaterialForm && (
                                <form onSubmit={handleAddMaterial} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Material Title *
                                            </label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={materialForm.title}
                                                onChange={handleMaterialFormChange}
                                                className="input w-full"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Type *
                                            </label>
                                            <select
                                                name="type"
                                                value={materialForm.type}
                                                onChange={handleMaterialFormChange}
                                                className="input w-full"
                                                required
                                            >
                                                <option value="video">Video</option>
                                                <option value="Document">Document (PDF)</option>
                                                <option value="link">Link</option>
                                                <option value="quiz">Quiz</option>
                                            </select>
                                        </div>

                                        {/* VIDEO: Only title + video file/URL */}
                                        {materialForm.type === 'video' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Upload Video File or Enter Video URL *
                                                </label>
                                                <input
                                                    key={fileInputKey}
                                                    type="file"
                                                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska"
                                                    onChange={(e) => handleFileUpload(e, 'videoFile')}
                                                    className="input w-full mb-2"
                                                />
                                                <input
                                                    type="url"
                                                    name="url"
                                                    value={materialForm.url}
                                                    onChange={handleMaterialFormChange}
                                                    className="input w-full"
                                                    placeholder="Or paste video URL (YouTube, Vimeo, etc.)"
                                                />
                                                {materialForm.videoFile && (
                                                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                                        <p className="text-xs text-green-700 font-semibold">✓ Video file uploaded</p>
                                                        <p className="text-xs text-gray-600 mt-1 break-all">{materialForm.videoFile}</p>
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">Upload a video file OR paste a video URL</p>
                                            </div>
                                        )}

                                        {/* DOCUMENT: Only title + PDF file/URL */}
                                        {materialForm.type === 'Document' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Upload PDF File or Enter PDF URL *
                                                </label>
                                                <input
                                                    key={fileInputKey}
                                                    type="file"
                                                    accept="application/pdf,.pdf"
                                                    onChange={(e) => handleFileUpload(e, 'documentFile')}
                                                    className="input w-full mb-2"
                                                />
                                                <input
                                                    type="url"
                                                    name="url"
                                                    value={materialForm.url}
                                                    onChange={handleMaterialFormChange}
                                                    className="input w-full"
                                                    placeholder="Or paste PDF URL (must end with .pdf)"
                                                />
                                                {materialForm.documentFile && (
                                                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                                        <p className="text-xs text-green-700 font-semibold">✓ PDF file uploaded</p>
                                                        <p className="text-xs text-gray-600 mt-1 break-all">{materialForm.documentFile}</p>
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">Upload a PDF file OR paste a PDF URL</p>
                                            </div>
                                        )}

                                        {/* LINK: Only title + URL */}
                                        {materialForm.type === 'link' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    URL/Link *
                                                </label>
                                                <input
                                                    type="url"
                                                    name="url"
                                                    value={materialForm.url}
                                                    onChange={handleMaterialFormChange}
                                                    className="input w-full"
                                                    placeholder="https://example.com"
                                                    required
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Enter the external link URL</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quiz Questions Builder - EXACTLY ONE QUESTION */}
                                    {materialForm.type === 'quiz' && (
                                        <div className="space-y-4 mt-4 p-4 bg-white rounded-lg border-2 border-blue-200">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-lg">Quiz Question (One MCQ Only)</h3>
                                                <span className="text-sm text-gray-600 bg-yellow-100 px-3 py-1 rounded-full">
                                                    ⚠️ Exactly 1 question with 4 options
                                                </span>
                                            </div>

                                            {materialForm.quizQuestions.map((question, qIndex) => (
                                                qIndex === 0 && (
                                                    <div key={qIndex} className="p-4 bg-gray-50 rounded-lg border">
                                                        <div className="space-y-3">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Question Text *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={question.question}
                                                                    onChange={(e) => handleQuizQuestionChange(qIndex, 'question', e.target.value)}
                                                                    className="input w-full"
                                                                    placeholder="Enter your quiz question"
                                                                    required
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Options (Select the correct answer) *
                                                                </label>
                                                                {question.options.map((option, optIndex) => (
                                                                    <div key={optIndex} className="flex items-center gap-2">
                                                                        <input
                                                                            type="radio"
                                                                            name={`correct-${qIndex}`}
                                                                            checked={question.correctAnswer === optIndex}
                                                                            onChange={() => handleQuizQuestionChange(qIndex, 'correctAnswer', optIndex)}
                                                                            className="w-4 h-4"
                                                                        />
                                                                        <span className="font-semibold text-gray-600 w-8">
                                                                            {String.fromCharCode(65 + optIndex)}.
                                                                        </span>
                                                                        <input
                                                                            type="text"
                                                                            value={option}
                                                                            onChange={(e) => {
                                                                                const newOptions = [...question.options];
                                                                                newOptions[optIndex] = e.target.value;
                                                                                handleQuizQuestionChange(qIndex, 'options', newOptions);
                                                                            }}
                                                                            className="input flex-1"
                                                                            placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                                                            required
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Time Limit (seconds) *
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        value={question.timeLimit}
                                                                        onChange={(e) => handleQuizQuestionChange(qIndex, 'timeLimit', parseInt(e.target.value))}
                                                                        min="10"
                                                                        max="300"
                                                                        className="input w-full"
                                                                        required
                                                                    />
                                                                </div>
                                                                <div className="flex items-end">
                                                                    <p className="text-sm text-gray-600 bg-green-100 px-3 py-2 rounded">
                                                                        ✓ Correct Answer: <strong>Option {String.fromCharCode(65 + question.correctAnswer)}</strong>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    )}

                                    <button type="submit" className="btn btn-primary">
                                        Add Material
                                    </button>
                                </form>
                            )}

                            {/* Materials List */}
                            <div className="space-y-3">
                                {course?.materials?.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">
                                        No materials added yet. Click "Add Material" to get started.
                                    </p>
                                ) : (
                                    course?.materials?.map((material, index) => (
                                        <div
                                            key={material._id}
                                            className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex gap-4 flex-1">
                                                <img
                                                    src={material.CoursePicture || 'https://via.placeholder.com/80'}
                                                    alt={material.title}
                                                    className="w-20 h-20 object-cover rounded"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/80';
                                                    }}
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold">{index + 1}.</span>
                                                        <h4 className="font-semibold">{material.title}</h4>
                                                    </div>
                                                    <div className="flex gap-4 text-sm text-gray-600 mb-2">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                                            {material.type}
                                                        </span>
                                                        {material.duration && (
                                                            <span>⏱️ {material.duration} min</span>
                                                        )}
                                                    </div>

                                                    {/* Display video/document/link */}
                                                    {(() => {
                                                        let fileUrl = material.url || material.videoFile || material.documentFile;

                                                        // If no URL, show message
                                                        if (!fileUrl) {
                                                            return <p className="text-sm text-gray-500">No file/URL provided</p>;
                                                        }

                                                        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

                                                        // Handle different URL formats (for backward compatibility with old uploads)
                                                        if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
                                                            // Not an absolute URL - handle relative paths
                                                            if (fileUrl.startsWith('/')) {
                                                                fileUrl = `${backendUrl}${fileUrl}`;
                                                            } else if (fileUrl.startsWith('uploaded/')) {
                                                                const filename = fileUrl.replace('uploaded/', '');
                                                                fileUrl = `${backendUrl}/temp/${filename}`;
                                                            } else {
                                                                fileUrl = `${backendUrl}/temp/${fileUrl}`;
                                                            }
                                                        }
                                                        // Cloudinary URLs and other absolute URLs are used as-is

                                                        // For videos, show player
                                                        if (material.type === 'video') {
                                                            const isYouTube = fileUrl.includes('youtube.com') || fileUrl.includes('youtu.be');
                                                            const isVimeo = fileUrl.includes('vimeo.com');

                                                            if (isYouTube) {
                                                                // Extract YouTube video ID
                                                                const match = fileUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                                                                const youtubeId = match ? match[1] : null;

                                                                if (youtubeId) {
                                                                    return (
                                                                        <div className="mt-2">
                                                                            <div className="relative w-full" style={{ paddingBottom: '56.25%', maxWidth: '500px' }}>
                                                                                <iframe
                                                                                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                                                                                    src={`https://www.youtube.com/embed/${youtubeId}`}
                                                                                    title={material.title}
                                                                                    frameBorder="0"
                                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                    allowFullScreen
                                                                                ></iframe>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }
                                                            }

                                                            // For direct video files or non-YouTube URLs
                                                            return (
                                                                <div className="mt-2 space-y-2">
                                                                    <video
                                                                        controls
                                                                        className="w-full rounded-lg"
                                                                        style={{ maxWidth: '500px', maxHeight: '300px' }}
                                                                    >
                                                                        <source src={fileUrl} type="video/mp4" />
                                                                        <source src={fileUrl} type="video/webm" />
                                                                        <source src={fileUrl} type="video/ogg" />
                                                                        Your browser does not support the video tag.
                                                                    </video>
                                                                    <a
                                                                        href={fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                                                    >
                                                                        ▶️ Open in New Tab
                                                                    </a>
                                                                </div>
                                                            );
                                                        }

                                                        // For documents/PDFs
                                                        if (material.type === 'Document') {
                                                            return (
                                                                <a
                                                                    href={fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm mt-2"
                                                                >
                                                                    📄 View PDF
                                                                </a>
                                                            );
                                                        }

                                                        // For links and other types
                                                        return (
                                                            <a
                                                                href={fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm mt-2"
                                                            >
                                                                {material.type === 'link' && '🔗 Open Link'}
                                                                {material.type === 'quiz' && '📝 View Quiz'}
                                                                {!['link', 'quiz', 'video', 'Document'].includes(material.type) && '📂 Open'}
                                                            </a>
                                                        );
                                                    })()}

                                                    {(material.url || material.videoFile || material.documentFile) && (
                                                        <p className="text-xs text-gray-500 mt-2 truncate max-w-md">
                                                            URL: {material.url || material.videoFile || material.documentFile}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteMaterial(material._id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete Material"
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default EditCourse;
