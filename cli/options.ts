import * as path from 'path'
import * as util from 'util'

import { info, warn, error, success, fatal } from 'consola'
import * as inquirer from 'inquirer'
import * as autoComplete from 'inquirer-autocomplete-prompt'

import { loadConfig, saveConfig, loadFiles, convertToPath } from './utils'

inquirer.registerPrompt('autocomplete', autoComplete)

export const selectFiles = () => {
  let filePath
  return inquirer
    .prompt([
      {
        type: 'autocomplete',
        name: 'fileName',
        message: 'Select the image file/folder to upload',
        source: (answersSoFar, input) => {
          filePath = `${input}`
          let origInput = input
          input = convertToPath(origInput)

          return Promise.resolve(loadFiles(input))
        }
      }
    ])
    .then(res => {
      return [path.join(__dirname, '..', filePath, res.fileName)]
    })
    .catch(err => error)
}

export const initConfig = () => {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'tinyPNG-KEY',
        message: 'Key for tinyPNG'
      },
      {
        type: 'input',
        name: 'qiniu-ACCESS_KEY',
        message: 'The access key for qiniu'
      },
      {
        type: 'input',
        name: 'qiniu-SECRET_KEY',
        message: 'The secret key for qiniu'
      },
      {
        type: 'input',
        name: 'qiniu-BUCKET',
        message: 'The bucket name of qiniu'
      },
      {
        type: 'input',
        name: 'qiniu-DOMAIN',
        message: 'The domain for qiniu bucket'
      }
    ])
    .then(res => {
      const config = Object.keys(res).reduce((config, key) => {
        const [type, prop] = key.split('-')

        config[type] = config[type] || {}
        config[type][prop] = res[key]
        return config
      }, {})

      info(`Going set the configs as follow`, util.inspect(config))
      return inquirer
        .prompt({
          type: 'confirm',
          name: 'toInit',
          message: 'Are you sure to continue'
        })
        .then(res => {
          if (res.toInit) {
            saveConfig(config)
            success('Config init successfully.')
          } else {
            fatal('Abort init config.')
          }
        })
    })
}
