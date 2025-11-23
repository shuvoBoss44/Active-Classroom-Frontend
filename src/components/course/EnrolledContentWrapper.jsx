// components/course/EnrolledContentWrapper.jsx
// This is a Server Component, so no "use client" and it can be async.

import EnrolledContent from "./EnrolledContent";

// Define a separate function to handle the data fetching logic
async function fetchCourseSubjects(courseId) {
  let subjects = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/subjects/course/${courseId}`,
      {
        credentials: "include",
        cache: "no-store",
      }
    );
    const data = await res.json();
    if (data.success) {
      subjects = data.subjects;
    } else {
      // Handle API success: false case if necessary
      console.error("API returned success: false");
    }
  } catch (err) {
    console.error("Failed to fetch enrolled content:", err);
  }
  return subjects;
}

// 1. UPDATED: Component now accepts 'facebookGroupLink' prop
export default async function EnrolledContentWrapper({
  courseId,
  facebookGroupLink,
}) {
  // 2. Fetch the data on the server
  const subjects = await fetchCourseSubjects(courseId);

  // 3. UPDATED: Pass the fetched data AND the new link down to the Client Component
  return (
    <EnrolledContent
      courseId={courseId}
      subjects={subjects}
      facebookGroupLink={facebookGroupLink} // <-- New Prop being passed
    />
  );
}
