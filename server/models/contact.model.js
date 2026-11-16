/**
 * contact.model.js
 * Mongoose schema for the "contacts" collection: messages sent from the
 * Contact form on the portfolio site.
 */
import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  firstname: {
    type: String,
    trim: true,
    required: [true, "First name is required."],
  },
  lastname: {
    type: String,
    trim: true,
    required: [true, "Last name is required."],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: [true, "Email is required."],
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address."],
  },
  // Assignment 3: optional extras captured by the updated contact form.
  // They are optional, so the Assignment 2 requests (firstname, lastname, email) still work unchanged.
  contactNumber: {
    type: String,
    trim: true,
  },
  message: {
    type: String,
    trim: true,
    maxlength: [2000, "Message must be 2000 characters or fewer."],
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

// Mongoose pluralises "Contact" -> collection name "contacts"
export default mongoose.model("Contact", ContactSchema);
