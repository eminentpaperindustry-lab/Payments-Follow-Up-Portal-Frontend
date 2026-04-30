import { useEffect, useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { 
  getParties, 
  getConsignees, 
  getPayments, 
  updateSingleFollowUp,
  updateBulkFollowUp 
} from "./api"
import Filters from "./components/Filters"

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  
  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[250px]`}>
        {type === 'success' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {type === 'error' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-80">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function App() {
  const [data, setData] = useState([])
  const [selectedRows, setSelectedRows] = useState([])
  const [partyOptions, setPartyOptions] = useState([])
  const [consigneeOptions, setConsigneeOptions] = useState([])
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isBulkAction, setIsBulkAction] = useState(false)
  const [currentBillNo, setCurrentBillNo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [copySuccess, setCopySuccess] = useState(false)
  const [toast, setToast] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    parties: [],
    consignees: []
  })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const formatLocalDate = (date) => {
    if (!date) return null
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const copyBillNumbersToClipboard = async () => {
    if (data.length === 0) {
      showToast("No bill numbers available to copy", 'error')
      return
    }

    const billNumbers = data.map(row => row.billNo).filter(Boolean)
    const billNumbersText = billNumbers.join('\n')
    
    try {
      await navigator.clipboard.writeText(billNumbersText)
      setCopySuccess(true)
      showToast(`Copied ${billNumbers.length} bill numbers!`, 'success')
      setTimeout(() => setCopySuccess(false), 3000)
    } catch (err) {
      showToast("Failed to copy bill numbers", 'error')
    }
  }

  useEffect(() => {
    loadParties()
  }, [])

  useEffect(() => {
    if (partyOptions.length > 0 && filters.parties.length === 0) {
      setFilters(prev => ({
        ...prev,
        parties: [...partyOptions]
      }))
    }
  }, [partyOptions])

  useEffect(() => {
    if (filters.parties.length > 0) {
      loadConsignees()
    } else {
      setConsigneeOptions([])
      setFilters(prev => ({ ...prev, consignees: [] }))
    }
  }, [filters.parties])

  useEffect(() => {
    if (consigneeOptions.length > 0 && filters.consignees.length === 0) {
      setFilters(prev => ({
        ...prev,
        consignees: [...consigneeOptions]
      }))
    }
  }, [consigneeOptions])

  useEffect(() => {
    if (filters.parties.length > 0) {
      loadData()
    }
  }, [filters])

  const loadParties = async () => {
    try {
      const res = await getParties()
      const options = res.data.map(p => ({
        value: p,
        label: p
      }))
      setPartyOptions(options)
    } catch (error) {
      showToast("Error loading parties", 'error')
    }
  }

  const loadConsignees = async () => {
    try {
      const partyNames = filters.parties.map(p => p.value)
      const res = await getConsignees(partyNames)
      const options = res.data.map(c => ({
        value: c,
        label: c
      }))
      setConsigneeOptions(options)
    } catch (error) {
      showToast("Error loading consignees", 'error')
    }
  }

  const loadData = async () => {
    if (loading) return
    
    setLoading(true)
    try {
      const apiFilters = {
        parties: filters.parties.map(p => p.value || p),
        consignees: filters.consignees.map(c => c.value || c),
        startDate: formatLocalDate(filters.startDate),
        endDate: formatLocalDate(filters.endDate)
      }
      
      const res = await getPayments(apiFilters)
      setData(res.data)
      setSelectedRows([])
      setLastUpdated(new Date())
      setCopySuccess(false)
    } catch (error) {
      showToast("Failed to load data", 'error')
    } finally {
      setLoading(false)
    }
  }

  const toggleRowSelection = (billNo) => {
    setSelectedRows(prev => 
      prev.includes(billNo) 
        ? prev.filter(b => b !== billNo)
        : [...prev, billNo]
    )
  }

  const toggleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(data.map(row => row.billNo))
    }
  }

  const handleSingleFollowUp = (billNo) => {
    setCurrentBillNo(billNo)
    setIsBulkAction(false)
    setShowDatePicker(true)
  }

  const handleBulkFollowUp = () => {
    if (selectedRows.length === 0) {
      showToast("Please select at least one row", 'error')
      return
    }
    setIsBulkAction(true)
    setShowDatePicker(true)
  }

  const handleDateConfirm = async () => {
    const date = formatLocalDate(selectedDate)
    
    setLoading(true)
    try {
      if (isBulkAction) {
        await updateBulkFollowUp(selectedRows, date)
        showToast(`${selectedRows.length} bills updated successfully!`, 'success')
        setSelectedRows([])
      } else {
        await updateSingleFollowUp(currentBillNo, date)
        showToast("Follow up updated successfully!", 'success')
      }
      
      setShowDatePicker(false)
      await loadData()
      
    } catch (error) {
      showToast("Failed to update follow up", 'error')
    } finally {
      setLoading(false)
    }
  }

  const totalBills = data.length
  console.log("data: ", data);
  
  const totalBalance = data.reduce((sum, row) => sum + (parseFloat(row.balance) || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">FMS Follow Up</h1>
            <p className="text-xs text-blue-100">Manage your follow-ups</p>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Desktop Header */}
        <div className="hidden lg:block bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Payments Follow Up Portal
              </h1>
              <p className="text-blue-100 mt-1">Manage your follow-ups efficiently</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                disabled={loading}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? "Refreshing..." : "Refresh"}
              </button>
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <span className="text-sm opacity-90">Last Updated:</span>
                <span className="ml-2 font-semibold">{lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-500 font-medium">Total Bills</p>
                <p className="text-xl lg:text-3xl font-bold text-gray-800 mt-1">{totalBills}</p>
              </div>
              <div className="bg-blue-100 p-2 lg:p-3 rounded-lg">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-500 font-medium">Total Balance</p>
                <p className="text-lg lg:text-3xl font-bold text-gray-800 mt-1">₹{totalBalance.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-2 lg:p-3 rounded-lg">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-500 font-medium">Selected Bills</p>
                <p className="text-xl lg:text-3xl font-bold text-gray-800 mt-1">{selectedRows.length}</p>
              </div>
              <div className="bg-purple-100 p-2 lg:p-3 rounded-lg">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border-l-4 border-orange-500 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105"
            onClick={copyBillNumbersToClipboard}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-500 font-medium">Copy Bill Numbers</p>
                <p className="text-sm lg:text-xl font-bold text-gray-800 mt-1">
                  {copySuccess ? "Copied! ✓" : "Click to Copy"}
                </p>
              </div>
              <div className={`p-2 lg:p-3 rounded-lg transition-all ${copySuccess ? 'bg-green-100' : 'bg-orange-100'}`}>
                {copySuccess ? (
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        <Filters
          partyOptions={partyOptions}
          consigneeOptions={consigneeOptions}
          filters={filters}
          setFilters={setFilters}
        />

        {selectedRows.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleBulkFollowUp}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg shadow-lg flex items-center space-x-2 transition-all transform hover:scale-105 disabled:opacity-50 text-sm lg:text-base"
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Update Selected ({selectedRows.length})</span>
            </button>
          </div>
        )}

        {/* Table - Horizontal Scroll on Mobile */}
        <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] lg:min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="p-3 lg:p-4 text-left">
                    <input
                      type="checkbox"
                      checked={data.length > 0 && selectedRows.length === data.length}
                      onChange={toggleSelectAll}
                      disabled={loading}
                      className="rounded h-4 w-4 text-blue-600"
                    />
                  </th>
                  <th className="p-3 lg:p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bill No</th>
                  <th className="p-3 lg:p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Party</th>
                  <th className="p-3 lg:p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Consignee</th>
                  <th className="p-3 lg:p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Bill Date</th>
                  <th className="p-3 lg:p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance</th>
                  <th className="p-3 lg:p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Planned For Loop</th>
                  <th className="p-3 lg:p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                        <p className="text-gray-500 text-sm">Loading data...</p>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-gray-500 text-sm">No data found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((row, index) => (
                    <tr 
                      key={index} 
                      className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${selectedRows.includes(row.billNo) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="p-3 lg:p-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.billNo)}
                          onChange={() => toggleRowSelection(row.billNo)}
                          className="rounded h-4 w-4 text-blue-600"
                        />
                      </td>
                      <td className="p-3 lg:p-4 text-sm font-medium text-gray-900">{row.billNo}</td>
                      <td className="p-3 lg:p-4 text-sm text-gray-600 hidden sm:table-cell">{row.party}</td>
                      <td className="p-3 lg:p-4 text-sm text-gray-600 hidden md:table-cell">{row.consignee}</td>
                      <td className="p-3 lg:p-4 text-sm text-gray-600 hidden lg:table-cell">{row.billDate}</td>
                      <td className="p-3 lg:p-4 text-sm font-medium text-gray-900">₹{parseFloat(row.balance).toLocaleString()}</td>
                      <td className="p-3 lg:p-4 hidden md:table-cell">
                        {row.plannedForLoop ? (
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                            {row.plannedForLoop}
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            Not Set
                          </span>
                        )}
                      </td>
                      <td className="p-3 lg:p-4">
                        <button
                          onClick={() => handleSingleFollowUp(row.billNo)}
                          disabled={loading}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm flex items-center space-x-1 disabled:opacity-50"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="hidden xs:inline">Follow Up</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Improved Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                {isBulkAction ? 'Bulk Follow Up' : 'Single Follow Up'}
              </h3>
              <button
                onClick={() => setShowDatePicker(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-4">
                {isBulkAction 
                  ? `Select date for ${selectedRows.length} selected bills`
                  : 'Select follow up date'
                }
              </p>

              <div className="flex justify-center">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  inline
                  minDate={new Date()}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t">
              <button
                onClick={handleDateConfirm}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 rounded-lg font-medium transition-all disabled:opacity-50"
              >
                {loading ? "Updating..." : "Confirm"}
              </button>
              <button
                onClick={() => setShowDatePicker(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App