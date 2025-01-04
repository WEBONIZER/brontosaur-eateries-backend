import { Router } from 'express';
import {
    saveAndSendEmail,
} from '../controllers/forms-controller';
import {authUsersMiddleware} from '../middlewares/users-auth-middlewares'

export const formsRouter = Router();

formsRouter.post('/establishment-not-found', authUsersMiddleware, saveAndSendEmail);