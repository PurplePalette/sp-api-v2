import express from 'express'
import { Sonolus, LocalizationText } from 'sonolus-express'
import { LevelInfo, InfoDetails, SRL } from 'sonolus-express'
import { config } from '../config'

interface CustomLevelInfo extends LevelInfo {
  userId: string
}

// Express add/edit/delete level handler
export const levelsRouter = express.Router()
levelsRouter.post('/', (req, res) => {
  res.send('Hello.')
})
levelsRouter.put('/:levelId', (req, res) => {
  req.params.levelId
  res.send('Hello.')
})

// Sonolus-Express level list handler
export function customLevelListHandler(
  sonolus: Sonolus,
  keywords: string | undefined,
  page: number
): { pageCount: number, infos: CustomLevelInfo[] } {
  return {
    pageCount: 255,
    infos: []
  }
}

// Sonolus-Express level list handler
export function customLevelDetailsHandler(
  sonolus: Sonolus,
  name: string
): InfoDetails<CustomLevelInfo> | undefined {
  const text : LocalizationText = {
    ja: 'aaa'
  }
  const bgm: SRL<'LevelBgm'> = {
    type: 'LevelBgm',
    url: '',
    hash: ''
  }
  const cover: SRL<'LevelCover'> = {
    type: 'LevelCover',
    url: '',
    hash: ''
  }
  const data: SRL<'LevelData'> = {
    type: 'LevelData',
    url: '',
    hash: ''
  }
  const info: CustomLevelInfo = {
    version: 1,
    name: 'a',
    description: text,
    title: text,
    rating: 1,
    useBackground: {
      useDefault: true
    },
    useEffect: {
      useDefault: true
    },
    useSkin: {
      useDefault: true
    },
    useParticle: {
      useDefault: true
    },
    artists: text,
    author: text,
    engine: config.engine,
    userId: 'hoge',
    bgm,
    cover,
    data,
  }
  return {
    info,
    description: info.description,
    recommended: []
  }
}