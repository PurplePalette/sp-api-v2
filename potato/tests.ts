import express from 'express'
import { Sonolus, defaultListHandler, listRouteHandler, LevelInfo, toLevelItem } from 'sonolus-express'
import CustomLevelInfo from '../types/level'

/**
 * Express: add/edit/delete level handler
*/
export function createTestsRouter(sonolus: Sonolus) : express.Router {
  const testsRouter = express.Router()

  testsRouter.get('/:testId/info', (req, res) => {
    // eslint-disable-next-line
    // req.localize = (text: any) => sonolus.localize(text, req.query.localization as string)
    const userId = req.params.testId
    const levels = sonolus.db.levels as CustomLevelInfo[]
    const filteredLevels = levels.filter(l => l.userId === userId)
    console.log(filteredLevels)
    const testsLevelListHandler = (
      sonolus: Sonolus,
      keywords: string | undefined,
      page: number
    ): {
        pageCount: number
        infos: LevelInfo[]
      } => {
      return defaultListHandler(
        sonolus.db.levels,
        ['name', 'rating', 'title', 'artists', 'author', 'description'],
        keywords,
        page
      )
    }
    const r: Promise<void> = listRouteHandler(sonolus, testsLevelListHandler, toLevelItem, req, res)
    console.log(r)
  })
  return testsRouter
}