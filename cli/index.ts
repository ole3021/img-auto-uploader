#!/usr/bin/env node

import { info, warn, error, success, fatal } from 'consola'
import * as path from 'path'
import * as prog from 'caporal'

import { init as initTinyPNG, tiniFile } from '../lib/compression/tinyPNG'
import { init as initQiniu, upload } from '../lib/storage/qiniu'
const packageObj = require('../package')

import {
  fetchMimeType,
  generateStruct,
  initFoldre,
  tempPath,
  loadConfg
} from '../lib/utils'
import { initFiles, initConfig } from './options'

const [, , ...args] = process.argv

initFoldre()
const config = loadConfg()

initTinyPNG(config)
initQiniu(config)

const autoUploadFiles = localImages => {
  const uploadPromises = localImages.map(image =>
    tiniFile(image.localpath, path.join(tempPath, image.fileName))
      .then(() => upload(image.localpath, image.name))
      .catch(err => err)
  )

  return Promise.all(uploadPromises).then(urls => {
    const results = localImages.map((imageInfo, index) => ({
      info: imageInfo,
      url: urls[index],
      md: `![${imageInfo.name}](${urls[index]})`
    }))
    return results
  })
}

prog
  .version(packageObj.version)
  .action((args, options, logger) => {
    // args and options are objects
    initFiles()
      .then(filePaths => {
        return autoUploadFiles(generateStruct(filePaths))
      })
      .then(result => {
        result.forEach(item => {
          success(`Upload ${item.info.fileName} complete: ${item.url}`)
        })
      })
      .catch(err => error)
  })
  .command('config', 'Config the auto uploader')
  .action((args, options, logger) => {
    initConfig()
  })

prog.parse(process.argv)
