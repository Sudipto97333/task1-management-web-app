function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  return (
    <article className={`task-card${task.completed ? " task-card-complete" : ""}`}>
      <button
        aria-label={task.completed ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}
        className={`task-check${task.completed ? " checked" : ""}`}
        onClick={() => onToggle(task)}
        type="button"
      >
        {task.completed && <span aria-hidden="true">✓</span>}
      </button>
      <div className="task-copy">
        <h3>{task.title}</h3>
        {task.description && <p>{task.description}</p>}
        <span className="task-date">Added {formatDate(task.createdAt)}</span>
      </div>
      <div className="task-actions">
        <button aria-label={`Edit ${task.title}`} className="icon-button" onClick={() => onEdit(task)} type="button">
          <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m13.8 3.2 3 3M3.5 16.5l3.8-.8L16 7l-3-3-8.7 8.7-.8 3.8Z" /></svg>
        </button>
        <button aria-label={`Delete ${task.title}`} className="icon-button delete-button" onClick={() => onDelete(task)} type="button">
          <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4.5 6h11m-9.5 0 .6 10h5.8l.6-10M8 6V4h4v2m-3 3v4m2-4v4" /></svg>
        </button>
      </div>
    </article>
  );
}
