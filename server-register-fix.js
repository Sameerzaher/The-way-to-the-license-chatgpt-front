exports.register = (req, res) => {
  const { name, email, course } = req.body; // ✅ Added course extraction

  // Debug log to see what's being received
  console.log('📝 Registration request received:');
  console.log('  Name:', name);
  console.log('  Email:', email);
  console.log('  Course:', course); // 🔍 This will show if course is being sent

  if (!name || !email) {
    return res.status(400).json({ error: "יש להזין שם ואימייל" });
  }

  const existingUser = findUserByEmail(email);
  if (existingUser) {
    return res.status(409).json({ error: "משתמש עם אימייל זה כבר קיים" });
  }

  const user = {
    id: "user_" + Math.random().toString(36).substring(2, 10),
    name,
    email,
    course: course || 'theory', // ✅ Added course field with default value
  };

  console.log('💾 Saving user with course:', user); // 🔍 Debug log

  addUser(user);

  console.log('✅ User saved successfully'); // 🔍 Debug log

  res.status(201).json({ user }); // ✅ This will now include the course field
}; 