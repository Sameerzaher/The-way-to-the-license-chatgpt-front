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
  // שליפת רשימת נושאים מהשרת (endpoint חדש)
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        const res = await fetch(`${apiUrl}/questions/subjects`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setSubjects(data);
        } else {
          setSubjects([]);
        }
      } catch (e) {
        setSubjects([]);
      }
    };
    fetchSubjects();
    // eslint-disable-next-line
  }, [lang]);

  // שליפת תתי-נושאים מתוך השאלות (כמו קודם)
  useEffect(() => {
    const fetchSubSubjects = async () => {
      if (!selectedSubject) {
        setSubSubjects([]);
        return;
      }
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        const res = await fetch(`${apiUrl}/questions?lang=${lang}&subject=${encodeURIComponent(selectedSubject)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const allSubSubjects = Array.from(new Set(data.map(q => q.subSubject).filter(Boolean)));
          setSubSubjects(allSubSubjects);
        } else {
          setSubSubjects([]);
        }
      } catch (e) {
        setSubSubjects([]);
      }
    };
    fetchSubSubjects();
    // eslint-disable-next-line
  }, [lang, selectedSubject]);

  return (
    <div className="control-row">
      <label className="control-label">נושא:</label>
      <select
        className="control-select"
        value={selectedSubject}
        onChange={e => { setSelectedSubject(e.target.value); setSelectedSubSubject(""); }}
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
        onChange={e => setSelectedSubSubject(e.target.value)}
        disabled={!selectedSubject || subSubjects.length === 0}
      >
        <option value="">כל תתי-הנושאים</option>
        {subSubjects.map(sub => (
          <option key={sub} value={sub}>{sub}</option>
        ))}
      </select>
    </div>
  );
} 