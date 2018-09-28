import analyzeExports, { listFiles, findExports, parseExports } from '../'

describe('unusedExports', () => {
  test('it finds export usage', () => {
    const results = analyzeExports('../__mockDirectory__')

    expect(results).toEqual({
      'client/utils/display.js': {
        default: ['client/components/A.js', 'client/components/B.js'],
        Display: ['client/components/C.js'],
      },
      'client/utils/camelcase.js': {
        default: [],
      },
    })
  })
})

describe('listFiles', () => {
  test('it will walk trough the dir and get a list of files', async () => {
    const files = await listFiles('./src/__mockDirectory__')

    expect(files).toEqual([
      './client/components/A.js',
      './client/components/B.js',
      './client/components/C.js',
      './client/utils/camelcase.js',
      './client/utils/display.js',
    ])
  })
})

describe('findExport', () => {
  test('it will find exports given a file', async () => {
    const results = await findExports(
      './src/__mockDirectory__',
      './client/utils/display.js'
    )
    expect(results).toEqual({ exports: ['default', 'Display'] })
  })
})

describe('parsingExports', () => {
  test('it finds es6 exports', () => {
    const sampleContents = `
export default "display";
export const Display1 = "";
export { Display2 }
export { Display3, Display4, Display5 }
export { 
	Display6, 
	Display7, 
	Display8
}
export function Display9() {}
export class Display10 {}
export class Display11 extends Component {}
export Display12 from 'display'

`
    expect(parseExports(sampleContents)).toEqual([
      'default',
      'Display1',
      'Display2',
      'Display3',
      'Display4',
      'Display5',
      'Display6',
      'Display7',
      'Display8',
      'Display9',
      'Display10',
      'Display11',
      'Display12',
    ])
  })
})
