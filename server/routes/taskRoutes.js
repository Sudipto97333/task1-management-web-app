const express = require("express");
const mongoose = require("mongoose");
const taskStore = require("../models/taskStore");

const router = express.Router();
const editableFields = ["title", "description", "completed"];

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateTaskChanges(body) {
  if (!isPlainObject(body)) {
    return "Request body must be a JSON object";
  }

  const keys = Object.keys(body);
  const unsupportedField = keys.find((key) => !editableFields.includes(key));

  if (unsupportedField) {
    return `Unsupported task field: ${unsupportedField}`;
  }

  if (keys.length === 0) {
    return "Provide at least one task field to update";
  }

  if ("title" in body && (typeof body.title !== "string" || !body.title.trim())) {
    return "Task title must be a non-empty string";
  }

  if ("title" in body && body.title.trim().length > 200) {
    return "Task title cannot exceed 200 characters";
  }

  if ("description" in body && typeof body.description !== "string") {
    return "Task description must be a string";
  }

  if ("description" in body && body.description.length > 2000) {
    return "Task description cannot exceed 2000 characters";
  }

  if ("completed" in body && typeof body.completed !== "boolean") {
    return "Task completed must be a boolean";
  }

  return null;
}

function validateTaskId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  next();
}

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const tasks = await taskStore.listTasks();
    res.json(tasks);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const validationError = validateTaskChanges(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (!("title" in req.body)) {
      return res.status(400).json({ error: "Task title is required" });
    }

    const task = await taskStore.createTask(req.body);
    res.status(201).json(task);
  })
);

router.patch(
  "/:id",
  validateTaskId,
  asyncHandler(async (req, res) => {
    const validationError = validateTaskChanges(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const task = await taskStore.updateTask(req.params.id, req.body);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  })
);

router.delete(
  "/:id",
  validateTaskId,
  asyncHandler(async (req, res) => {
    const task = await taskStore.deleteTask(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(204).end();
  })
);

module.exports = router;
