import express from 'express'
import { Sonolus } from 'sonolus-express'
import { defaultListHandler, defaultDetailsHandler, InfoDetails } from 'sonolus-express'
import { CustomLevelInfo, initLevelsDatabase } from './reader'

// Load custom levels database
const levels = initLevelsDatabase()

/**
 * Express: add/edit/delete level handler
*/
export const levelsRouter = express.Router()
levelsRouter.post('/', (req, res) => {
  res.send('Hello.')
})
levelsRouter.put('/:levelId', (req, res) => {
  req.params.levelId
  res.send('Hello.')
})
levelsRouter.delete('/:levelId', (req, res) => {
  req.params.levelId
  res.send('Hello.')
})

/**
 * Sonolus-Express: level list handler
*/
export function customLevelListHandler(
  sonolus: Sonolus,
  keywords: string | undefined,
  page: number
): { pageCount: number, infos: CustomLevelInfo[] } {
  return defaultListHandler(
    levels,
    ['name', 'rating', 'title', 'artists', 'author', 'description'],
    keywords,
    page
  )
}

/**
 * Sonolus-Express: level detail handler
*/
export function customLevelDetailsHandler(
  sonolus: Sonolus,
  name: string
): InfoDetails<CustomLevelInfo> | undefined {
  return defaultDetailsHandler(levels, name)
}