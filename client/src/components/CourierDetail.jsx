import { Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

function CourierDetail() {
  const { id } = useParams()
  const [courier, setCourier] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/couriers/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Courier not found')
        return res.json()
      })
      .then(data => {
        setCourier(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch courier:', err)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return <p className="text-gray-600">Loading courier...</p>
  }

  if (!courier) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Courier not found</p>
        <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to list
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to list
      </Link>
      <div className="bg-white rounded-lg shadow-md p-8 mt-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">{courier.name}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Employee ID</p>
              <p className="text-lg font-medium text-gray-800">{courier.employeeId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Global Courier ID</p>
              <p className="text-lg font-medium text-gray-800">{courier.globalCourierId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">City</p>
              <p className="text-lg font-medium text-gray-800">{courier.city}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Vehicle</p>
              <p className="text-lg font-medium text-gray-800">{courier.vehicle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Onboarding Status</p>
              <p className={`text-lg font-medium ${
                courier.onboardingStatus === 'verified' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {courier.onboardingStatus}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Status</p>
              <p className={`text-lg font-medium ${courier.active ? 'text-green-600' : 'text-red-600'}`}>
                {courier.active ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourierDetail
