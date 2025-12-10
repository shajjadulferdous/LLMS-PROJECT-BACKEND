import { useState } from 'react';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import toast from 'react-hot-toast';

const SystemSettings = () => {
    const [settings, setSettings] = useState({
        siteName: 'Learning Management System',
        siteDescription: 'Professional online learning platform',
        courseCreationFee: 5,
        minCoursePrice: 0,
        maxCoursePrice: 10000,
        enableRegistration: true,
        enableCourseCreation: true,
        requireEmailVerification: false,
        requireInstructorApproval: false,
        maintenanceMode: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = () => {
        // In a real app, this would save to backend
        toast.success('Settings saved successfully');
        console.log('Saving settings:', settings);
    };

    const handleReset = () => {
        setSettings({
            siteName: 'Learning Management System',
            siteDescription: 'Professional online learning platform',
            courseCreationFee: 5,
            minCoursePrice: 0,
            maxCoursePrice: 10000,
            enableRegistration: true,
            enableCourseCreation: true,
            requireEmailVerification: false,
            requireInstructorApproval: false,
            maintenanceMode: false,
        });
        toast.success('Settings reset to defaults');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">System Settings</h1>
                    <p className="text-gray-600">Configure platform settings and preferences</p>
                </div>

                {/* General Settings */}
                <div className="card mb-6">
                    <h2 className="text-xl font-bold mb-4">General Settings</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Site Name
                            </label>
                            <input
                                type="text"
                                name="siteName"
                                value={settings.siteName}
                                onChange={handleChange}
                                className="input w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Site Description
                            </label>
                            <textarea
                                name="siteDescription"
                                value={settings.siteDescription}
                                onChange={handleChange}
                                rows={3}
                                className="input w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Course Settings */}
                <div className="card mb-6">
                    <h2 className="text-xl font-bold mb-4">Course Settings</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Course Creation Fee (%)
                            </label>
                            <input
                                type="number"
                                name="courseCreationFee"
                                value={settings.courseCreationFee}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                className="input w-full"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Percentage charged when instructor creates a course
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Minimum Course Price ($)
                                </label>
                                <input
                                    type="number"
                                    name="minCoursePrice"
                                    value={settings.minCoursePrice}
                                    onChange={handleChange}
                                    min="0"
                                    className="input w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Maximum Course Price ($)
                                </label>
                                <input
                                    type="number"
                                    name="maxCoursePrice"
                                    value={settings.maxCoursePrice}
                                    onChange={handleChange}
                                    min="0"
                                    className="input w-full"
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="enableCourseCreation"
                                name="enableCourseCreation"
                                checked={settings.enableCourseCreation}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="enableCourseCreation" className="ml-2 text-sm text-gray-700">
                                Enable course creation by instructors
                            </label>
                        </div>
                    </div>
                </div>

                {/* User Settings */}
                <div className="card mb-6">
                    <h2 className="text-xl font-bold mb-4">User Settings</h2>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="enableRegistration"
                                name="enableRegistration"
                                checked={settings.enableRegistration}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="enableRegistration" className="ml-2 text-sm text-gray-700">
                                Enable user registration
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="requireEmailVerification"
                                name="requireEmailVerification"
                                checked={settings.requireEmailVerification}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="requireEmailVerification" className="ml-2 text-sm text-gray-700">
                                Require email verification for new users
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="requireInstructorApproval"
                                name="requireInstructorApproval"
                                checked={settings.requireInstructorApproval}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="requireInstructorApproval" className="ml-2 text-sm text-gray-700">
                                Require admin approval for instructor accounts
                            </label>
                        </div>
                    </div>
                </div>

                {/* System Maintenance */}
                <div className="card mb-6">
                    <h2 className="text-xl font-bold mb-4">System Maintenance</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div>
                                <p className="font-semibold text-yellow-900">Maintenance Mode</p>
                                <p className="text-sm text-yellow-700">
                                    Temporarily disable site access for maintenance
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="maintenanceMode"
                                    checked={settings.maintenanceMode}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => toast.success('Cache cleared successfully')}
                                className="btn bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Clear Cache
                            </button>
                            <button
                                onClick={() => toast.success('System logs exported')}
                                className="btn bg-gray-600 hover:bg-gray-700 text-white"
                            >
                                Export Logs
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="card mb-6">
                    <h2 className="text-xl font-bold mb-4">System Statistics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-3xl font-bold text-blue-600">--</p>
                            <p className="text-sm text-gray-600">Total Users</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-3xl font-bold text-green-600">--</p>
                            <p className="text-sm text-gray-600">Active Courses</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-3xl font-bold text-purple-600">--</p>
                            <p className="text-sm text-gray-600">Total Revenue</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <p className="text-3xl font-bold text-orange-600">--</p>
                            <p className="text-sm text-gray-600">Enrollments</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        className="btn btn-primary flex-1"
                    >
                        Save Settings
                    </button>
                    <button
                        onClick={handleReset}
                        className="btn bg-gray-300 hover:bg-gray-400 text-gray-700"
                    >
                        Reset to Defaults
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default SystemSettings;
