import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getPlatformStats } from "@/actions/stats";
import { getAuthor } from "@/actions/authors";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const authorId = searchParams.get("authorId");

  try {
    switch (type) {
      case "landing":
        return await generateLandingOG();
      case "author":
        if (!authorId) throw new Error("Author ID is required");
        return await generateAuthorOG(authorId);
      case "models":
        return await generateModelsOG();
      default:
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
  const stats = await getPlatformStats();

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
              fontSize: "48px",
              fontWeight: "bold",
              color: "#1a1a1a",
              marginBottom: "8px",
            }}
          >
            {stats.totalModels.toLocaleString()}
          </div>
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
              fontSize: "48px",
              fontWeight: "bold",
              color: "#1a1a1a",
              marginBottom: "8px",
            }}
          >
            {stats.totalProviders.toLocaleString()}
          </div>
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
              fontSize: "48px",
              fontWeight: "bold",
              color: "#1a1a1a",
              marginBottom: "8px",
            }}
          >
            {stats.totalModalities.toLocaleString()}
          </div>
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

async function generateAuthorOG(authorId: string) {
  try {
    // Try to get actual author data
    const authorData = await getAuthor({ authorId });
    const authorName =
      authorData?.author?.name ||
      authorId.charAt(0).toUpperCase() + authorId.slice(1);

    return new ImageResponse(
      <div
        style={{
          background: "#ffffff",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Left Side - Text Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            flex: 1,
            maxWidth: "600px",
          }}
        >
          {/* Main Title */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "#1a1a1a",
              marginBottom: "16px",
              lineHeight: "1.1",
              display: "flex",
              alignItems: "center",
            }}
          >
            {authorName}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "28px",
              color: "#666666",
              fontWeight: "400",
              lineHeight: "1.3",
              display: "flex",
              alignItems: "center",
            }}
          >
            Browse models by {authorName}
          </div>
        </div>

        {/* Right Side - Author Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            position: "relative",
          }}
        >
          {authorData?.author?.logo ? (
            // biome-ignore lint/performance/noImgElement: <explanation>
            <img
              width="256"
              height="256"
              alt={`${authorName} logo`}
              src={authorData.author.logo}
              style={{
                borderRadius: 128,
              }}
            />
          ) : (
            /* Fallback - Author Initial */
            <div
              style={{
                width: "200px",
                height: "200px",
                background:
                  "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #8b5cf6 100%)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "80px",
                fontWeight: "bold",
                color: "white",
              }}
            >
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Bottom Right Branding */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "40px",
            fontSize: "18px",
            color: "#666666",
            fontWeight: "400",
          }}
        >
          &lt; OpenModal
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error("Error generating author OG:", error);
    // Fallback to simple author name
    const authorName = authorId.charAt(0).toUpperCase() + authorId.slice(1);

    return new ImageResponse(
      <div
        style={{
          background: "#ffffff",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Left Side - Text Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            flex: 1,
            maxWidth: "600px",
          }}
        >
          {/* Main Title */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "#1a1a1a",
              marginBottom: "16px",
              lineHeight: "1.1",
              display: "flex",
              alignItems: "center",
            }}
          >
            {authorName}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "28px",
              color: "#666666",
              fontWeight: "400",
              lineHeight: "1.3",
              display: "flex",
              alignItems: "center",
            }}
          >
            Browse models by {authorName}
          </div>
        </div>

        {/* Right Side - Author Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            position: "relative",
          }}
        >
          {/* Fallback - Author Initial */}
          <div
            style={{
              width: "200px",
              height: "200px",
              background:
                "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #8b5cf6 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "80px",
              fontWeight: "bold",
              color: "white",
            }}
          >
            {authorName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Bottom Right Branding */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "40px",
            fontSize: "18px",
            color: "#666666",
            fontWeight: "400",
          }}
        >
          &lt; OpenModal
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  }
}

async function generateModelsOG() {
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
            fontSize: "56px",
            fontWeight: "bold",
            color: "#1a1a1a",
            marginBottom: "16px",
          }}
        >
          AI Models Directory
        </div>
        <div
          style={{
            fontSize: "24px",
            color: "#666666",
            fontWeight: "400",
            maxWidth: "800px",
          }}
        >
          Discover and explore AI models from leading providers
        </div>
      </div>

      {/* Features Grid */}
      <div
        style={{
          display: "flex",
          gap: "30px",
          marginBottom: "40px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#f8f9fa",
            padding: "24px 20px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            minWidth: "120px",
          }}
        >
          <div
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#1a1a1a",
              marginBottom: "8px",
            }}
          >
            Text
          </div>
          <div
            style={{
              fontSize: "16px",
              color: "#666666",
              textAlign: "center",
              fontWeight: "500",
            }}
          >
            Language Models
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#f8f9fa",
            padding: "24px 20px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            minWidth: "120px",
          }}
        >
          <div
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#1a1a1a",
              marginBottom: "8px",
            }}
          >
            Image
          </div>
          <div
            style={{
              fontSize: "16px",
              color: "#666666",
              textAlign: "center",
              fontWeight: "500",
            }}
          >
            Vision Models
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#f8f9fa",
            padding: "24px 20px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            minWidth: "120px",
          }}
        >
          <div
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#1a1a1a",
              marginBottom: "8px",
            }}
          >
            Audio
          </div>
          <div
            style={{
              fontSize: "16px",
              color: "#666666",
              textAlign: "center",
              fontWeight: "500",
            }}
          >
            Speech Models
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#f8f9fa",
            padding: "24px 20px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            minWidth: "120px",
          }}
        >
          <div
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#1a1a1a",
              marginBottom: "8px",
            }}
          >
            Video
          </div>
          <div
            style={{
              fontSize: "16px",
              color: "#666666",
              textAlign: "center",
              fontWeight: "500",
            }}
          >
            Video Models
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
        Find the perfect model for your project
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
