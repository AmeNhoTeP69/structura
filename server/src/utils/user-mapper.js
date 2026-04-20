function toPublicUser(user) {
  if (!user) return null;

  return {
    id: String(user.id),
    name: user.fullName,
    email: user.email,
    role: String(user.role || '').toLowerCase(),
    phone: user.phone || undefined,
    isActive: user.isActive,
    employeeTypeId: user.employeeProfile?.employeeTypeId
      ? String(user.employeeProfile.employeeTypeId)
      : undefined,
    employeeTypeName: user.employeeProfile?.employeeType?.name || undefined,
    speciality: user.employeeProfile?.speciality || undefined,
    notes: user.employeeProfile?.notes || undefined,
  };
}

module.exports = { toPublicUser };
