import { useState, useEffect } from 'react';
import { bankService } from '../../services/bankService';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import Loading from '../../components/shared/Loading';
import Modal from '../../components/shared/Modal';
import { DollarSign, CreditCard, TrendingUp, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const BankSetup = () => {
    const [loading, setLoading] = useState(true);
    const [bankAccount, setBankAccount] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [createForm, setCreateForm] = useState({
        accountNo: '',
        password: '',
        confirmPassword: '',
        initialDeposit: 1000,
    });

    const [transactionForm, setTransactionForm] = useState({
        amount: '',
        password: '',
    });

    useEffect(() => {
        fetchBankAccount();
    }, []);

    const fetchBankAccount = async () => {
        try {
            setLoading(true);
            const response = await bankService.getAccount();
            setBankAccount(response.data);
        } catch (error) {
            // Account doesn't exist yet
            setBankAccount(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccount = async (e) => {
        e.preventDefault();

        if (createForm.password !== createForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (createForm.password.length < 4) {
            toast.error('PIN must be at least 4 characters');
            return;
        }

        try {
            // Create account
            const response = await bankService.createAccount({
                accountNo: createForm.accountNo,
                password: createForm.password,
            });

            // If initial deposit is specified, deposit it
            if (createForm.initialDeposit > 0) {
                try {
                    const depositResponse = await bankService.deposit(createForm.initialDeposit);
                    setBankAccount(depositResponse.data);
                } catch (depositError) {
                    console.error('Initial deposit failed:', depositError);
                    setBankAccount(response.data);
                }
            } else {
                setBankAccount(response.data);
            }

            setShowCreateModal(false);
            toast.success('Bank account created successfully!');

            // Reset form
            setCreateForm({
                accountNo: '',
                password: '',
                confirmPassword: '',
                initialDeposit: 1000,
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create account');
        }
    };

    const handleDeposit = async (e) => {
        e.preventDefault();

        try {
            const response = await bankService.deposit(
                parseFloat(transactionForm.amount)
            );

            setBankAccount(response.data);
            setShowDepositModal(false);
            toast.success('Deposit successful!');

            setTransactionForm({ amount: '', password: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Deposit failed');
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();

        try {
            const response = await bankService.withdraw(
                parseFloat(transactionForm.amount),
                transactionForm.password
            );

            setBankAccount(response.data);
            setShowWithdrawModal(false);
            toast.success('Withdrawal successful!');

            setTransactionForm({ amount: '', password: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Withdrawal failed');
        }
    };

    if (loading) {
        return <Loading fullScreen />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Bank Account</h1>
                    <p className="text-gray-600">Manage your account and transactions</p>
                </div>

                {bankAccount ? (
                    <>
                        {/* Balance Card */}
                        <div className="card mb-8 bg-gradient-to-r from-primary-600 to-blue-600 text-white">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-blue-100 text-sm mb-2">Available Balance</p>
                                    <p className="text-5xl font-bold">${bankAccount.balance?.toFixed(2)}</p>
                                </div>
                                <DollarSign className="h-24 w-24 opacity-20" />
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-blue-400">
                                <div>
                                    <p className="text-blue-100 text-sm">Account Number</p>
                                    <p className="text-xl font-semibold">{bankAccount.accountNo}</p>
                                </div>
                                <CreditCard className="h-12 w-12 opacity-50" />
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <button
                                onClick={() => setShowDepositModal(true)}
                                className="card hover:shadow-xl transition-shadow text-left group"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="bg-green-100 p-4 rounded-lg group-hover:bg-green-200 transition-colors">
                                        <TrendingUp className="h-8 w-8 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">Deposit Funds</h3>
                                        <p className="text-gray-600 text-sm">Add money to your account</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setShowWithdrawModal(true)}
                                className="card hover:shadow-xl transition-shadow text-left group"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="bg-red-100 p-4 rounded-lg group-hover:bg-red-200 transition-colors">
                                        <DollarSign className="h-8 w-8 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">Withdraw Funds</h3>
                                        <p className="text-gray-600 text-sm">Transfer money out</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Transaction History */}
                        <div className="card">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Transaction History</h2>
                            {bankAccount.history && bankAccount.history.length > 0 ? (
                                <div className="space-y-3">
                                    {bankAccount.history.slice(0, 10).map((transaction, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm text-gray-700">{transaction}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 text-center py-8">No transactions yet</p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="card text-center py-12">
                        <CreditCard className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            No Bank Account Found
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Create a bank account to start purchasing courses
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary"
                        >
                            Create Bank Account
                        </button>
                    </div>
                )}
            </main>

            {/* Create Account Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create Bank Account"
            >
                <form onSubmit={handleCreateAccount} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Number
                        </label>
                        <input
                            type="text"
                            value={createForm.accountNo}
                            onChange={(e) => setCreateForm({ ...createForm, accountNo: e.target.value })}
                            placeholder="Enter account number (e.g., 1234567890)"
                            className="input-field"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            PIN (Password)
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={createForm.password}
                                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                placeholder="Enter 4-digit PIN"
                                className="input-field"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm PIN
                        </label>
                        <input
                            type="password"
                            value={createForm.confirmPassword}
                            onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                            placeholder="Confirm PIN"
                            className="input-field"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Initial Deposit (USD)
                        </label>
                        <input
                            type="number"
                            value={createForm.initialDeposit}
                            onChange={(e) => setCreateForm({ ...createForm, initialDeposit: parseFloat(e.target.value) })}
                            placeholder="1000"
                            min="0"
                            step="0.01"
                            className="input-field"
                            required
                        />
                    </div>

                    <button type="submit" className="w-full btn-primary">
                        Create Account
                    </button>
                </form>
            </Modal>

            {/* Deposit Modal */}
            <Modal
                isOpen={showDepositModal}
                onClose={() => setShowDepositModal(false)}
                title="Deposit Funds"
            >
                <form onSubmit={handleDeposit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount (USD)
                        </label>
                        <input
                            type="number"
                            value={transactionForm.amount}
                            onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                            placeholder="Enter amount"
                            min="0.01"
                            step="0.01"
                            className="input-field"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bank PIN
                        </label>
                        <input
                            type="password"
                            value={transactionForm.password}
                            onChange={(e) => setTransactionForm({ ...transactionForm, password: e.target.value })}
                            placeholder="Enter your PIN"
                            className="input-field"
                            required
                        />
                    </div>

                    <button type="submit" className="w-full btn-primary">
                        Deposit
                    </button>
                </form>
            </Modal>

            {/* Withdraw Modal */}
            <Modal
                isOpen={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                title="Withdraw Funds"
            >
                <form onSubmit={handleWithdraw} className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-yellow-800 text-sm">
                            Available Balance: <span className="font-bold">${bankAccount?.balance?.toFixed(2)}</span>
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount (USD)
                        </label>
                        <input
                            type="number"
                            value={transactionForm.amount}
                            onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                            placeholder="Enter amount"
                            min="0.01"
                            max={bankAccount?.balance || 0}
                            step="0.01"
                            className="input-field"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bank PIN
                        </label>
                        <input
                            type="password"
                            value={transactionForm.password}
                            onChange={(e) => setTransactionForm({ ...transactionForm, password: e.target.value })}
                            placeholder="Enter your PIN"
                            className="input-field"
                            required
                        />
                    </div>

                    <button type="submit" className="w-full btn-primary">
                        Withdraw
                    </button>
                </form>
            </Modal>

            <Footer />
        </div>
    );
};

export default BankSetup;
