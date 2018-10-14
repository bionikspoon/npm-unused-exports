import resolveImportFactory from './resolveImportFactory'

describe('with default options', () => {
  const resolveImport = resolveImportFactory('src/__mockDirectory__/')

  test('it resolves local', async () => {
    expect(await resolveImport('client/components/B.js', './A')).toEqual(
      'client/components/A.js'
    )
  })
  test('it assumes index', async () => {
    expect(await resolveImport('client/index.js', './components/App')).toEqual(
      'client/components/App/index.js'
    )
  })
})

describe('with options', () => {
  const resolveImport = resolveImportFactory('src/__mockDirectory__/', {
    modules: ['client'],
  })

  test('it assumes allows customization', async () => {
    expect(
      await resolveImport('client/components/C.js', 'utils/display')
    ).toEqual('client/utils/display.js')
  })
})

describe('with npm module', () => {
  const resolveImport = resolveImportFactory('src/__mockDirectory__/', {
    modules: ['client'],
  })

  test("it does't resolve npm modules", async () => {
    expect(await resolveImport('client/components/C.js', 'react/src')).toEqual(
      'react'
    )
  })
})
describe('with namespaced npm module', () => {
  const resolveImport = resolveImportFactory('src/__mockDirectory__/', {
    modules: ['client'],
  })

  test('it works with namespaced npm modules', async () => {
    expect(
      await resolveImport(
        'client/components/C.js',
        '@bionikspoon/package/folder'
      )
    ).toEqual('@bionikspoon/package')
  })
})
