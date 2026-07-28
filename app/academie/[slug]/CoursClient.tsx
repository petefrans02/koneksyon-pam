"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { findCourse } from "@/lib/academy-data";
import { getCourseContent } from "@/lib/courses";
import ComingSoon from "@/app/components/ComingSoon";
import CourseViewer from "@/app/components/CourseViewer";
import { IconName } from "@/app/components/Icon";

export default function CoursClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const course = findCourse(slug);
  const content = getCourseContent(slug);

  // Cours pointant vers un contenu externe (ex. études bibliques) → redirection.
  useEffect(() => {
    if (course && !content && course.status === "available" && course.href) {
      router.replace(course.href);
    } else if (!course) {
      router.replace("/academie");
    }
  }, [course, content, router]);

  if (!course) return null;

  // Contenu de formation rédigé → lecteur de cours.
  if (content) return <CourseViewer course={course} content={content} />;

  // Redirection externe en cours.
  if (course.status === "available" && course.href) return null;

  // Sinon : page de pré-lancement élégante.
  return (
    <ComingSoon
      icon={course.icon as IconName}
      feature={`cours:${course.slug}`}
      accent={course.color}
      title={course.title}
      subtitle={course.description}
      links={[
        { href: "/academie", label: { fr: "← Toutes les formations", ht: "← Tout fòmasyon yo", en: "← All courses", es: "← Todas las formaciones" }, primary: true },
        { href: "/etude", label: { fr: "Commencer une étude", ht: "Kòmanse yon etid", en: "Start a study", es: "Empezar un estudio" } },
      ]}
    />
  );
}
