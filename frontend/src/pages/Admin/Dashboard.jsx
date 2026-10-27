import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import FloatingChatBot from '../../components/FloatingChatBot';
import ProfileEditor from '../../components/ProfileEditor';
import './Dashboard.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const enrollmentData = {
  '7 days': [
    { label: 'Mon', enrollments: 42 },
    { label: 'Tue', enrollments: 58 },
    { label: 'Wed', enrollments: 47 },
    { label: 'Thu', enrollments: 71 },
    { label: 'Fri', enrollments: 63 },
    { label: 'Sat', enrollments: 86 },
    { label: 'Sun', enrollments: 74 },
  ],
  '30 days': [
    { label: 'Week 1', enrollments: 196 },
    { label: 'Week 2', enrollments: 248 },
    { label: 'Week 3', enrollments: 219 },
    { label: 'Week 4', enrollments: 312 },
  ],
  '12 months': [
    { label: 'May', enrollments: 640 },
    { label: 'Jun', enrollments: 720 },
    { label: 'Jul', enrollments: 680 },
    { label: 'Aug', enrollments: 810 },
    { label: 'Sep', enrollments: 930 },
    { label: 'Oct', enrollments: 1084 },
  ],
};

const courses = [
  { name: 'Digital Skills for the Workplace', category: 'Digital literacy', instructor: 'Grace Wanjiku', learners: 384, completion: 82, status: 'Published', color: 'violet', initials: 'DS' },
  { name: 'Introduction to Data Analytics', category: 'Technology', instructor: 'David Otieno', learners: 296, completion: 68, status: 'Published', color: 'blue', initials: 'DA' },
  { name: 'Entrepreneurship & Business', category: 'Business', instructor: 'Faith Njeri', learners: 241, completion: 74, status: 'Published', color: 'amber', initials: 'EB' },
  { name: 'Communication Skills', category: 'Professional skills', instructor: 'Peter Mwangi', learners: 188, completion: 91, status: 'Review', color: 'green', initials: 'CS' },
];

const activities = [
  { initials: 'JM', name: 'Joyce Muthoni', action: 'completed', target: 'Digital Skills for the Workplace', time: '12 min ago', color: 'peach' },
  { initials: 'DO', name: 'Daniel Omondi', action: 'enrolled in', target: 'Introduction to Data Analytics', time: '38 min ago', color: 'blue' },
  { initials: 'AW', name: 'Alice Wambui', action: 'submitted an assessment in', target: 'Communication Skills', time: '1 hr ago', color: 'green' },
];

const initialUsers = [
  { name: 'Joyce Muthoni', email: 'joyce.muthoni@example.com', role: 'student', status: 'Active' },
  { name: 'David Otieno', email: 'david.otieno@example.com', role: 'instructor', status: 'Active' },
  { name: 'Faith Njeri', email: 'faith.njeri@example.com', role: 'student', status: 'Inactive' },
];

const initialFees = [
  { name: 'Joyce Muthoni', className: 'Grade 8 East', status: 'Paid' },
  { name: 'Faith Njeri', className: 'Grade 7 North', status: 'Partial' },
  { name: 'Daniel Omondi', className: 'Grade 9 West', status: 'Pending' },
];

const initialApprovals = [
  { title: 'Grade 8 Mathematics blueprint', standard: 'CBC · Junior School', status: 'Awaiting review' },
  { title: 'Science lesson template: Energy', standard: 'CBC · Grade 7', status: 'Awaiting review' },
  { title: 'Digital literacy assessment', standard: 'National curriculum alignment', status: 'Awaiting review' },
];

const navItems = [
  { label: 'Overview', icon: 'grid', target: 'dashboard' },
  { label: 'Courses', icon: 'book', target: 'courses' },
  { label: 'People', icon: 'users', target: 'learners' },
  { label: 'Payments', icon: 'wallet', target: 'revenue' },
  { label: 'Reports', icon: 'chart', target: 'enrollment' },
];

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function parseCsvLine(line) {
  return line.match(/("(?:[^"]|"")*"|[^,]*)(,|$)/g)
    ?.map((cell) => cell.replace(/,$/, '').replace(/^"|"$/g, '').replaceAll('""', '"')) || [];
}

