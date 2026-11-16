/**
 * project.routes.js
 * URL map for the projects REST API, mounted at /api/projects in express.js.
 * Access rules: GET (list and by id) is PUBLIC; POST, PUT and DELETE are ADMIN only.
 */
import express from "express";
import * as projectController from "../controllers/project.controller.js";
import { requireSignin, requireAdmin } from "../controllers/auth.controller.js";
import validateId from "../helpers/validateId.js";

const router = express.Router();

router
  .route("/")
  .get(projectController.list) // get all projects
  .post(requireSignin, requireAdmin, projectController.create) // add a new project
  .delete(requireSignin, requireAdmin, projectController.removeAll); // remove all projects

router
  .route("/:id")
  .get(validateId, projectController.read) // get a project by id
  .put(requireSignin, requireAdmin, validateId, projectController.update) // update a project by id
  .delete(requireSignin, requireAdmin, validateId, projectController.remove); // remove a project by id

export default router;
