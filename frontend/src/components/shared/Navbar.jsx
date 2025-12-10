import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Home, BookOpen, User, LogOut, Menu, X,
    GraduationCap, Settings, Users, DollarSign
} from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getNavLinks = () => {
        if (!isAuthenticated) {
            return [
                { to: '/', label: 'Home', icon: Home },
                { to: '/login', label: 'Login', icon: User },
                { to: '/register', label: 'Register', icon: User },
            ];
        }

        switch (user?.role) {
            case 'admin':
                return [
                    { to: '/admin/dashboard', label: 'Dashboard', icon: Home },
                    { to: '/admin/users', label: 'Users', icon: Users },
                    { to: '/admin/courses', label: 'Courses', icon: BookOpen },
                    { to: '/admin/settings', label: 'Settings', icon: Settings },
                ];
            case 'instructor':
                return [
                    { to: '/instructor/dashboard', label: 'Dashboard', icon: Home },
                    { to: '/instructor/my-courses', label: 'My Courses', icon: BookOpen },
                    { to: '/instructor/create-course', label: 'Create Course', icon: GraduationCap },
                    { to: '/instructor/all-courses', label: 'Browse Courses', icon: BookOpen },
                    { to: '/instructor/bank-setup', label: 'Bank', icon: DollarSign },
                    { to: '/instructor/payouts', label: 'Payouts', icon: DollarSign },
                ];
            default:
                return [
                    { to: '/student/dashboard', label: 'Dashboard', icon: Home },
                    { to: '/student/courses', label: 'Courses', icon: BookOpen },
                    { to: '/student/my-courses', label: 'My Courses', icon: GraduationCap },
                    { to: '/student/bank-setup', label: 'Bank', icon: DollarSign },
                ];
        }
    };

    const navLinks = getNavLinks();

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <GraduationCap className="h-8 w-8 text-primary-600" />
                            <span className="text-xl font-bold text-gray-900">LMS Platform</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.to;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}

                        {isAuthenticated && (
                            <>
                                <Link
                                    to={`/${user?.role}/profile`}
                                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    <User className="h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.to;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${isActive
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}

                        {isAuthenticated && (
                            <>
                                <Link
                                    to={`/${user?.role}/profile`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    <User className="h-5 w-5" />
                                    <span>Profile</span>
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>Logout</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
