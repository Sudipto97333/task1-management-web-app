import { useEffect, useState } from "react";

export default function TaskForm({ task, onSubmit, onCancel, saving }) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");

  useEffect(() => {
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
  }, [task]);

  function handleSubmit(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    onSubmit({ title: cleanTitle, description: description.trim() });
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label className="field-label" htmlFor="task-title">Task name</label>
      <input
        autoFocus
        id="task-title"
        maxLength={200}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="e.g. Prepare project proposal"
        value={title}
      />
      <label className="field-label" htmlFor="task-description">Notes <span>Optional</span></label>
      <textarea
        id="task-description"
        maxLength={2000}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Add a little more detail..."
        rows={4}
        value={description}
      />
      <div className="form-actions">
        <button className="button button-quiet" onClick={onCancel} type="button">Cancel</button>
        <button className="button button-primary" disabled={saving || !title.trim()} type="submit">
          {saving ? "Saving..." : task ? "Save changes" : "Add task"}
        </button>
      </div>
    </form>
  );
}
