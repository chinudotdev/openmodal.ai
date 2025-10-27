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
  const result = await getAuthor({ authorId });

  if (!result) {
    throw new Error("Author not found");
  }

  const { author, modelCount } = result;

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
      {/* Author Logo Placeholder */}
      <div
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          border: "3px solid #e5e7eb",
          backgroundColor: "#f8f9fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "40px",
          fontSize: "48px",
          fontWeight: "bold",
          color: "#666666",
        }}
      >
        {author.name.charAt(0).toUpperCase()}
      </div>

      {/* Author Name */}
      <div
        style={{
          fontSize: "56px",
          fontWeight: "bold",
          color: "#1a1a1a",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        {author.name}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: "24px",
          color: "#666666",
          marginBottom: "40px",
          textAlign: "center",
          maxWidth: "800px",
          lineHeight: "1.4",
          fontWeight: "400",
        }}
      >
        {author.description}
      </div>

      {/* Model Count */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#f8f9fa",
          padding: "24px 40px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            fontSize: "36px",
            fontWeight: "bold",
            color: "#1a1a1a",
            marginRight: "16px",
          }}
        >
          {modelCount}
        </div>
        <div
          style={{
            fontSize: "20px",
            color: "#666666",
            fontWeight: "500",
          }}
        >
          AI Models Available
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
        Explore {author.name} models on OpenModal
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}

async function generateModelsOG() {
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
          Discover and explore {stats.totalModels}+ AI models from{" "}
          {stats.totalProviders}+ providers
        </div>
      </div>

      {/* Modality Types */}
      <div
        style={{
          display: "flex",
          gap: "30px",
          marginBottom: "40px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {stats.modalityTypes.slice(0, 4).map((modality) => (
          <div
            key={modality.name}
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
              {modality.count}
            </div>
            <div
              style={{
                fontSize: "16px",
                color: "#666666",
                textAlign: "center",
                textTransform: "capitalize",
                fontWeight: "500",
              }}
            >
              {modality.name}
            </div>
          </div>
        ))}
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
        Find the perfect model for text, image, audio, and video tasks
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
