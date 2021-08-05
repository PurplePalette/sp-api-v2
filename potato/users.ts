import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import { initUsersDatabase } from './reader'
import CustomUserInfo from '../types/user'
import * as OpenApiValidator from 'express-openapi-validator'

let users = initUsersDatabase()

/**
 * Express: add/edit/get account handler
*/
export const usersRouter = express.Router()

// Default handling is json
usersRouter.use(express.json())

// Add validator
usersRouter.use(
  OpenApiValidator.middleware({
    apiSpec: './api.yaml',
    validateRequests: {
      removeAdditional: 'all'
    }
  }),
)

// I couldn't found express-opeapi-validator-error type
interface OpenApiError {
  status?: number
  errors?: string
  message?: string
}

// Default error handler
usersRouter.use((
  err: OpenApiError,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  })
})

// Get user detail
usersRouter.get('/:userId', (req, res) => {
  const matchedUser = users.filter(user => user.userId === req.params.userId)
  if (matchedUser.length === 0) {
    res.json({ message: 'User not found' })
    return
  }
  const resp = matchedUser[0]
  resp.testId = 'hidden'
  res.json(resp)
})

// Edit user detail
usersRouter.patch('/:userId', (req, res) => {
  const reqUser = req.body as unknown as CustomUserInfo
  const matchedUser = users.filter(user => user.userId === req.params.userId)
  if (matchedUser.length === 0) {
    users.push(reqUser)
    res.json({ message: 'User add success' })
    return
  }
  users = users.filter(user => user.userId !== reqUser.userId)
  users.push(reqUser)
  res.json({ message: 'User edit success' })
})

// Per-user level list
usersRouter.get('/:userId/levels', (req, res) => {
  const matchedUser = users.filter(user => user.userId === req.params.userId)
  if (matchedUser.length === 0) {
    res.json({ message: 'User not found' })
    return
  }
  const resp = matchedUser[0]
  resp.testId = 'hidden'
  res.json(resp)
})