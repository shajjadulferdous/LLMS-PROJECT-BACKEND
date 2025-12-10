import { useState, useEffect } from 'react';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, student, instructor, blocked
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllUsers({ limit: 1000 });
            console.log('Users response:', response);

            // Backend returns { users: [...], total, page, pages }
            const usersData = response.data?.users || [];

            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async (userId) => {
        try {
            await adminService.blockUser(userId);
            toast.success('User blocked successfully');
            fetchUsers();
        } catch (error) {
            console.error('Error blocking user:', error);
            toast.error(error.response?.data?.message || 'Failed to block user');
        }
    };

    const handleUnblockUser = async (userId) => {
        try {
            await adminService.unblockUser(userId);
            toast.success('User unblocked successfully');
            fetchUsers();
        } catch (error) {
            console.error('Error unblocking user:', error);
            toast.error(error.response?.data?.message || 'Failed to unblock user');
        }
    };

    const handleApproveInstructor = async (userId) => {
        try {
            await adminService.approveInstructor(userId);
            toast.success('Instructor approved successfully');
            fetchUsers();
        } catch (error) {
            console.error('Error approving instructor:', error);
            toast.error(error.response?.data?.message || 'Failed to approve instructor');
        }
    };

    const filteredUsers = users.filter(user => {
        // Apply role filter
        if (filter === 'student' && user.role !== 'student') return false;
        if (filter === 'instructor' && user.role !== 'instructor') return false;
        if (filter === 'blocked' && !user.isBlocked) return false;

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                user.username?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query) ||
                user.fullName?.toLowerCase().includes(query)
            );
        }

        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full border-blue-600 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading users...</p>
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
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">User Management</h1>
                    <p className="text-gray-600">Manage users, roles, and permissions</p>
                </div>

                {/* Filters and Search */}
                <div className="card mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                All ({users.length})
                            </button>
                            <button
                                onClick={() => setFilter('student')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'student'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Students ({users.filter(u => u.role === 'student').length})
                            </button>
                            <button
                                onClick={() => setFilter('instructor')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'instructor'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Instructors ({users.filter(u => u.role === 'instructor').length})
                            </button>
                            <button
                                onClick={() => setFilter('blocked')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'blocked'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Blocked ({users.filter(u => u.isBlocked).length})
                            </button>
                        </div>

                        <div className="w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input w-full md:w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="card overflow-hidden">
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No users found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        {user.profilePicture ? (
                                                            <img
                                                                src={user.profilePicture}
                                                                alt={user.fullName}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-blue-600 font-semibold">
                                                                {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.fullName || user.username}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            @{user.username}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                    user.role === 'instructor' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.isBlocked ? (
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        Blocked
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    {user.role !== 'admin' && (
                                                        <>
                                                            {user.isBlocked ? (
                                                                <button
                                                                    onClick={() => handleUnblockUser(user._id)}
                                                                    className="text-green-600 hover:text-green-900"
                                                                    title="Unblock User"
                                                                >
                                                                    Unblock
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleBlockUser(user._id)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                    title="Block User"
                                                                >
                                                                    Block
                                                                </button>
                                                            )}
                                                            {user.role === 'instructor' && (
                                                                <button
                                                                    onClick={() => handleApproveInstructor(user._id)}
                                                                    className="text-blue-600 hover:text-blue-900"
                                                                    title="Approve Instructor"
                                                                >
                                                                    Approve
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
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

export default UserManagement;
