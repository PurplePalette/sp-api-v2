import {
  engineConfiguration,
  engineData,
  engineInfo,
  engineThumbnail,
} from 'sonolus-pjsekai-engine'
import type { Sonolus } from 'sonolus-express'

// exporting engine name so uploaded levels can associate with
export const engineName = engineInfo.name

export function installSekaiEngine(sonolus: Sonolus): void {
  sonolus.db.engines.push({
    ...engineInfo,
    skin: 'pjsekai.classic',
    background: 'pjsekai.live',
    effect: 'pjsekai.classic',
    particle: 'pjsekai.classic',
    // using file path in sonolus.add is preferred over file content buffer
    // this allows file content to be read on demand rather than be kept in memory
    thumbnail: sonolus.add('EngineThumbnail', engineThumbnail.path),
    data: sonolus.add('EngineData', engineData.path),
    configuration: sonolus.add(
      'EngineConfiguration',
      engineConfiguration.path
    ),
  })
}