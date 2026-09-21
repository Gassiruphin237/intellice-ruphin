import { Navigate, Route, Routes } from 'react-router-dom'
import { CVChat } from './pages/CVChat'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/chat" element={<CVChat />} />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  )
}
