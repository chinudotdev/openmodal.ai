import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuthor, getAllAuthors } from "@/actions/authors";
import AuthorClient from "./_components/author-client";

interface AuthorPageProps {
  params: Promise<{
    author: string;
  }>;
}

// Generate static params for all authors
export async function generateStaticParams() {
  try {
    const authors = await getAllAuthors();
    return authors.map((author) => ({
      author: author.id,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const { author: authorId } = await params;
  const result = await getAuthor({ authorId });

  if (!result) {
    return {
      title: "Author Not Found | OpenModal",
      description: "The requested author could not be found.",
    };
  }

  const { author } = result;

  return {
    title: `${author.name} Models | OpenModal`,
    description: `Browse ${result.modelCount} AI models from ${author.name}. ${author.description}`,
    keywords: [
      author.name,
      "AI models",
      "machine learning",
      "LLM",
      "AI provider",
      "model comparison",
    ],
    openGraph: {
      title: `${author.name} Models | OpenModal`,
      description: `Browse ${result.modelCount} AI models from ${author.name}. ${author.description}`,
      type: "website",
      url: `/${author.id}`,
      siteName: "OpenModal",
      images: [
        {
          url: `/api/og?type=author&authorId=${author.id}`,
          width: 1200,
          height: 630,
          alt: `${author.name} Models | OpenModal`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${author.name} Models | OpenModal`,
      description: `Browse ${result.modelCount} AI models from ${author.name}. ${author.description}`,
      images: [`/api/og?type=author&authorId=${author.id}`],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { author: authorId } = await params;
  const result = await getAuthor({ authorId });

  if (!result) {
    notFound();
  }

  return <AuthorClient data={result} />;
}
