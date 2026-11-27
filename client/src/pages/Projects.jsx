import PageHeader from "../components/PageHeader.jsx";
import ResourceManager from "../components/ResourceManager.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { projectsApi } from "../lib/api.js";
import { projectConfig } from "../data/resourceConfig.js";
import { projectList } from "../data/portfolioData.js";

// Projects: one detailed card per project (Assignment 1), followed by the live list from the
// database (Assignment 3), where an admin can add, edit and delete projects.
export default function Projects() {
  const { isAdmin } = useAuth();
  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Selected work"
        intro="A mix of independent and academic projects, from responsive websites to relational databases."
      />

      <section className="section">
        <div className="container project-stack">
          {projectList.map((project, projectIndex) => (
            <article
              className={`project ${projectIndex % 2 === 1 ? "project-reverse" : ""}`}
              key={project.id}
            >
              <div className={`project-media ${project.images.length > 1 ? "project-media-multi" : ""}`}>
                {project.images.map((image) => (
                  <img key={image.src} src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" />
                ))}
              </div>

              <div className="project-content">
                <p className="eyebrow">{project.context} &middot; {project.period}</p>
                <h2>{project.title}</h2>
                <p><strong>My role: </strong>{project.role}</p>
                <p><strong>Outcome: </strong>{project.outcome}</p>
                <ul className="chip-list">
                  {project.technologies.map((technology) => (
                    <li className="chip" key={technology}>{technology}</li>
                  ))}
                </ul>
                {project.links.map((projectLink) => (
                  <a key={projectLink.url} className="text-link" href={projectLink.url} target="_blank" rel="noreferrer">
                    {projectLink.label} &rarr;
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <ResourceManager
            {...projectConfig}
            title="More projects, live from the database"
            intro={isAdmin ? "You are signed in as an admin: you can add, edit and delete projects." : "Read from the API (GET /api/projects). Sign in as an admin to manage them."}
            api={projectsApi}
            canManage={isAdmin}
            emptyText="No projects have been added to the database yet."
          />
        </div>
      </section>
    </>
  );
}
