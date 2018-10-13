import parseContent from './parseContent'

describe('parseContent', () => {
  test('it finds es6 exports', () => {
    const sampleContent = `
    export default "display";
    export const Display1 = "";
    export { Display2 as Display3 }
    export { Display4 }
    export { Display5, Display6, Display7 as Display8 }
    export {
        Display9,
        Display10,
        Display11 as Display12
    }
    export function Display13() {}
    export class Display14 {}
    export class Display15 extends Component {}
    export Display16 from './display16'
    export { Display17, Display18, Display19 as Display20 } from './display17'
    `

    expect(parseContent(sampleContent, './index.js')).toEqual({
      exports: [
        'default',
        'Display1',
        'Display3',
        'Display4',
        'Display5',
        'Display6',
        'Display8',
        'Display9',
        'Display10',
        'Display12',
        'Display13',
        'Display14',
        'Display15',
        'Display16',
        'Display17',
        'Display18',
        'Display20',
      ],
      imports: [
        ['default', './display16'],
        ['Display17', './display17'],
        ['Display18', './display17'],
        ['Display19', './display17'],
      ],
      pathname: './index.js',
    })
  })

  test('it finds imports', () => {
    const sampleContent = `
    import Display1 from './display1'
    import { Display2 } from './display2'
    import { Display3, Display4, Display5 } from './display3'
    import Display6, { Display7, Display8 } from './display4'
    import * as something from './display5'
    `

    expect(parseContent(sampleContent, './index.js')).toEqual({
      exports: [],
      imports: [
        ['default', './display1'],
        ['Display2', './display2'],
        ['Display3', './display3'],
        ['Display4', './display3'],
        ['Display5', './display3'],
        ['default', './display4'],
        ['Display7', './display4'],
        ['Display8', './display4'],
        ['*', './display5'],
      ],
      pathname: './index.js',
    })
  })
})
