/**
 * resourceConfig.js
 * Describes the form fields of each REST object so the same <ResourceManager> component
 * can show, add, edit and delete projects, qualifications and contacts.
 * The names match the Mongoose schemas on the back end (server/models/*.model.js).
 */
import { personalInfo } from "./portfolioData.js";

// Projects and qualifications share the same schema (Assignment 2)
const entryFields = [
  { name: "title", label: "Title", type: "text", required: true, wide: true },
  { name: "firstname", label: "First name", type: "text", required: true },
  { name: "lastname", label: "Last name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "completion", label: "Completion date", type: "date", required: true },
  { name: "description", label: "Description", type: "textarea", wide: true },
];

// Starting values for the "Add" form, so the admin does not retype their own details
const entryDefaults = {
  title: "",
  firstname: personalInfo.firstName,
  lastname: "Torres",
  email: personalInfo.email,
  completion: "",
  description: "",
};

export const projectConfig = {
  idPrefix: "project",
  singular: "Project",
  fields: entryFields,
  defaultValues: entryDefaults,
};

export const qualificationConfig = {
  idPrefix: "qualification",
  singular: "Qualification",
  fields: entryFields,
  defaultValues: entryDefaults,
};

export const contactConfig = {
  idPrefix: "contact",
  singular: "Message",
  titleFields: ["firstname", "lastname"],
  fields: [
    { name: "firstname", label: "First name", type: "text", required: true },
    { name: "lastname", label: "Last name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "contactNumber", label: "Contact number", type: "tel" },
    { name: "message", label: "Message", type: "textarea", wide: true },
  ],
  defaultValues: { firstname: "", lastname: "", email: "", contactNumber: "", message: "" },
};
