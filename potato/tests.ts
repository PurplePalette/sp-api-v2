import {
  Sonolus,
  defaultListHandler, listRouteHandler,
  detailsRouteHandler,
  LevelInfo, toLevelItem, toServerInfo,
  LocalizationText,
} from 'sonolus-express'
import { sortByUpdatedTime } from './levels'
import type { Request } from 'express'
import CustomUserInfo from '../types/user'

function getTestingLevels (sonolus: Sonolus, req: Request) : LevelInfo[] {
  const users = req.app.locals.users as CustomUserInfo[]
  const userIds = users.filter(u => u.testId === req.params.testId)
  if (userIds.length === 0) {
    return []
  }
  const filteredLevels = sonolus.db.levels.filter(l => l.userId === userIds[0].userId)
  return filteredLevels
}

/**
 * Express: add/edit/delete level handler
*/
export function installTestsEndpoints(sonolus: Sonolus): void {
  /* Server info */
  sonolus.app.get('/tests/:testId/info', (req, res) => {
    req.localize = (text: LocalizationText) => sonolus.localize(text, req.query.localization as string)
    const filteredLevels = sortByUpdatedTime(getTestingLevels(sonolus, req))
    if (filteredLevels.length === 0) { return res.status(404).json({message: 'No tests found'})}
    res.json(
      toServerInfo(
        {
          levels: filteredLevels.slice(0, 5),
          skins: [], backgrounds: [], effects: [], particles: [], engines: []
        },
        sonolus.db,
        req.localize
      )
    )
  })

  /* Level list */
  sonolus.app.get('/tests/:testId/levels/list', (req, res, next) => {
    (async () => {
      req.localize = (text: LocalizationText) => sonolus.localize(text, req.query.localization as string)
      const testsLevelListHandler = (
        sonolus: Sonolus,
        keywords: string | undefined,
        page: number
      ): {
        pageCount: number
        infos: LevelInfo[]
        } => {
        const filteredLevels = sortByUpdatedTime(getTestingLevels(sonolus, req))
        if (filteredLevels.length === 0) {
          return { pageCount: 0, infos: [] }
        }
        return defaultListHandler(
          filteredLevels,
          ['name', 'rating', 'title', 'artists', 'author', 'description'],
          keywords,
          page
        )
      }
      await listRouteHandler(sonolus, testsLevelListHandler, toLevelItem, req, res)
    })().catch(next)
  })

  /* Get level */
  sonolus.app.get('/tests/:testId/levels/:levelName', (req, res, next) => {
    (async () => {
      req.localize = (text: LocalizationText) => sonolus.localize(text, req.query.localization as string)
      await detailsRouteHandler(sonolus, sonolus.levelDetailsHandler, toLevelItem, req, res)
    })().catch(next)
  })
}