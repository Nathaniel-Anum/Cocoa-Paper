// Flip to true when HR Operations is ready to show again
// (sidebar Templates + Add Document → HR Operations).
export const HR_OPERATIONS_ENABLED = false;

function departmentNameOf(user) {
  return String(
    user?.department?.departmentName || user?.departmentName || '',
  )
    .trim()
    .toLowerCase();
}

/** True when the user's department is HR or Human Resource(s). */
export function isHrDepartment(user) {
  if (!HR_OPERATIONS_ENABLED) return false;
  const name = departmentNameOf(user);
  if (!name) return false;
  if (name === 'hr' || name === 'h.r' || name === 'h.r.') return true;
  if (name.includes('human resource')) return true;
  return /(?:^|[\s/_-])hr(?:$|[\s/_-])/.test(name);
}
