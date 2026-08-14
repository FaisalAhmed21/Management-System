const fs = require('fs');
const path = require('path');

function fixLayout(filePath, roleClass) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Sidebar wrapper
  content = content.replace(/bg-surface border-r border-border/g, `${roleClass} text-white border-r-0`);
  
  // Fix text-ink that should be white on sidebar
  content = content.replace(/text-ink/g, 'text-white');
  content = content.replace(/text-ink-muted/g, 'text-white/70');
  
  // Restore main content area to NOT have text-white (since it was globally replaced with text-ink)
  // Actually, main area background was replaced with bg-paper.
  content = content.replace(/<main className="flex-1 overflow-y-auto bg-paper p-8">/g, '<main className="flex-1 overflow-y-auto bg-paper p-8 text-ink">');
  
  fs.writeFileSync(filePath, content);
}

fixLayout('c:/Users/88019/Desktop/Assignment/frontend/src/app/admin/layout.tsx', 'bg-admin');
fixLayout('c:/Users/88019/Desktop/Assignment/frontend/src/app/teacher/layout.tsx', 'bg-teacher');
fixLayout('c:/Users/88019/Desktop/Assignment/frontend/src/app/student/layout.tsx', 'bg-student');

// Fix Badges to use Rubber Stamps
function fixBadges(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the dynamic badge class builders or direct classes
  content = content.replace(/<span className={`px-2.5 py-1 rounded-full text-xs font-medium \${/g, '<span className={`\\${');
  
  content = content.replace(/assignment.status === 'Published' \? 'bg-green-500\/10 text-green-400' : 'bg-yellow-500\/10 text-yellow-400'/g, "assignment.status === 'Published' ? 'rubber-stamp-green' : 'rubber-stamp-gray'");
  
  content = content.replace(/bg-green-500\/10 text-green-400/g, 'rubber-stamp-green');
  content = content.replace(/bg-red-500\/10 text-red-400/g, 'rubber-stamp-red');
  content = content.replace(/bg-yellow-500\/10 text-yellow-400/g, 'rubber-stamp-yellow');
  content = content.replace(/bg-blue-500\/10 text-blue-400/g, 'rubber-stamp-blue');
  content = content.replace(/px-2.5 py-1 rounded-full text-xs font-medium /g, '');
  
  fs.writeFileSync(filePath, content);
}

const badgeFiles = [
  'c:/Users/88019/Desktop/Assignment/frontend/src/app/teacher/assignments/page.tsx',
  'c:/Users/88019/Desktop/Assignment/frontend/src/app/teacher/submissions/page.tsx',
  'c:/Users/88019/Desktop/Assignment/frontend/src/app/student/assignments/page.tsx',
  'c:/Users/88019/Desktop/Assignment/frontend/src/app/student/assignments/[id]/page.tsx'
];

badgeFiles.forEach(fixBadges);
