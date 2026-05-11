import axios from "axios"

const API = process.env.REACT_APP_API_URL || "http://localhost:5003/api/payments"

const apiClient = axios.create({
  baseURL: API,
  timeout: 120000, // Increased timeout for large bulk operations
  headers: { 'Content-Type': 'application/json' }
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message)
    return Promise.reject(error)
  }
)

const encodeNames = (names) => {
  if (!names || names.length === 0) return ""
  return names.map(n => encodeURIComponent(n.value || n)).join('|||')
}

export const getParties = (params = {}) => {
  console.log("Fetching parties with params:", params)
  return apiClient.get("/parties", { params })
}

export const getConsignees = (parties, params = {}) => {
  const partiesParam = encodeNames(parties)
  console.log("Fetching consignees for parties:", parties.length)
  return apiClient.get("/consignees", { params: { ...params, parties: partiesParam } })
}

export const getPayments = (filters) => {
  return apiClient.get("/", {
    params: {
      startDate: filters.startDate || "",
      endDate: filters.endDate || "",
      parties: encodeNames(filters.parties || []),
      consignees: encodeNames(filters.consignees || []),
      skipCache: filters.skipCache || false
    }
  })
}

export const updateSingleFollowUp = (billNumber, followUpDate) => {
  return apiClient.post("/update-followup-single", { billNumber, followUpDate })
}

export const updateBulkFollowUp = (billNumbers, followUpDate) => {
  return apiClient.post("/update-followup", { billNumbers, followUpDate })
}

export const clearCache = () => apiClient.post("/clear-cache")