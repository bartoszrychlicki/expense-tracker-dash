/**
 * API Configuration Constants
 * 
 * This file contains all API-related constants and configuration
 * for the expense tracker application.
 */

// Airtable API Configuration
export const AIRTABLE_CONFIG = {
  BASE_ID: process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID || "appFKp3PqUbg7tcxe",
  API_KEY: process.env.EXPO_PUBLIC_AIRTABLE_API_KEY || "pateg4IGkbM6zAoZU.312eb8dfc60d6f1274fd43d9acc80b5a9d94d11bb2bb598f4d63bc6819a82171",
  TABLES: {
    DAYS: "days",
    TRANSACTIONS: "transactions",
  },
  ENDPOINTS: {
    BASE_URL: "https://api.airtable.com/v0",
  },
} as const;

// API Request Headers
export const getAirtableHeaders = () => ({
  Authorization: `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
  "Content-Type": "application/json",
});

// API URLs
export const getAirtableUrl = (tableName: string, params?: Record<string, any>) => {
  const baseUrl = `${AIRTABLE_CONFIG.ENDPOINTS.BASE_URL}/${AIRTABLE_CONFIG.BASE_ID}/${tableName}`;
  
  if (!params) return baseUrl;
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, JSON.stringify(value));
  });
  
  return `${baseUrl}?${searchParams.toString()}`;
};