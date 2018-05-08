import * as tinify from 'tinify'

interface TinyConfig {
  KEY: string
}

export const init = (tinyPNG: TinyConfig) => {
  tinify.key = tinyPNG.KEY
}

export const tinyFile = (source: string, target: string): Promise<void> =>
  tinify.fromFile(source).toFile(target)
