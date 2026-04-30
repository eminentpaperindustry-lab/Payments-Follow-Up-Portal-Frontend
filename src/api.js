import axios from "axios"

// const API = "http://localhost:5003/api/payments"
const API = "https://payments-follow-up-portal.onrender.com/api/payments"


export const getParties = () => {
  return axios.get(API + "/parties")
}

export const getConsignees = (parties) => {
  const partiesParam = parties && parties.length ? parties.join(",") : ""
  return axios.get(API + "/consignees", {
    params: {
      parties: partiesParam
    }
  })
}

export const getPayments = (filters) => {
  // Safely extract values
  let partiesParam = ""
  let consigneesParam = ""
  
  if (filters.parties && Array.isArray(filters.parties) && filters.parties.length > 0) {
    partiesParam = filters.parties.map(p => p.value || p).join(",")
  }
  
  if (filters.consignees && Array.isArray(filters.consignees) && filters.consignees.length > 0) {
    consigneesParam = filters.consignees.map(c => c.value || c).join(",")
  }
  
  return axios.get(API, {
    params: {
      startDate: filters.startDate || "",
      endDate: filters.endDate || "",
      parties: partiesParam,
      consignees: consigneesParam
    }
  })
}

export const updateSingleFollowUp = (billNumber, followUpDate) => {
  return axios.post(API + "/update-followup-single", {
    billNumber,
    followUpDate
  })
}

export const updateBulkFollowUp = (billNumbers, followUpDate) => {
  return axios.post(API + "/update-followup", {
    billNumbers,
    followUpDate
  })
}