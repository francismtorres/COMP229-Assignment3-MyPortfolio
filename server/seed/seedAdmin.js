/**
 * seedAdmin.js
 * Stores the ADMIN account in the "users" collection of the Portfolio database
 * (Assignment 3: "hardcode the Admin role credentials in your MongoDB database").
 *
 * Run it once from the project root:   npm run seed:admin
 *
 * - If the admin email does not exist yet, the account is created with role "admin".
 * - If it already exists, its role is set back to "admin" and the password is reset to the
 *   configured value, so running the script again is always safe.
 * The password is hashed by the User model's pre-save hook, so only a salted hash is stored.
 * Credentials come from ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD in .env (defaults in config.js).
 */
import mongoose from "mongoose";
import config from "../config/config.js";
import User from "../models/user.model.js";

const seedAdmin = async () => {
  await mongoose.connect(config.mongoUri);
  console.log(`Connected to the "${mongoose.connection.name}" database.`);

  const email = config.adminEmail.trim().toLowerCase();
  // select("+password") is not needed: we only overwrite the password, never read it
  let admin = await User.findOne({ email });

  if (admin) {
    admin.name = config.adminName;
    admin.role = "admin";
    admin.password = config.adminPassword; // re-hashed by the pre-save hook
    admin.updated = Date.now();
    await admin.save();
    console.log(`Updated the existing account ${email} and made it an admin.`);
  } else {
    admin = await User.create({
      name: config.adminName,
      email,
      password: config.adminPassword,
      role: "admin",
    });
    console.log(`Created the admin account ${email}.`);
  }
};

seedAdmin()
  .catch((error) => {
    console.error(`Could not seed the admin account: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
