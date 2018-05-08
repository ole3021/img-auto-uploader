#!/usr/bin/env node

import { info, warn, error, success, fatal } from 'consola'
import * as prog from 'caporal'

const packageObj = require('../package')

import { initImageInfo, initServices, processImages } from '../lib'

import { initDotFolder, loadConfig } from './utils'
import { selectFiles, initConfig } from './options'

const [, , ...args] = process.argv

initDotFolder()
const config = loadConfig()

prog
  .version(packageObj.version)
  .action(async (args, options, logger) => {
    try {
      initServices(config)
      const filePaths = await selectFiles()
      const results = await processImages(initImageInfo(filePaths))

      return results.forEach(item => {
        success(`Upload ${item.image.fileName} complete: ${item.md}`)
      })
    } catch (err) {
      error('Fail to upload image', err)
    }
  })
  .command('config', 'Config the auto uploader')
  .action(() => initConfig())

prog.parse(process.argv)
