import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import toast from 'react-hot-toast';

const CreateCourse = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description || formData.price === '') {
            toast.error('Please fill in all fields');
            return;
        }

        const price = parseFloat(formData.price);
        if (isNaN(price) || price < 0) {
            toast.error('Please enter a valid price');
            return;
        }

        try {
            setLoading(true);
            await courseService.createCourse({
                title: formData.title,
                description: formData.description,
                price: price
            });
            toast.success('Course created successfully! Pending admin approval.');
            navigate('/instructor/courses');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
                    <p className="mt-2 text-gray-600">
                        Create a new course for students. Note: A small creation fee (5% of course price) will be charged.
                    </p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Course Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter course title"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Course Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="6"
                                className="input-field"
                                placeholder="Describe your course in detail"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                Course Price (USD) *
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                required
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Set to 0 for a free course. A 5% creation fee will be charged.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex-1"
                            >
                                {loading ? 'Creating...' : 'Create Course'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/instructor/courses')}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CreateCourse;
