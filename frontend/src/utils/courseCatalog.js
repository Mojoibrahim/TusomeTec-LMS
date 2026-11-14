export const courseCatalogStorageKey = 'tusometec_course_catalog';
export const studentEnrollmentsStorageKey = 'tusometec_student_enrollments';
export const courseCatalogUpdatedEvent = 'tusometec:course-catalog-updated';

export function readStoredArray(key, fallback = []) {
  try {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) return fallback;
    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : fallback;
  } catch (error) {
    console.error(`Could not read ${key} from browser storage.`, error);
    return fallback;
  }
}

export function writeStoredArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  if (key === courseCatalogStorageKey) {
    window.dispatchEvent(new Event(courseCatalogUpdatedEvent));
  }
}
