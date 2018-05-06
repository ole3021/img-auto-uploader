import * as tinify from 'tinify'

export const init = ({ tinyPNG }) => {
  tinify.key = tinyPNG.KEY
}

export const tiniFile = async (
  source: string,
  target: string
): Promise<Boolean> => {
  try {
    await tinify.fromFile(source).toFile(target)
    return true
  } catch (err) {
    console.log('>>> err', err)
    return false
  }
}
