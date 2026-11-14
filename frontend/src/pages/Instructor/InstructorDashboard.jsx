import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FloatingChatBot from '../../components/FloatingChatBot';
import ProfileEditor from '../../components/ProfileEditor';
import { courseCatalogStorageKey, readStoredArray, writeStoredArray } from '../../utils/courseCatalog';
import './InstructorDashboard.css';

const initialCourses = [
  { id: 'digital', title: 'Digital Skills for the Workplace', category: 'Digital literacy', learners: 84, completion: 76, lessons: 12, color: 'violet', initials: 'DS', updated: 'Updated 2 days ago', status: 'published', visibility: 'Public', drip: 'Open access', enrollmentLimit: '', modules: [{ title: 'Digital safety essentials', prerequisite: 'None' }, { title: 'Password management', prerequisite: 'Digital safety essentials' }], units: [{ title: 'Digital safety essentials', topics: ['Protecting personal information', 'Recognizing online risks'] }, { title: 'Password management', topics: ['Creating strong passwords', 'Using a password manager'] }] },
  { id: 'analytics', title: 'Introduction to Data Analytics', category: 'Technology', learners: 62, completion: 58, lessons: 10, color: 'blue', initials: 'DA', updated: 'Updated yesterday', status: 'published', visibility: 'Public', drip: 'Open access', enrollmentLimit: '', modules: [{ title: 'Reading your first dataset', prerequisite: 'None' }], units: [{ title: 'Reading your first dataset', topics: ['Rows, columns, and data types', 'Finding patterns in a table'] }] },
  { id: 'business', title: 'Entrepreneurship & Business', category: 'Business', learners: 48, completion: 89, lessons: 8, color: 'amber', initials: 'EB', updated: 'Updated 5 days ago', status: 'published', visibility: 'Public', drip: 'Open access', enrollmentLimit: '', modules: [{ title: 'Finding a business idea', prerequisite: 'None' }], units: [{ title: 'Finding a business idea', topics: ['Identifying customer needs', 'Evaluating an opportunity'] }] },
];

const initialSubmissions = [
  { id: 1, learner: 'Joyce Muthoni', initials: 'JM', courseId: 'digital', cohort: 'Cohort A', assignment: 'Digital safety reflection', submitted: '12 min ago', submittedAt: new Date(Date.now() - 12 * 60 * 1000), status: 'Needs review', onTime: true, color: 'peach' },
  { id: 2, learner: 'Daniel Omondi', initials: 'DO', courseId: 'analytics', cohort: 'Cohort B', assignment: 'Reading a data chart', submitted: '38 min ago', submittedAt: new Date(Date.now() - 38 * 60 * 1000), status: 'Needs review', onTime: false, color: 'blue' },
  { id: 3, learner: 'Alice Wambui', initials: 'AW', courseId: 'business', cohort: 'Cohort A', assignment: 'Business idea canvas', submitted: '1 hr ago', submittedAt: new Date(Date.now() - 60 * 60 * 1000), status: 'Reviewed', onTime: true, color: 'green' },
  { id: 4, learner: 'Brian Kamau', initials: 'BK', courseId: 'digital', cohort: 'Cohort B', assignment: 'Create a strong password guide', submitted: 'Yesterday', submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), status: 'Needs review', onTime: false, color: 'purple' },
];

const learners = [
  { name: 'Joyce Muthoni', email: 'joyce.muthoni@example.com', grade: 'Grade 1', initials: 'JM', courseId: 'digital', course: 'Digital Skills for the Workplace', progress: 92, activity: 'Today', activityDays: 0, videoCompletion: 96, discussions: 4, failedQuizAttempts: 0, overdueAssignments: 0, moduleProgress: [100, 84, 92, 91], color: 'peach' },
  { name: 'Daniel Omondi', email: 'daniel.omondi@example.com', grade: 'Grade 4', initials: 'DO', courseId: 'analytics', course: 'Introduction to Data Analytics', progress: 68, activity: 'Today', activityDays: 0, videoCompletion: 72, discussions: 2, failedQuizAttempts: 1, overdueAssignments: 0, moduleProgress: [100, 78, 64, 30], color: 'blue' },
  { name: 'Alice Wambui', email: 'alice.wambui@example.com', grade: 'Grade 4', initials: 'AW', courseId: 'business', course: 'Entrepreneurship & Business', progress: 54, activity: 'Yesterday', activityDays: 1, videoCompletion: 49, discussions: 1, failedQuizAttempts: 0, overdueAssignments: 1, moduleProgress: [100, 65, 40, 11], color: 'green' },
  { name: 'Brian Kamau', email: 'brian.kamau@example.com', grade: 'Grade 1', initials: 'BK', courseId: 'digital', course: 'Digital Skills for the Workplace', progress: 31, activity: '8 days ago', activityDays: 8, videoCompletion: 28, discussions: 0, failedQuizAttempts: 2, overdueAssignments: 2, moduleProgress: [80, 35, 0, 0], color: 'purple' },
  { name: 'Amina Hassan', email: 'amina.hassan@example.com', grade: 'Grade 1', initials: 'AH', courseId: 'digital', course: 'Digital Skills for the Workplace', progress: 76, activity: 'Yesterday', activityDays: 1, videoCompletion: 81, discussions: 3, failedQuizAttempts: 0, overdueAssignments: 0, moduleProgress: [100, 70, 65, 50], color: 'blue' },
  { name: 'Peter Mwangi', email: 'peter.mwangi@example.com', grade: 'Grade 1', initials: 'PM', courseId: 'digital', course: 'Digital Skills for the Workplace', progress: 61, activity: '2 days ago', activityDays: 2, videoCompletion: 58, discussions: 1, failedQuizAttempts: 1, overdueAssignments: 0, moduleProgress: [90, 60, 42, 30], color: 'green' },
  { name: 'Faith Njeri', email: 'faith.njeri@example.com', grade: 'Grade 4', initials: 'FN', courseId: 'analytics', course: 'Introduction to Data Analytics', progress: 83, activity: 'Today', activityDays: 0, videoCompletion: 88, discussions: 5, failedQuizAttempts: 0, overdueAssignments: 0, moduleProgress: [100, 92, 80, 60], color: 'peach' },
  { name: 'Kevin Otieno', email: 'kevin.otieno@example.com', grade: 'Grade 4', initials: 'KO', courseId: 'business', course: 'Entrepreneurship & Business', progress: 42, activity: '3 days ago', activityDays: 3, videoCompletion: 40, discussions: 1, failedQuizAttempts: 1, overdueAssignments: 1, moduleProgress: [100, 55, 20, 0], color: 'purple' },
];

const getUpcomingDate = (days, hour) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const sessions = [
  { date: getUpcomingDate(0, 14), title: 'Digital safety: live Q&A', courseId: 'digital', color: 'violet' },
  { date: getUpcomingDate(2, 10), title: 'Understanding your first dataset', courseId: 'analytics', color: 'blue' },
  { date: getUpcomingDate(5, 13), title: 'Building a business model', courseId: 'business', color: 'amber' },
];

const pastSessions = [
  { date: getUpcomingDate(-3, 14), title: 'Digital safety: learner clinic', courseId: 'digital', recording: 'Recording unavailable' },
  { date: getUpcomingDate(-7, 10), title: 'Getting started with spreadsheets', courseId: 'analytics', recording: 'Recording unavailable' },
];

const initialDiscussions = [
  { id: 1, course: 'Digital Skills for the Workplace', author: 'Joyce Muthoni', message: 'Could you clarify the password manager exercise?', status: 'Open', flagged: false, cohort: 'Cohort A' },
  { id: 2, course: 'Introduction to Data Analytics', author: 'Daniel Omondi', message: 'I shared my chart in the class discussion.', status: 'Pending approval', flagged: true, cohort: 'Cohort B' },
];

const sampleRevenue = [
  { course: 'Digital Skills for the Workplace', revenue: 84200, coupons: 14, refunds: 2, renewals: 8 },
  { course: 'Introduction to Data Analytics', revenue: 61900, coupons: 9, refunds: 1, renewals: 5 },
  { course: 'Entrepreneurship & Business', revenue: 47300, coupons: 6, refunds: 3, renewals: 4 },
];

const sampleTransactions = [
  { id: 'TX-2408', date: 'Oct 28', description: 'Digital Skills enrollment', amount: 12500, status: 'Settled' },
  { id: 'TX-2407', date: 'Oct 24', description: 'Analytics subscription renewal', amount: 8400, status: 'Settled' },
  { id: 'TX-2406', date: 'Oct 21', description: 'Business course refund', amount: -3200, status: 'Sample refund' },
];

const learnerActivity = [
  { learner: 'Joyce Muthoni', activity: 'Completed Digital safety essentials video', time: 'Today · 9:42 AM', kind: 'Video' },
  { learner: 'Daniel Omondi', activity: 'Posted a question in course Q&A', time: 'Today · 8:16 AM', kind: 'Discussion' },
  { learner: 'Alice Wambui', activity: 'Signed in and resumed module 2', time: 'Yesterday · 4:30 PM', kind: 'Login' },
  { learner: 'Brian Kamau', activity: 'Last recorded course activity', time: '8 days ago', kind: 'Login' },
];

const sampleQuizAnalytics = [
  { question: 'Recognizing a secure password', correct: 78, difficulty: 'Moderate' },
  { question: 'Choosing the safest sharing method', correct: 52, difficulty: 'Challenging' },
  { question: 'Identifying a phishing message', correct: 91, difficulty: 'Easy' },
];

const readStoredObject = (key) => {
  try {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) return {};
    const parsedValue = JSON.parse(storedValue);
    return parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue)
      ? parsedValue
      : {};
  } catch (error) {
    console.error(`Could not read ${key} from browser storage.`, error);
    return {};
  }
};

const navigation = [
  { label: 'Overview', icon: 'grid', target: 'overview' },
  { label: 'My courses', icon: 'book', target: 'my-courses' },
  { label: 'Assignments', icon: 'clipboard', target: 'assignments', count: '3' },
  { label: 'Learners', icon: 'users', target: 'learners' },
  { label: 'Class schedule', icon: 'calendar', target: 'schedule' },
  { label: 'Settings', icon: 'spark', target: 'instructor-settings' },
];

const quickTools = [
  { label: 'Upload content', target: 'content-library' },
  { label: 'Build assessment', target: 'assessment-builder' },
  { label: 'Grade work', target: 'grading-hub' },
  { label: 'Attendance & progress', target: 'progress-attendance' },
  { label: 'Live classes & discussions', target: 'live-discussions' },
  { label: 'Revenue & payouts', target: 'financial-overview' },
  { label: 'Instructor settings', target: 'instructor-settings' },
];

