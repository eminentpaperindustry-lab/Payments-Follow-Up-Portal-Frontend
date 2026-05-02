import { useState, useRef, useEffect } from "react"

export default function MultiSelect({ options, value, onChange, placeholder, label, loading = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleSelectAll = () => {
    if (value.length === filteredOptions.length && filteredOptions.length > 0) {
      onChange([])
    } else {
      onChange([...filteredOptions])
    }
  }

  const handleSelect = (option) => {
    const isSelected = value.some(v => v.value === option.value)
    if (isSelected) {
      onChange(value.filter(v => v.value !== option.value))
    } else {
      onChange([...value, option])
    }
  }

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isAllSelected = value.length === filteredOptions.length && filteredOptions.length > 0
  const isIndeterminate = value.length > 0 && value.length < filteredOptions.length

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-semibold text-gray-700 block mb-1 animate-pulse">
            {label}
          </label>
        )}
        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="text-sm font-semibold text-gray-700 block mb-1">
          {label}
        </label>
      )}
      
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white flex justify-between items-center hover:bg-gray-50"
        type="button"
      >
        <span className={value.length > 0 ? "text-gray-700" : "text-gray-400"}>
          {value.length > 0 ? `${value.length} selected` : placeholder || "Select..."}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSearchTerm("")
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-gray-400 text-sm">
                No options found
              </div>
            ) : (
              <>
                {/* Select All Option */}
                <div 
                  className="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 sticky top-0 bg-white"
                  onClick={handleSelectAll}
                >
                  <input
                    type="checkbox"
                    className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300"
                    checked={isAllSelected}
                    ref={input => {
                      if (input) {
                        input.indeterminate = isIndeterminate
                      }
                    }}
                    onChange={() => {}}
                  />
                  <span className={`text-sm font-medium ${isAllSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                    {isAllSelected ? "✓ Deselect All" : "☑️ Select All"}
                  </span>
                </div>

                {/* Individual Options */}
                {filteredOptions.map((option) => {
                  const isSelected = value.some(v => v.value === option.value)
                  return (
                    <div 
                      key={option.value}
                      className="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => handleSelect(option)}
                    >
                      <input
                        type="checkbox"
                        className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300"
                        checked={isSelected}
                        onChange={() => {}}
                      />
                      <span className={`text-sm ${isSelected ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
                        {option.label}
                      </span>
                    </div>
                  )
                })}
              </>
            )}
          </div>

          {/* Footer with count */}
          {filteredOptions.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
              {value.length} of {filteredOptions.length} selected
            </div>
          )}
        </div>
      )}
    </div>
  )
}