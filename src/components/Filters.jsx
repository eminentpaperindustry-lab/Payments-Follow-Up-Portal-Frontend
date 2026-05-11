import MultiSelect from "./MultiSelect"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function Filters({
  partyOptions,
  consigneeOptions,
  filters,
  setFilters,
  onPartyChange,
  onConsigneeChange,
  onDateRangeChange,
  loading = false,
  isUpdating = false
}) {
  const handlePartyChange = (newParties) => {
    if (onPartyChange) {
      onPartyChange(newParties)
    } else {
      setFilters({ ...filters, parties: newParties })
    }
  }

  const handleConsigneeChange = (newConsignees) => {
    if (onConsigneeChange) {
      onConsigneeChange(newConsignees)
    } else {
      setFilters({ ...filters, consignees: newConsignees })
    }
  }

  const handleStartDateChange = (date) => {
    if (onDateRangeChange) {
      onDateRangeChange(date, filters.endDate)
    } else {
      setFilters({ ...filters, startDate: date })
    }
  }

  const handleEndDateChange = (date) => {
    if (onDateRangeChange) {
      onDateRangeChange(filters.startDate, date)
    } else {
      setFilters({ ...filters, endDate: date })
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
        {isUpdating && (
          <div className="ml-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Start Date */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 block">Start Date (Optional)</label>
          <DatePicker
            selected={filters.startDate}
            onChange={handleStartDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
            placeholderText="Select start date"
            dateFormat="dd/MM/yyyy"
            isClearable
          />
        </div>

        {/* End Date */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 block">End Date (Optional)</label>
          <DatePicker
            selected={filters.endDate}
            onChange={handleEndDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
            placeholderText="Select end date"
            dateFormat="dd/MM/yyyy"
            isClearable
            minDate={filters.startDate}
          />
        </div>

        {/* Party MultiSelect */}
        <div>
          <MultiSelect
            options={partyOptions}
            value={filters.parties}
            onChange={handlePartyChange}
            placeholder="Select parties..."
            label="Party"
            loading={loading && partyOptions.length === 0}
          />
        </div>

        {/* Consignee MultiSelect */}
        <div>
          <MultiSelect
            options={consigneeOptions}
            value={filters.consignees}
            onChange={handleConsigneeChange}
            placeholder="Select consignees..."
            label="Consignee"
            loading={loading && consigneeOptions.length === 0}
          />
        </div>
      </div>
      
      {/* Active Filters Summary */}
      {(filters.startDate || filters.endDate || filters.parties.length > 0 || filters.consignees.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500 font-medium">Active Filters:</span>
            {filters.startDate && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Start: {filters.startDate.toLocaleDateString()}
              </span>
            )}
            {filters.endDate && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                End: {filters.endDate.toLocaleDateString()}
              </span>
            )}
            {filters.parties.length > 0 && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {filters.parties.length} Party(s)
              </span>
            )}
            {filters.consignees.length > 0 && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                {filters.consignees.length} Consignee(s)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}