import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, TrendingUp, ArrowRight } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';

const LandingPage = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-600 to-blue-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-5xl font-bold mb-6">
                                Learn Without Limits
                            </h1>
                            <p className="text-xl mb-8 text-blue-100">
                                Access thousands of courses from expert instructors. Start learning today with
                                our integrated payment system and earn certificates.
                            </p>
                            <div className="flex space-x-4">
                                <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                                    Get Started
                                </Link>
                                <Link to="/student/courses" className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
                                    Browse Courses
                                </Link>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <GraduationCap className="h-96 w-96 mx-auto opacity-20" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Why Choose Our Platform?
                        </h2>
                        <p className="text-xl text-gray-600">
                            Everything you need to succeed in your learning journey
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-8 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all">
                            <BookOpen className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Quality Courses</h3>
                            <p className="text-gray-600">
                                Access hundreds of high-quality courses taught by experienced instructors
                            </p>
                        </div>

                        <div className="text-center p-8 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all">
                            <Users className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Expert Instructors</h3>
                            <p className="text-gray-600">
                                Learn from industry professionals and subject matter experts
                            </p>
                        </div>

                        <div className="text-center p-8 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all">
                            <TrendingUp className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Track Progress</h3>
                            <p className="text-gray-600">
                                Monitor your learning progress and earn certificates upon completion
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-primary-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6">
                        Ready to Start Learning?
                    </h2>
                    <p className="text-xl mb-8 text-blue-100">
                        Join thousands of students already learning on our platform
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                        <span>Create Free Account</span>
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-primary-600 mb-2">10,000+</div>
                            <div className="text-gray-600">Active Students</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
                            <div className="text-gray-600">Expert Instructors</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-primary-600 mb-2">1,000+</div>
                            <div className="text-gray-600">Courses Available</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-primary-600 mb-2">98%</div>
                            <div className="text-gray-600">Satisfaction Rate</div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
