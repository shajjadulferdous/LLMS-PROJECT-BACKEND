import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const navigate = useNavigate();
    const { login, user, isAuthenticated } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            console.log('User already authenticated, redirecting...');
            const role = user.role || 'student';
            if (role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else if (role === 'instructor') {
                navigate('/instructor/dashboard', { replace: true });
            } else {
                navigate('/student/dashboard', { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('Submitting login form...');
            const response = await login(formData);
            console.log('Login successful, response:', response);

            // Redirect based on role
            const role = response.user?.role || 'student';
            console.log('User role:', role);

            if (role === 'admin') {
                console.log('Navigating to admin dashboard');
                navigate('/admin/dashboard', { replace: true });
            } else if (role === 'instructor') {
                console.log('Navigating to instructor dashboard');
                navigate('/instructor/dashboard', { replace: true });
            } else {
                console.log('Navigating to student dashboard');
                navigate('/student/dashboard', { replace: true });
            }
        } catch (error) {
            console.error('Login error:', error);
            // Error toast already shown in AuthContext
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl">
                <div>
                    <div className="flex justify-center">
                        <GraduationCap className="h-16 w-16 text-primary-600" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                            create a new account
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field mt-1"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link
                                to="/forgot-password"
                                className="font-medium text-primary-600 hover:text-primary-500"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>

                    <div className="text-center text-sm text-gray-600 mt-4">
                        <p>Demo Accounts:</p>
                        <p className="text-xs">Student: student@test.com / password</p>
                        <p className="text-xs">Instructor: instructor@test.com / password</p>
                        <p className="text-xs">Admin: admin@test.com / password</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
