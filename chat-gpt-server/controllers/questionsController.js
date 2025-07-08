  if (licenseType) {
    console.log('licenseType מה-Frontend:', licenseType);
    pool = pool.filter(q =>
      q.licenseTypes &&
      q.licenseTypes.some(type => type.toLowerCase() === licenseType.toLowerCase())
    );
    console.log('סינון לפי licenseType:', licenseType, 'נשארו:', pool.length);
  }
  // סינון לפי נושא (topic/subject) עם ניקוי חכם
  if (subject) {
    const subjectCleaned = normalizeFilter(subject);
    pool = pool.filter(q =>
      (q.topic && normalizeFilter(q.topic) === subjectCleaned) ||
      (q.subject && normalizeFilter(q.subject) === subjectCleaned)
    );
  }
  // סינון לפי תת-נושא (sub_topic/subSubject) עם ניקוי חכם
  if (subSubject) {
    const subSubjectCleaned = normalizeFilter(subSubject);
    pool = pool.filter(q =>
      (q.sub_topic && normalizeFilter(q.sub_topic) === subSubjectCleaned) ||
      (q.subSubject && normalizeFilter(q.subSubject) === subSubjectCleaned)
    );
  }
  const result = pool.map(q => ({
    ...q,
    licenseTypes: q.licenseTypes || [],
    subSubject: q.sub_topic || q.subSubject || ""
  }));