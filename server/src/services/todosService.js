const { pool } = require('../db/pool')

function toTodo(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    completed: row.completed,
    priority: row.priority,
    dueDate: row.due_date ? row.due_date.toISOString().split('T')[0] : null,
    createdAt: row.created_at,
  }
}

async function listTodos(userId, { page, limit, status }) {
  const offset = (page - 1) * limit
  const params = [userId]
  let whereClause = 'WHERE user_id = $1 AND deleted_at IS NULL'

  if (status === 'active') {
    whereClause += ' AND completed = false'
  } else if (status === 'completed') {
    whereClause += ' AND completed = true'
  }

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM todos ${whereClause}`,
    params
  )
  const total = parseInt(countResult.rows[0].count)

  const dataResult = await pool.query(
    `SELECT id, user_id, title, completed, priority, due_date, created_at
     FROM todos ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  )

  return { todos: dataResult.rows.map(toTodo), total }
}

async function createTodo(userId, { title, dueDate, priority = 'medium' }) {
  const result = await pool.query(
    `INSERT INTO todos (user_id, title, due_date, priority)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, title, completed, priority, due_date, created_at`,
    [userId, title, dueDate || null, priority]
  )
  return toTodo(result.rows[0])
}

async function getTodo(userId, id) {
  const result = await pool.query(
    `SELECT id, user_id, title, completed, priority, due_date, created_at
     FROM todos
     WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
    [id, userId]
  )
  return result.rows.length > 0 ? toTodo(result.rows[0]) : null
}

async function updateTodo(userId, id, { title, completed, dueDate, priority }) {
  const existing = await pool.query(
    'SELECT id FROM todos WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
    [id, userId]
  )
  if (existing.rows.length === 0) return null

  const result = await pool.query(
    `UPDATE todos
     SET
       title     = COALESCE($3, title),
       completed = COALESCE($4, completed),
       due_date  = CASE WHEN $5::boolean THEN $6::date ELSE due_date END,
       priority  = COALESCE($7, priority)
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, title, completed, priority, due_date, created_at`,
    [
      id,
      userId,
      title ?? null,
      completed ?? null,
      dueDate !== undefined,
      dueDate ?? null,
      priority ?? null,
    ]
  )
  return toTodo(result.rows[0])
}

async function deleteTodo(userId, id) {
  const existing = await pool.query(
    'SELECT id FROM todos WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
    [id, userId]
  )
  if (existing.rows.length === 0) return false

  await pool.query(
    'UPDATE todos SET deleted_at = now() WHERE id = $1 AND user_id = $2',
    [id, userId]
  )
  return true
}

module.exports = { listTodos, createTodo, getTodo, updateTodo, deleteTodo }
