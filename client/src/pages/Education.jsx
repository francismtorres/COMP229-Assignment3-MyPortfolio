import PageHeader from "../components/PageHeader.jsx";
import ResourceManager from "../components/ResourceManager.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { qualificationsApi } from "../lib/api.js";
import { qualificationConfig } from "../data/resourceConfig.js";
import { educationList } from "../data/portfolioData.js";

// Education: the qualifications timeline (Assignment 1), followed by the live list from the
// database (Assignment 3), where an admin can add, edit and delete qualifications.
export default function Education() {
  const { isAdmin } = useAuth();
  return (
    <>
      <PageHeader
        eyebrow="Education"
        title="Qualifications"
        intro="Formal training in business and software engineering, with hands-on co-op experience on the way."
      />

      <section className="section">
        <div className="container">
          <ol className="timeline">
            {educationList.map((entry) => (
              <li className="timeline-item" key={entry.id}>
                <div className="timeline-date">
                  <span>{entry.dateLabel}</span>
                  <span className={`badge ${entry.status === "In progress" ? "badge-active" : ""}`}>{entry.status}</span>
                </div>
                <div className="card timeline-card">
                  <div className="card-body">
                    <h2>{entry.credential}</h2>
                    <p className="muted">{entry.school}</p>
                    <ul className="plain-list">
                      {entry.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <ResourceManager
            {...qualificationConfig}
            title="More qualifications, live from the database"
            intro={isAdmin ? "You are signed in as an admin: you can add, edit and delete qualifications." : "Read from the API (GET /api/qualifications). Sign in as an admin to manage them."}
            api={qualificationsApi}
            canManage={isAdmin}
            emptyText="No qualifications have been added to the database yet."
          />
        </div>
      </section>
    </>
  );
}
