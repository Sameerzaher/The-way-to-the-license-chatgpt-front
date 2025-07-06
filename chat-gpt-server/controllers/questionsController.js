  if (licenseType) {
    console.log('licenseType מה-Frontend:', licenseType);
    pool = pool.filter(q =>
      q.licenseTypes &&
      q.licenseTypes.some(type => type.toLowerCase() === licenseType.toLowerCase())
    );
    console.log('סינון לפי licenseType:', licenseType, 'נשארו:', pool.length);
  }