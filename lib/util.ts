import * as mime from 'mime'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
export * from 'util'

const homedir = os.homedir()

interface ImageInfo {
  localPath: string
  fileName: string
  mime: string
  name: string
}

interface DotConfig {
  tinyPNG?: {
    KEY: string
  }
  qiniu?: {
    ACCESS_KEY: string
    SECRET_KEY: string
    BUCKET: string
    DOMAIN: string
  }
}

const SUPPORT_MIMES = ['image/gif', 'image/jpeg', 'image/png', 'image/bmp']

export const initImageInfos = (paths: string[]): ImageInfo[] =>
  paths.reduce((infos: ImageInfo[], localPath: string) => {
    let info: ImageInfo
    info.localPath = localPath
    info.fileName = path.basename(localPath)
    info.mime = getMimeType(localPath)
    info.name = info.fileName.split('.')[0]
    return infos.concat(info)
  }, [])

export const getMimeType = (path: string): string => mime.getType(path)

export const tempPath: string = path.join(homedir, '.imgAutoUploader')

export const initDotFolder = (): void => {
  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath)
  }
}

export const loadConfig = (): any => {
  const configPath = path.join(tempPath, `config.json`)
  if (!fs.existsSync(configPath)) return null
  return JSON.parse(fs.readFileSync(configPath, 'utf8'))
}

export const saveConfig = (config: DotConfig) => {
  const configPath = path.join(tempPath, `config.json`)
  fs.writeFileSync(configPath, config)
}

export const loadFiles = (localPath: string): string[] => {
  if (fs.existsSync(localPath)) {
    const items = fs.readdirSync(localPath)
    return items.filter(item => {
      const targetPath = path.join(localPath, item)
      return (
        fs.lstatSync(targetPath).isDirectory() ||
        SUPPORT_MIMES.indexOf(getMimeType(targetPath)) >= 0
      )
    })
  }
  return ['No path match']
}

export const convertToPath = (input: string): string => {
  if (!input || input === ' ') return '.'
  return input
}
