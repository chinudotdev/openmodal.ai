import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    switch (type) {
      case "landing":
        return await generateLandingOG();
    }
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new ImageResponse(
      <div
        style={{
          fontSize: 40,
          color: "black",
          background: "white",
          width: "100%",
          height: "100%",
          padding: "50px 200px",
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        OpenModal
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  }
}

async function generateLandingOG() {
  return new ImageResponse(
    <div
      style={{
        background: "#ffffff",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            color: "#1a1a1a",
            marginBottom: "16px",
          }}
        >
          OpenModal
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "#666666",
            fontWeight: "400",
          }}
        >
          AI Model Directory & Discovery Platform
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "flex",
          gap: "60px",
          marginBottom: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#f8f9fa",
            padding: "40px 30px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            minWidth: "140px",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              color: "#666666",
              fontWeight: "500",
            }}
          >
            AI Models
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#f8f9fa",
            padding: "40px 30px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            minWidth: "140px",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              color: "#666666",
              fontWeight: "500",
            }}
          >
            Providers
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#f8f9fa",
            padding: "40px 30px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            minWidth: "140px",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              color: "#666666",
              fontWeight: "500",
            }}
          >
            Modalities
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          fontSize: "20px",
          color: "#666666",
          textAlign: "center",
          fontWeight: "400",
        }}
      >
        Discover the perfect AI model for your project
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
