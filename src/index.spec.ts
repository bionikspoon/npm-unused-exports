import analyzeExports, { findFiles, parseFile } from '.'

describe('analyzeExports', () => {
  test('it finds export usage', async () => {
    const results = await analyzeExports('./src/__mockDirectory__', {
      modules: ['client', 'node_modules'],
    })

    expect(results).toEqual({
      'client/index.js': {},
      'client/utils/display.js': {
        default: ['client/components/A.js', 'client/components/B.js'],
        Display: ['client/components/C.js'],
      },
      'client/utils/camelcase.js': {
        default: [],
      },
      'client/components/App/App.js': {
        default: ['client/components/App/index.js'],
      },
      'client/components/App/index.js': {
        default: ['client/index.js'],
      },
      'client/components/A.js': {
        default: ['client/components/App/App.js'],
      },
      'client/components/B.js': {
        default: ['client/components/App/App.js'],
      },
      'client/components/C.js': {
        default: ['client/components/App/App.js'],
      },
    })
  })
})

describe('findFiles', () => {
  test('it finds js files in a directory', async () => {
    const files = await findFiles('./src/__mockDirectory__')

    expect(files).toEqual([
      './client/components/A.js',
      './client/components/App/App.js',
      './client/components/App/index.js',
      './client/components/B.js',
      './client/components/C.js',
      './client/index.js',
      './client/utils/camelcase.js',
      './client/utils/display.js',
    ])
  })
})

describe('parseFile', () => {
  test('parses a files import and exports', async () => {
    const results = await parseFile(
      './src/__mockDirectory__',
      './client/utils/display.js'
    )
    expect(results).toEqual({
      pathname: './client/utils/display.js',
      exports: ['default', 'Display'],
      imports: [],
    })
  })

  test('parses a files import and exports', async () => {
    const results = await parseFile(
      './src/__mockDirectory__',
      './client/components/A.js'
    )
    expect(results).toEqual({
      pathname: './client/components/A.js',
      exports: ['default'],
      imports: [['default', '../utils/display']],
    })
  })
})