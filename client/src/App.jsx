import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CourierList from './components/CourierList'
import CourierDetail from './components/CourierDetail'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Courier Management</h1>
          <Routes>
            <Route path="/" element={<CourierList />} />
            <Route path="/courier/:id" element={<CourierDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
