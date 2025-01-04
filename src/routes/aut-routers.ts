import { Router } from 'express';
import {
    register,
    passwordRecovery,
    login,
    getMe,
    updateUser,
    updateEmail,
    confirmedPhoneReplace,
    confirmedEmailReplace,
    addOrderToUser,
    addFavourite,
    removeFavourite,
    getAllUsers,
    getUserById,
    findUsersByPartialPhoneNumber,
    createNewUser,
    updatePhone,
} from '../controllers/user-controller';
import checkAuth from '../utils/check-auth'
import {
    loginValidation,
    registerValidation,
    fullNameValidation,
    emailValidation,
    avatarUrlValidation,
    phoneValidation,
} from '../utils/utils'
import { handleValidationErrors } from '../utils/handle-validation-errors'
import { authUsersMiddleware } from '../middlewares/users-auth-middlewares';

export const autRouter = Router();

autRouter.post('/login', loginValidation, authUsersMiddleware, handleValidationErrors, login);
autRouter.post('/register', registerValidation, authUsersMiddleware, handleValidationErrors, register);
autRouter.post('/password-recovery', authUsersMiddleware, passwordRecovery);
autRouter.get('/me', checkAuth, authUsersMiddleware, getMe)
autRouter.patch('/me/user', checkAuth, authUsersMiddleware, updateUser);
autRouter.patch('/me/email', checkAuth, authUsersMiddleware, emailValidation, updateEmail);
autRouter.patch('/me/phone', checkAuth, authUsersMiddleware, phoneValidation, updatePhone);
autRouter.patch('/me/confirmed-phone', authUsersMiddleware, checkAuth, confirmedPhoneReplace);
autRouter.patch('/me/confirmed-email', authUsersMiddleware, checkAuth, confirmedEmailReplace);
autRouter.post('/me/add-order', authUsersMiddleware, checkAuth, addOrderToUser);

autRouter.patch('/me/favourite/add', authUsersMiddleware, checkAuth, addFavourite);
autRouter.patch('/me/favourite/remove', authUsersMiddleware, checkAuth, removeFavourite);

autRouter.get('/user/:id', authUsersMiddleware, checkAuth, getUserById);
autRouter.get('/users/search', authUsersMiddleware, findUsersByPartialPhoneNumber);

autRouter.get('/users', authUsersMiddleware, checkAuth, getAllUsers);
autRouter.post('/create-new-user', authUsersMiddleware, createNewUser);
