import { useState, useRef, useEffect } from "react"

export default function MultiSelect({ options, value, onChange, placeholder, label }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([])
    } else {
      onChange([...options])
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

  const isAllSelected = value.length === options.length && options.length > 0

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
        className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white flex justify-between items-center"
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
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {/* Select All Option */}
          <div 
            className="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
            onClick={handleSelectAll}
          >
            <input
              type="checkbox"
              className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300"
              checked={isAllSelected}
              onChange={() => {}}
            />
            <span className={`text-sm font-medium ${isAllSelected ? 'text-blue-700' : 'text-gray-700'}`}>
              ☑️ Select All
            </span>
          </div>

          {/* Individual Options */}
          {options.map((option) => {
            const isSelected = value.some(v => v.value === option.value)
            return (
              <div 
                key={option.value}
                className="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer"
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
        </div>
      )}
    </div>
  )
}