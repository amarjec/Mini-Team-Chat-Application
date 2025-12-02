import express from 'express'
import { registerUser, loginUser, logoutUser, getAllUsers } from '../controllers/userController.js';
import userAuth from '../middlewares/userAuthMiddleware.js';

const userRouter = express.Router();

// --- Auth Routes (No auth middleware needed) ---

// Route: POST /api/auth/signup
userRouter.post("/signup", registerUser);

// Route: POST /api/auth/login
userRouter.post("/login", loginUser);

// --- User Routes (Auth middleware required) ---
userRouter.post('/logout', userAuth, logoutUser);
userRouter.get("/users", userAuth, getAllUsers);


export default userRouter;