import { useEffect, useMemo, useState } from "react";
import TaskForm from "./components/TaskForm.jsx";
import TaskList from "./components/TaskList.jsx";
import { taskApi } from "./services/api.js";

const filters = [
  { id: "all", label: "All tasks" },
  { id: "active", label: "In progress" },
  { id: "completed", label: "Completed" },
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalTask, setModalTask] = useState(undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [storage, setStorage] = useState("");
  const [apiOnline, setApiOnline] = useState(null);

  async function loadTasks() {
    setLoading(true);
    try {
      setTasks(await taskApi.list());
      setApiOnline(true);
      setError("");
      taskApi.health()
        .then((health) => {
          setStorage(health.storage);
          setApiOnline(true);
        })
        .catch((healthError) => {
          setStorage("");
          setApiOnline(!healthError.isNetworkError);
        });
    } catch (requestError) {
      setApiOnline(!requestError.isNetworkError);
      setStorage("");
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const completedCount = tasks.filter((task) => task.completed).length;
  const remainingCount = tasks.length - completedCount;
  const visibleTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tasks
      .filter((task) => {
        if (filter === "active") return !task.completed;
        if (filter === "completed") return task.completed;
        return true;
      })
      .filter((task) =>
        !normalizedQuery ||
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.description.toLowerCase().includes(normalizedQuery)
      );
  }, [filter, query, tasks]);

  async function saveTask(changes) {
    setSaving(true);
    try {
      if (modalTask) {
        const updated = await taskApi.update(modalTask._id, changes);
        setTasks((current) => current.map((task) => task._id === updated._id ? updated : task));
      } else {
        const created = await taskApi.create(changes);
        setTasks((current) => [created, ...current]);
      }
      setModalTask(undefined);
      setApiOnline(true);
      setError("");
    } catch (requestError) {
      setApiOnline(!requestError.isNetworkError);
      setStorage("");
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    try {
      const updated = await taskApi.update(task._id, { completed: !task.completed });
      setTasks((current) => current.map((item) => item._id === updated._id ? updated : item));
      setApiOnline(true);
      setError("");
    } catch (requestError) {
      setApiOnline(!requestError.isNetworkError);
      setStorage("");
      setError(requestError.message);
    }
  }

  async function deleteTask(task) {
    try {
      await taskApi.remove(task._id);
      setTasks((current) => current.filter((item) => item._id !== task._id));
      setApiOnline(true);
      setError("");
    } catch (requestError) {
      setApiOnline(!requestError.isNetworkError);
      setStorage("");
      setError(requestError.message);
    }
  }

  const greetingDate = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Daymark home">
          <span className="brand-mark"><span /></span>
          <span>daymark<span className="brand-period">.</span></span>
        </a>
        <div className="sidebar-label">WORKSPACE</div>
        <nav aria-label="Task filters" className="filter-nav">
          {filters.map((item) => (
            <button
              aria-current={filter === item.id ? "page" : undefined}
              className={`nav-item${filter === item.id ? " nav-item-active" : ""}`}
              key={item.id}
              onClick={() => setFilter(item.id)}
              type="button"
            >
              <span className={`nav-symbol nav-symbol-${item.id}`} aria-hidden="true">
                {item.id === "all" ? "▦" : item.id === "active" ? "◷" : "✓"}
              </span>
              {item.label}
              {item.id === "all" && <span className="nav-count">{tasks.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="focus-note">
            <span className="focus-spark" aria-hidden="true">✳</span>
            <strong>Make room to focus</strong>
            <p>Small steps add up to meaningful progress.</p>
          </div>
          <div className="profile">
            <div className="profile-avatar">D</div>
            <div><strong>Your workspace</strong><span>Personal plan</span></div>
            <span aria-hidden="true" className="profile-menu">···</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span className="topbar-date">{greetingDate}</span>
          <div className="connection-state"><span className={`connection-dot${apiOnline === false ? " connection-offline" : ""}`} />{apiOnline === false ? "API offline" : storage === "local-file" ? "Saved on this device" : storage === "mongodb" ? "MongoDB synced" : "Workspace"}</div>
        </header>

        <section className="page-content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow">YOUR PERSONAL WORKSPACE</div>
              <h1>A little progress,<br /><span>every day.</span></h1>
              <p className="welcome-copy">Keep your focus on what matters right now.</p>
            </div>
            <button className="button button-primary add-task-button" onClick={() => setModalTask(null)} type="button">
              <span aria-hidden="true">+</span> New task
            </button>
          </div>

          <section aria-label="Task summary" className="summary-grid">
            <div className="summary-card">
              <span className="summary-icon icon-lilac" aria-hidden="true">▦</span>
              <div><span className="summary-label">Total tasks</span><strong>{tasks.length}</strong></div>
              <span className="summary-caption">in your list</span>
            </div>
            <div className="summary-card">
              <span className="summary-icon icon-peach" aria-hidden="true">◷</span>
              <div><span className="summary-label">In progress</span><strong>{remainingCount}</strong></div>
              <span className="summary-caption">still to do</span>
            </div>
            <div className="summary-card">
              <span className="summary-icon icon-mint" aria-hidden="true">✓</span>
              <div><span className="summary-label">Completed</span><strong>{completedCount}</strong></div>
              <span className="summary-caption">nicely done</span>
            </div>
          </section>

          <section className="tasks-section">
            <div className="tasks-heading">
              <div>
                <h2>{filter === "all" ? "Your tasks" : filter === "active" ? "In progress" : "Completed"}</h2>
                <p>{remainingCount ? `${remainingCount} ${remainingCount === 1 ? "thing" : "things"} on your mind` : "You have space for something new"}</p>
              </div>
              <label className="search-box">
                <svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="8.8" cy="8.8" r="5.6" /><path d="m13 13 4 4" /></svg>
                <input aria-label="Search tasks" onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" value={query} />
                <kbd>/</kbd>
              </label>
            </div>

            {error && (
              <div className="error-banner" role="alert">
                <span>{error}</span>
                <button onClick={loadTasks} type="button">Try again</button>
              </div>
            )}

            <TaskList
              filter={filter}
              loading={loading}
              onAdd={() => setModalTask(null)}
              onDelete={deleteTask}
              onEdit={setModalTask}
              onToggle={toggleTask}
              tasks={visibleTasks}
            />
          </section>

          <footer className="page-footer"><span>One thing at a time.</span><span>DAYMARK · A CALMER WAY TO GET THINGS DONE</span></footer>
        </section>
      </main>

      {modalTask !== undefined && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setModalTask(undefined)}>
          <section aria-labelledby="modal-title" aria-modal="true" className="modal" role="dialog">
            <div className="modal-heading">
              <div><span className="eyebrow">{modalTask ? "REFINE YOUR PLAN" : "MAKE A LITTLE PROGRESS"}</span><h2 id="modal-title">{modalTask ? "Edit task" : "Add a task"}</h2></div>
              <button aria-label="Close" className="modal-close" onClick={() => setModalTask(undefined)} type="button">×</button>
            </div>
            <TaskForm onCancel={() => setModalTask(undefined)} onSubmit={saveTask} saving={saving} task={modalTask} />
          </section>
        </div>
      )}
    </div>
  );
}
