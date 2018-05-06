import * as mime from 'mime'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
const homedir = os.homedir()

interface ImageInfo {
  localpath: string
  fileName: string
  mime: string
  name: string
}

const SUPPORT_MIMES = ['image/gif', 'image/jpeg', 'image/png', 'image/bmp']

export const generateStruct = (paths: string[]): ImageInfo[] =>
  paths.reduce((infos: [ImageInfo] | any, localpath: string) => {
    let info: ImageInfo = {
      localpath: null,
      fileName: null,
      mime: null,
      name: null
    }
    info.localpath = localpath
    info.fileName = path.basename(localpath)
    info.mime = fetchMimeType(localpath)
    info.name = info.fileName.split('.')[0]
    return infos.concat(info)
  }, [])

export const fetchMimeType = (path: string): string => mime.getType(path)

export const tempPath = path.join(homedir, '.imgAutoUploader')

export const initFoldre = () => {
  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath)
  }
}

export const loadConfg = () => {
  const configPath = path.join(tempPath, `config.json`)
  if (!fs.existsSync(configPath)) return null
  return JSON.parse(fs.readFileSync(configPath, 'utf8'))
}

export const saveConfg = config => {
  const configPath = path.join(tempPath, `config.json`)
  fs.writeFileSync(configPath, config)
  return true
}

export const loadFiles = localPath => {
  if (fs.existsSync(localPath)) {
    const items = fs.readdirSync(localPath)
    return items.filter(item => {
      const targetPath = path.join(localPath, item)
      return (
        fs.lstatSync(targetPath).isDirectory() ||
        SUPPORT_MIMES.indexOf(fetchMimeType(targetPath)) >= 0
      )
    })
  }
  return ['No path match']
}

export const convertToPath = input => {
  if (!input || input === ' ') return '.'
  return input
}
