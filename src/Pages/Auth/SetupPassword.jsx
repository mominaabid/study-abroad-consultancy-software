import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { BASE_URL } from "../../Content/Url";

export default function SetupPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [user, setUser] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid link.");
      setLoading(false);
      return;
    }

    fetch(`${BASE_URL}/auth/verify-setup-token?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setUser(data.user);
          setTokenValid(true);
        } else {
          setError(data.message);
        }
      })
      .catch(() => setError("Something went wrong."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/setup-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      navigate("/login?setup=success");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  // Common styles for the eye button
  const eyeButtonStyle = {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    padding: 0,
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: "3px solid #e5e7eb",
              borderTopColor: "#0d9488",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            Verifying your link...
          </p>
        </div>
      </div>
    );

  if (!tokenValid)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "40px 36px",
            maxWidth: 400,
            textAlign: "center",
            boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Link Invalid or Expired
          </h2>
          <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.6 }}>
            {error}
          </p>
          <p style={{ color: "#6b7280", fontSize: 13, marginTop: 12 }}>
            Please contact your counsellor to resend the setup link.
          </p>
        </div>
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#f8fafc",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "40px 36px",
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: "#0d9488",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            E
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: "0.1em",
              color: "#111827",
            }}
          >
            EDUCATIA
          </span>
        </div>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#0f172a",
            margin: "0 0 6px",
          }}
        >
          Set your password
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 28px" }}>
          Welcome, <strong>{user?.name}</strong>! Create a password for{" "}
          <strong>{user?.email}</strong>
        </p>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13.5,
              marginBottom: 18,
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          {/* New Password Field */}
          <div>
            <label
              style={{
                fontSize: 13.5,
                fontWeight: 500,
                color: "#334155",
                display: "block",
                marginBottom: 6,
              }}
            >
              New Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                style={{
                  width: "100%",
                  height: 44,
                  padding: "0 44px 0 14px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={eyeButtonStyle}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              style={{
                fontSize: 13.5,
                fontWeight: 500,
                color: "#334155",
                display: "block",
                marginBottom: 6,
              }}
            >
              Confirm Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                required
                style={{
                  width: "100%",
                  height: 44,
                  padding: "0 44px 0 14px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              height: 46,
              background: "#0d9488",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              marginTop: 4,
            }}
          >
            {saving ? "Setting up..." : "Set Password & Continue"}
          </button>
        </form>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
