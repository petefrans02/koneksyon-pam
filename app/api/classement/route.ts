import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [classesRes, questionsRes, membersRes] = await Promise.all([
    db.from("classes").select("id, school_name, country, subject, created_at"),
    db.from("kp_questions").select("subject, status").eq("status", "published"),
    db.from("class_members").select("class_id, student_id"),
  ]);

  const classes = classesRes.data ?? [];
  const questions = questionsRes.data ?? [];
  const members = membersRes.data ?? [];

  // --- Schools ranking ---
  const schoolMap = new Map<string, {
    school_name: string; country: string;
    class_ids: Set<string>; subjects: Set<string>;
  }>();

  for (const cls of classes) {
    const key = `${cls.school_name || "Sans nom"}__${cls.country || "HT"}`;
    if (!schoolMap.has(key)) {
      schoolMap.set(key, {
        school_name: cls.school_name || "Sans nom",
        country: cls.country || "HT",
        class_ids: new Set(),
        subjects: new Set(),
      });
    }
    const entry = schoolMap.get(key)!;
    entry.class_ids.add(cls.id);
    if (cls.subject) entry.subjects.add(cls.subject);
  }

  const membersByClass = new Map<string, number>();
  for (const m of members) {
    membersByClass.set(m.class_id, (membersByClass.get(m.class_id) ?? 0) + 1);
  }

  const schools = Array.from(schoolMap.values())
    .map(s => ({
      school_name: s.school_name,
      country: s.country,
      class_count: s.class_ids.size,
      student_count: Array.from(s.class_ids).reduce((acc, cid) => acc + (membersByClass.get(cid) ?? 0), 0),
      subjects: Array.from(s.subjects),
    }))
    .sort((a, b) => b.student_count - a.student_count || b.class_count - a.class_count);

  // --- Subjects ranking ---
  const subjectQCount = new Map<string, number>();
  for (const q of questions) {
    subjectQCount.set(q.subject, (subjectQCount.get(q.subject) ?? 0) + 1);
  }

  const subjectStudents = new Map<string, Set<string>>();
  for (const cls of classes) {
    if (!subjectStudents.has(cls.subject)) subjectStudents.set(cls.subject, new Set());
    for (const m of members.filter(m => m.class_id === cls.id)) {
      subjectStudents.get(cls.subject)!.add(m.student_id);
    }
  }

  const allSubjects = ["bible","maths","sciences","histoire","langues","arts","tech","sante"];
  const subjectsRanked = allSubjects.map(subject => ({
    subject,
    question_count: subjectQCount.get(subject) ?? 0,
    student_count: subjectStudents.get(subject)?.size ?? 0,
  })).sort((a, b) => b.student_count - a.student_count);

  // --- Countries ranking ---
  const countryMap = new Map<string, { schools: Set<string>; students: Set<string>; class_count: number }>();
  for (const cls of classes) {
    const c = cls.country || "HT";
    if (!countryMap.has(c)) countryMap.set(c, { schools: new Set(), students: new Set(), class_count: 0 });
    const entry = countryMap.get(c)!;
    if (cls.school_name) entry.schools.add(cls.school_name);
    entry.class_count++;
    for (const m of members.filter(m => m.class_id === cls.id)) {
      entry.students.add(m.student_id);
    }
  }

  const countries = Array.from(countryMap.entries())
    .map(([country, d]) => ({
      country,
      school_count: d.schools.size,
      student_count: d.students.size,
      class_count: d.class_count,
    }))
    .sort((a, b) => b.student_count - a.student_count);

  return NextResponse.json({ schools, subjects: subjectsRanked, countries });
}
