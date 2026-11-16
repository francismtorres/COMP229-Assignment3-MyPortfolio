/**
 * user.routes.js
 * URL map for the users REST API, mounted at /api/users in express.js.
 * Access rules:
 *   POST   /api/users      PUBLIC  - register (the new account always gets the "user" role)
 *   GET    /api/users      ADMIN   - list every account
 *   DELETE /api/users      ADMIN   - remove all non-admin accounts
 *   GET/PUT/DELETE /:id    the signed-in user's OWN account, or any account for an ADMIN
 */
import express from "express";
import * as userController from "../controllers/user.controller.js";
import { requireSignin, requireAdmin, hasAuthorization } from "../controllers/auth.controller.js";
import validateId from "../helpers/validateId.js";

const router = express.Router();

router
  .route("/")
  .get(requireSignin, requireAdmin, userController.list) // get all users
  .post(userController.create) // add a new user (register)
  .delete(requireSignin, requireAdmin, userController.removeAll); // remove all users

router
  .route("/:id")
  .get(requireSignin, validateId, hasAuthorization, userController.read) // get a user by id
  .put(requireSignin, validateId, hasAuthorization, userController.update) // update a user by id
  .delete(requireSignin, validateId, hasAuthorization, userController.remove); // remove a user by id

export default router;
