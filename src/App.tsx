import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DarkModeProvider } from './context/DarkModeContext'
import HomePage from './pages/HomePage'
import CharacterCreatePage from './pages/CharacterCreatePage'
import CharacterSheetPage from './pages/CharacterSheetPage'

function App() {
  return (
    <DarkModeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/character/new" element={<CharacterCreatePage />} />
          <Route path="/character/:id" element={<CharacterSheetPage />} />
        </Routes>
      </BrowserRouter>
    </DarkModeProvider>
  )
}

export default App
