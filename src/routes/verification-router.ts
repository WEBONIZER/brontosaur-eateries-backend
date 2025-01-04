import { Router } from 'express';
import {
    sendCode,
    verifyCode,
    verifyEmail,
    sendVerificationCode
} from '../controllers/verification-controller';
import {authUsersMiddleware} from '../middlewares/users-auth-middlewares'

export const verificationRouter = Router();

verificationRouter.post('/send-code', authUsersMiddleware, sendCode)
verificationRouter.post('/verify-code', authUsersMiddleware, verifyCode);
verificationRouter.post('/send-email-code', authUsersMiddleware, sendVerificationCode);
verificationRouter.post('/verify-email-code', authUsersMiddleware, verifyEmail);