function getDirectoryLabel(value) {
  if (Array.isArray(value)) {
    const labels = value.map(getDirectoryLabel).filter((label) => label !== 'Not recorded');
    return labels.length ? labels.join(', ') : 'Not recorded';
  }
  if (value && typeof value === 'object') {
    return getDirectoryLabel(value.name ?? value.title ?? value.label ?? value.courseName);
  }
  return typeof value === 'string' || typeof value === 'number'
    ? String(value).trim() || 'Not recorded'
    : 'Not recorded';
}

function getStudentCourse(student) {
  return getDirectoryLabel(student.enrolledCourses ?? student.courseNames ?? student.courses ?? student.courseName ?? student.course);
}

function getStudentClass(student) {
  return getDirectoryLabel(student.className ?? student.class ?? student.gradeName ?? student.grade);
}

function getEnrollmentYear(student) {
  const enrollmentDate = student.enrollmentDate ?? student.enrolledAt ?? student.createdAt;
  if (!enrollmentDate) return '';
  const date = new Date(enrollmentDate);
  return Number.isNaN(date.getTime()) ? '' : String(date.getFullYear());
}

function compareDirectoryNames(left, right) {
  return getDirectoryLabel(left).localeCompare(getDirectoryLabel(right), undefined, { sensitivity: 'base', numeric: true });
}

