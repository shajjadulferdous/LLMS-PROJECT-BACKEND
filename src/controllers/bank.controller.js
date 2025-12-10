import { Bank } from "../models/bank.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Course } from "../models/course.model.js"
// export const createAccount = asyncHandler(async (req, res) => {
//     const { accountNo, password } = req.body;
//     if (!accountNo || !password) throw new ApiError(400, "accountNo and password required");
//     const existing = await Bank.findOne({ accountNo });
//     if (existing) throw new ApiError(409, "Account already exists");
//     const bank = await Bank.create({ user: req.user._id, accountNo, password });
//     // link user.balance to bank._id if using ref
//     await User.findByIdAndUpdate(req.user._id, { $set: { balance: bank._id } }, { new: true });
//     return res.status(201).json(new ApiResponse(201, bank, "Bank account created"));
// });

// export const deposit = asyncHandler(async (req, res) => {
//     const { amount } = req.body;
//     if (!amount || amount <= 0) throw new ApiError(400, "Invalid amount");
//     const bank = await Bank.findOne({ user: req.user._id });
//     if (!bank) throw new ApiError(404, "Bank account not found");
//     bank.balance += Number(amount);
//     bank.history.push(`DEPOSIT:${amount}`);
//     await bank.save();
//     return res.status(200).json(new ApiResponse(200, bank, "Deposit successful"));
// });

// export const withdraw = asyncHandler(async (req, res) => {
//     const { amount, password } = req.body;
//     if (!amount || amount <= 0) throw new ApiError(400, "Invalid amount");
//     const bank = await Bank.findOne({ user: req.user._id });
//     if (!bank) throw new ApiError(404, "Bank account not found");
//     const ok = await bank.isPasswordCorrect(password || "");
//     if (!ok) throw new ApiError(401, "Bank password incorrect");
//     if (bank.balance < amount) throw new ApiError(400, "Insufficient funds");
//     bank.balance -= Number(amount);
//     bank.history.push(`WITHDRAW:${amount}`);
//     await bank.save();
//     return res.status(200).json(new ApiResponse(200, bank, "Withdraw successful"));
// });

// export const getAccount = asyncHandler(async (req, res) => {
//     const bank = await Bank.findOne({ user: req.user._id }).select("-password");
//     if (!bank) throw new ApiError(404, "Bank account not found");
//     return res.status(200).json(new ApiResponse(200, bank));
// });

const createBankAccount = asyncHandler(async (req, res) => {
    const { accountNo, password } = req.body;
    if (!accountNo || !password) {
        throw new ApiError(400, "accountNo and password required")
    }
    const existAccount = await Bank.findOne({ accountNo });
    if (existAccount) {
        throw new ApiError(409, "Bank Account Already exist")
    }
    const user = await Bank.create(
        {
            user: req.user._id,
            accountNo,
            password
        }
    )
    if (!user) {
        throw new ApiError(400, "SOmething is wrong when account created")
    }
    return res.status(200)
        .json(new ApiResponse(200, user, "bank account create successfully"))
})

const addBalance = asyncHandler(async (req, res) => {
    const { ammount, accountNo, password } = req.body;
    if (ammount < 10) {
        throw new ApiError(400, "valid ammount required")
    }
    if (!accountNo || !password) {
        throw new ApiError(400, "accountNo and password required")
    }
    const BankAccount = await Bank.findOne(
        {
            accountNo
        })
    if (!BankAccount) {
        throw new ApiError(400, "Account not found")
    }
    const isPasswordValid = await BankAccount.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(400, "Password is Wrong")
    }
    BankAccount.balance = BankAccount.balance + Number(ammount);
    BankAccount.history.push(`Deposit${ammount}`)
    await BankAccount.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, BankAccount, "Deposit successful"));
})

const createAccount = asyncHandler(async (req, res) => {
    const { accountNo, password } = req.body;
    if (!accountNo || !password) throw new ApiError(400, "accountNo and password required");
    const existing = await Bank.findOne({ accountNo });
    if (existing) throw new ApiError(409, "Account already exists");
    const bank = await Bank.create({ user: req.user._id, accountNo, password });
    await User.findByIdAndUpdate(req.user._id, { $set: { balance: bank._id } }, { new: true });
    return res.status(201).json(new ApiResponse(201, bank, "Bank account created"));
});

const deposit = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) throw new ApiError(400, "Invalid amount");
    const bank = await Bank.findOne({ user: req.user._id });
    if (!bank) throw new ApiError(404, "Bank account not found");
    bank.balance += Number(amount);
    bank.history.push(`DEPOSIT:${amount}`);
    await bank.save();
    return res.status(200).json(new ApiResponse(200, bank, "Deposit successful"));
});

const withdraw = asyncHandler(async (req, res) => {
    const { amount, password } = req.body;
    if (!amount || amount <= 0) throw new ApiError(400, "Invalid amount");
    const bank = await Bank.findOne({ user: req.user._id });
    if (!bank) throw new ApiError(404, "Bank account not found");
    const ok = await bank.isPasswordCorrect(password || "");
    if (!ok) throw new ApiError(401, "Bank password incorrect");
    if (bank.balance < amount) throw new ApiError(400, "Insufficient funds");
    bank.balance -= Number(amount);
    bank.history.push(`WITHDRAW:${amount}`);
    await bank.save();
    return res.status(200).json(new ApiResponse(200, bank, "Withdraw successful"));
});

const getAccount = asyncHandler(async (req, res) => {
    const bank = await Bank.findOne({ user: req.user._id }).select("-password");
    if (!bank) throw new ApiError(404, "Bank account not found");
    return res.status(200).json(new ApiResponse(200, bank));
});

export {
    createBankAccount,
    addBalance,
    createAccount,
    deposit,
    withdraw,
    getAccount
};