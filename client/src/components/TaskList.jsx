import TaskItem from "./TaskItem.jsx";

export default function TaskList({ tasks, loading, filter, onToggle, onEdit, onDelete, onAdd }) {
  if (loading) {
    return (
      <div aria-label="Loading tasks" className="loading-state">
        <span className="spinner" />
        <span>Gathering your tasks...</span>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div aria-hidden="true" className="empty-mark">✓</div>
        <h3>{filter === "completed" ? "Nothing completed yet" : filter === "active" ? "All caught up" : "A clear day starts here"}</h3>
        <p>{filter === "completed" ? "Finished tasks will find their way here." : "Add a task to give your day a little direction."}</p>
        {filter !== "completed" && <button className="button button-primary" onClick={onAdd} type="button">Create your first task</button>}
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task._id} onDelete={onDelete} onEdit={onEdit} onToggle={onToggle} task={task} />
      ))}
    </div>
  );
}
