import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import Loading from '../../components/shared/Loading';
import { Search, Filter, BookOpen, Clock, DollarSign, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseCatalog = () => {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceFilter, setPriceFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        filterAndSortCourses();
    }, [courses, searchTerm, priceFilter, sortBy]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await courseService.getAllCourses();
            console.log('Courses response:', response);
            // Backend returns { statusCode, data: { items, total, page, pages }, message }
            const coursesData = response.data?.items || response.data || [];
            console.log('Courses data:', coursesData);
            setCourses(coursesData);
        } catch (error) {
            console.error('Failed to load courses:', error);
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortCourses = () => {
        let filtered = [...courses];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(course =>
                course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Price filter
        if (priceFilter !== 'all') {
            if (priceFilter === 'free') {
                filtered = filtered.filter(course => course.price === 0);
            } else if (priceFilter === 'paid') {
                filtered = filtered.filter(course => course.price > 0);
            }
        }

        // Sort
        if (sortBy === 'price-low') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'title') {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        }

        setFilteredCourses(filtered);
    };

    if (loading) {
        return <Loading fullScreen />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Catalog</h1>
                    <p className="text-gray-600">Explore our wide range of courses</p>
                </div>

                {/* Search and Filters */}
                <div className="card mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field pl-10"
                            />
                        </div>

                        <select
                            value={priceFilter}
                            onChange={(e) => setPriceFilter(e.target.value)}
                            className="input-field"
                        >
                            <option value="all">All Prices</option>
                            <option value="free">Free</option>
                            <option value="paid">Paid</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="input-field"
                        >
                            <option value="newest">Newest First</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="title">Title (A-Z)</option>
                        </select>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        Showing {filteredCourses.length} of {courses.length} courses
                    </p>
                </div>

                {/* Courses Grid */}
                {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => (
                            <Link
                                key={course._id}
                                to={`/student/courses/${course._id}`}
                                className="card hover:shadow-xl transition-all duration-300 group"
                            >
                                <div className="relative overflow-hidden rounded-lg mb-4">
                                    <img
                                        src={course.thumbnail || 'https://via.placeholder.com/400x200'}
                                        alt={course.title}
                                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {course.price === 0 && (
                                        <span className="absolute top-2 right-2 badge-success">FREE</span>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                    {course.title}
                                </h3>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {course.description}
                                </p>

                                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                    <div className="flex items-center space-x-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{course.duration || '8'} weeks</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <BookOpen className="h-4 w-4" />
                                        <span>{course.materials?.length || 0} lessons</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="text-2xl font-bold text-primary-600">
                                        ${course.price?.toFixed(2)}
                                    </div>
                                    <span className="btn-primary text-sm">View Details</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-12">
                        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No courses found</p>
                        <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default CourseCatalog;
