import axios from "axios"

const API = process.env.REACT_APP_API_URL || "http://localhost:5003/api/payments"

// Create axios instance with interceptors for cache control
const apiClient = axios.create({
  baseURL: API,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Add request interceptor to handle cache busting
apiClient.interceptors.request.use((config) => {
  if (config.method === 'get' && config.params?.skipCache) {
    config.params._t = Date.now()
    delete config.params.skipCache
  }
  return config
})

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Helper: Encode party/consignee names with special separator
const encodeNames = (names) => {
  if (!names || names.length === 0) return ""
  return names.map(n => encodeURIComponent(n.value || n)).join('|||')
}

export const getParties = () => {
  return apiClient.get("/parties")
}

export const getConsignees = (parties) => {
  const partiesParam = encodeNames(parties)
  console.log("🔍 Fetching consignees for parties:", parties)
  return apiClient.get("/consignees", {
    params: { parties: partiesParam }
  })
}

export const getPayments = (filters) => {
  const partiesParam = encodeNames(filters.parties || [])
  const consigneesParam = encodeNames(filters.consignees || [])
  
  console.log("🔍 Fetching payments with parties:", filters.parties)
  
  return apiClient.get("/", {
    params: {
      startDate: filters.startDate || "",
      endDate: filters.endDate || "",
      parties: partiesParam,
      consignees: consigneesParam,
      skipCache: filters.skipCache || false
    }
  })
}

export const updateSingleFollowUp = (billNumber, followUpDate) => {
  return apiClient.post("/update-followup-single", {
    billNumber,
    followUpDate
  })
}

export const updateBulkFollowUp = (billNumbers, followUpDate) => {
  return apiClient.post("/update-followup", {
    billNumbers,
    followUpDate
  })
}

export const clearCache = () => {
  return apiClient.post("/clear-cache")
}