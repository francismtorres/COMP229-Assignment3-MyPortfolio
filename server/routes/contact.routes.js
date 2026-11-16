/**
 * contact.routes.js
 * URL map for the contacts REST API, mounted at /api/contacts in express.js.
 * Access rules: POST is PUBLIC (the website contact form); GET, PUT and DELETE are ADMIN only
 * (the messages visitors send are private).
 */
import express from "express";
import * as contactController from "../controllers/contact.controller.js";
import { requireSignin, requireAdmin } from "../controllers/auth.controller.js";
import validateId from "../helpers/validateId.js";

const router = express.Router();

router
  .route("/")
  .get(requireSignin, requireAdmin, contactController.list) // get all contacts
  .post(contactController.create) // add a new contact
  .delete(requireSignin, requireAdmin, contactController.removeAll); // remove all contacts

router
  .route("/:id")
  .get(requireSignin, requireAdmin, validateId, contactController.read) // get a contact by id
  .put(requireSignin, requireAdmin, validateId, contactController.update) // update a contact by id
  .delete(requireSignin, requireAdmin, validateId, contactController.remove); // remove a contact by id

export default router;
