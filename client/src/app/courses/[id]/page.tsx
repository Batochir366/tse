import type { Metadata } from "next";
import CourseDetailPageClient from "./CourseDetailPageClient";
import { coursesService } from "@/lib/services/courses.service";
import { BASE_URL } from "@/lib/apiClient";

type PageProps = { params: Promise<{ id: string }> };

function truncateMetaDescription(text: string, max = 160): string {
  const plain = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1).trimEnd()}…`;
}

function absoluteCoverUrl(coverImage: string | undefined): string | undefined {
  if (!coverImage?.trim()) return undefined;
  const u = coverImage.trim();
  if (/^https?:\/\//i.test(u)) return u;
  const base = BASE_URL.replace(/\/$/, "");
  return `${base}/${u.replace(/^\//, "")}`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const course = await coursesService.getOne(id);
    const title = `${course.name} | TSE Academy`;
    const description = course.description
      ? truncateMetaDescription(course.description)
      : "Онлайн сургалтын платформ";
    const ogImage = absoluteCoverUrl(course.coverImage);

    return {
      title,
      description,
      alternates: {
        canonical: `/courses/${id}`,
      },
      openGraph: {
        title,
        description,
        type: "website",
        url: `/courses/${id}`,
        ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(ogImage ? { images: [ogImage] } : {}),
      },
    };
  } catch {
    return {
      title: "Курс олдсонгүй | TSE Academy",
      description: "Энэхүү курсыг ачаалах боломжгүй байна.",
    };
  }
}

export default function CourseDetailPage() {
  return <CourseDetailPageClient />;
}
