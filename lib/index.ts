import * as path from 'path'

import * as mime from 'mime'
import { info, warn, error, success, fatal } from 'consola'

import { init as initTinyPNG, tinyFile } from '../lib/compression/tinyPNG'
import {
  init as initQiniu,
  upload as uploadToQiniu
} from '../lib/storage/qiniu'

interface ImageInfo {
  sourcePath: string
  fileName: string
  mime: string
  name: string
}

interface UploadResult {
  image: ImageInfo
  url: string
  html: string
  md: string
}

enum compressService {
  TinyPNG
}

enum uploadService {
  DigitalOcean,
  Qiniu
}

enum resultType {
  HTML,
  Markdown,
  URL
}

interface DotConfig {
  general?: {
    needCompress?: boolean
    compressService?: compressService
    uploadService?: uploadService
    resultType?: resultType
  }
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

let needCompress: boolean,
  compress: { (sourcePath: string): void },
  upload: { (sourcePath: string, name: string): string }

export const isValidPath = (path: string): boolean =>
  SUPPORT_MIMES.indexOf(mime.getType(path)) >= 0

// TODO: fix allow string[] or {path, name}[]
export const initImageInfo = (
  paths: string[],
  name: string[] = []
): ImageInfo[] =>
  paths.reduce((infos: ImageInfo[], sourcePath, index) => {
    let info: ImageInfo
    info.sourcePath = sourcePath
    info.fileName = path.basename(sourcePath)
    info.mime = mime.getType(sourcePath)
    info.name = name[index] || info.fileName.split('.')[0]
    return infos.concat(info)
  }, [])

export const initServices = (config: DotConfig) => {
  if (config) {
    initTinyPNG(config.tinyPNG)
    initQiniu(config.qiniu)
  } else {
    // Emit
    info('>>> Not config the app yet, please run `imgup config` to init.')
    process.exit(0)
  }
}

export const processImages = (images: ImageInfo[]): Promise<UploadResult[]> => {
  try {
    const uploadProcess = images.map(
      image =>
        new Promise((resolve, reject): Promise<string> | void => {
          ;(async () => {
            if ((needCompress = true)) {
              await compress(image.sourcePath)
            }
            const uploadPath = await upload(image.sourcePath, image.name)
            resolve(uploadPath)
          })()
        })
    )

    return Promise.all(uploadProcess).then(urls => {
      return images.map((image, index) => ({
        image,
        url: <string>urls[index],
        md: `![${image.name}](${urls[index]})`,
        html: `<img src="${urls[index]}">`
      }))
    })
  } catch (err) {}
}
