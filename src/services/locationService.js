// src/services/locationService.js
import axios from "axios";
import { BASE_URL } from "../Content/Url";

const getToken = () => localStorage.getItem("token") || "";
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

// ── Config ──
export const getAllConfigs = () =>
  axios.get(`${BASE_URL}/configs`, { headers: headers() });

export const getConfigByType = (type) =>
  axios.get(`${BASE_URL}/configs/${type}`, { headers: headers() });

// ── Countries ──
export const getCountries = () =>
  axios.get(`${BASE_URL}/countries`, { headers: headers() });

// ── Cities by country ──
export const getCitiesByCountry = (countryId) =>
  axios.get(`${BASE_URL}/countries/${countryId}/cities`, { headers: headers() });

// ── Universities by city ──
export const getUniversitiesByCity = (cityId) =>
  axios.get(`${BASE_URL}/cities/${cityId}/universities`, { headers: headers() });