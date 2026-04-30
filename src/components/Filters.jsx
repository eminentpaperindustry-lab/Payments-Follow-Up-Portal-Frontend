import MultiSelect from "./MultiSelect"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function Filters({
  partyOptions,
  consigneeOptions,
  filters,
  setFilters
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Advanced Filters
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 block">Start Date</label>
          <DatePicker
            selected={filters.startDate}
            onChange={(d) => setFilters({ ...filters, startDate: d })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
            placeholderText="Select start date"
            dateFormat="dd/MM/yyyy"
            isClearable
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 block">End Date</label>
          <DatePicker
            selected={filters.endDate}
            onChange={(d) => setFilters({ ...filters, endDate: d })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
            placeholderText="Select end date"
            dateFormat="dd/MM/yyyy"
            isClearable
          />
        </div>

        <div>
          <MultiSelect
            options={partyOptions}
            value={filters.parties}
            onChange={(v) => setFilters({ ...filters, parties: v })}
            placeholder="Select parties..."
            label="Party"
          />
        </div>

        <div>
          <MultiSelect
            options={consigneeOptions}
            value={filters.consignees}
            onChange={(v) => setFilters({ ...filters, consignees: v })}
            placeholder="Select consignees..."
            label="Consignee"
          />
        </div>
      </div>
    </div>
  )
}