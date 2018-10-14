import './styles'

import React from 'react'
import A from '../A'
import B from '../B'
import C from '../C'
import query from './query.graphql'
import * as CONSTANTS from '../../constants'

export default function App() {
  return (
    <div>
      <A />
      <B />
      <C />
    </div>
  )
}
