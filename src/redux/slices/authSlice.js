// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../../Content/Url";

// ✅ Check if token is expired
const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
};

// ✅ Login User - FIXED to handle new response format
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            
            if (!res.ok) {
                return rejectWithValue(data.message || "Login failed.");
            }

            // ✅ FIX: Handle new response format
            if (data.success && data.data) {
                const { token, user } = data.data;
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));
                return { token, user };
            }
            
            // ✅ Fallback: Handle old response format
            if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                return { token: data.token, user: data.user };
            }
            
            return rejectWithValue("Invalid response format");
        } catch (error) {
            return rejectWithValue("Network error. Please try again.");
        }
    }
);

// ✅ Counsellor Login - FIXED
export const counsellorLogin = createAsyncThunk(
    "auth/counsellorLogin",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BASE_URL}/auth/counsellor/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            
            if (!res.ok) {
                return rejectWithValue(data.message || "Login failed.");
            }

            if (data.success && data.data) {
                const { token, user } = data.data;
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));
                return { token, user };
            }
            
            if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                return { token: data.token, user: data.user };
            }
            
            return rejectWithValue("Invalid response format");
        } catch (error) {
            return rejectWithValue("Network error. Please try again.");
        }
    }
);

// ✅ Load User - FIXED
export const loadUser = createAsyncThunk(
    "auth/loadUser",
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem("token");
        
        if (!token) {
            return rejectWithValue("No token found.");
        }

        if (isTokenExpired(token)) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return rejectWithValue("Session expired. Please login again.");
        }

        try {
            const res = await fetch(`${BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                }
                return rejectWithValue(data.message || "Session expired.");
            }
            
            // ✅ Handle new response format
            if (data.success && data.data) {
                return { token, user: data.data };
            }
            
            return { token, user: data };
        } catch (error) {
            return rejectWithValue("Network error.");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        token: localStorage.getItem("token") || null,
        isAuthenticated: !!localStorage.getItem("token"),
        loading: false,
        authChecked: false,
        error: null,
    },
    reducers: {
        logout(state) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        },
        clearError(state) {
            state.error = null;
        },
        checkSession(state) {
            const token = localStorage.getItem("token");
            if (token && isTokenExpired(token)) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = "Session expired. Please login again.";
            }
        }
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.token = null;
                state.user = null;
                state.error = action.payload;
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            });

        // Counsellor Login
        builder
            .addCase(counsellorLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(counsellorLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(counsellorLogin.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.token = null;
                state.user = null;
                state.error = action.payload;
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            });

        // Load User
        builder
            .addCase(loadUser.pending, (state) => {
                state.authChecked = false;
                state.loading = true;
            })
            .addCase(loadUser.fulfilled, (state, action) => {
                state.authChecked = true;
                state.loading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(loadUser.rejected, (state, action) => {
                state.authChecked = true;
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = action.payload || "Session expired";
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            });
    },
});

// ✅ Selectors
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuth = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectRole = (state) => state.auth?.user?.role || null;
export const selectAuthChecked = (state) => state.auth.authChecked;

export const { logout, clearError, checkSession } = authSlice.actions;
export default authSlice.reducer;