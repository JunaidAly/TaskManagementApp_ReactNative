/**
 * Utility Functions
 * Common helper functions used throughout the app
 */

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Check if date is overdue
 */
export const isOverdue = (date: string | Date): boolean => {
  return new Date(date) < new Date();
};

/**
 * Get priority color
 */
export const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
  switch (priority) {
    case 'high':
      return '#EF4444'; // red-500
    case 'medium':
      return '#F59E0B'; // amber-500
    case 'low':
      return '#10B981'; // green-500
    default:
      return '#6B7280'; // gray-500
  }
};

/**
 * Get status color
 */
export const getStatusColor = (status: 'todo' | 'in-progress' | 'done'): string => {
  switch (status) {
    case 'todo':
      return '#6B7280'; // gray-500
    case 'in-progress':
      return '#3B82F6'; // blue-500
    case 'done':
      return '#10B981'; // green-500
    default:
      return '#6B7280';
  }
};

/**
 * Get status label
 */
export const getStatusLabel = (status: 'todo' | 'in-progress' | 'done'): string => {
  switch (status) {
    case 'todo':
      return 'To Do';
    case 'in-progress':
      return 'In Progress';
    case 'done':
      return 'Done';
    default:
      return status;
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 */
export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = d.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (Math.abs(diffMins) < 60) {
    if (diffMins === 0) return 'now';
    return diffMins > 0 ? `in ${diffMins} min` : `${Math.abs(diffMins)} min ago`;
  } else if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `in ${diffHours}h` : `${Math.abs(diffHours)}h ago`;
  } else {
    return diffDays > 0 ? `in ${diffDays}d` : `${Math.abs(diffDays)}d ago`;
  }
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
