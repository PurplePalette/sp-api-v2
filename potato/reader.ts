import fs from 'fs'
import { gzipSync } from 'zlib'
import { createHash } from 'crypto'
import { LevelInfo } from 'sonolus-express'

export interface CustomLevelInfo extends LevelInfo {
  userId: string,
  coverHash: string,
  dataHash: string,
  bgmHash: string,
  playCount: number,
  notes: number,
  genre: string,
  createdTime: number,
  updatedTime: number,
  public: boolean
}

/**
 * Generate SHA1 hash of a file
*/
function getHashFromFile(path: string): string {
  const file = fs.readFileSync(path)
  const hash = createHash('sha1').update(file).digest('hex')
  return hash
}

/**
 * Inject name/data/cover/bgm alternative to sonolus-generate-static
*/
function injectLackedFields(levelData: CustomLevelInfo, levelName: string) {
  levelData.name = levelName
  levelData.data = {
    type: 'LevelData',
    hash: levelData.dataHash,
    url: `/repository/${levelName}/data.gz`
  }
  levelData.cover = {
    type: 'LevelCover',
    hash: levelData.coverHash,
    url: `/repository/${levelName}/cover.png`
  }
  levelData.bgm = {
    type: 'LevelBgm',
    hash: levelData.bgmHash,
    url: `/repository/${levelName}/bgm.mp3`
  }
  return levelData
}

/**
 * Load a level from a file.
 * If the level file is not customized level file, return undefined.
*/
function loadLevelInfo(levelName: string): CustomLevelInfo | undefined {
  const levelData = JSON.parse(fs.readFileSync('./db/levels/' + levelName + '/info.json').toString()) as CustomLevelInfo
  if (levelData.userId && levelData.coverHash && levelData.public) {
    return injectLackedFields(levelData, levelName)
  } else {
    return undefined
  }
}

/**
 * Load a original level file and cook the level to customized level file.
 * This function gzip level data, and create hash for the level files.
 * It may take some time.
*/
export function initLevelInfo(levelName: string): CustomLevelInfo {
  const levelInfo = JSON.parse(fs.readFileSync(`./db/levels/${levelName}/info.json`).toString()) as CustomLevelInfo
  const levelDataGzip = gzipSync(fs.readFileSync(`./db/levels/${levelName}/data.json`).toString(), { level: 9 })
  fs.writeFileSync(`./db/levels/${levelName}/data.gz`, levelDataGzip)
  const levelDataHash = getHashFromFile(`./db/levels/${levelName}/data.gz`)
  const levelBgmHash = getHashFromFile(`./db/levels/${levelName}/bgm.mp3`)
  const levelCoverHash = getHashFromFile(`./db/levels/${levelName}/cover.png`)
  levelInfo.dataHash = levelDataHash
  levelInfo.bgmHash = levelBgmHash
  levelInfo.coverHash = levelCoverHash
  fs.writeFileSync(`./db/levels/${levelName}/info.json`, JSON.stringify(levelInfo, null, '    '))
  return injectLackedFields(levelInfo, levelName)
}

/**
 * Load db/levels folder and create levels database.
 * If found non-customized file(no hash exists in json) while loading, try to cook the level.
*/
export function initLevelsDatabase() : CustomLevelInfo[] {
  const levels: CustomLevelInfo[] = []
  const levelFolders = fs.readdirSync('./db/levels')
  for (const levelName of levelFolders) {
    try {
      const level = loadLevelInfo(levelName)
      if (level) {
        levels.push(level)
      } else {
        const newLevel = initLevelInfo(levelName)
        levels.push(newLevel)
      }
    } catch {
      console.error('Error reading level info file for ' + levelName)
    }
  }
  // console.log(levels)
  return levels
}
