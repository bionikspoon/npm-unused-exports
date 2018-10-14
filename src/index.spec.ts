import analyzeExports, { findFiles, parseFile } from '.'

describe('analyzeExports', () => {
  test('it finds export usage', async () => {
    const results = await analyzeExports(
      './src/__mockDirectory__',
      './client/**/*',
      {
        modules: ['client'],
      }
    )

    expect(results).toEqual({
      '@bionikspoon/package': {},
      'client/components/A.js': { default: ['client/components/App/App.js'] },
      'client/components/App/App.js': {
        default: ['client/components/App/index.js'],
      },
      'client/components/App/index.js': { default: ['client/index.js'] },
      'client/components/App/query.graphql': {
        default: ['client/components/App/App.js'],
      },
      'client/components/App/styles.css': {
        default: [],
      },
      'client/components/B.js': { default: ['client/components/App/App.js'] },
      'client/components/C.js': { default: ['client/components/App/App.js'] },
      'client/constants.js': {
        PUBLISH: ['client/components/App/App.js'],
        SUBSCRIBE: ['client/components/App/App.js'],
      },
      'client/index.js': {},
      'client/utils/camelcase.js': { default: [] },
      'client/utils/display.js': {
        Display: ['client/components/C.js'],
        default: ['client/components/A.js', 'client/components/B.js'],
      },
      ramda: {},
      react: {
        default: ['client/index.js', 'client/components/App/App.js'],
      },
      'react-dom': {
        render: ['client/index.js'],
      },
    })
  })
})

describe('findFiles', () => {
  test('it finds js files in a directory', async () => {
    const files = await findFiles('./src/__mockDirectory__', './client/**/*')

    expect(files).toEqual([
      './client/components/A.js',
      './client/components/App/App.js',
      './client/components/App/index.js',
      './client/components/App/query.graphql',
      './client/components/App/styles.css',
      './client/components/B.js',
      './client/components/C.js',
      './client/constants.js',
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
      exports: ['default', 'Display'],
      imports: [],
      pathname: './client/utils/display.js',
    })
  })

  test('parses a files import and exports', async () => {
    const results = await parseFile(
      './src/__mockDirectory__',
      './client/components/A.js'
    )
    expect(results).toEqual({
      exports: ['default'],
      imports: [['default', '../utils/display']],
      pathname: './client/components/A.js',
    })
  })

  test('parses a non js file', async () => {
    const results = await parseFile(
      './src/__mockDirectory__',
      './client/components/App/query.graphql'
    )
    expect(results).toEqual({
      exports: ['default'],
      imports: [],
      pathname: './client/components/App/query.graphql',
    })
  })
})
