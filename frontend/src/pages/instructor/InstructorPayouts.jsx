import { useState, useEffect } from 'react';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { bankService } from '../../services/bankService';
import { courseService } from '../../services/courseService';
import { enrollService } from '../../services/enrollService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const InstructorPayouts = () => {
    const { user } = useAuth();
    const [bankAccount, setBankAccount] = useState(null);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawPassword, setWithdrawPassword] = useState('');
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [stats, setStats] = useState({
        totalEarnings: 0,
        availableBalance: 0,
        totalStudents: 0,
        totalCourses: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch bank account
            let bankData = null;
            try {
                const bankResponse = await bankService.getAccount();
                bankData = bankResponse.data?.data || bankResponse.data;
                console.log('Bank data:', bankData);
                setBankAccount(bankData);
            } catch (err) {
                console.log('No bank account found:', err);
            }

            // Fetch instructor's courses
            let myCourses = [];
            try {
                const coursesResponse = await courseService.getAllCourses({ limit: 100 });
                console.log('Courses response:', coursesResponse);

                // Handle paginated response structure
                const allCourses = Array.isArray(coursesResponse.data)
                    ? coursesResponse.data
                    : (coursesResponse.data?.items || coursesResponse.data?.data || []);

                console.log('All courses:', allCourses);

                // Filter courses where current user is instructor
                myCourses = allCourses.filter(course => {
                    const instructorIds = course.instructor?.map(inst =>
                        typeof inst === 'string' ? inst : inst._id
                    ) || [];
                    return instructorIds.includes(user?._id);
                });

                console.log('My courses:', myCourses);
                setCourses(myCourses);
            } catch (err) {
                console.error('Error fetching courses:', err);
            }

            // Calculate stats
            const totalEarnings = bankData?.history?.reduce((sum, entry) => {
                if (entry.startsWith('ENROLLMENT:')) {
                    const amount = parseFloat(entry.split(':')[1]);
                    return sum + amount;
                }
                return sum;
            }, 0) || 0;

            setStats({
                totalEarnings: totalEarnings,
                availableBalance: bankData?.balance || 0,
                totalStudents: 0, // This would need enrollment data
                totalCourses: myCourses.length
            });

        } catch (error) {
            console.error('Error fetching payout data:', error);
            toast.error('Failed to load payout data');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();

        const amount = parseFloat(withdrawAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (amount > bankAccount?.balance) {
            toast.error('Insufficient balance');
            return;
        }

        if (!withdrawPassword) {
            toast.error('Please enter your bank password');
            return;
        }

        try {
            await bankService.withdraw(amount, withdrawPassword);
            toast.success(`Successfully withdrew $${amount}`);
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            setWithdrawPassword('');
            fetchData();
        } catch (error) {
            console.error('Error withdrawing funds:', error);
            toast.error(error.response?.data?.message || 'Failed to withdraw funds');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const parseHistoryEntry = (entry) => {
        if (entry.startsWith('ENROLLMENT:')) {
            const amount = entry.split(':')[1];
            return { type: 'Enrollment', amount: `+$${amount}`, color: 'text-green-600' };
        } else if (entry.startsWith('COURSE_CREATE_FEE:')) {
            const amount = entry.split(':')[1];
            return { type: 'Course Creation Fee', amount: `-$${amount}`, color: 'text-red-600' };
        } else if (entry.startsWith('WITHDRAW:')) {
            const amount = entry.split(':')[1];
            return { type: 'Withdrawal', amount: `-$${amount}`, color: 'text-red-600' };
        } else if (entry.startsWith('DEPOSIT:')) {
            const amount = entry.split(':')[1];
            return { type: 'Deposit', amount: `+$${amount}`, color: 'text-green-600' };
        }
        return { type: 'Other', amount: entry, color: 'text-gray-600' };
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full border-blue-600 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading payout data...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!bankAccount) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
                    <h1 className="text-3xl font-bold mb-6">Payouts & Earnings</h1>
                    <div className="card text-center py-12">
                        <svg className="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <h3 className="text-xl font-semibold mb-2">No Bank Account</h3>
                        <p className="text-gray-600 mb-4">You need to set up a bank account to receive payouts</p>
                        <a href="/instructor/bank-setup" className="btn btn-primary">
                            Set Up Bank Account
                        </a>
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
                    <h1 className="text-3xl font-bold mb-2">Payouts & Earnings</h1>
                    <p className="text-gray-600">Manage your earnings and withdrawals</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Available Balance</p>
                                <h3 className="text-3xl font-bold">${bankAccount.balance.toFixed(2)}</h3>
                                <p className="text-green-100 text-xs mt-1">Ready to withdraw</p>
                            </div>
                            <svg className="w-12 h-12 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Total Earnings</p>
                                <h3 className="text-3xl font-bold">${stats.totalEarnings.toFixed(2)}</h3>
                                <p className="text-blue-100 text-xs mt-1">All time</p>
                            </div>
                            <svg className="w-12 h-12 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Active Courses</p>
                                <h3 className="text-3xl font-bold">{courses.length}</h3>
                                <p className="text-purple-100 text-xs mt-1">Published courses</p>
                            </div>
                            <svg className="w-12 h-12 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                            </svg>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">Account Number</p>
                                <h3 className="text-2xl font-bold">{bankAccount.accountNo}</h3>
                                <p className="text-orange-100 text-xs mt-1">Bank account</p>
                            </div>
                            <svg className="w-12 h-12 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Transaction History */}
                    <div className="lg:col-span-2">
                        <div className="card">
                            <h2 className="text-xl font-bold mb-4">Transaction History</h2>
                            {bankAccount.history && bankAccount.history.length > 0 ? (
                                <div className="space-y-3">
                                    {bankAccount.history.slice().reverse().map((entry, index) => {
                                        const parsed = parseHistoryEntry(entry);
                                        return (
                                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-semibold">{parsed.type}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Transaction #{bankAccount.history.length - index}
                                                    </p>
                                                </div>
                                                <span className={`font-bold text-lg ${parsed.color}`}>
                                                    {parsed.amount}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No transactions yet</p>
                            )}
                        </div>
                    </div>

                    {/* Withdraw Section */}
                    <div className="space-y-6">
                        <div className="card">
                            <h2 className="text-xl font-bold mb-4">Withdraw Funds</h2>
                            <p className="text-gray-600 mb-4">
                                Available: <span className="font-bold text-green-600">${bankAccount.balance.toFixed(2)}</span>
                            </p>
                            <button
                                onClick={() => setShowWithdrawModal(true)}
                                disabled={bankAccount.balance <= 0}
                                className={`btn w-full ${bankAccount.balance > 0
                                    ? 'btn-primary'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Withdraw Money
                            </button>
                        </div>

                        <div className="card">
                            <h2 className="text-xl font-bold mb-4">Your Courses</h2>
                            {courses.length > 0 ? (
                                <div className="space-y-2">
                                    {courses.map(course => (
                                        <div key={course._id} className="p-3 bg-gray-50 rounded-lg">
                                            <p className="font-semibold text-sm">{course.title}</p>
                                            <p className="text-xs text-gray-600">${course.price}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No courses yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Withdraw Modal */}
                {showWithdrawModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold mb-4">Withdraw Funds</h3>
                            <form onSubmit={handleWithdraw} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Amount ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        step="0.01"
                                        min="0.01"
                                        max={bankAccount.balance}
                                        className="input w-full"
                                        placeholder="Enter amount"
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Maximum: ${bankAccount.balance.toFixed(2)}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bank Password
                                    </label>
                                    <input
                                        type="password"
                                        value={withdrawPassword}
                                        onChange={(e) => setWithdrawPassword(e.target.value)}
                                        className="input w-full"
                                        placeholder="Enter bank password"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="btn btn-primary flex-1"
                                    >
                                        Confirm Withdrawal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowWithdrawModal(false);
                                            setWithdrawAmount('');
                                            setWithdrawPassword('');
                                        }}
                                        className="btn bg-gray-300 hover:bg-gray-400 text-gray-700"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default InstructorPayouts;
