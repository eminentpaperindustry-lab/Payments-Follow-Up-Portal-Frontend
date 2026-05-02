import axios from "axios"

const API = process.env.REACT_APP_API_URL || "http://localhost:5003/api/payments"

// Create axios instance with interceptors for cache control
const apiClient = axios.create({
  baseURL: API,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
})

// Add request interceptor to handle cache busting
apiClient.interceptors.request.use((config) => {
  // Add timestamp to prevent browser cache for GET requests after updates
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

export const getParties = () => {
  return apiClient.get("/parties")
}

export const getConsignees = (parties) => {
  const partiesParam = parties && parties.length ? parties.join(",") : ""
  return apiClient.get("/consignees", {
    params: {
      parties: partiesParam
    }
  })
}

export const getPayments = (filters) => {
  let partiesParam = ""
  let consigneesParam = ""
  
  if (filters.parties && Array.isArray(filters.parties) && filters.parties.length > 0) {
    partiesParam = filters.parties.map(p => p.value || p).join(",")
  }
  
  if (filters.consignees && Array.isArray(filters.consignees) && filters.consignees.length > 0) {
    consigneesParam = filters.consignees.map(c => c.value || c).join(",")
  }
  
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