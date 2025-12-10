import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

// CORS configuration - allow specific origin or all origins for development
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // In development, allow all origins
        if (process.env.CORS_ORIGIN === '*') {
            return callback(null, true);
        }

        // Otherwise check against allowed origins
        const allowedOrigins = process.env.CORS_ORIGIN.split(',');
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow anyway for development
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));


app.use(express.json({ limit: "16kb" }))

app.use(express.urlencoded({ extended: true }))

// Serve static files from public directory
app.use(express.static('public'))

app.use(cookieParser())

import userRouter from './routes/user.routes.js'
import courseRouter from './routes/course.routes.js'
import bankRouter from './routes/bank.routes.js'
import enrollRouter from './routes/enroll.routes.js'
import { globalErrorHandler, notFound } from './middlewares/error.middlewares.js'

app.use('/api/v1/users', userRouter)
app.use('/api/v1/courses', courseRouter)
app.use('/api/v1/bank', bankRouter)
app.use('/api/v1/enroll', enrollRouter)

// fallbacks
app.use(notFound)
app.use(globalErrorHandler)



export { app } 