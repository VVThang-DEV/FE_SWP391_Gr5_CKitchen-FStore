import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            textAlign: "center",
            minHeight: "400px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "var(--danger-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              marginBottom: "20px",
            }}
          >
            !
          </div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: "var(--text-xl)",
              marginBottom: "8px",
            }}
          >
            Da xay ra loi
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "var(--text-sm)",
              marginBottom: "24px",
              maxWidth: "400px",
            }}
          >
            Vui long tai lai trang hoac lien he quan tri vien neu loi tiep tuc
            xay ra.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: "10px 24px",
              background: "var(--primary)",
              color: "var(--text-inverse)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "var(--text-sm)",
            }}
          >
            Thu lai
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
