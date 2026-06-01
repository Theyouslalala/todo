# Database Schema

## Collections to create in Cloud Console

### 1. users
- Fields: openid, name, avatar, role, familyGroupId, settings, createdAt
- Indexes: openid (unique)

### 2. reminders
- Fields: title, description, color, priority, category, dueDate, dueTime,
  isLunar, lunarDate, repeat, assignedTo, createdBy, familyGroupId,
  status, images, quantity, enableNotification, notifyBefore,
  createdAt, updatedAt, completedAt, deletedAt
- Indexes:
  - familyGroupId + status + dueDate
  - familyGroupId + category + status
  - assignedTo + status + dueDate

### 3. activity_logs
- Fields: familyGroupId, userId, action, targetTitle, detail, createdAt
- Indexes: familyGroupId + createdAt

### 4. notification_records
- Fields: userId, templateId, remainingCount, lastSubscribeAt, updatedAt
- Indexes: userId + templateId (unique)