function Icon({ name, size = 19 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" /><path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20" /></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V2h6v2M9 11h6M9 15h6" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    arrowUp: <><path d="M7 17 17 7M7 7h10v10" /></>,
    play: <path d="m9 6 10 6-10 6z" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" /><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4 20-7z" /><path d="M22 2 11 13" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
  };

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function InstructorDashboard() {
  const navigate = useNavigate();
  const { grade: gradeParam } = useParams();
  const [activeNav, setActiveNav] = useState('Overview');
  const [activeSection, setActiveSection] = useState('overview');
  const [gradePages, setGradePages] = useState({});
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState(() => readStoredArray(courseCatalogStorageKey, initialCourses));
  const [courseSaveError, setCourseSaveError] = useState('');
  const [courseStatusFilter, setCourseStatusFilter] = useState('all');
  const [coursePage, setCoursePage] = useState(1);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('');
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [submissionCourseFilter, setSubmissionCourseFilter] = useState('all');
  const [submissionCohortFilter, setSubmissionCohortFilter] = useState('all');
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState('all');
  const [submissionTimingFilter, setSubmissionTimingFilter] = useState('all');
  const [submissionDateFilter, setSubmissionDateFilter] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [contentItems, setContentItems] = useState([]);
  const [contentCourse, setContentCourse] = useState(courses[0].id);
  const [contentKind, setContentKind] = useState('Lesson notes');
  const [contentMessage, setContentMessage] = useState('');
  const [assessments, setAssessments] = useState([]);
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [assessmentCourse, setAssessmentCourse] = useState(courses[0].id);
  const [assessmentType, setAssessmentType] = useState('Auto-graded quiz');
  const [assessmentTimeLimit, setAssessmentTimeLimit] = useState(30);
  const [assessmentMessage, setAssessmentMessage] = useState('');
  const [attendance, setAttendance] = useState(() => learners.map((learner) => ({ email: learner.email, status: 'Present' })));
  const [liveSessions, setLiveSessions] = useState([]);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionCourse, setSessionCourse] = useState(courses[0].id);
  const [sessionTime, setSessionTime] = useState('');
  const [sessionLink, setSessionLink] = useState('');
  const [sessionPlatform, setSessionPlatform] = useState('Zoom');
  const [sessionMessage, setSessionMessage] = useState('');
  const [discussions, setDiscussions] = useState(initialDiscussions);
  const [discussionFilter, setDiscussionFilter] = useState('all');
  const [expandedAnalytics, setExpandedAnalytics] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [announcementCourse, setAnnouncementCourse] = useState('all');
  const [announcementCohort, setAnnouncementCohort] = useState('all');
  const [announcementChannels, setAnnouncementChannels] = useState(['system']);
  const [announcementSchedule, setAnnouncementSchedule] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'Welcome to the new learning term!', time: 'Sample · Posted Oct 10', audience: 'All learners', status: 'Sent' },
    { id: 2, title: 'Remember to submit your weekly reflection.', time: 'Sample · Posted Oct 8', audience: 'Digital Skills learners', status: 'Sent' },
  ]);
  const [profileSettings, setProfileSettings] = useState(() => {
    const settings = readStoredObject('instructor_dashboard_settings');
    const preferences = settings.notificationPreferences && typeof settings.notificationPreferences === 'object'
      ? settings.notificationPreferences
      : {};
    return {
      bio: typeof settings.bio === 'string' ? settings.bio : '',
      brandColor: typeof settings.brandColor === 'string' && /^#[\da-f]{6}$/i.test(settings.brandColor)
        ? settings.brandColor
        : '#7661e8',
      notificationPreferences: {
        grading: typeof preferences.grading === 'boolean' ? preferences.grading : true,
        discussions: typeof preferences.discussions === 'boolean' ? preferences.discussions : true,
        sessions: typeof preferences.sessions === 'boolean' ? preferences.sessions : false,
      },
    };
  });
  const [instructorBio, setInstructorBio] = useState(profileSettings.bio || '');
  const [brandColor, setBrandColor] = useState(profileSettings.brandColor || '#7661e8');
  const [notificationPreferences, setNotificationPreferences] = useState(profileSettings.notificationPreferences || { grading: true, discussions: true, sessions: false });
  const [settingsMessage, setSettingsMessage] = useState('');
  const [financeMessage, setFinanceMessage] = useState('');
  const [user, setUser] = useState(() => readStoredObject('user_data'));
  const firstName = user.name?.trim().split(/\s+/)[0] || 'Instructor';
  const currentDate = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  const pendingCount = submissions.filter((submission) => submission.status === 'Needs review').length;
  const openDiscussionCount = discussions.filter((discussion) => discussion.status !== 'Resolved').length;
  const activeCourses = courses.filter((course) => course.status === 'published');
  const activeEnrollmentCount = activeCourses.reduce((total, course) => total + course.learners, 0);
  const averageCompletion = activeCourses.length
    ? Math.round(activeCourses.reduce((total, course) => total + course.completion, 0) / activeCourses.length)
    : 0;
  const courseTitle = (courseId) => courses.find((course) => course.id === courseId)?.title || 'Assigned course';
  const upcomingSessions = [
    ...sessions.map((session) => ({ ...session, title: session.title, course: courseTitle(session.courseId) })),
    ...liveSessions
      .filter((session) => new Date(session.time) >= new Date())
      .map((session) => ({ ...session, date: new Date(session.time), course: courseTitle(session.courseId) })),
  ].sort((first, second) => first.date - second.date);
  const nextSession = upcomingSessions[0];
  const flaggedLearners = learners.filter((learner) => (
    learner.activityDays >= 7
    || learner.failedQuizAttempts > 0
    || learner.overdueAssignments > 0
    || learner.progress < 40
  ));
  const learnerGrades = [...new Set(learners.map((learner) => learner.grade))];
  const selectedGrade = learnerGrades.find((grade) => grade.toLowerCase().replace(/\s+/g, '-') === gradeParam) || null;
  const learnersPerGradePage = 2;
  useEffect(() => {
    if (!gradeParam) return;
    if (!selectedGrade) {
      navigate('/instructor/dashboard', { replace: true });
      return;
    }
    setActiveSection('learners');
    setActiveNav('Learners');
  }, [gradeParam, navigate, selectedGrade]);
  useEffect(() => {
    try {
      writeStoredArray(courseCatalogStorageKey, courses);
      setCourseSaveError('');
    } catch (error) {
      console.error('Could not save instructor course curriculum to browser storage.', error);
      setCourseSaveError('Course changes could not be saved in this browser.');
    }
  }, [courses]);
  useEffect(() => {
    const syncCourseCatalog = (event) => {
      if (event.key === courseCatalogStorageKey) {
        setCourses(readStoredArray(courseCatalogStorageKey, initialCourses));
      }
    };
    window.addEventListener('storage', syncCourseCatalog);
    return () => window.removeEventListener('storage', syncCourseCatalog);
  }, []);
  const filteredDiscussions = discussions.filter((discussion) => (
    discussionFilter === 'all'
    || (discussionFilter === 'flagged' && discussion.flagged)
    || (discussionFilter === 'pending' && discussion.status === 'Pending approval')
    || (discussionFilter === 'open' && discussion.status === 'Open')
    || (discussionFilter === 'resolved' && discussion.status === 'Resolved')
  ));
  const filteredCourses = useMemo(
    () => courses.filter((course) => (
      `${course.title} ${course.category}`.toLowerCase().includes(search.toLowerCase())
      && (courseStatusFilter === 'all' || course.status === courseStatusFilter)
    )),
    [courses, search, courseStatusFilter],
  );
  const coursesPerPage = 4;
  const coursePageCount = Math.max(1, Math.ceil(filteredCourses.length / coursesPerPage));
  const paginatedCourses = filteredCourses.slice((coursePage - 1) * coursesPerPage, coursePage * coursesPerPage);
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesCourse = submissionCourseFilter === 'all' || submission.courseId === submissionCourseFilter;
    const matchesCohort = submissionCohortFilter === 'all' || submission.cohort === submissionCohortFilter;
    const matchesStatus = submissionStatusFilter === 'all' || submission.status === submissionStatusFilter;
    const matchesTiming = submissionTimingFilter === 'all'
      || (submissionTimingFilter === 'on-time' ? submission.onTime : !submission.onTime);
    const matchesDate = !submissionDateFilter
      || submission.submittedAt.toLocaleDateString('en-CA') === submissionDateFilter;
    return matchesCourse && matchesCohort && matchesStatus && matchesTiming && matchesDate;
  });
  const submissionGroups = filteredSubmissions.reduce((groups, submission) => {
    const courseId = submission.courseId || 'unassigned';
    let group = groups.find((item) => item.courseId === courseId);
    if (!group) {
      group = { courseId, submissions: [] };
      groups.push(group);
    }
    group.submissions.push(submission);
    return groups;
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const markReviewed = (submissionId) => {
    const score = selectedSubmission.score === '' ? '' : Number(selectedSubmission.score);
    if (score !== '' && (!Number.isFinite(score) || score < 0 || score > 100)) {
      setSelectedSubmission((current) => ({ ...current, gradeError: 'Score must be between 0 and 100.' }));
      return;
    }
    const invalidRubricScore = Object.values(selectedSubmission.rubric || {}).some((value) => (
      value !== '' && (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 5)
    ));
    if (invalidRubricScore) {
      setSelectedSubmission((current) => ({ ...current, gradeError: 'Rubric scores must be between 0 and 5.' }));
      return;
    }
    setSubmissions((current) => current.map((submission) => (
      submission.id === submissionId
        ? { ...submission, status: 'Reviewed', score, feedback: selectedSubmission.feedback, rubric: selectedSubmission.rubric }
        : submission
    )));
    setSelectedSubmission(null);
  };

  const createCourse = (event) => {
    event.preventDefault();
    const title = newCourseTitle.trim();
    const category = newCourseCategory.trim();
    if (!title || !category) return;
    const initials = title.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
    setCourses((current) => [{
      id: `course-${Date.now()}`,
      title,
      category,
      learners: 0,
      completion: 0,
      lessons: 0,
      color: 'violet',
      initials,
      updated: 'Created just now',
      status: 'draft',
      visibility: 'Private',
      drip: 'Open access',
      enrollmentLimit: '',
      modules: [],
      units: [],
    }, ...current]);
    setNewCourseTitle('');
    setNewCourseCategory('');
    setCourseStatusFilter('all');
    setCoursePage(1);
  };

  const updateCourse = (courseId, changes) => {
    setCourses((current) => current.map((course) => (
      course.id === courseId ? { ...course, ...changes } : course
    )));
  };

  const addModule = (event, courseId) => {
    event.preventDefault();
    const form = event.currentTarget;
    const title = new FormData(form).get('moduleTitle')?.toString().trim();
    if (!title) return;
    setCourses((current) => current.map((course) => (
      course.id === courseId
        ? { ...course, modules: [...course.modules, { title, prerequisite: 'None' }], lessons: course.lessons + 1 }
        : course
    )));
    form.reset();
  };

  const addUnit = (event, courseId) => {
    event.preventDefault();
    const form = event.currentTarget;
    const title = new FormData(form).get('unitTitle')?.toString().trim();
    if (!title) return;
    setCourses((current) => current.map((course) => (
      course.id === courseId
        ? { ...course, units: [...(course.units || []), { title, topics: [] }] }
        : course
    )));
    form.reset();
  };

  const addTopic = (event, courseId, unitIndex) => {
    event.preventDefault();
    const form = event.currentTarget;
    const title = new FormData(form).get('topicTitle')?.toString().trim();
    if (!title) return;
    setCourses((current) => current.map((course) => (
      course.id === courseId
        ? {
          ...course,
          units: course.units.map((unit, index) => (
            index === unitIndex ? { ...unit, topics: [...unit.topics, title] } : unit
          )),
        }
        : course
    )));
    form.reset();
  };

  const uploadContent = (event) => {
    event.preventDefault();
    const files = Array.from(event.currentTarget.elements.contentFiles.files || []);
    if (!files.length) {
      setContentMessage('Choose one or more files to add to this course.');
      return;
    }
    setContentItems((current) => [
      ...files.map((file, index) => ({
        id: `${file.name}-${file.lastModified}-${index}`,
        name: file.name,
        size: file.size,
        courseId: contentCourse,
        kind: contentKind,
      })),
      ...current,
    ]);
    setContentMessage(`${files.length} file${files.length === 1 ? '' : 's'} added to this local dashboard view.`);
    event.currentTarget.elements.contentFiles.value = '';
  };

  const createAssessment = (event) => {
    event.preventDefault();
    const title = assessmentTitle.trim();
    if (!title) {
      setAssessmentMessage('Enter a title before creating an assessment.');
      return;
    }
    setAssessments((current) => [{
      id: Date.now(),
      title,
      courseId: assessmentCourse,
      type: assessmentType,
      timeLimit: assessmentType === 'Timed exam' ? Number(assessmentTimeLimit) : null,
    }, ...current]);
    setAssessmentTitle('');
    setAssessmentMessage('Assessment draft added below. It has not been published to learners.');
  };

  const createLiveSession = (event) => {
    event.preventDefault();
    if (!sessionTitle.trim() || !sessionTime) {
      setSessionMessage('Add a session title and date/time to create a schedule draft.');
      return;
    }
    if (new Date(sessionTime) <= new Date()) {
      setSessionMessage('Choose a future date and time for this session.');
      return;
    }
    if (sessionLink.trim()) {
      try {
        const meetingUrl = new URL(sessionLink.trim());
        if (!['http:', 'https:'].includes(meetingUrl.protocol)) throw new Error('Invalid protocol');
      } catch {
        setSessionMessage('Enter a valid Zoom or Google Meet web link, or leave the link blank.');
        return;
      }
    }
    setLiveSessions((current) => [{
      id: Date.now(),
      title: sessionTitle.trim(),
      courseId: sessionCourse,
      time: sessionTime,
      link: sessionLink.trim(),
      platform: sessionPlatform,
    }, ...current]);
    setSessionTitle('');
    setSessionTime('');
    setSessionLink('');
    setSessionMessage('Session draft added locally. No invitations or live stream were configured.');
  };

  const toggleAttendance = (email) => {
    setAttendance((current) => current.map((record) => (
      record.email === email ? { ...record, status: record.status === 'Present' ? 'Absent' : 'Present' } : record
    )));
  };

  const moderateDiscussion = (discussionId, action) => {
    setDiscussions((current) => current.map((discussion) => (
      discussion.id === discussionId
        ? {
          ...discussion,
          status: action === 'flag'
            ? discussion.status
            : action === 'approve'
              ? 'Open'
              : action === 'resolve'
                ? 'Resolved'
                : discussion.status === 'Resolved' ? 'Open' : 'Resolved',
          flagged: action === 'flag' ? !discussion.flagged : discussion.flagged,
        }
        : discussion
    )));
  };

  const saveInstructorSettings = (event) => {
    event.preventDefault();
    const updatedSettings = { bio: instructorBio.trim(), brandColor, notificationPreferences };
    try {
      localStorage.setItem('instructor_dashboard_settings', JSON.stringify(updatedSettings));
      setProfileSettings(updatedSettings);
      setSettingsMessage('Preferences saved in this browser. Public profile and notifications are not synced to the server.');
    } catch (error) {
      console.error('Could not save instructor dashboard settings.', error);
      setSettingsMessage('Could not save preferences in this browser. Check available storage and try again.');
    }
  };

  const toggleAnnouncementChannel = (channel) => {
    setAnnouncementChannels((current) => (
      current.includes(channel) ? current.filter((item) => item !== channel) : [...current, channel]
    ));
  };

  const visibleWhen = (...sections) => sections.includes(activeSection) ? undefined : { display: 'none' };
  const sectionTitles = {
    overview: 'Overview',
    'my-courses': 'My courses',
    'content-library': 'Content upload',
    assignments: 'Assignments',
    'assessment-builder': 'Assessment builder',
    'grading-hub': 'Grading & feedback',
    learners: 'Learners',
    'progress-attendance': 'Progress & attendance',
    schedule: 'Class schedule',
    'live-discussions': 'Live classes & discussions',
    announcements: 'Announcements',
    'financial-overview': 'Revenue & payouts',
    'instructor-settings': 'Instructor settings',
  };
  const handleSectionNavigation = (event) => {
    const link = event.target.closest('a[href^="#"]');
    const target = link?.getAttribute('href')?.slice(1);
    if (!target || !sectionTitles[target]) return;

    event.preventDefault();
    setActiveSection(target);
    if (gradeParam) navigate('/instructor/dashboard');
    if (target === 'instructor-settings') {
      setActiveNav('Settings');
    } else if (['overview', 'my-courses', 'assignments', 'learners', 'schedule'].includes(target)) {
      setActiveNav(sectionTitles[target]);
    } else if (['content-library'].includes(target)) {
      setActiveNav('My courses');
    } else if (['assessment-builder', 'grading-hub'].includes(target)) {
      setActiveNav('Assignments');
    } else if (target === 'progress-attendance') {
      setActiveNav('Learners');
    } else if (target === 'live-discussions') {
      setActiveNav('Class schedule');
    } else if (target === 'announcements') {
      setActiveNav('Announcements');
    } else if (target === 'financial-overview') {
      setActiveNav('Settings');
    }
  };

  const postAnnouncement = (event) => {
    event.preventDefault();
    const title = announcement.trim();
    if (!title || !announcementChannels.length) {
      setAnnouncementMessage('Enter a message and choose at least one delivery channel.');
      return;
    }
    const scheduledAt = announcementSchedule ? new Date(announcementSchedule) : null;
    if (scheduledAt && Number.isNaN(scheduledAt.getTime())) {
      setAnnouncementMessage('Choose a valid send date and time.');
      return;
    }
    if (scheduledAt && scheduledAt <= new Date()) {
      setAnnouncementMessage('Choose a future send date and time, or clear the schedule to save a draft.');
      return;
    }
    const course = announcementCourse === 'all' ? null : courses.find((item) => item.id === announcementCourse);
    const audience = [course?.title || 'All courses', announcementCohort === 'all' ? 'All cohorts' : announcementCohort].join(' · ');
    const status = scheduledAt && scheduledAt > new Date() ? 'Scheduled locally' : 'Draft · not sent';
    const time = scheduledAt && scheduledAt > new Date()
      ? `Scheduled for ${scheduledAt.toLocaleString()}`
      : 'Created just now';
    setAnnouncements((current) => [{
      id: Date.now(),
      title,
      time,
      audience,
      status,
      channels: announcementChannels,
    }, ...current]);
    setAnnouncement('');
    setAnnouncementSchedule('');
    setAnnouncementMessage('Saved locally. System, email, and push delivery are not connected.');
    setShowAnnouncementForm(false);
  };

  const renderGradeLearner = (learner) => {
    const attendanceStatus = attendance.find((record) => record.email === learner.email)?.status || 'Present';
    return (
      <div className="instructor-grade-learner" key={learner.email}>
        <div className="instructor-grade-learner-info">
          <span className={`instructor-learner-avatar avatar-${learner.color}`}>{learner.initials}</span>
          <span><strong>{learner.name}</strong><small>{learner.email}</small><small>{learner.course}</small></span>
        </div>
        <div className="instructor-grade-learner-progress">
          <span>Course progress <strong>{learner.progress}%</strong></span>
          <div className="instructor-progress-track"><span style={{ width: `${learner.progress}%` }} /></div>
        </div>
        <button
          type="button"
          className="submission-action"
          onClick={() => toggleAttendance(learner.email)}
          aria-label={`Mark ${learner.name} ${attendanceStatus === 'Present' ? 'absent' : 'present'}`}
        >
          {attendanceStatus}
        </button>
      </div>
    );
  };

  return (
    <div className="instructor-dashboard" id="overview" onClick={handleSectionNavigation} style={{ '--instructor-purple': brandColor }}>
      <aside className="instructor-sidebar">
        <a className="instructor-brand" href="#overview" onClick={() => setActiveNav('Overview')} aria-label="TusomeTec home">
          <span className="instructor-brand-mark">t</span>
          <span>Tusome<span className="instructor-brand-accent">Tec</span></span>
        </a>
        <div className="instructor-workspace">
          <span className="instructor-workspace-icon">T</span>
          <span className="instructor-workspace-copy"><strong>TusomeTec Academy</strong><small>Instructor workspace</small></span>
        </div>
        <span className="instructor-sidebar-label">TEACHING</span>
        <nav className="instructor-nav" aria-label="Instructor dashboard sections">
          {navigation.map((item) => (
            <a
              className={`instructor-nav-link${activeNav === item.label ? ' is-active' : ''}`}
              href={`#${item.target}`}
              key={item.label}
              onClick={() => setActiveNav(item.label)}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.count && <span className="instructor-nav-count">{pendingCount}</span>}
            </a>
          ))}
        </nav>
        <span className="instructor-sidebar-label instructor-manage-label">COMMUNITY</span>
        <a className={`instructor-nav-link${activeNav === 'Announcements' ? ' is-active' : ''}`} href="#announcements" onClick={() => setActiveNav('Announcements')}>
          <Icon name="send" size={18} /><span>Announcements</span>
        </a>

        <div className="instructor-help">
          <span className="instructor-help-icon"><Icon name="spark" size={16} /></span>
          <strong>Here to help</strong>
          <p>Need support with your course or class? Our team is one message away.</p>
          <a href="mailto:support@tusometec.com">Contact support <Icon name="arrow" size={13} /></a>
        </div>
        <button className="instructor-logout" type="button" onClick={handleLogout}>
          <Icon name="logout" size={18} /><span>Sign out</span>
        </button>
      </aside>
      <FloatingChatBot courseCount={courses.length} />

      <main className="instructor-main">
        <header className="instructor-topbar">
          <div className="instructor-mobile-brand"><span className="instructor-brand-mark">t</span><strong>Tusome<span className="instructor-brand-accent">Tec</span></strong></div>
          <div className="instructor-breadcrumb"><span>Teaching workspace</span><span className="breadcrumb-divider">/</span><strong>{selectedGrade ? `${selectedGrade} students` : sectionTitles[activeSection]}</strong></div>
          <div className="instructor-top-actions">
            <span className="instructor-date">{currentDate}</span>
            <div className="instructor-notification-wrap">
              <button className={`instructor-icon-button${showNotifications ? ' is-active' : ''}`} type="button" aria-label="Notifications" aria-expanded={showNotifications} onClick={() => setShowNotifications((visible) => !visible)}>
                <Icon name="bell" size={19} /><span className="instructor-notification-dot" />
              </button>
              {showNotifications && (
                <div className="instructor-notifications">
                  <strong>Teaching updates</strong>
                  <p><span />{pendingCount} learner submissions need your review.</p>
                  <p><span />{openDiscussionCount} student questions are awaiting a response.</p>
                  <p><span />{nextSession ? `Next live session: ${nextSession.title} · ${nextSession.date.toLocaleString()}.` : 'No upcoming live sessions.'}</p>
                </div>
              )}
            </div>
            <ProfileEditor
              avatarClassName="instructor-profile-avatar"
              className="instructor-profile"
              copyClassName="instructor-profile-copy"
              onUpdated={setUser}
              roleLabel="Instructor"
              user={user}
            />
          </div>
        </header>

        <div className="instructor-content">
          {selectedGrade ? (
            <section className="instructor-grade-page" aria-labelledby="selected-grade-title">
              <div className="instructor-grade-page-heading">
                <div>
                  <p className="instructor-eyebrow">LEARNER CLASS</p>
                  <h1 id="selected-grade-title">{selectedGrade} students</h1>
                  <p>Full class list · {learners.filter((learner) => learner.grade === selectedGrade).length} learners</p>
                </div>
                <button type="button" className="submission-action" onClick={() => navigate('/instructor/dashboard#learners')}>Back to grades</button>
              </div>
              <div className="instructor-grade-detail-roster">
                {learners.filter((learner) => learner.grade === selectedGrade).map(renderGradeLearner)}
              </div>
            </section>
          ) : (
            <>
          <section className="instructor-welcome" style={visibleWhen('overview')}>
            <div>
              <p className="instructor-eyebrow">YOUR TEACHING SPACE</p>
              <h1>Good morning, {firstName} <span>✦</span></h1>
              <p>Here’s how your learners and courses are doing today.</p>
            </div>
            <a className="instructor-primary-button" href="#my-courses"><Icon name="plus" size={17} /> Manage my courses</a>
          </section>

          <nav aria-label="Teaching tool shortcuts" style={{ ...visibleWhen('overview'), display: activeSection === 'overview' ? 'flex' : 'none', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {quickTools.map((tool) => (
              <a className="instructor-text-link" href={`#${tool.target}`} key={tool.target} style={{ padding: '7px 10px', border: '1px solid #eceef4', borderRadius: 8, background: '#fff' }}>
                {tool.label} <Icon name="arrow" size={13} />
              </a>
            ))}
          </nav>

          <section className="instructor-stats" aria-label="Teaching overview" style={visibleWhen('overview')}>
            <article className="instructor-stat-card">
              <span className="instructor-stat-icon stat-violet"><Icon name="book" size={19} /></span>
              <span className="instructor-stat-trend">{courses.length} managed</span>
              <p>Active courses</p><strong>{activeCourses.length}</strong><small>Published courses</small>
            </article>
            <article className="instructor-stat-card">
              <span className="instructor-stat-icon stat-blue"><Icon name="users" size={19} /></span>
              <span className="instructor-stat-trend">Active courses</span>
              <p>Active enrollments</p><strong>{activeEnrollmentCount}</strong><small>Across published courses</small>
            </article>
            <article className="instructor-stat-card">
              <span className="instructor-stat-icon stat-green"><Icon name="check" size={19} /></span>
              <span className="instructor-stat-trend">Course average</span>
              <p>Completion rate</p><strong>{averageCompletion}%</strong><small>Across published courses</small>
            </article>
            <article className="instructor-stat-card">
              <span className="instructor-stat-icon stat-amber"><Icon name="arrowUp" size={19} /></span>
              <span className="instructor-stat-trend">Payouts</span>
              <p>Total earnings</p><strong>—</strong><small>Reporting is not connected</small>
            </article>
          </section>

          <section className="instructor-panel instructor-action-center" aria-label="Action center" style={visibleWhen('overview')}>
            <div className="instructor-panel-heading">
              <div><h2>Action center</h2><p>Items that may need your attention</p></div>
              <span className="instructor-action-total">{pendingCount + openDiscussionCount + flaggedLearners.length + (nextSession ? 1 : 0)} priorities</span>
            </div>
            <div className="instructor-action-list">
              <a className="instructor-action-item" href="#assignments">
                <span className="instructor-action-icon action-amber"><Icon name="clipboard" size={17} /></span>
                <span><strong>{pendingCount} ungraded submission{pendingCount === 1 ? '' : 's'}</strong><small>Open the grading queue</small></span>
                <Icon name="arrow" size={15} />
              </a>
              <a className="instructor-action-item" href="#live-discussions">
                <span className="instructor-action-icon action-blue"><Icon name="send" size={16} /></span>
                <span><strong>{openDiscussionCount} student Q&amp;A request{openDiscussionCount === 1 ? '' : 's'}</strong><small>Review open course discussions</small></span>
                <Icon name="arrow" size={15} />
              </a>
              <a className="instructor-action-item" href="#learners">
                <span className="instructor-action-icon action-amber"><Icon name="users" size={17} /></span>
                <span><strong>{flaggedLearners.length} at-risk learner{flaggedLearners.length === 1 ? '' : 's'}</strong><small>Review inactivity, quiz, and overdue-work alerts</small></span>
                <Icon name="arrow" size={15} />
              </a>
              <a className="instructor-action-item" href="#schedule">
                <span className="instructor-action-icon action-violet"><Icon name="calendar" size={17} /></span>
                <span><strong>{nextSession ? nextSession.title : 'No upcoming sessions'}</strong><small>{nextSession ? nextSession.date.toLocaleString() : 'Schedule office hours or a live class'}</small></span>
                <Icon name="arrow" size={15} />
              </a>
            </div>
            <p className="instructor-data-note">Dashboard metrics and activity are sample data for this session; live enrollment, payout, and support integrations are not connected.</p>
          </section>

          <section className="instructor-main-grid" style={{ ...visibleWhen('overview', 'my-courses', 'schedule'), gridTemplateColumns: activeSection === 'overview' ? undefined : 'minmax(0, 1fr)' }}>
            <article className="instructor-panel instructor-courses-panel" id="my-courses" style={visibleWhen('overview', 'my-courses')}>
              <div className="instructor-panel-heading instructor-courses-heading">
                <div><h2>My courses</h2><p>Assigned subjects, course progress, and teaching materials</p></div>
                <div className="instructor-course-tools">
                  <label className="instructor-course-search"><Icon name="search" size={16} /><input aria-label="Search my courses" placeholder="Find a course" value={search} onChange={(event) => { setSearch(event.target.value); setCoursePage(1); }} /></label>
                  <label className="instructor-course-filter">Status
                    <select aria-label="Filter courses by status" value={courseStatusFilter} onChange={(event) => { setCourseStatusFilter(event.target.value); setCoursePage(1); }}>
                      <option value="all">All courses</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
                    </select>
                  </label>
                </div>
              </div>
              <form className="instructor-create-course" onSubmit={createCourse}>
                <input aria-label="New course title" value={newCourseTitle} onChange={(event) => setNewCourseTitle(event.target.value)} placeholder="New course title" required />
                <input aria-label="New course category" value={newCourseCategory} onChange={(event) => setNewCourseCategory(event.target.value)} placeholder="Category" required />
                <button className="submission-mark-reviewed" type="submit"><Icon name="plus" size={14} /> Create draft</button>
              </form>
              {courseSaveError && <p className="course-storage-error" role="alert">{courseSaveError}</p>}
              <div className="instructor-course-list">
                {paginatedCourses.map((course) => (
                  <article className="instructor-course-card" key={course.id}>
                    <div className={`instructor-course-cover cover-${course.color}`}>{course.initials}</div>
                    <div className="instructor-course-details">
                      <span className="instructor-course-category">Assigned subject · {course.category} <span className={`course-status status-${course.status}`}>{course.status}</span></span>
                      <h3>{course.title}</h3>
                      <div className="instructor-course-meta"><span><Icon name="users" size={14} />{course.learners} learners</span><span><Icon name="book" size={14} />{course.lessons} lessons</span></div>
                      <div className="instructor-progress-line"><span>Course completion</span><strong>{course.completion}%</strong></div>
                      <div className="instructor-progress-track"><span style={{ width: `${course.completion}%` }} /></div>
                      <small className="instructor-course-updated">{course.updated}</small>
                      <div className="instructor-resource-access" aria-label={`Teaching resources for ${course.title}`}>
                        <span className="instructor-resource-heading">Quick access <small>Resource links not connected</small></span>
                        <div className="instructor-resource-links">
                          {['Lesson plans', 'Syllabus', 'Unit materials'].map((resource) => (
                            <span className="instructor-resource-link" aria-disabled="true" key={resource} title="Resource access is not connected">
                              {resource}<small>Not connected</small>
                            </span>
                          ))}
                        </div>
                      </div>
                      <details className="course-management-controls">
                        <summary>Curriculum &amp; release controls</summary>
                        <div className="course-release-grid">
                          <label>Course status
                            <select value={course.status} onChange={(event) => updateCourse(course.id, { status: event.target.value })}>
                              <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
                            </select>
                          </label>
                          <label>Visibility
                            <select value={course.visibility} onChange={(event) => updateCourse(course.id, { visibility: event.target.value })}>
                              <option>Public</option><option>Private</option>
                            </select>
                          </label>
                          <label>Content schedule
                            <select value={course.drip} onChange={(event) => updateCourse(course.id, { drip: event.target.value })}>
                              <option>Open access</option><option>Weekly release</option><option>Unlock by prerequisite</option>
                            </select>
                          </label>
                          <label>Enrollment limit
                            <input type="number" min="0" placeholder="No limit" value={course.enrollmentLimit} onChange={(event) => updateCourse(course.id, { enrollmentLimit: event.target.value })} />
                          </label>
                        </div>
                        <div className="course-module-list">
                          <strong>Modules &amp; unlock conditions</strong>
                          {course.modules.map((module, index) => (
                            <div className="course-module-row" key={`${module.title}-${index}`}>
                              <span>{index + 1}. {module.title}</span>
                              <label>Unlock after
                                <select value={module.prerequisite} onChange={(event) => updateCourse(course.id, {
                                  modules: course.modules.map((item, itemIndex) => itemIndex === index ? { ...item, prerequisite: event.target.value } : item),
                                })}>
                                  <option>None</option>
                                  {course.modules.slice(0, index).map((priorModule) => <option key={priorModule.title}>{priorModule.title}</option>)}
                                </select>
                              </label>
                            </div>
                          ))}
                          <form className="course-add-module" onSubmit={(event) => addModule(event, course.id)}>
                            <input name="moduleTitle" aria-label={`Add module to ${course.title}`} placeholder="New module or chapter" required />
                            <button type="submit" className="submission-action">Add module</button>
                          </form>
                        </div>
                        <div className="course-curriculum-editor">
                          <strong>Units &amp; topics</strong>
                          {(course.units || []).map((unit, unitIndex) => (
                            <section className="course-curriculum-unit" key={`${unit.title}-${unitIndex}`}>
                              <label className="course-unit-title">
                                <span>Unit {unitIndex + 1} title</span>
                                <input
                                  aria-label={`Unit ${unitIndex + 1} title for ${course.title}`}
                                  value={unit.title}
                                  onChange={(event) => updateCourse(course.id, {
                                    units: course.units.map((item, index) => index === unitIndex ? { ...item, title: event.target.value } : item),
                                  })}
                                />
                              </label>
                              <div className="course-topic-list">
                                {unit.topics.map((topic, topicIndex) => (
                                  <label className="course-topic-row" key={`${topicIndex}`}>
                                    <span>Topic {topicIndex + 1}</span>
                                    <input
                                      aria-label={`Topic ${topicIndex + 1} in unit ${unitIndex + 1} for ${course.title}`}
                                      value={topic}
                                      onChange={(event) => updateCourse(course.id, {
                                        units: course.units.map((item, index) => (
                                          index === unitIndex
                                            ? { ...item, topics: item.topics.map((itemTopic, itemTopicIndex) => itemTopicIndex === topicIndex ? event.target.value : itemTopic) }
                                            : item
                                        )),
                                      })}
                                    />
                                  </label>
                                ))}
                                <form className="course-add-topic" onSubmit={(event) => addTopic(event, course.id, unitIndex)}>
                                  <input name="topicTitle" aria-label={`Add topic to unit ${unitIndex + 1} in ${course.title}`} placeholder="New topic" required />
                                  <button type="submit" className="submission-action">Add topic</button>
                                </form>
                              </div>
                            </section>
                          ))}
                          <form className="course-add-unit" onSubmit={(event) => addUnit(event, course.id)}>
                            <input name="unitTitle" aria-label={`Add unit to ${course.title}`} placeholder="New unit title" required />
                            <button type="submit" className="submission-action">Add unit</button>
                          </form>
                        </div>
                        <p className="course-local-note">Changes are saved in this browser and shared with students when the course is public and published. Server-wide course management is not connected.</p>
                      </details>
                    </div>
                    <a className="instructor-course-action" href="#learners" aria-label={`View learners in ${course.title}`} title="View learners"><Icon name="arrow" size={17} /></a>
                  </article>
                ))}
                {filteredCourses.length === 0 && <p className="instructor-empty-state">No courses match “{search}”. Try another search.</p>}
              </div>
              {filteredCourses.length > coursesPerPage && (
                <div className="course-pagination">
                  <span>{(coursePage - 1) * coursesPerPage + 1}–{Math.min(coursePage * coursesPerPage, filteredCourses.length)} of {filteredCourses.length} courses</span>
                  <button type="button" className="submission-action" disabled={coursePage === 1} onClick={() => setCoursePage((page) => page - 1)}>Previous</button>
                  <span>Page {coursePage} of {coursePageCount}</span>
                  <button type="button" className="submission-action" disabled={coursePage === coursePageCount} onClick={() => setCoursePage((page) => page + 1)}>Next</button>
                </div>
              )}
              <p className="course-local-note">Course catalog, unit, topic, and release changes are saved in this browser. Server-wide course management is not connected.</p>
            </article>

            <article className="instructor-panel instructor-sessions-panel" id="schedule" style={visibleWhen('overview', 'schedule')}>
              <div className="instructor-panel-heading">
                <div><h2>Upcoming classes</h2><p>Your next live learning sessions</p></div>
                <a className="instructor-text-link" href="#schedule">Full schedule <Icon name="arrow" size={14} /></a>
              </div>
              <div className="instructor-session-list">
                {upcomingSessions.slice(0, 3).map((session, index) => (
                  <article className={`instructor-session session-${session.color || 'violet'}`} key={`${session.title}-${session.date.toISOString()}`}>
                    <div className="instructor-session-date"><strong>{session.date.toLocaleDateString('en', { day: '2-digit' })}</strong><span>{session.date.toLocaleDateString('en', { month: 'short' }).toUpperCase()}</span></div>
                    <div className="instructor-session-details"><strong>{session.title}</strong><span>{session.course}</span><small><Icon name="clock" size={13} />{session.date.toLocaleString()}</small></div>
                    {index === 0 && <span className="session-today">NEXT</span>}
                  </article>
                ))}
              </div>
              {nextSession && <div className="session-note"><span className="session-note-dot" /><span>Next session <strong>{nextSession.date.toLocaleString()}</strong></span></div>}
            </article>
          </section>

          <section className="instructor-main-grid" style={{ ...visibleWhen('overview', 'content-library', 'assessment-builder', 'assignments'), gridTemplateColumns: activeSection === 'overview' ? undefined : 'minmax(0, 1fr)' }}>
            <article className="instructor-panel" id="content-library" style={visibleWhen('overview', 'content-library')}>
              <div className="instructor-panel-heading">
                <div><h2>Content upload &amp; creator tools</h2><p>Add course materials to your local dashboard workspace</p></div>
              </div>
              <form onSubmit={uploadContent} style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  <label style={{ display: 'grid', flex: '1 1 150px', gap: 5, color: '#737d91', fontSize: 10 }}>
                    Assigned subject
                    <select value={contentCourse} onChange={(event) => setContentCourse(event.target.value)} style={{ minHeight: 34, border: '1px solid #e9ebf1', borderRadius: 7, padding: '0 8px', background: '#fff', color: '#46516a' }}>
                      {courses.map((course) => <option value={course.id} key={course.id}>{course.title}</option>)}
                    </select>
                  </label>
                  <label style={{ display: 'grid', flex: '1 1 140px', gap: 5, color: '#737d91', fontSize: 10 }}>
                    Resource type
                    <select value={contentKind} onChange={(event) => setContentKind(event.target.value)} style={{ minHeight: 34, border: '1px solid #e9ebf1', borderRadius: 7, padding: '0 8px', background: '#fff', color: '#46516a' }}>
                      <option>Video lecture</option><option>Lesson notes</option><option>Slide deck</option><option>PDF</option><option>Interactive resource</option>
                    </select>
                  </label>
                </div>
                <label style={{ display: 'grid', gap: 6, color: '#737d91', fontSize: 10 }}>
                  Select videos, notes, slide decks, PDFs, or interactive resources
                  <input name="contentFiles" type="file" multiple accept="video/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.html,.zip" style={{ padding: 9, border: '1px dashed #d9dce7', borderRadius: 8, color: '#69738a', fontSize: 10 }} />
                </label>
                <button className="submission-mark-reviewed" type="submit" style={{ justifySelf: 'start' }}>Add to course workspace</button>
                {contentMessage && <p role="status" style={{ margin: 0, color: '#6655c5', fontSize: 9 }}>{contentMessage}</p>}
              </form>
              <div style={{ display: 'grid', gap: 7, marginTop: 14 }}>
                <strong style={{ color: '#48526a', fontSize: 10 }}>Course materials ({contentItems.length})</strong>
                {contentItems.length === 0 && <span style={{ color: '#9ba2b1', fontSize: 9 }}>No files selected in this dashboard session.</span>}
                {contentItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 6, padding: '8px 9px', border: '1px solid #eff0f5', borderRadius: 8, color: '#626d82', fontSize: 9 }}>
                    <span><strong>{item.name}</strong><small style={{ display: 'block', marginTop: 2, color: '#9ba2b1' }}>{courseTitle(item.courseId)} · {item.kind} · {Math.max(1, Math.round(item.size / 1024))} KB</small></span>
                    <span style={{ color: '#9ba2b1' }}>Local only</span>
                  </div>
                ))}
              </div>
              <p style={{ margin: '10px 0 0', color: '#9ba2b1', fontSize: 9 }}>Files are listed for this page session only; no server upload or learner publishing is connected.</p>
            </article>

            <article className="instructor-panel" id="assessment-builder" style={visibleWhen('overview', 'assessment-builder', 'assignments')}>
              <div className="instructor-panel-heading">
                <div><h2>Assessment &amp; quiz builder</h2><p>Prepare quizzes, timed exams, and assignment dropboxes</p></div>
              </div>
              <form onSubmit={createAssessment} style={{ display: 'grid', gap: 9, marginTop: 14 }}>
                <label style={{ display: 'grid', gap: 5, color: '#737d91', fontSize: 10 }}>
                  Assessment title
                  <input value={assessmentTitle} onChange={(event) => setAssessmentTitle(event.target.value)} placeholder="e.g. Unit 2 knowledge check" required style={{ minHeight: 34, padding: '0 9px', border: '1px solid #e9ebf1', borderRadius: 7, color: '#46516a' }} />
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                  <label style={{ display: 'grid', flex: '1 1 145px', gap: 5, color: '#737d91', fontSize: 10 }}>
                    Assigned subject
                    <select value={assessmentCourse} onChange={(event) => setAssessmentCourse(event.target.value)} style={{ minHeight: 34, border: '1px solid #e9ebf1', borderRadius: 7, padding: '0 8px', background: '#fff', color: '#46516a' }}>
                      {courses.map((course) => <option value={course.id} key={course.id}>{course.title}</option>)}
                    </select>
                  </label>
                  <label style={{ display: 'grid', flex: '1 1 140px', gap: 5, color: '#737d91', fontSize: 10 }}>
                    Assessment type
                    <select value={assessmentType} onChange={(event) => setAssessmentType(event.target.value)} style={{ minHeight: 34, border: '1px solid #e9ebf1', borderRadius: 7, padding: '0 8px', background: '#fff', color: '#46516a' }}>
                      <option>Auto-graded quiz</option><option>Timed exam</option><option>Assignment dropbox</option>
                    </select>
                  </label>
                </div>
                {assessmentType === 'Timed exam' && (
                  <label style={{ display: 'grid', maxWidth: 180, gap: 5, color: '#737d91', fontSize: 10 }}>
                    Time limit (minutes)
                    <input type="number" min="1" max="300" value={assessmentTimeLimit} onChange={(event) => setAssessmentTimeLimit(event.target.value)} style={{ minHeight: 34, padding: '0 9px', border: '1px solid #e9ebf1', borderRadius: 7, color: '#46516a' }} />
                  </label>
                )}
                <button className="submission-mark-reviewed" type="submit" style={{ justifySelf: 'start' }}>Create assessment draft</button>
                {assessmentMessage && <p role="status" style={{ margin: 0, color: '#6655c5', fontSize: 9 }}>{assessmentMessage}</p>}
              </form>
              <div style={{ display: 'flex', gap: 14, marginTop: 14, color: '#737d91', fontSize: 9 }}>
                <span>Quiz drafts: <strong>{assessments.filter((item) => item.type === 'Auto-graded quiz').length}</strong></span>
                <span>Awaiting submissions: <strong>{pendingCount}</strong></span>
              </div>
              <div style={{ display: 'grid', gap: 7, marginTop: 8 }}>
                {assessments.map((item) => (
                  <div key={item.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 7, padding: '8px 9px', border: '1px solid #eff0f5', borderRadius: 8, color: '#626d82', fontSize: 9 }}>
                    <span><strong>{item.title}</strong><small style={{ display: 'block', marginTop: 2, color: '#9ba2b1' }}>{courseTitle(item.courseId)} · {item.type}{item.timeLimit ? ` · ${item.timeLimit} min` : ''}</small></span>
                    <a className="instructor-text-link" href="#grading-hub">Open grading hub <Icon name="arrow" size={12} /></a>
                  </div>
                ))}
              </div>
              <section className="quiz-analytics" aria-label="Quiz analytics">
                <button className="quiz-analytics-toggle" type="button" aria-expanded={expandedAnalytics} onClick={() => setExpandedAnalytics((expanded) => !expanded)}>
                  <span><strong>Quiz &amp; item analysis</strong><small>Pass/fail distribution and question difficulty</small></span>
                  <span>{expandedAnalytics ? 'Hide' : 'Show'}</span>
                </button>
                {expandedAnalytics && (
                  <>
                    <div className="quiz-pass-distribution">
                      <span>Sample pass rate <strong>68%</strong></span>
                      <div className="quiz-distribution-bar" aria-label="Sample results: 68 percent pass, 32 percent fail"><span /></div>
                      <small>68% pass · 32% need another attempt</small>
                    </div>
                    <div className="quiz-question-list">
                      {sampleQuizAnalytics.map((item) => (
                        <div className="quiz-question-row" key={item.question}>
                          <span><strong>{item.question}</strong><small>{item.difficulty} · {item.correct}% answered correctly</small></span>
                          <div className="quiz-question-track"><span style={{ width: `${item.correct}%` }} /></div>
                        </div>
                      ))}
                    </div>
                    <p className="course-local-note">Illustrative item analysis only; live pass/fail and question-level results require connected assessment submissions.</p>
                  </>
                )}
              </section>
              <p style={{ margin: '10px 0 0', color: '#9ba2b1', fontSize: 9 }}>Builder creates local drafts only; quiz questions, publishing, and automatic scoring need a connected assessment service.</p>
            </article>
          </section>

          <section className="instructor-panel instructor-submissions-panel" id="assignments" style={visibleWhen('overview', 'assignments', 'grading-hub')}>
            <div id="grading-hub" />
            <div className="instructor-panel-heading">
              <div><h2>Grading &amp; feedback hub</h2><p>Review the pending queue, record scores, and leave learner feedback</p></div>
              <a className="instructor-review-filter" href="#assignments"><span />{pendingCount} need review</a>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, margin: '10px 0', color: '#737d91', fontSize: 9 }}>
              <span>Pending manual review: <strong>{pendingCount}</strong></span>
              <span>Scored submissions: <strong>{submissions.filter((submission) => submission.score !== undefined && submission.score !== '').length}</strong></span>
              <span>Auto-graded results: <strong>Not connected</strong></span>
            </div>
            <div className="submission-filters" aria-label="Filter submissions">
              <label>Course
                <select value={submissionCourseFilter} onChange={(event) => setSubmissionCourseFilter(event.target.value)}>
                  <option value="all">All courses</option>
                  {courses.map((course) => <option value={course.id} key={course.id}>{course.title}</option>)}
                </select>
              </label>
              <label>Cohort
                <select value={submissionCohortFilter} onChange={(event) => setSubmissionCohortFilter(event.target.value)}>
                  <option value="all">All cohorts</option><option>Cohort A</option><option>Cohort B</option>
                </select>
              </label>
              <label>Status
                <select value={submissionStatusFilter} onChange={(event) => setSubmissionStatusFilter(event.target.value)}>
                  <option value="all">All statuses</option><option>Needs review</option><option>Reviewed</option>
                </select>
              </label>
              <label>Timing
                <select value={submissionTimingFilter} onChange={(event) => setSubmissionTimingFilter(event.target.value)}>
                  <option value="all">On time &amp; late</option><option value="on-time">On time</option><option value="late">Late</option>
                </select>
              </label>
              <label>Submitted on
                <input type="date" value={submissionDateFilter} onChange={(event) => setSubmissionDateFilter(event.target.value)} />
              </label>
              <button type="button" className="submission-action" onClick={() => {
                setSubmissionCourseFilter('all');
                setSubmissionCohortFilter('all');
                setSubmissionStatusFilter('all');
                setSubmissionTimingFilter('all');
                setSubmissionDateFilter('');
              }}>Clear filters</button>
            </div>
            <div className="submission-course-groups">
              {submissionGroups.map(({ courseId, submissions: courseSubmissions }) => (
                <section className="submission-course-card" key={courseId} aria-label={`${courseTitle(courseId)} assignments`}>
                  <div className="submission-course-heading">
                    <h3>{courseTitle(courseId)}</h3>
                    <span>{courseSubmissions.length} submission{courseSubmissions.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className="submission-assignment-list">
                    {courseSubmissions.map((submission) => (
                      <article className="submission-assignment-card" key={submission.id}>
                        <div className="submission-assignment-heading">
                          <div>
                            <h4>{submission.assignment}</h4>
                            <div className="instructor-learner-cell">
                              <span className={`instructor-learner-avatar avatar-${submission.color}`}>{submission.initials}</span>
                              <strong>{submission.learner}</strong>
                            </div>
                          </div>
                          <button className={`submission-action${submission.status === 'Reviewed' ? ' is-done' : ''}`} type="button" onClick={() => setSelectedSubmission({ ...submission, course: courseTitle(submission.courseId), readOnly: submission.status === 'Reviewed', score: submission.score ?? '', feedback: submission.feedback ?? '', rubric: submission.rubric || { understanding: '', evidence: '', communication: '' } })}>{submission.status === 'Reviewed' ? 'View' : 'Review'}</button>
                        </div>
                        <div className="submission-assignment-details">
                          <span>Submitted<strong>{submission.submitted}</strong><small>{submission.submittedAt.toLocaleDateString()}</small></span>
                          <span>Cohort<strong>{submission.cohort}</strong></span>
                          <span>Timing<strong className={`submission-timing${submission.onTime ? '' : ' is-late'}`}>{submission.onTime ? 'On time' : 'Late'}</strong></span>
                          <span>Score<strong>{submission.score === undefined || submission.score === '' ? '—' : `${submission.score}%`}</strong></span>
                          <span>Status<strong className={`submission-status${submission.status === 'Reviewed' ? ' is-reviewed' : ''}`}><i />{submission.status}</strong></span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
              {filteredSubmissions.length === 0 && <p className="submission-groups-empty">No submissions match these filters.</p>}
            </div>
          </section>

          <section className="instructor-bottom-grid" style={{ ...visibleWhen('overview', 'learners', 'announcements', 'financial-overview', 'instructor-settings'), gridTemplateColumns: activeSection === 'overview' ? undefined : 'minmax(0, 1fr)' }}>
            <article className="instructor-panel instructor-learners-panel" id="progress-attendance" style={visibleWhen('overview', 'learners', 'progress-attendance')}>
              <div className="instructor-panel-heading" id="learners">
                <div><h2>Student progress &amp; attendance</h2><p>Completion, attendance, and students who may need support</p></div>
                <span className="instructor-review-filter"><span />{flaggedLearners.length} flagged</span>
                <a className="instructor-text-link" href="#learners">View all <Icon name="arrow" size={14} /></a>
              </div>
              <div style={{ display: 'flex', gap: 14, margin: '10px 0', color: '#737d91', fontSize: 9 }}>
                <span>Present today: <strong>{attendance.filter((record) => record.status === 'Present').length} / {attendance.length}</strong></span>
                <span>Needs support: <strong>{flaggedLearners.length}</strong></span>
                <span>Avg. video completion: <strong>{Math.round(learners.reduce((total, learner) => total + learner.videoCompletion, 0) / learners.length)}%</strong></span>
                <span>Discussion participation: <strong>{Math.round(learners.reduce((total, learner) => total + learner.discussions, 0) / learners.length)} posts / learner</strong></span>
              </div>
              <div className="at-risk-alerts">
                <strong>At-risk learner alerts</strong>
                {flaggedLearners.length === 0 && <span>No learners currently meet the alert criteria.</span>}
                {flaggedLearners.map((learner) => (
                  <div className="at-risk-alert-row" key={learner.email}>
                    <span><strong>{learner.name}</strong><small>{learner.course}</small></span>
                    <span>{[
                      learner.activityDays >= 7 ? `Inactive ${learner.activityDays} days` : '',
                      learner.failedQuizAttempts ? `${learner.failedQuizAttempts} failed quiz attempt${learner.failedQuizAttempts === 1 ? '' : 's'}` : '',
                      learner.overdueAssignments ? `${learner.overdueAssignments} overdue assignment${learner.overdueAssignments === 1 ? '' : 's'}` : '',
                      learner.progress < 40 ? `${learner.progress}% course progress` : '',
                    ].filter(Boolean).join(' · ')}</span>
                  </div>
                ))}
              </div>
              {activeSection === 'learners' && (
                <div className="instructor-grade-grid">
                  {learnerGrades.map((grade) => {
                    const gradeLearners = learners.filter((learner) => learner.grade === grade);
                    const totalPages = Math.ceil(gradeLearners.length / learnersPerGradePage);
                    const currentPage = Math.min(gradePages[grade] || 1, totalPages);
                    const startIndex = (currentPage - 1) * learnersPerGradePage;
                    return (
                      <article className="instructor-grade-card" key={grade}>
                        <div className="instructor-grade-heading">
                          <button type="button" className="instructor-grade-open" onClick={() => navigate(`/instructor/dashboard/${grade.toLowerCase().replace(/\s+/g, '-')}`)} aria-label={`View all ${grade} students`}>
                            <span><strong>{grade}</strong><small>View full class list</small></span>
                            <Icon name="arrow" size={14} />
                          </button>
                          <span>{gradeLearners.length} learner{gradeLearners.length === 1 ? '' : 's'}</span>
                        </div>
                        <div className="instructor-grade-roster">
                          {gradeLearners.slice(startIndex, startIndex + learnersPerGradePage).map(renderGradeLearner)}
                        </div>
                        <div className="instructor-grade-pagination">
                          <span>Showing {startIndex + 1}–{Math.min(startIndex + learnersPerGradePage, gradeLearners.length)} of {gradeLearners.length}</span>
                          <div>
                            <button
                              type="button"
                              onClick={() => setGradePages((current) => ({ ...current, [grade]: Math.max(1, currentPage - 1) }))}
                              disabled={currentPage === 1}
                              aria-label={`Previous ${grade} students`}
                            >
                              Previous
                            </button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button
                              type="button"
                              onClick={() => setGradePages((current) => ({ ...current, [grade]: Math.min(totalPages, currentPage + 1) }))}
                              disabled={currentPage === totalPages}
                              aria-label={`Next ${grade} students`}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
              <div className="instructor-learner-list" style={visibleWhen('overview', 'progress-attendance')}>
                {learners.map((learner) => (
                  <div className="instructor-learner-row" key={learner.email}>
                    <span className={`instructor-learner-avatar avatar-${learner.color}`}>{learner.initials}</span>
                    <div className="learner-monitoring">
                      <div className="instructor-learner-row">
                        <div className="instructor-learner-info"><strong>{learner.name}</strong><span>{learner.course}</span></div>
                        <div className="learner-progress"><div className="instructor-progress-track"><span style={{ width: `${learner.progress}%` }} /></div><small>{learner.progress}%</small></div>
                        <span className="learner-last-active">{learner.activity}</span>
                        <span className={`learner-risk-status${flaggedLearners.includes(learner) ? ' is-at-risk' : ''}`}>{flaggedLearners.includes(learner) ? 'At risk' : 'On track'}</span>
                        <button type="button" className="submission-action" onClick={() => toggleAttendance(learner.email)} aria-label={`Mark ${learner.name} ${attendance.find((record) => record.email === learner.email)?.status === 'Present' ? 'absent' : 'present'}`}>
                          {attendance.find((record) => record.email === learner.email)?.status || 'Present'}
                        </button>
                      </div>
                      <div className="learner-engagement-grid">
                        <span>Modules</span>
                        <div className="module-progress-track" aria-label={`${learner.name} course modules`}>
                          {learner.moduleProgress.map((progress, index) => (
                            <span className="module-progress-segment" key={index} title={`Module ${index + 1}: ${progress}% complete`}>
                              <i style={{ width: `${progress}%` }} />
                            </span>
                          ))}
                        </div>
                        <span>Video {learner.videoCompletion}%</span>
                        <span>{learner.discussions} discussion posts</span>
                        <span>{learner.failedQuizAttempts} failed quizzes</span>
                        <span>{learner.overdueAssignments} overdue work</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="learner-activity-panel">
                <div className="learner-activity-heading"><strong>Recent learner activity</strong><span>Login recency · video completion · Q&amp;A</span></div>
                {learnerActivity.map((item) => (
                  <div className="learner-activity-row" key={`${item.learner}-${item.activity}`}>
                    <span className="activity-kind">{item.kind}</span>
                    <span><strong>{item.learner}</strong><small>{item.activity}</small></span>
                    <time>{item.time}</time>
                  </div>
                ))}
              </div>
              <div className="video-heatmap-panel">
                <div className="learner-activity-heading"><strong>Video completion activity</strong><span>Sample activity over the last 7 days</span></div>
                <div className="video-heatmap">
                  {[
                    { day: 'Mon', values: [5, 3, 1, 0] },
                    { day: 'Tue', values: [4, 2, 1, 0] },
                    { day: 'Wed', values: [5, 4, 2, 1] },
                    { day: 'Thu', values: [3, 3, 1, 0] },
                    { day: 'Fri', values: [4, 2, 0, 0] },
                    { day: 'Sat', values: [2, 1, 1, 0] },
                    { day: 'Sun', values: [1, 0, 0, 0] },
                  ].map((day) => (
                    <div className="video-heatmap-day" key={day.day}>
                      <span>{day.day}</span>
                      {day.values.map((level, index) => <i className={`heat-level-${level}`} key={`${day.day}-${index}`} title={`${day.day} activity level ${level}`} />)}
                    </div>
                  ))}
                </div>
              </div>
              <p style={{ margin: '10px 0 0', color: '#9ba2b1', fontSize: 9 }}>Activity, engagement, alerts, and attendance are illustrative records for this dashboard; live course telemetry is not connected.</p>
            </article>

            <article className="instructor-panel instructor-announcements-panel" id="announcements" style={visibleWhen('overview', 'announcements')}>
              <div className="instructor-panel-heading">
                <div><h2>Class announcements</h2><p>Keep learners informed and on track</p></div>
                <button className="instructor-icon-add" type="button" aria-label="Create announcement" onClick={() => setShowAnnouncementForm((visible) => !visible)}><Icon name={showAnnouncementForm ? 'close' : 'plus'} size={17} /></button>
              </div>
              {showAnnouncementForm && (
                <form className="announcement-form" onSubmit={postAnnouncement}>
                  <label htmlFor="announcement-message">Announcement</label>
                  <textarea id="announcement-message" rows="3" maxLength="240" placeholder="Share an update, reminder, or resource…" value={announcement} onChange={(event) => setAnnouncement(event.target.value)} required />
                  <div className="announcement-targets">
                    <label>Course
                      <select value={announcementCourse} onChange={(event) => setAnnouncementCourse(event.target.value)}>
                        <option value="all">All courses</option>
                        {courses.map((course) => <option value={course.id} key={course.id}>{course.title}</option>)}
                      </select>
                    </label>
                    <label>Cohort
                      <select value={announcementCohort} onChange={(event) => setAnnouncementCohort(event.target.value)}>
                        <option value="all">All cohorts</option><option>Cohort A</option><option>Cohort B</option>
                      </select>
                    </label>
                    <label>Schedule for
                      <input type="datetime-local" value={announcementSchedule} onChange={(event) => setAnnouncementSchedule(event.target.value)} />
                    </label>
                  </div>
                  <fieldset className="announcement-channels">
                    <legend>Delivery channels (configured locally only)</legend>
                    {[
                      ['system', 'System message'],
                      ['email', 'Email alert'],
                      ['push', 'Push notification'],
                    ].map(([value, label]) => (
                      <label key={value}>
                        <input type="checkbox" checked={announcementChannels.includes(value)} onChange={() => toggleAnnouncementChannel(value)} />
                        {label}
                      </label>
                    ))}
                  </fieldset>
                  <div><span>{announcement.length}/240</span><button type="submit" disabled={!announcement.trim()}><Icon name="send" size={14} /> Save announcement</button></div>
                  {announcementMessage && <p className="announcement-feedback" role="status">{announcementMessage}</p>}
                </form>
              )}
              {!showAnnouncementForm && announcementMessage && <p className="announcement-feedback" role="status">{announcementMessage}</p>}
              <div className="announcement-list">
                {announcements.map((item) => (
                  <article className="announcement-item" key={item.id}>
                    <span className="announcement-bullet"><Icon name="send" size={14} /></span>
                    <div><strong>{item.title}</strong><span>{item.audience} · {item.time}</span><small>{item.status}{item.channels ? ` · ${item.channels.join(', ')}` : ''}</small></div>
                  </article>
                ))}
              </div>
              <a className="instructor-announcement-link" href="#announcements" onClick={() => setShowAnnouncementForm(true)}>Write an announcement <Icon name="arrow" size={14} /></a>
            </article>

            <article className="instructor-panel instructor-finance-panel" id="financial-overview" style={visibleWhen('overview', 'financial-overview')}>
              <div className="instructor-panel-heading">
                <div><h2>Revenue &amp; payouts</h2><p>Course sales, subscriptions, refunds, and transaction activity</p></div>
                <span className="finance-sample-label">Illustrative data</span>
              </div>
              <div className="finance-summary-grid">
                <div><span>Sample gross revenue</span><strong>KES {sampleRevenue.reduce((total, row) => total + row.revenue, 0).toLocaleString()}</strong></div>
                <div><span>Coupon uses</span><strong>{sampleRevenue.reduce((total, row) => total + row.coupons, 0)}</strong></div>
                <div><span>Sample refunds</span><strong>{sampleRevenue.reduce((total, row) => total + row.refunds, 0)}</strong></div>
                <div><span>Subscription renewals</span><strong>{sampleRevenue.reduce((total, row) => total + row.renewals, 0)}</strong></div>
              </div>
              <div className="finance-table-wrap">
                <table className="finance-table">
                  <thead><tr><th>COURSE</th><th>REVENUE</th><th>COUPONS</th><th>REFUNDS</th><th>RENEWALS</th></tr></thead>
                  <tbody>
                    {sampleRevenue.map((row) => (
                      <tr key={row.course}><td>{row.course}</td><td>KES {row.revenue.toLocaleString()}</td><td>{row.coupons}</td><td>{row.refunds}</td><td>{row.renewals}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="payout-settings-panel">
                <strong>Payout &amp; banking settings</strong>
                <span>Bank account setup, tax documents, and payout statements are unavailable until a secure payments service is connected. No banking details are collected here.</span>
                <button className="submission-action" type="button" onClick={() => setFinanceMessage('Payout settings are unavailable because no payment provider is connected.')}>Check payout availability</button>
                {financeMessage && <small role="status">{financeMessage}</small>}
              </div>
              <div className="finance-transactions">
                <strong>Recent transactions</strong>
                {sampleTransactions.map((transaction) => (
                  <div className="finance-transaction-row" key={transaction.id}>
                    <span><strong>{transaction.description}</strong><small>{transaction.id} · {transaction.date}</small></span>
                    <span className={transaction.amount < 0 ? 'is-refund' : ''}>{transaction.amount < 0 ? '−' : ''}KES {Math.abs(transaction.amount).toLocaleString()}</span>
                    <small>{transaction.status}</small>
                  </div>
                ))}
              </div>
              <p className="course-local-note">Revenue and transactions above are illustrative only. No live sales, coupon, refund, subscription, banking, or payout data is connected.</p>
            </article>

            <article className="instructor-panel instructor-settings-panel" id="instructor-settings" style={visibleWhen('overview', 'instructor-settings')}>
              <div className="instructor-panel-heading">
                <div><h2>Instructor profile &amp; preferences</h2><p>Public profile, branding, alerts, and integration status</p></div>
              </div>
              <form className="instructor-settings-form" onSubmit={saveInstructorSettings}>
                <label>Public instructor bio
                  <textarea rows="4" maxLength="500" value={instructorBio} onChange={(event) => setInstructorBio(event.target.value)} placeholder="Introduce your teaching background and areas of expertise." />
                  <small>{instructorBio.length}/500 · stored in this browser only</small>
                </label>
                <label className="instructor-brand-setting">Dashboard brand color
                  <span><input type="color" value={brandColor} onChange={(event) => setBrandColor(event.target.value)} /> <code>{brandColor}</code></span>
                </label>
                <fieldset className="instructor-notification-settings">
                  <legend>Notification preferences</legend>
                  {[
                    ['grading', 'Grading reminders'],
                    ['discussions', 'Discussion questions'],
                    ['sessions', 'Live session reminders'],
                  ].map(([key, label]) => (
                    <label key={key}><input type="checkbox" checked={notificationPreferences[key]} onChange={(event) => setNotificationPreferences((current) => ({ ...current, [key]: event.target.checked }))} />{label}</label>
                  ))}
                </fieldset>
                <div className="instructor-integration-status">
                  <strong>Third-party integrations</strong>
                  <span>Zoom, Teams, streaming, payment, and API integrations are not connected. Integration keys must be configured securely on the server and are not requested or stored in this dashboard.</span>
                </div>
                <button className="submission-mark-reviewed" type="submit">Save preferences</button>
                {settingsMessage && <p className="settings-feedback" role="status">{settingsMessage}</p>}
              </form>
            </article>
          </section>

          <section className="instructor-main-grid" id="live-discussions" style={{ ...visibleWhen('overview', 'schedule', 'live-discussions'), gridTemplateColumns: activeSection === 'overview' ? undefined : 'minmax(0, 1fr)' }}>
            <article className="instructor-panel" style={visibleWhen('overview', 'schedule', 'live-discussions')}>
              <div className="instructor-panel-heading">
                <div><h2>Live class manager</h2><p>Prepare Zoom or Google Meet session details</p></div>
                <a className="instructor-text-link" href="#schedule">Upcoming classes <Icon name="arrow" size={13} /></a>
              </div>
              <form onSubmit={createLiveSession} style={{ display: 'grid', gap: 9, marginTop: 14 }}>
                <label style={{ display: 'grid', gap: 5, color: '#737d91', fontSize: 10 }}>
                  Session title
                  <input value={sessionTitle} onChange={(event) => setSessionTitle(event.target.value)} placeholder="e.g. Revision and questions" required style={{ minHeight: 34, padding: '0 9px', border: '1px solid #e9ebf1', borderRadius: 7, color: '#46516a' }} />
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                  <label style={{ display: 'grid', flex: '1 1 150px', gap: 5, color: '#737d91', fontSize: 10 }}>
                    Assigned subject
                    <select value={sessionCourse} onChange={(event) => setSessionCourse(event.target.value)} style={{ minHeight: 34, border: '1px solid #e9ebf1', borderRadius: 7, padding: '0 8px', background: '#fff', color: '#46516a' }}>
                      {courses.map((course) => <option value={course.id} key={course.id}>{course.title}</option>)}
                    </select>
                  </label>
                  <label style={{ display: 'grid', flex: '1 1 150px', gap: 5, color: '#737d91', fontSize: 10 }}>
                    Date and time
                    <input type="datetime-local" value={sessionTime} onChange={(event) => setSessionTime(event.target.value)} required style={{ minHeight: 34, padding: '0 7px', border: '1px solid #e9ebf1', borderRadius: 7, color: '#46516a' }} />
                  </label>
                  <label style={{ display: 'grid', flex: '1 1 150px', gap: 5, color: '#737d91', fontSize: 10 }}>
                    Classroom type
                    <select value={sessionPlatform} onChange={(event) => setSessionPlatform(event.target.value)} style={{ minHeight: 34, border: '1px solid #e9ebf1', borderRadius: 7, padding: '0 8px', background: '#fff', color: '#46516a' }}>
                      <option>Zoom</option><option>Microsoft Teams</option><option>Google Meet</option><option>Live stream</option><option>External classroom</option>
                    </select>
                  </label>
                </div>
                <label style={{ display: 'grid', gap: 5, color: '#737d91', fontSize: 10 }}>
                  {sessionPlatform === 'Live stream' ? 'Stream or recording URL' : `${sessionPlatform} room URL`}
                  <input type="url" value={sessionLink} onChange={(event) => setSessionLink(event.target.value)} placeholder="https://..." style={{ minHeight: 34, padding: '0 9px', border: '1px solid #e9ebf1', borderRadius: 7, color: '#46516a' }} />
                </label>
                <button className="submission-mark-reviewed" type="submit" style={{ justifySelf: 'start' }}>Add session draft</button>
                {sessionMessage && <p role="status" style={{ margin: 0, color: '#6655c5', fontSize: 9 }}>{sessionMessage}</p>}
              </form>
              <div style={{ display: 'grid', gap: 7, marginTop: 14 }}>
                <strong style={{ color: '#48526a', fontSize: 10 }}>Scheduled drafts ({liveSessions.length})</strong>
                {liveSessions.length === 0 && <span style={{ color: '#9ba2b1', fontSize: 9 }}>No new session drafts yet.</span>}
                {liveSessions.map((session) => (
                  <div key={session.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 7, padding: '8px 9px', border: '1px solid #eff0f5', borderRadius: 8, color: '#626d82', fontSize: 9 }}>
                    <span><strong>{session.title}</strong><small style={{ display: 'block', marginTop: 2, color: '#9ba2b1' }}>{courseTitle(session.courseId)} · {session.platform} · {new Date(session.time).toLocaleString()}</small></span>
                    {session.link ? <a className="instructor-text-link" href={session.link} target="_blank" rel="noopener noreferrer">Launch classroom <Icon name="arrow" size={12} /></a> : <span style={{ color: '#9ba2b1' }}>Room link not set</span>}
                  </div>
                ))}
              </div>
              <div className="past-session-list">
                <strong>Past sessions &amp; recordings</strong>
                {pastSessions.map((session) => (
                  <div className="past-session-row" key={session.title}>
                    <span><strong>{session.title}</strong><small>{courseTitle(session.courseId)} · {session.date.toLocaleDateString()}</small></span>
                    <span>{session.recording}</span>
                  </div>
                ))}
              </div>
              <p style={{ margin: '10px 0 0', color: '#9ba2b1', fontSize: 9 }}>Drafts are not saved to a calendar and do not send invitations. Launch opens only the room URL you supplied; recording and stream integrations are not connected.</p>
            </article>

            <article className="instructor-panel" style={visibleWhen('overview', 'live-discussions')}>
              <div className="instructor-panel-heading">
                <div><h2>Q&amp;A &amp; discussion inbox</h2><p>Moderate questions, flagged posts, and thread approvals</p></div>
                <label className="discussion-filter">Filter
                  <select value={discussionFilter} onChange={(event) => setDiscussionFilter(event.target.value)}>
                    <option value="all">All threads</option><option value="open">Open</option><option value="pending">Pending approval</option><option value="flagged">Flagged</option><option value="resolved">Resolved</option>
                  </select>
                </label>
              </div>
              <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
                {filteredDiscussions.map((discussion) => (
                  <article key={discussion.id} style={{ padding: 10, border: '1px solid #eff0f5', borderRadius: 9 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'grid', gap: 4 }}>
                        <strong style={{ color: '#48526a', fontSize: 10 }}>{discussion.author}</strong>
                        <span style={{ color: '#9ba2b1', fontSize: 8 }}>{discussion.course} · {discussion.cohort}</span>
                      </div>
                      <span className={`discussion-state${discussion.flagged ? ' is-flagged' : ''}`}>{discussion.flagged ? 'Flagged · ' : ''}{discussion.status}</span>
                    </div>
                    <p style={{ margin: '8px 0', color: '#626d82', fontSize: 10 }}>{discussion.message}</p>
                    <div className="discussion-actions">
                      {discussion.status === 'Pending approval' && <button type="button" className="submission-action" onClick={() => moderateDiscussion(discussion.id, 'approve')}>Approve thread</button>}
                      <button type="button" className="submission-action" onClick={() => moderateDiscussion(discussion.id, discussion.status === 'Resolved' ? 'reopen' : 'resolve')}>{discussion.status === 'Resolved' ? 'Reopen' : 'Resolve'}</button>
                      <button type="button" className="submission-action" onClick={() => moderateDiscussion(discussion.id, 'flag')}>{discussion.flagged ? 'Remove flag' : 'Flag post'}</button>
                    </div>
                  </article>
                ))}
                {filteredDiscussions.length === 0 && <span style={{ color: '#9ba2b1', fontSize: 9 }}>No threads match this filter.</span>}
              </div>
              <p style={{ margin: '10px 0 0', color: '#9ba2b1', fontSize: 9 }}>Moderation changes are temporary dashboard records; live forum notifications are not connected.</p>
            </article>
          </section>

          <footer className="instructor-footer">© {new Date().getFullYear()} TusomeTec Academy <span>Helping every learner move forward.</span></footer>
            </>
          )}
        </div>
      </main>

      {selectedSubmission && (
        <div className="submission-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedSubmission(null); }}>
          <section className="submission-modal" role="dialog" aria-modal="true" aria-labelledby="submission-modal-title">
            <div className="submission-modal-heading"><div><span className="instructor-eyebrow">LEARNER SUBMISSION</span><h2 id="submission-modal-title">{selectedSubmission.assignment}</h2></div><button className="instructor-icon-add" type="button" aria-label="Close submission" onClick={() => setSelectedSubmission(null)}><Icon name="close" size={17} /></button></div>
            <p className="submission-modal-byline">Submitted by <strong>{selectedSubmission.learner}</strong> in {selectedSubmission.course} · {selectedSubmission.submitted}</p>
            <div className="submission-review-layout">
              <div className="submission-review-evidence">
                <h3>Submission</h3>
                <div className="submission-preview"><span className="submission-file-icon"><Icon name="clipboard" size={20} /></span><div><strong>{selectedSubmission.assignment}.pdf</strong><small>Sample file record · preview integration unavailable</small></div><span className="submission-file-status"><Icon name="check" size={14} /> Received</span></div>
                <div className="submission-rubric">
                  <strong>Rubric scores (out of 5)</strong>
                  {[
                    ['understanding', 'Understanding'],
                    ['evidence', 'Use of evidence'],
                    ['communication', 'Communication'],
                  ].map(([key, label]) => (
                    <label key={key}>{label}
                      <input type="number" min="0" max="5" value={selectedSubmission.rubric[key]} disabled={selectedSubmission.readOnly} onChange={(event) => setSelectedSubmission((current) => ({
                        ...current,
                        rubric: { ...current.rubric, [key]: event.target.value },
                      }))} />
                    </label>
                  ))}
                </div>
              </div>
              <div className="submission-review-scoring">
                <h3>Score &amp; feedback</h3>
                <label className="feedback-label" htmlFor="instructor-score">Overall score (%)</label>
                <input id="instructor-score" type="number" min="0" max="100" value={selectedSubmission.score} disabled={selectedSubmission.readOnly} onChange={(event) => setSelectedSubmission((current) => ({ ...current, score: event.target.value, gradeError: '' }))} style={{ width: 110, minHeight: 34, padding: '0 9px', border: '1px solid #e9ebf1', borderRadius: 7, color: '#46516a' }} />
                {selectedSubmission.gradeError && <p role="alert" style={{ margin: '5px 0 0', color: '#b14e4e', fontSize: 9 }}>{selectedSubmission.gradeError}</p>}
                <label className="feedback-label" htmlFor="instructor-feedback">Feedback notes</label>
                <textarea id="instructor-feedback" className="instructor-feedback" rows="6" placeholder="Add constructive feedback for this learner…" value={selectedSubmission.feedback} onChange={(event) => setSelectedSubmission((current) => ({ ...current, feedback: event.target.value }))} disabled={selectedSubmission.readOnly} />
              </div>
            </div>
            {selectedSubmission.readOnly && (selectedSubmission.score !== '' || selectedSubmission.feedback) && (
              <p style={{ margin: '8px 0 0', color: '#737d91', fontSize: 9 }}>Saved score and feedback are displayed from this dashboard session.</p>
            )}
            <div className="submission-modal-actions"><button type="button" className="submission-cancel" onClick={() => setSelectedSubmission(null)}>Close</button>{!selectedSubmission.readOnly && <button type="button" className="submission-mark-reviewed" onClick={() => markReviewed(selectedSubmission.id)}><Icon name="check" size={16} /> Save feedback &amp; review</button>}</div>
          </section>
        </div>
      )}
    </div>
  );
}

export default InstructorDashboard;
