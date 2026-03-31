const { Router } = require('express')
const { body } = require('express-validator')
const { authMiddleware } = require('../middleware/auth')
const {
  listTodos,
  createTodo,
  getTodo,
  updateTodo,
  deleteTodo,
} = require('../controllers/todosController')

const router = Router()

router.use(authMiddleware)

const createValidation = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
]

const updateValidation = [
  body('title')
    .optional()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Title must be 500 characters or fewer'),
  body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Due date must be a valid date'),
]

router.get('/', listTodos)
router.post('/', createValidation, createTodo)
router.get('/:id', getTodo)
router.put('/:id', updateValidation, updateTodo)
router.delete('/:id', deleteTodo)

module.exports = router
