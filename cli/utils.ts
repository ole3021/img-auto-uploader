import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import { isValidPath } from '../lib'

const homedir = os.homedir()
export const tempPath: string = path.join(homedir, '.imgAutoUploader')

export const initDotFolder = (): void => {
  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath)
  }
}

// TODO: use DotConfig Type
export const loadConfig = (): {} => {
  const configPath = path.join(tempPath, `config.json`)
  if (!fs.existsSync(configPath)) return null
  return JSON.parse(fs.readFileSync(configPath, 'utf8'))
}

// TODO: use DotConfig Type
export const saveConfig = (config: {}) => {
  const configPath = path.join(tempPath, `config.json`)
  fs.writeFileSync(configPath, JSON.stringify(config))
}

export const loadFiles = (sourcePath: string): string[] => {
  if (fs.existsSync(sourcePath)) {
    const items = fs.readdirSync(sourcePath)
    return items.filter(item => {
      const targetPath = path.join(sourcePath, item)
      return fs.lstatSync(targetPath).isDirectory() || isValidPath(targetPath)
    })
  }
  return ['No path match']
}

export const convertToPath = (input: string): string => {
  if (!input || input === ' ') return '.'
  return input
}
