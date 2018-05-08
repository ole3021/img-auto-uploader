import { getMimeType, getFileName } from '../../lib/util'

test('Should return file mime types', () => {
  const filePaths = [
    './test/filename1.PNG',
    './test/filename2.png',
    './test/filename3.jpg',
    './test/filename4.jpeg'
  ]

  const types = filePaths.map(path => getMimeType(path))

  expect(types[0]).toBe('image/png')
  expect(types[1]).toBe('image/png')
  expect(types[2]).toBe('image/jpeg')
  expect(types[3]).toBe('image/jpeg')
})
