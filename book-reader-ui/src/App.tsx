import React from 'react'
import { BookReader } from './components/BookReader'
import { BookProvider } from './context/BookContext'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-parchment-50 via-parchment-100 to-parchment-200">
      <BookProvider>
        <BookReader />
      </BookProvider>
    </div>
  )
}

export default App