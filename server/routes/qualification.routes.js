/**
 * qualification.routes.js
 * URL map for the qualifications REST API, mounted at /api/qualifications in express.js.
 * Access rules: GET (list and by id) is PUBLIC; POST, PUT and DELETE are ADMIN only.
 */
import express from "express";
import * as qualificationController from "../controllers/qualification.controller.js";
import { requireSignin, requireAdmin } from "../controllers/auth.controller.js";
import validateId from "../helpers/validateId.js";

const router = express.Router();

router
  .route("/")
  .get(qualificationController.list) // get all qualifications
  .post(requireSignin, requireAdmin, qualificationController.create) // add a new qualification
  .delete(requireSignin, requireAdmin, qualificationController.removeAll); // remove all qualifications

router
  .route("/:id")
  .get(validateId, qualificationController.read) // get a qualification by id
  .put(requireSignin, requireAdmin, validateId, qualificationController.update) // update a qualification by id
  .delete(requireSignin, requireAdmin, validateId, qualificationController.remove); // remove a qualification by id

export default router;
