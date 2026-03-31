const { validationResult } = require('express-validator')
const { listTodos, createTodo, getTodo, updateTodo, deleteTodo } = require('../services/todosService')

async function listTodosHandler(req, res, next) {
  try {
    const userId = req.user.id
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
    const { status } = req.query

    const result = await listTodos(userId, { page, limit, status })
    return res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

async function createTodoHandler(req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg })
    }

    const todo = await createTodo(req.user.id, req.body)
    return res.status(201).json(todo)
  } catch (err) {
    next(err)
  }
}

async function getTodoHandler(req, res, next) {
  try {
    const todo = await getTodo(req.user.id, req.params.id)
    if (!todo) return res.status(403).json({ error: 'Forbidden' })
    return res.status(200).json(todo)
  } catch (err) {
    next(err)
  }
}

async function updateTodoHandler(req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg })
    }

    const todo = await updateTodo(req.user.id, req.params.id, req.body)
    if (!todo) return res.status(403).json({ error: 'Forbidden' })
    return res.status(200).json(todo)
  } catch (err) {
    next(err)
  }
}

async function deleteTodoHandler(req, res, next) {
  try {
    const deleted = await deleteTodo(req.user.id, req.params.id)
    if (!deleted) return res.status(403).json({ error: 'Forbidden' })
    return res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listTodos: listTodosHandler,
  createTodo: createTodoHandler,
  getTodo: getTodoHandler,
  updateTodo: updateTodoHandler,
  deleteTodo: deleteTodoHandler,
}
