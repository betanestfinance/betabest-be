import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

import { inviteUser, resetPassword, requestPasswordReset, loginUser } from "../controllers/userController.js";

const router = express.Router();

// router.route("/")
//   .get(getUsers)
//   .post(createUser);

// router.route("/:id")
//   .get(getUserById)
//   .put(updateUser)
//   .delete(deleteUser);

router.post("/invite", inviteUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);
router.post("/reset-password/request", requestPasswordReset);

export default router;
