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
  // console.log("SubjectFilter render:", {
  //   selectedSubject,
  //   selectedSubSubject,
  //   subjectsCount: subjects.length,
  //   subSubjectsCount: subSubjects.length,
  //   lang
  // });

  // ביטול מוחלט של קריאות שרת
  useEffect(() => {
    setSubjects(['חוקי התנועה', 'תמרורים', 'בטיחות בדרכים', 'הכרת הרכב']);
  }, []); // רק פעם אחת ללא תלות ב-lang

  // ביטול מוחלט של קריאות תתי-נושאים
  useEffect(() => {
    if (!selectedSubject) {
      setSubSubjects([]);
      return;
    }
    
    // נתונים סטטיים פשוטים
    const subSubjects = {
      'חוקי התנועה': ['זכות קדימה', 'מהירות', 'עקיפה'],
      'תמרורים': ['תמרורי אזהרה', 'תמרורי איסור', 'תמרורי חובה'],
      'בטיחות בדרכים': ['מרחק בטיחות', 'נהיגה בלילה'],
      'הכרת הרכב': ['בלמים', 'הגה', 'מנוע']
    };
    
    setSubSubjects(subSubjects[selectedSubject] || []);
  }, [selectedSubject]); // רק כשהנושא משתנה

  // console.log("SubjectFilter: Rendering with subjects:", subjects, "subSubjects:", subSubjects);

  // הדפסת debug לפני ה-return
  // console.log("subSubjects array (final before render):", subSubjects);

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