function Icon({ name, size = 20 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" /><path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 9h18M16 14h2" /><path d="M6 5V3h12v2" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 5-6" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    arrowUp: <><path d="M7 17 17 7M7 7h10v10" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" /><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  };

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [range, setRange] = useState('30 days');
  const [courseSearch, setCourseSearch] = useState('');
  const [activeNav, setActiveNav] = useState('Overview');
  const [activeSection, setActiveSection] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user_data') || '{}'));
  const [managedUsers, setManagedUsers] = useState(initialUsers);
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [directoryError, setDirectoryError] = useState('');
  const [studentSort, setStudentSort] = useState('name');
  const [importMessage, setImportMessage] = useState('');
  const [fees, setFees] = useState(initialFees);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [announcement, setAnnouncement] = useState('');
  const [announcementChannel, setAnnouncementChannel] = useState('Email');
  const [announcementAudience, setAnnouncementAudience] = useState('Parents');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const firstName = user.name?.trim().split(/\s+/)[0] || 'Admin';
  const filteredCourses = useMemo(
    () => courses.filter((course) => `${course.name} ${course.category} ${course.instructor}`.toLowerCase().includes(courseSearch.toLowerCase())),
    [courseSearch],
  );
  const students = useMemo(() => {
    const records = directoryUsers.filter((record) => record.role?.toLowerCase() === 'student');
    return records.sort((left, right) => {
      if (studentSort === 'year') {
        const leftYear = getEnrollmentYear(left);
        const rightYear = getEnrollmentYear(right);
        if (!leftYear && rightYear) return 1;
        if (leftYear && !rightYear) return -1;
        return rightYear.localeCompare(leftYear) || compareDirectoryNames(left.name, right.name);
      }
      const getSortValue = {
        name: (record) => record.name,
        course: getStudentCourse,
        class: getStudentClass,
      }[studentSort];
      return compareDirectoryNames(getSortValue(left), getSortValue(right))
        || compareDirectoryNames(left.name, right.name);
    });
  }, [directoryUsers, studentSort]);
  const instructors = useMemo(
    () => directoryUsers.filter((record) => record.role?.toLowerCase() === 'instructor')
      .sort((left, right) => compareDirectoryNames(left.name, right.name)),
    [directoryUsers],
  );
  useEffect(() => {
    const controller = new AbortController();
    axios.get(`${BACKEND_URL}/api/auth/admin/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` },
      signal: controller.signal,
    })
      .then(({ data }) => {
        if (!Array.isArray(data)) throw new Error('The user directory response was not a list.');
        setDirectoryUsers(data);
        setDirectoryError('');
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          setDirectoryError(error.response?.data?.message || error.message || 'Could not load registered users.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setDirectoryLoading(false);
      });

    return () => controller.abort();
  }, []);
  const currentDate = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  const sectionTitles = {
    overview: 'Overview',
    courses: 'Courses',
    people: 'People',
    instructors: 'Instructors',
    assessments: 'Assessments',
    payments: 'Payments',
    reports: 'Reports',
    'user-management': 'User & roles',
    'fee-access': 'Fee access',
    curriculum: 'CBC approvals',
    'audit-reports': 'Audit trails',
    communications: 'Communications',
  };
  const sectionByTarget = {
    dashboard: 'overview',
    courses: 'courses',
    learners: 'people',
    revenue: 'payments',
    enrollment: 'reports',
    instructors: 'instructors',
    assessments: 'assessments',
    'user-management': 'user-management',
    'fee-access': 'fee-access',
    curriculum: 'curriculum',
    'audit-reports': 'audit-reports',
    communications: 'communications',
  };
  const activeNavBySection = {
    overview: 'Overview',
    courses: 'Courses',
    people: 'People',
    instructors: 'People',
    assessments: 'Courses',
    payments: 'Payments',
    reports: 'Reports',
    'user-management': 'People',
    'fee-access': 'Payments',
    curriculum: 'Courses',
    'audit-reports': 'Reports',
    communications: 'Overview',
  };
  const visibleWhen = (...sections) => sections.includes(activeSection) ? undefined : { display: 'none' };

  const handleSectionNavigation = (event) => {
    const link = event.target.closest('a[href^="#"]');
    const target = link?.getAttribute('href')?.slice(1);
    const section = sectionByTarget[target];
    if (!section) return;

    event.preventDefault();
    setActiveSection(section);
    setActiveNav(activeNavBySection[section]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const exportReport = () => {
    const rows = [
      ['Course', 'Category', 'Instructor', 'Learners', 'Completion rate', 'Status'],
      ...courses.map((course) => [course.name, course.category, course.instructor, course.learners, `${course.completion}%`, course.status]),
    ];
    downloadCsv('tusome-tec-course-report.csv', rows);
  };

  const exportUsers = () => {
    downloadCsv('tusome-tec-users.csv', [
      ['Name', 'Email', 'Role', 'Status'],
      ...managedUsers.map(({ name, email, role, status }) => [name, email, role, status]),
    ]);
  };

  const importUsers = async (event) => {
    const [file] = event.target.files || [];
    if (!file) return;

    try {
      const lines = (await file.text()).replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
      const headers = parseCsvLine(lines.shift() || '').map((header) => header.trim().toLowerCase());
      const nameIndex = headers.indexOf('name');
      const emailIndex = headers.indexOf('email');
      const roleIndex = headers.indexOf('role');
      if (nameIndex < 0 || emailIndex < 0 || roleIndex < 0) {
        setImportMessage('CSV must include Name, Email, and Role columns.');
        return;
      }

      const importedUsers = lines.map(parseCsvLine).map((columns) => ({
        name: columns[nameIndex]?.trim(),
        email: columns[emailIndex]?.trim(),
        role: columns[roleIndex]?.trim(),
        status: columns[headers.indexOf('status')]?.trim() || 'Active',
      })).filter((record) => record.name && record.email && record.role);
      if (!importedUsers.length) {
        setImportMessage('No valid user rows found. Check the selected CSV and try again.');
        return;
      }

      setManagedUsers((currentUsers) => [...currentUsers, ...importedUsers]);
      setImportMessage(`${importedUsers.length} user${importedUsers.length === 1 ? '' : 's'} imported.`);
    } catch (error) {
      setImportMessage(`Could not read this CSV: ${error.message}`);
    } finally {
      event.target.value = '';
    }
  };

  const exportAuditReport = () => {
    downloadCsv('tusome-tec-oversight-report.csv', [
      ['Report', 'Measure', 'Value'],
      ['Attendance', 'Learner attendance', '92%'],
      ['Teacher activity', 'Active this week', '38 of 42'],
      ['Completion', 'Course completion rate', '78.4%'],
      ['Security audit', 'Recent sign-in alerts', '2 reviewed'],
      ...fees.map((record) => ['Fee and access', `${record.name} · ${record.className}`, `${record.status} · ${record.status === 'Paid' ? 'Access allowed' : 'Access restricted'}`]),
    ]);
  };

  const prepareBroadcast = (event) => {
    event.preventDefault();
    if (!announcement.trim()) {
      setBroadcastMessage('Enter a message before preparing the broadcast.');
      return;
    }
    setBroadcastMessage(`${announcementChannel} notice for ${announcementAudience.toLowerCase()} is ready. Connect a delivery provider to send it.`);
  };

  const toggleUserStatus = (index) => {
    setManagedUsers((currentUsers) => currentUsers.map((record, userIndex) => (
      userIndex === index ? { ...record, status: record.status === 'Active' ? 'Inactive' : 'Active' } : record
    )));
  };

  const updateUserRole = (index, role) => {
    setManagedUsers((currentUsers) => currentUsers.map((record, userIndex) => (
      userIndex === index ? { ...record, role } : record
    )));
  };

  const updateFeeStatus = (index, status) => {
    setFees((currentFees) => currentFees.map((record, feeIndex) => (
      feeIndex === index ? { ...record, status } : record
    )));
  };

  const updateApprovalStatus = (index, status) => {
    setApprovals((currentApprovals) => currentApprovals.map((record, approvalIndex) => (
      approvalIndex === index ? { ...record, status } : record
    )));
  };

  return (
    <div className="admin-dashboard" id="dashboard" onClick={handleSectionNavigation}>
      <aside className="admin-sidebar">
        <a className="admin-brand" href="#dashboard" onClick={() => setActiveNav('Overview')} aria-label="TusomeTec home">
          <span className="admin-brand-mark">t</span>
          <span>Tusome<span className="brand-highlight">Tec</span></span>
        </a>

        <div className="workspace-switcher">
          <span className="workspace-icon">T</span>
          <span className="workspace-copy"><strong>TusomeTec Academy</strong><small>Learning workspace</small></span>
          <Icon name="chevron" size={16} />
        </div>

        <span className="sidebar-section-label">WORKSPACE</span>
        <nav className="admin-nav" aria-label="Admin dashboard sections">
          {navItems.map((item) => (
            <a
              className={`admin-nav-link${activeNav === item.label ? ' is-active' : ''}`}
              href={`#${item.target}`}
              key={item.label}
              onClick={() => setActiveNav(item.label)}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.label === 'Courses' && <span className="nav-count">24</span>}
            </a>
          ))}
        </nav>

        <div className="sidebar-divider" />
        <span className="sidebar-section-label">MANAGE</span>
        <a className={`admin-nav-link${activeSection === 'instructors' ? ' is-active' : ''}`} href="#instructors" onClick={() => setActiveNav('People')}>
          <Icon name="users" size={19} /><span>Instructors</span><span className="nav-pending">3</span>
        </a>
        <a className={`admin-nav-link${activeSection === 'assessments' ? ' is-active' : ''}`} href="#assessments" onClick={() => setActiveNav('Courses')}>
          <Icon name="check" size={19} /><span>Assessments</span>
        </a>
        <a className={`admin-nav-link${activeSection === 'user-management' ? ' is-active' : ''}`} href="#user-management" onClick={() => setActiveNav('People')}>
          <Icon name="users" size={19} /><span>User &amp; roles</span>
        </a>
        <a className={`admin-nav-link${activeSection === 'fee-access' ? ' is-active' : ''}`} href="#fee-access" onClick={() => setActiveNav('Payments')}>
          <Icon name="wallet" size={19} /><span>Fee access</span>
        </a>
        <a className={`admin-nav-link${activeSection === 'curriculum' ? ' is-active' : ''}`} href="#curriculum" onClick={() => setActiveNav('Courses')}>
          <Icon name="book" size={19} /><span>CBC approvals</span>
        </a>
        <a className={`admin-nav-link${activeSection === 'audit-reports' ? ' is-active' : ''}`} href="#audit-reports" onClick={() => setActiveNav('Reports')}>
          <Icon name="chart" size={19} /><span>Audit trails</span>
        </a>
        <a className={`admin-nav-link${activeSection === 'communications' ? ' is-active' : ''}`} href="#communications" onClick={() => setActiveNav('Overview')}>
          <Icon name="bell" size={19} /><span>Communications</span>
        </a>

        <div className="sidebar-help">
          <span className="help-spark"><Icon name="spark" size={16} /></span>
          <strong>Need a hand?</strong>
          <p>Visit the help center for tips on managing your learning workspace.</p>
          <a href="mailto:support@tusometec.com">Visit help center <Icon name="chevron" size={13} /></a>
        </div>

        <button className="admin-logout" type="button" onClick={handleLogout}>
          <Icon name="logout" size={18} /><span>Sign out</span>
        </button>
      </aside>
      <FloatingChatBot courseCount={courses.length} />

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="mobile-brand">
            <span className="admin-brand-mark">t</span><strong>Tusome<span className="brand-highlight">Tec</span></strong>
          </div>
          <div className="breadcrumb"><span>Workspace</span><Icon name="chevron" size={14} /><strong>{sectionTitles[activeSection]}</strong></div>
          <div className="topbar-actions">
            <span className="topbar-date">{currentDate}</span>
            <div className="notification-wrap">
              <button className={`icon-button${showNotifications ? ' is-active' : ''}`} type="button" aria-label="Notifications" aria-expanded={showNotifications} onClick={() => setShowNotifications((visible) => !visible)}>
                <Icon name="bell" size={19} /><span className="notification-dot" />
              </button>
              {showNotifications && (
                <div className="notification-popover">
                  <strong>Notifications</strong>
                  <p><span className="notification-unread" />3 instructor profiles are waiting for review.</p>
                  <p><span className="notification-unread" />Your monthly learning report is ready.</p>
                </div>
              )}
            </div>
            <ProfileEditor
              avatarClassName="profile-avatar"
              className="topbar-profile"
              copyClassName="profile-copy"
              onUpdated={setUser}
              roleLabel="Administrator"
              user={user}
            />
          </div>
        </header>

        <div className="admin-content">
          <section className="welcome-row" style={visibleWhen('overview')}>
            <div>
              <p className="welcome-kicker">ADMIN OVERVIEW</p>
              <h1>Good morning, {firstName} <span className="wave">✦</span></h1>
              <p className="welcome-description">Institution snapshot. Live counts require a connected institutional data service.</p>
            </div>
            <button className="export-button" type="button" onClick={exportReport}><Icon name="download" size={17} /> Export report</button>
          </section>

          <section className="stats-grid" aria-label="Institution overview" style={visibleWhen('overview')}>
            <article className="stat-card">
              <div className="stat-card-top"><span className="stat-icon stat-icon-purple"><Icon name="users" size={19} /></span><span className="stat-trend">Institution</span></div>
              <p className="stat-label">Active students</p><strong className="stat-value">2,846</strong><p className="stat-footnote">Current student accounts</p>
              <div className="stat-sparkline purple-spark"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </article>
            <article className="stat-card">
              <div className="stat-card-top"><span className="stat-icon stat-icon-blue"><Icon name="users" size={19} /></span><span className="stat-trend">Institution</span></div>
              <p className="stat-label">Teachers</p><strong className="stat-value">42</strong><p className="stat-footnote">38 active this week</p>
              <div className="stat-sparkline blue-spark"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </article>
            <article className="stat-card" id="revenue">
              <div className="stat-card-top"><span className="stat-icon stat-icon-green"><Icon name="book" size={19} /></span><span className="stat-trend">Institution</span></div>
              <p className="stat-label">Active classes</p><strong className="stat-value">86</strong><p className="stat-footnote">Across all grade levels</p>
              <div className="stat-sparkline green-spark"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </article>
            <article className="stat-card">
              <div className="stat-card-top"><span className="stat-icon stat-icon-orange"><Icon name="chart" size={19} /></span><span className="stat-trend">System health</span></div>
              <p className="stat-label">Storage used</p><strong className="stat-value">68%</strong><p className="stat-footnote">Platform operational · 340 GB / 500 GB</p>
              <div className="stat-sparkline orange-spark"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </article>
          </section>

          <section className="analytics-grid" style={{ ...visibleWhen('overview', 'reports'), gridTemplateColumns: activeSection === 'reports' ? 'minmax(0, 1fr)' : undefined }}>
            <article className="panel enrollment-panel" id="enrollment">
              <div className="panel-heading">
                <div><h2>Enrollment overview</h2><p>Track learner sign-ups over time</p></div>
                <label className="range-select-label" htmlFor="enrollment-range">Period</label>
                <select id="enrollment-range" className="range-select" value={range} onChange={(event) => setRange(event.target.value)}>
                  {Object.keys(enrollmentData).map((option) => <option key={option}>{option}</option>)}
                </select>
              </div>
              <div className="chart-summary"><strong>{range === '7 days' ? '441' : range === '30 days' ? '975' : '4,864'}</strong><span>new enrollments</span><span className="chart-positive"><Icon name="arrowUp" size={13} /> 14.6%</span></div>
              <div className="enrollment-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={enrollmentData[range]} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                    <defs><linearGradient id="enrollmentFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7763e8" stopOpacity={0.2} /><stop offset="95%" stopColor="#7763e8" stopOpacity={0.01} /></linearGradient></defs>
                    <CartesianGrid stroke="#edf0f6" vertical={false} />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#9299aa', fontSize: 11 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9299aa', fontSize: 11 }} />
                    <Tooltip contentStyle={{ border: '1px solid #edf0f6', borderRadius: 10, boxShadow: '0 8px 24px rgba(32, 42, 70, .1)' }} />
                    <Area type="monotone" dataKey="enrollments" name="Enrollments" stroke="#7661e8" strokeWidth={2.5} fill="url(#enrollmentFill)" activeDot={{ r: 5, fill: '#7661e8', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend"><span className="legend-dot" /> New enrollments <span className="chart-caption">Updated just now</span></div>
            </article>

            <article className="panel activity-panel" style={visibleWhen('overview')}>
              <div className="panel-heading"><div><h2>Recent activity</h2><p>Latest updates from your learners</p></div><button className="text-link" type="button" onClick={() => { setActiveNav('People'); setActiveSection('people'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>View all <Icon name="chevron" size={14} /></button></div>
              <div className="activity-list">
                {activities.map((activity) => (
                  <div className="activity-item" key={activity.name}>
                    <span className={`activity-avatar avatar-${activity.color}`}>{activity.initials}</span>
                    <div className="activity-copy"><p><strong>{activity.name}</strong> {activity.action} <b>{activity.target}</b></p><span>{activity.time}</span></div>
                  </div>
                ))}
              </div>
              <div className="activity-footer"><span className="live-indicator" /> Live learning activity</div>
            </article>
          </section>

          <section className="lower-grid" style={{ ...visibleWhen('overview', 'courses', 'instructors', 'assessments'), gridTemplateColumns: activeSection === 'overview' ? undefined : 'minmax(0, 1fr)' }}>
            <article className="panel courses-panel" id="courses" style={visibleWhen('overview', 'courses')}>
              <div className="panel-heading courses-heading">
                <div><h2>Course performance</h2><p>Review engagement and learner progress</p></div>
                <div className="course-tools">
                  <label className="course-search"><Icon name="search" size={16} /><input aria-label="Search courses" placeholder="Search courses" value={courseSearch} onChange={(event) => setCourseSearch(event.target.value)} /></label>
                  <a href="#courses" className="text-link">All courses <Icon name="chevron" size={14} /></a>
                </div>
              </div>
              <div className="course-table-wrap">
                <table className="course-table">
                  <thead><tr><th>COURSE</th><th>INSTRUCTOR</th><th>LEARNERS</th><th>COMPLETION</th><th>STATUS</th></tr></thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course.name}>
                        <td><div className="course-name-cell"><span className={`course-cover cover-${course.color}`}>{course.initials}</span><span><strong>{course.name}</strong><small>{course.category}</small></span></div></td>
                        <td className="instructor-cell">{course.instructor}</td>
                        <td className="learner-count">{course.learners}</td>
                        <td><div className="completion-cell"><div className="completion-track"><span style={{ width: `${course.completion}%` }} /></div><span>{course.completion}%</span></div></td>
                        <td><span className={`course-status${course.status === 'Review' ? ' status-review' : ''}`}><i />{course.status}</span></td>
                      </tr>
                    ))}
                    {filteredCourses.length === 0 && <tr><td className="empty-courses" colSpan="5">No courses match “{courseSearch}”.</td></tr>}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="panel attention-panel" style={visibleWhen('overview', 'instructors', 'assessments')}>
              <div className="panel-heading"><div><h2>Needs your attention</h2><p>A few things to keep moving</p></div><span className="attention-count">3</span></div>
              <a className="attention-item" href="mailto:support@tusometec.com?subject=Instructor%20review">
                <span className="attention-icon attention-purple"><Icon name="users" size={17} /></span><span className="attention-copy"><strong>Instructor approvals</strong><small>3 profiles awaiting review</small></span><Icon name="chevron" size={15} />
              </a>
              <a className="attention-item" href="#courses" id="assessments">
                <span className="attention-icon attention-amber"><Icon name="book" size={17} /></span><span className="attention-copy"><strong>Course review</strong><small>1 course needs your approval</small></span><Icon name="chevron" size={15} />
              </a>
              <div className="platform-health"><span className="health-check"><Icon name="check" size={14} /></span><span><strong>All systems operational</strong><small>Platform status · Updated 2 min ago</small></span></div>
            </article>
          </section>

          <section className="admin-tools-grid" aria-label="Institution management tools" style={{ ...visibleWhen('overview', 'people', 'instructors', 'payments', 'curriculum', 'reports', 'communications', 'user-management', 'fee-access', 'audit-reports'), gridTemplateColumns: activeSection === 'overview' ? undefined : 'minmax(0, 1fr)' }}>
            <article className="panel management-panel directory-panel" id="learners" style={visibleWhen('overview', 'people')}>
              <div className="panel-heading management-heading">
                <div><h2>Registered students</h2><p>{students.length} student{students.length === 1 ? '' : 's'} in the directory</p></div>
                <label className="directory-sort-label" htmlFor="student-sort">Sort by
                  <select id="student-sort" className="directory-sort" value={studentSort} onChange={(event) => setStudentSort(event.target.value)}>
                    <option value="name">Name</option>
                    <option value="course">Course</option>
                    <option value="class">Class</option>
                    <option value="year">Enrollment year</option>
                  </select>
                </label>
              </div>
              {directoryError && <p className="form-feedback directory-error" role="alert">{directoryError}</p>}
              <div className="directory-table-wrap">
                <table className="management-table directory-table">
                  <thead><tr><th>STUDENT</th><th>COURSE(S)</th><th>CLASS</th><th>YEAR ENROLLED</th></tr></thead>
                  <tbody>
                    {directoryLoading && <tr><td className="directory-message" colSpan="4">Loading registered students…</td></tr>}
                    {!directoryLoading && !directoryError && students.map((student) => (
                      <tr key={student._id || student.id || student.email}>
                        <td><strong>{student.name || 'Name not provided'}</strong><small>{student.email}</small></td>
                        <td>{getStudentCourse(student)}</td>
                        <td>{getStudentClass(student)}</td>
                        <td>{getEnrollmentYear(student) || 'Not recorded'}</td>
                      </tr>
                    ))}
                    {!directoryLoading && !directoryError && students.length === 0 && <tr><td className="directory-message" colSpan="4">No registered students found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="panel management-panel directory-panel" id="instructors" style={visibleWhen('overview', 'instructors')}>
              <div className="panel-heading management-heading">
                <div><h2>Instructors</h2><p>{instructors.length} instructor{instructors.length === 1 ? '' : 's'} in the directory</p></div>
              </div>
              {directoryError && <p className="form-feedback directory-error" role="alert">{directoryError}</p>}
              <div className="directory-table-wrap">
                <table className="management-table directory-table">
                  <thead><tr><th>INSTRUCTOR</th><th>DEPARTMENT</th><th>DATE REGISTERED</th></tr></thead>
                  <tbody>
                    {directoryLoading && <tr><td className="directory-message" colSpan="3">Loading instructors…</td></tr>}
                    {!directoryLoading && !directoryError && instructors.map((instructor) => (
                      <tr key={instructor._id || instructor.id || instructor.email}>
                        <td><strong>{instructor.name || 'Name not provided'}</strong><small>{instructor.email}</small></td>
                        <td>{instructor.department || 'Not assigned'}</td>
                        <td>{getEnrollmentYear(instructor) || 'Not recorded'}</td>
                      </tr>
                    ))}
                    {!directoryLoading && !directoryError && instructors.length === 0 && <tr><td className="directory-message" colSpan="3">No registered instructors found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="panel management-panel" id="user-management" style={visibleWhen('overview', 'people', 'user-management')}>
              <div className="panel-heading management-heading">
                <div><h2>User &amp; role management</h2><p>Import, export, and manage account access</p></div>
                <button className="export-button compact-button" type="button" onClick={exportUsers}>Export users</button>
              </div>
              <label className="import-control">
                <span>Import users from CSV (Excel-compatible)</span>
                <input type="file" accept=".csv,text/csv" onChange={importUsers} />
              </label>
              {importMessage && <p className="form-feedback" role="status">{importMessage}</p>}
              <div className="management-table-wrap">
                <table className="management-table">
                  <thead><tr><th>USER</th><th>ROLE</th><th>ACCOUNT</th></tr></thead>
                  <tbody>
                    {managedUsers.map((record, index) => (
                      <tr key={`${record.email}-${index}`}>
                        <td><strong>{record.name}</strong><small>{record.email}</small></td>
                        <td><select aria-label={`Role for ${record.name}`} value={record.role} onChange={(event) => updateUserRole(index, event.target.value)}><option value="student">Student</option><option value="instructor">Instructor</option><option value="admin">Admin</option></select></td>
                        <td><button className={`account-toggle${record.status === 'Active' ? ' is-enabled' : ''}`} type="button" onClick={() => toggleUserStatus(index)}>{record.status}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="panel fee-panel" id="fee-access" style={visibleWhen('overview', 'payments', 'fee-access')}>
              <div className="panel-heading management-heading">
                <div><h2>Fee status &amp; access</h2><p>Clearance linked to exam and course access</p></div>
              </div>
              <div className="fee-list">
                {fees.map((record, index) => (
                  <div className="fee-row" key={record.name}>
                    <span className="fee-person"><strong>{record.name}</strong><small>{record.className}</small></span>
                    <select aria-label={`Fee status for ${record.name}`} value={record.status} onChange={(event) => updateFeeStatus(index, event.target.value)}>
                      <option>Paid</option><option>Partial</option><option>Pending</option>
                    </select>
                    <span className={`access-state${record.status === 'Paid' ? ' access-allowed' : ' access-restricted'}`}>{record.status === 'Paid' ? 'Access allowed' : 'Restricted'}</span>
                  </div>
                ))}
              </div>
              <p className="policy-note">Partial and pending accounts are flagged for restricted access. Changes here are a dashboard record only.</p>
            </article>

            <article className="panel curriculum-panel" id="curriculum" style={visibleWhen('overview', 'curriculum')}>
              <div className="panel-heading management-heading">
                <div><h2>Curriculum &amp; CBC alignment</h2><p>Review blueprints, lesson templates, and standards alignment</p></div>
              </div>
              <div className="approval-list">
                {approvals.map((approval, index) => (
                  <div className="approval-row" key={approval.title}>
                    <span className="approval-copy"><strong>{approval.title}</strong><small>{approval.standard}</small></span>
                    {approval.status === 'Awaiting review' ? (
                      <span className="approval-actions">
                        <button type="button" onClick={() => updateApprovalStatus(index, 'Approved')}>Approve</button>
                        <button type="button" onClick={() => updateApprovalStatus(index, 'Changes requested')}>Request changes</button>
                      </span>
                    ) : <span className={`approval-status${approval.status === 'Approved' ? ' is-approved' : ''}`}>{approval.status}</span>}
                  </div>
                ))}
              </div>
            </article>

            <article className="panel reports-panel" id="audit-reports" style={visibleWhen('overview', 'reports', 'audit-reports')}>
              <div className="panel-heading management-heading">
                <div><h2>Reports &amp; audit trails</h2><p>Institution analytics and security review</p></div>
                <span className="report-actions">
                  <button className="export-button compact-button" type="button" onClick={exportAuditReport}>Export CSV</button>
                  <button className="export-button compact-button print-report-button" type="button" onClick={() => window.print()}>Print / PDF</button>
                </span>
              </div>
              <div className="report-metrics">
                <div><span>Student attendance</span><strong>92%</strong></div>
                <div><span>Teacher activity</span><strong>38 / 42 active</strong></div>
                <div><span>Course completion</span><strong>78.4%</strong></div>
                <div><span>Security log</span><strong>2 alerts reviewed</strong></div>
              </div>
              <p className="policy-note">Report exports are CSV files that open in spreadsheet tools.</p>
            </article>

            <article className="panel communication-panel" id="communications" style={visibleWhen('overview', 'communications')}>
              <div className="panel-heading management-heading">
                <div><h2>Communication hub</h2><p>Prepare notices for parents, students, or staff</p></div>
              </div>
              <form className="broadcast-form" onSubmit={prepareBroadcast}>
                <div className="broadcast-options">
                  <label>Channel<select value={announcementChannel} onChange={(event) => setAnnouncementChannel(event.target.value)}><option>Email</option><option>SMS</option></select></label>
                  <label>Audience<select value={announcementAudience} onChange={(event) => setAnnouncementAudience(event.target.value)}><option>Parents</option><option>Students</option><option>Staff</option></select></label>
                </div>
                <label className="broadcast-message-label">Announcement<textarea rows="3" value={announcement} onChange={(event) => setAnnouncement(event.target.value)} placeholder="Write an urgent notice or update..." /></label>
                <button className="broadcast-button" type="submit">Prepare broadcast</button>
                {broadcastMessage && <p className="form-feedback" role="status">{broadcastMessage}</p>}
              </form>
            </article>
          </section>
          <footer className="admin-footer">© {new Date().getFullYear()} TusomeTec Academy <span>Learning that moves you forward.</span></footer>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
