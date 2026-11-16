import PageHeader from "../components/PageHeader.jsx";
import ResourceManager from "../components/ResourceManager.jsx";
import { contactsApi } from "../lib/api.js";
import { contactConfig } from "../data/resourceConfig.js";

/**
 * AdminContacts: the messages sent through the Contact form (admin only - see PrivateRoute in App.jsx).
 * The admin can read, edit and delete every contact, and add one manually.
 */
export default function AdminContacts() {
  return (
    <>
      <PageHeader eyebrow="Admin" title="Contact messages" intro="Messages sent through the Contact form are stored in the contacts collection." />
      <section className="section">
        <div className="container">
          <ResourceManager
            {...contactConfig}
            title="Contacts"
            api={contactsApi}
            canManage
            emptyText="No messages yet. Send one from the Contact page."
          />
        </div>
      </section>
    </>
  );
}
