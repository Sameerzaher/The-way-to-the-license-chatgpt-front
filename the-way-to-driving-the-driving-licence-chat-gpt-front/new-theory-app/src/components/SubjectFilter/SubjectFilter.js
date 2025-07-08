import React, { useEffect } from "react";
import "./SubjectFilter.css";

export default function SubjectFilter({
  selectedSubject,
  setSelectedSubject,
  selectedSubSubject,
  setSelectedSubSubject,
  subjects,
  setSubjects,
  subSubjects,
  setSubSubjects,
  lang
}) {
  console.log("SubjectFilter render:", {
    selectedSubject,
    selectedSubSubject,
    subjectsCount: subjects.length,
    subSubjectsCount: subSubjects.length,
    lang
  });

  // שליפת רשימת נושאים מהשרת (endpoint חדש)
  useEffect(() => {
    console.log("SubjectFilter: Fetching subjects for lang:", lang);
    const fetchSubjects = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        const url = `${apiUrl}/questions/topics`;
        console.log("SubjectFilter: Fetching from URL:", url);
        const res = await fetch(url);
        console.log("SubjectFilter: Response status:", res.status);
        const data = await res.json();
        console.log("SubjectFilter: Received subjects data:", data);
        if (Array.isArray(data)) {
          console.log("SubjectFilter: Setting subjects:", data);
          setSubjects(data);
        } else {
          console.log("SubjectFilter: Data is not array, setting empty array");
          setSubjects([]);
        }
      } catch (e) {
        console.error("SubjectFilter: Error fetching subjects:", e);
        setSubjects([]);
      }
    };
    fetchSubjects();
    // eslint-disable-next-line
  }, [lang]);

  // שליפת תתי-נושאים מהשרת (מערך תתי-נושאים ישירות)
  useEffect(() => {
    console.log("All subjects:", subjects);
    console.log("selectedSubject (raw):", selectedSubject, "typeof:", typeof selectedSubject);
    const fetchSubSubjects = async () => {
      if (!selectedSubject) {
        console.log("SubjectFilter: No subject selected, clearing sub-subjects");
        setSubSubjects([]);
        return;
      }
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        // TRIM the subject before sending!
        const url = `${apiUrl}/questions/sub-subjects?lang=${lang}&subject=${encodeURIComponent(selectedSubject.trim())}`;
        console.log("URL sent to backend:", url);
        const res = await fetch(url);
        console.log("SubjectFilter: Sub-subjects response status:", res.status);
        const data = await res.json();
        console.log("Response from backend:", data);
        if (Array.isArray(data)) {
          setSubSubjects(data);
        } else {
          console.log("SubjectFilter: Sub-subjects data is not array, setting empty array");
          setSubSubjects([]);
        }
      } catch (e) {
        console.error("SubjectFilter: Error fetching sub-subjects:", e);
        setSubSubjects([]);
      }
    };
    fetchSubSubjects();
    // eslint-disable-next-line
  }, [lang, selectedSubject]);

  console.log("SubjectFilter: Rendering with subjects:", subjects, "subSubjects:", subSubjects);

  // הדפסת debug לפני ה-return
  console.log("subSubjects array (final before render):", subSubjects);

  return (
    <div className="control-row">
      <label className="control-label">נושא:</label>
      <select
        className="control-select"
        value={selectedSubject}
        onChange={e => {
          console.log("SubjectFilter: Subject changed to:", e.target.value);
          setSelectedSubject(e.target.value);
          setSelectedSubSubject(""); // איפוס תת-נושא בכל שינוי נושא
        }}
      >
        <option value="">כל הנושאים</option>
        {subjects.map(subj => (
          <option key={subj} value={subj}>{subj}</option>
        ))}
      </select>
      <label className="control-label">תת-נושא:</label>
      <select
        className="control-select"
        value={selectedSubSubject}
        onChange={e => {
          console.log("SubjectFilter: Sub-subject changed to:", e.target.value);
          setSelectedSubSubject(e.target.value);
        }}
      >
        <option value="">כל תתי-הנושאים</option>
        {subSubjects.length === 0 && (
          <option value="" disabled>אין תתי-נושאים זמינים</option>
        )}
        {subSubjects.map(sub => (
          <option key={sub} value={sub}>{sub}</option>
        ))}
      </select>
    </div>
  );
} 