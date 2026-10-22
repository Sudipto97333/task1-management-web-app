const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const mongoose = require("mongoose");
const Task = require("./Task");

const localFilePath = path.resolve(
  __dirname,
  "..",
  process.env.LOCAL_DATA_FILE || "data/tasks.json"
);
let pendingWrites = Promise.resolve();

async function readLocalTasks() {
  try {
    const contents = await fs.readFile(localFilePath, "utf8");
    const tasks = JSON.parse(contents);
    if (!Array.isArray(tasks)) {
      throw new Error(`Task data file must contain a JSON array: ${localFilePath}`);
    }
    return tasks;
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeLocalTasks(tasks) {
  await fs.mkdir(path.dirname(localFilePath), { recursive: true });
  const tempFilePath = `${localFilePath}.${process.pid}.${randomUUID()}.tmp`;
  await fs.writeFile(tempFilePath, `${JSON.stringify(tasks, null, 2)}\n`, "utf8");
  await fs.rename(tempFilePath, localFilePath);
}

function updateLocalTasks(mutator) {
  const operation = pendingWrites.then(async () => {
    const tasks = await readLocalTasks();
    const { result, changed } = mutator(tasks);
    if (changed) await writeLocalTasks(tasks);
    return result;
  });

  pendingWrites = operation.catch(() => {});
  return operation;
}

async function listTasks() {
  if (process.env.MONGODB_URI) {
    return Task.find().sort({ createdAt: -1 });
  }
  await pendingWrites;
  return (await readLocalTasks()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function createTask(fields) {
  if (process.env.MONGODB_URI) return Task.create(fields);

  const now = new Date().toISOString();
  const task = {
    _id: new mongoose.Types.ObjectId().toString(),
    title: fields.title.trim(),
    description: fields.description?.trim() ?? "",
    completed: fields.completed ?? false,
    createdAt: now,
    updatedAt: now,
  };

  return updateLocalTasks((tasks) => {
    tasks.push(task);
    return { result: task, changed: true };
  });
}

async function updateTask(id, changes) {
  if (process.env.MONGODB_URI) {
    return Task.findByIdAndUpdate(id, changes, { new: true, runValidators: true });
  }

  return updateLocalTasks((tasks) => {
    const task = tasks.find((entry) => entry._id === id);
    if (!task) return { result: null, changed: false };

    if ("title" in changes) task.title = changes.title.trim();
    if ("description" in changes) task.description = changes.description.trim();
    if ("completed" in changes) task.completed = changes.completed;
    task.updatedAt = new Date().toISOString();
    return { result: task, changed: true };
  });
}

async function deleteTask(id) {
  if (process.env.MONGODB_URI) return Task.findByIdAndDelete(id);

  return updateLocalTasks((tasks) => {
    const index = tasks.findIndex((entry) => entry._id === id);
    if (index === -1) return { result: null, changed: false };
    const [task] = tasks.splice(index, 1);
    return { result: task, changed: true };
  });
}

module.exports = {
  localFilePath,
  listTasks,
  createTask,
  updateTask,
  deleteTask,
};
