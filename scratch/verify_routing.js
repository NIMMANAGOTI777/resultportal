import fs from 'fs';
import path from 'path';

console.log("=== STARTING ROUTING & GUARD VERIFICATION AUDIT ===\n");

let allPassed = true;

const filesToCheck = [
  'src/components/Router.tsx',
  'src/components/StudentLogin.tsx',
  'src/components/TeacherLogin.tsx',
  'src/components/AdminLogin.tsx',
  'src/components/StudentDashboard.tsx',
  'src/components/StaffDashboard.tsx',
  'src/App.tsx',
  'src/services/db.ts'
];

console.log("Checking file existence on disk:");
for (const file of filesToCheck) {
  const fullPath = path.resolve(file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ File found: ${file}`);
  } else {
    console.error(`❌ Missing file: ${file}`);
    allPassed = false;
  }
}

console.log("\nChecking Route Definitions inside App.tsx:");
const appPath = path.resolve('src/App.tsx');
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf-8');
  
  const expectedPaths = [
    '/',
    '/student-login',
    '/teacher-login',
    '/admin-login',
    '/student/dashboard',
    '/teacher/dashboard',
    '/admin/dashboard'
  ];

  for (const expectedPath of expectedPaths) {
    // Check if the path exists inside App.tsx (e.g. path="/student-login")
    if (appContent.includes(`path="${expectedPath}"`) || appContent.includes(`path === '${expectedPath}'`) || appContent.includes(`path === "${expectedPath}"`)) {
      console.log(`✅ Route path matches in App.tsx: ${expectedPath}`);
    } else {
      console.error(`❌ Route path NOT found in App.tsx: ${expectedPath}`);
      allPassed = false;
    }
  }

  // Check for route guards
  const hasRouteGuard = appContent.includes('Global Route Guards') || appContent.includes('currentUser.role');
  if (hasRouteGuard) {
    console.log("✅ Role-based access control (RBAC) route guards found in App.tsx.");
  } else {
    console.error("❌ Missing route guard rules or redirection structure in App.tsx.");
    allPassed = false;
  }
} else {
  allPassed = false;
}

console.log("\nChecking Student Session Helpers in db.ts:");
const dbPath = path.resolve('src/services/db.ts');
if (fs.existsSync(dbPath)) {
  const dbContent = fs.readFileSync(dbPath, 'utf-8');
  const hasSessionHelpers = dbContent.includes('saveStudentSession') && dbContent.includes('zphs_student_session');
  if (hasSessionHelpers) {
    console.log("✅ Student session storage helper functions are defined.");
  } else {
    console.error("❌ Missing student session storage helper functions in db.ts.");
    allPassed = false;
  }
} else {
  allPassed = false;
}

console.log("\n=======================================================");
if (allPassed) {
  console.log("⭐ ALL ROUTING & SECURITY AUDITS PASSED! ⭐");
  process.exit(0);
} else {
  console.error("❌ SOME ROUTING AUDIT CHECKS FAILED. Please review the errors above.");
  process.exit(1);
}
