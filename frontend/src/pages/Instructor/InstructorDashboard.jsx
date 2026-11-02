import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingChatBot from '../../components/FloatingChatBot';
import ProfileEditor from '../../components/ProfileEditor';
import './InstructorDashboard.css';

const courses = [
  { id: 'digital', title: 'Digital Skills for the Workplace', category: 'Digital literacy', learners: 84, completion: 76, lessons: 12, color: 'violet', initials: 'DS', updated: 'Updated 2 days ago' },
  { id: 'analytics', title: 'Introduction to Data Analytics', category: 'Technology', learners: 62, completion: 58, lessons: 10, color: 'blue', initials: 'DA', updated: 'Updated yesterday' },
  { id: 'business', title: 'Entrepreneurship & Business', category: 'Business', learners: 48, completion: 89, lessons: 8, color: 'amber', initials: 'EB', updated: 'Updated 5 days ago' },
];

const initialSubmissions = [
  { id: 1, learner: 'Joyce Muthoni', initials: 'JM', course: 'Digital Skills for the Workplace', assignment: 'Digital safety reflection', submitted: '12 min ago', status: 'Needs review', color: 'peach' },
  { id: 2, learner: 'Daniel Omondi', initials: 'DO', course: 'Introduction to Data Analytics', assignment: 'Reading a data chart', submitted: '38 min ago', status: 'Needs review', color: 'blue' },
  { id: 3, learner: 'Alice Wambui', initials: 'AW', course: 'Entrepreneurship & Business', assignment: 'Business idea canvas', submitted: '1 hr ago', status: 'Reviewed', color: 'green' },
  { id: 4, learner: 'Brian Kamau', initials: 'BK', course: 'Digital Skills for the Workplace', assignment: 'Create a strong password guide', submitted: 'Yesterday', status: 'Needs review', color: 'purple' },
];

const learners = [
  { name: 'Joyce Muthoni', email: 'joyce.muthoni@example.com', initials: 'JM', course: 'Digital Skills for the Workplace', progress: 92, activity: 'Today', color: 'peach' },
  { name: 'Daniel Omondi', email: 'daniel.omondi@example.com', initials: 'DO', course: 'Introduction to Data Analytics', progress: 68, activity: 'Today', color: 'blue' },
  { name: 'Alice Wambui', email: 'alice.wambui@example.com', initials: 'AW', course: 'Entrepreneurship & Business', progress: 54, activity: 'Yesterday', color: 'green' },
  { name: 'Brian Kamau', email: 'brian.kamau@example.com', initials: 'BK', course: 'Digital Skills for the Workplace', progress: 31, activity: 'Oct 12', color: 'purple' },
];

const sessions = [
  { day: '15', month: 'OCT', title: 'Digital safety: live Q&A', course: 'Digital Skills for the Workplace', time: 'Today · 2:00 PM – 3:00 PM', color: 'violet' },
  { day: '17', month: 'OCT', title: 'Understanding your first dataset', course: 'Introduction to Data Analytics', time: 'Friday · 10:30 AM – 11:30 AM', color: 'blue' },
  { day: '20', month: 'OCT', title: 'Building a business model', course: 'Entrepreneurship & Business', time: 'Monday · 1:00 PM – 2:00 PM', color: 'amber' },
];

const initialDiscussions = [
  { id: 1, course: 'Digital Skills for the Workplace', author: 'Joyce Muthoni', message: 'Could you clarify the password manager exercise?', status: 'Open' },
  { id: 2, course: 'Introduction to Data Analytics', author: 'Daniel Omondi', message: 'I shared my chart in the class discussion.', status: 'Open' },
];

const navigation = [
  { label: 'Overview', icon: 'grid', target: 'overview' },
  { label: 'My courses', icon: 'book', target: 'my-courses' },
  { label: 'Assignments', icon: 'clipboard', target: 'assignments', count: '3' },
  { label: 'Learners', icon: 'users', target: 'learners' },
  { label: 'Class schedule', icon: 'calendar', target: 'schedule' },
];

const quickTools = [
  { label: 'Upload content', target: 'content-library' },
  { label: 'Build assessment', target: 'assessment-builder' },
  { label: 'Grade work', target: 'grading-hub' },
  { label: 'Attendance & progress', target: 'progress-attendance' },
  { label: 'Live classes & discussions', target: 'live-discussions' },
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
  const [activeNav, setActiveNav] = useState('Overview');
  const [activeSection, setActiveSection] = useState('overview');
  const [search, setSearch] = useState('');
  const [submissions, setSubmissions] = useState(initialSubmissions);
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
  const [sessionMessage, setSessionMessage] = useState('');
  const [discussions, setDiscussions] = useState(initialDiscussions);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'Welcome to the new learning term!', time: 'Posted Oct 10', audience: 'All learners' },
    { id: 2, title: 'Remember to submit your weekly reflection.', time: 'Posted Oct 8', audience: 'Digital Skills learners' },
  ]);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user_data') || '{}'));
  const firstName = user.name?.trim().split(/\s+/)[0] || 'Instructor';
  const currentDate = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  const pendingCount = submissions.filter((submission) => submission.status === 'Needs review').length;
  const flaggedLearners = learners.filter((learner) => learner.progress < 40 || learner.activity !== 'Today');
  const filteredCourses = useMemo(
    () => courses.filter((course) => `${course.title} ${course.category}`.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

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
    setSubmissions((current) => current.map((submission) => (
      submission.id === submissionId
        ? { ...submission, status: 'Reviewed', score, feedback: selectedSubmission.feedback }
        : submission
    )));
    setSelectedSubmission(null);
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
    }, ...current]);
    setSessionTitle('');
    setSessionTime('');
    setSessionLink('');
    setSessionMessage('Session added to this local schedule. No calendar invite was sent.');
  };

  const toggleAttendance = (email) => {
    setAttendance((current) => current.map((record) => (
      record.email === email ? { ...record, status: record.status === 'Present' ? 'Absent' : 'Present' } : record
    )));
  };

  const moderateDiscussion = (discussionId) => {
    setDiscussions((current) => current.map((discussion) => (
      discussion.id === discussionId ? { ...discussion, status: discussion.status === 'Open' ? 'Resolved' : 'Open' } : discussion
    )));
  };

  const courseTitle = (courseId) => courses.find((course) => course.id === courseId)?.title || 'Assigned course';
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
  };
  const handleSectionNavigation = (event) => {
    const link = event.target.closest('a[href^="#"]');
    const target = link?.getAttribute('href')?.slice(1);
    if (!target || !sectionTitles[target]) return;

    event.preventDefault();
    setActiveSection(target);
    if (['overview', 'my-courses', 'assignments', 'learners', 'schedule'].includes(target)) {
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
    }
  };

  const postAnnouncement = (event) => {
    event.preventDefault();
    const title = announcement.trim();
    if (!title) return;
    setAnnouncements((current) => [{ id: Date.now(), title, time: 'Posted just now', audience: 'All learners' }, ...current]);
    setAnnouncement('');
    setShowAnnouncementForm(false);
  };

  return (
    <div className="instructor-dashboard" id="overview" onClick={handleSectionNavigation}>
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
        <a className="instructor-nav-link" href="#announcements" onClick={() => setActiveNav('Announcements')}>
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
          <div className="instructor-breadcrumb"><span>Teaching workspace</span><span className="breadcrumb-divider">/</span><strong>{sectionTitles[activeSection]}</strong></div>
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
                  <p><span />Your next live class is today at 2:00 PM.</p>
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
              <span className="instructor-stat-trend"><Icon name="arrowUp" size={13} /> 1 new</span>
              <p>My courses</p><strong>3</strong><small>Across 3 subject areas</small>
            </article>
            <article className="instructor-stat-card">
              <span className="instructor-stat-icon stat-blue"><Icon name="users" size={19} /></span>
              <span className="instructor-stat-trend"><Icon name="arrowUp" size={13} /> 8.4%</span>
              <p>Enrolled learners</p><strong>194</strong><small>Compared with last month</small>
            </article>
            <article className="instructor-stat-card">
              <span className="instructor-stat-icon stat-amber"><Icon name="clipboard" size={19} /></span>
              <a className={`instructor-stat-trend${pendingCount ? ' trend-attention' : ''}`} href="#assignments">{pendingCount ? 'Action needed' : 'All caught up'}</a>
              <p>To review</p><strong>{pendingCount}</strong><small>Learner submissions</small>
            </article>
            <article className="instructor-stat-card">
              <span className="instructor-stat-icon stat-green"><Icon name="check" size={19} /></span>
              <span className="instructor-stat-trend">This term</span>
              <p>Average completion</p><strong>74%</strong><small>Across your courses</small>
            </article>
          </section>

          <section className="instructor-main-grid" style={{ ...visibleWhen('overview', 'my-courses', 'schedule'), gridTemplateColumns: activeSection === 'overview' ? undefined : 'minmax(0, 1fr)' }}>
            <article className="instructor-panel instructor-courses-panel" id="my-courses" style={visibleWhen('overview', 'my-courses')}>
              <div className="instructor-panel-heading instructor-courses-heading">
                <div><h2>My courses</h2><p>Assigned subjects, course progress, and teaching materials</p></div>
                <label className="instructor-course-search"><Icon name="search" size={16} /><input aria-label="Search my courses" placeholder="Find a course" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
              </div>
              <div className="instructor-course-list">
                {filteredCourses.map((course) => (
                  <article className="instructor-course-card" key={course.id}>
                    <div className={`instructor-course-cover cover-${course.color}`}>{course.initials}</div>
                    <div className="instructor-course-details">
                      <span className="instructor-course-category">Assigned subject · {course.category}</span>
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
                    </div>
                    <a className="instructor-course-action" href="#learners" aria-label={`View learners in ${course.title}`} title="View learners"><Icon name="arrow" size={17} /></a>
                  </article>
                ))}
                {filteredCourses.length === 0 && <p className="instructor-empty-state">No courses match “{search}”. Try another search.</p>}
              </div>
            </article>

            <article className="instructor-panel instructor-sessions-panel" id="schedule" style={visibleWhen('overview', 'schedule')}>
              <div className="instructor-panel-heading">
                <div><h2>Upcoming classes</h2><p>Your next live learning sessions</p></div>
                <a className="instructor-text-link" href="#schedule">Full schedule <Icon name="arrow" size={14} /></a>
              </div>
              <div className="instructor-session-list">
                {sessions.map((session, index) => (
                  <article className={`instructor-session session-${session.color}`} key={session.title}>
                    <div className="instructor-session-date"><strong>{session.day}</strong><span>{session.month}</span></div>
                    <div className="instructor-session-details"><strong>{session.title}</strong><span>{session.course}</span><small><Icon name="clock" size={13} />{session.time}</small></div>
                    {index === 0 && <span className="session-today">TODAY</span>}
                  </article>
                ))}
              </div>
              <div className="session-note"><span className="session-note-dot" /><span>Your next class starts in <strong>2 hours</strong></span></div>
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
            <div className="instructor-table-scroll">
              <table className="instructor-submissions-table">
                <thead><tr><th>LEARNER</th><th>ASSIGNMENT</th><th>COURSE</th><th>SUBMITTED</th><th>SCORE</th><th>STATUS</th><th /></tr></thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td><div className="instructor-learner-cell"><span className={`instructor-learner-avatar avatar-${submission.color}`}>{submission.initials}</span><strong>{submission.learner}</strong></div></td>
                      <td className="instructor-assignment-name">{submission.assignment}</td>
                      <td className="instructor-submission-course">{submission.course}</td>
                      <td className="instructor-submitted-time">{submission.submitted}</td>
                      <td>{submission.score === undefined || submission.score === '' ? '—' : `${submission.score}%`}</td>
                      <td><span className={`submission-status${submission.status === 'Reviewed' ? ' is-reviewed' : ''}`}><i />{submission.status}</span></td>
                      <td><button className={`submission-action${submission.status === 'Reviewed' ? ' is-done' : ''}`} type="button" onClick={() => setSelectedSubmission({ ...submission, readOnly: submission.status === 'Reviewed', score: submission.score ?? '', feedback: submission.feedback ?? '' })}>{submission.status === 'Reviewed' ? 'View' : 'Review'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="instructor-bottom-grid" style={{ ...visibleWhen('overview', 'learners', 'announcements'), gridTemplateColumns: activeSection === 'overview' ? undefined : 'minmax(0, 1fr)' }}>
            <article className="instructor-panel instructor-learners-panel" id="progress-attendance" style={visibleWhen('overview', 'learners', 'progress-attendance')}>
              <div className="instructor-panel-heading" id="learners">
                <div><h2>Student progress &amp; attendance</h2><p>Completion, attendance, and students who may need support</p></div>
                <span className="instructor-review-filter"><span />{flaggedLearners.length} flagged</span>
                <a className="instructor-text-link" href="#learners">View all <Icon name="arrow" size={14} /></a>
              </div>
              <div style={{ display: 'flex', gap: 14, margin: '10px 0', color: '#737d91', fontSize: 9 }}>
                <span>Present today: <strong>{attendance.filter((record) => record.status === 'Present').length} / {attendance.length}</strong></span>
                <span>Needs support: <strong>{flaggedLearners.length}</strong></span>
              </div>
              <div className="instructor-learner-list">
                {learners.map((learner) => (
                  <div className="instructor-learner-row" key={learner.email}>
                    <span className={`instructor-learner-avatar avatar-${learner.color}`}>{learner.initials}</span>
                    <div className="instructor-learner-info"><strong>{learner.name}</strong><span>{learner.course}</span></div>
                    <div className="learner-progress"><div className="instructor-progress-track"><span style={{ width: `${learner.progress}%` }} /></div><small>{learner.progress}%</small></div>
                    <span className="learner-last-active">{learner.activity}</span>
                    <span style={{ color: learner.progress < 40 || learner.activity !== 'Today' ? '#bd863d' : '#398966', fontSize: 8, whiteSpace: 'nowrap' }}>
                      {learner.progress < 40 || learner.activity !== 'Today' ? 'Needs support' : 'On track'}
                    </span>
                    <button type="button" className="submission-action" onClick={() => toggleAttendance(learner.email)} aria-label={`Mark ${learner.name} ${attendance.find((record) => record.email === learner.email)?.status === 'Present' ? 'absent' : 'present'}`}>
                      {attendance.find((record) => record.email === learner.email)?.status || 'Present'}
                    </button>
                  </div>
                ))}
              </div>
              <p style={{ margin: '10px 0 0', color: '#9ba2b1', fontSize: 9 }}>Attendance marks are local to this dashboard session and are not recorded in the school register.</p>
            </article>

            <article className="instructor-panel instructor-announcements-panel" id="announcements" style={visibleWhen('overview', 'announcements')}>
              <div className="instructor-panel-heading">
                <div><h2>Class announcements</h2><p>Keep learners informed and on track</p></div>
                <button className="instructor-icon-add" type="button" aria-label="Create announcement" onClick={() => setShowAnnouncementForm((visible) => !visible)}><Icon name={showAnnouncementForm ? 'close' : 'plus'} size={17} /></button>
              </div>
              {showAnnouncementForm && (
                <form className="announcement-form" onSubmit={postAnnouncement}>
                  <label htmlFor="announcement-message">Announcement for all learners</label>
                  <textarea id="announcement-message" rows="3" maxLength="240" placeholder="Share an update, reminder, or resource…" value={announcement} onChange={(event) => setAnnouncement(event.target.value)} required />
                  <div><span>{announcement.length}/240</span><button type="submit" disabled={!announcement.trim()}><Icon name="send" size={14} /> Post</button></div>
                </form>
              )}
              <div className="announcement-list">
                {announcements.map((item) => (
                  <article className="announcement-item" key={item.id}>
                    <span className="announcement-bullet"><Icon name="send" size={14} /></span>
                    <div><strong>{item.title}</strong><span>{item.audience} · {item.time}</span></div>
                  </article>
                ))}
              </div>
              <a className="instructor-announcement-link" href="#announcements" onClick={() => setShowAnnouncementForm(true)}>Write an announcement <Icon name="arrow" size={14} /></a>
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
                </div>
                <label style={{ display: 'grid', gap: 5, color: '#737d91', fontSize: 10 }}>
                  Meeting link (Zoom / Google Meet)
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
                    <span><strong>{session.title}</strong><small style={{ display: 'block', marginTop: 2, color: '#9ba2b1' }}>{courseTitle(session.courseId)} · {new Date(session.time).toLocaleString()}</small></span>
                    {session.link ? <a className="instructor-text-link" href={session.link} target="_blank" rel="noreferrer">Open meeting <Icon name="arrow" size={12} /></a> : <span style={{ color: '#9ba2b1' }}>Meeting link not set</span>}
                  </div>
                ))}
              </div>
              <p style={{ margin: '10px 0 0', color: '#9ba2b1', fontSize: 9 }}>Drafts are not saved to a calendar and do not send invitations. Meeting links open the provider URL you supplied.</p>
            </article>

            <article className="instructor-panel" style={visibleWhen('overview', 'live-discussions')}>
              <div className="instructor-panel-heading">
                <div><h2>Class discussions</h2><p>Review questions and mark resolved topics</p></div>
                <span className="instructor-review-filter"><span />{discussions.filter((discussion) => discussion.status === 'Open').length} open</span>
              </div>
              <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
                {discussions.map((discussion) => (
                  <article key={discussion.id} style={{ padding: 10, border: '1px solid #eff0f5', borderRadius: 9 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'grid', gap: 4 }}>
                        <strong style={{ color: '#48526a', fontSize: 10 }}>{discussion.author}</strong>
                        <span style={{ color: '#9ba2b1', fontSize: 8 }}>{discussion.course}</span>
                      </div>
                      <span style={{ color: discussion.status === 'Open' ? '#bd863d' : '#398966', fontSize: 8 }}>{discussion.status}</span>
                    </div>
                    <p style={{ margin: '8px 0', color: '#626d82', fontSize: 10 }}>{discussion.message}</p>
                    <button type="button" className="submission-action" onClick={() => moderateDiscussion(discussion.id)}>{discussion.status === 'Open' ? 'Mark resolved' : 'Reopen discussion'}</button>
                  </article>
                ))}
                {discussions.length === 0 && <span style={{ color: '#9ba2b1', fontSize: 9 }}>No discussions to review.</span>}
              </div>
              <p style={{ margin: '10px 0 0', color: '#9ba2b1', fontSize: 9 }}>Discussion items are sample dashboard records; a live class forum is not connected.</p>
            </article>
          </section>

          <footer className="instructor-footer">© {new Date().getFullYear()} TusomeTec Academy <span>Helping every learner move forward.</span></footer>
        </div>
      </main>

      {selectedSubmission && (
        <div className="submission-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedSubmission(null); }}>
          <section className="submission-modal" role="dialog" aria-modal="true" aria-labelledby="submission-modal-title">
            <div className="submission-modal-heading"><div><span className="instructor-eyebrow">LEARNER SUBMISSION</span><h2 id="submission-modal-title">{selectedSubmission.assignment}</h2></div><button className="instructor-icon-add" type="button" aria-label="Close submission" onClick={() => setSelectedSubmission(null)}><Icon name="close" size={17} /></button></div>
            <p className="submission-modal-byline">Submitted by <strong>{selectedSubmission.learner}</strong> in {selectedSubmission.course} · {selectedSubmission.submitted}</p>
            <div className="submission-preview"><span className="submission-file-icon"><Icon name="clipboard" size={20} /></span><div><strong>{selectedSubmission.assignment}.pdf</strong><small>PDF document · learner submission</small></div><span className="submission-file-status"><Icon name="check" size={14} /> Received</span></div>
            <label className="feedback-label" htmlFor="instructor-score">Score (%)</label>
            <input id="instructor-score" type="number" min="0" max="100" value={selectedSubmission.score} disabled={selectedSubmission.readOnly} onChange={(event) => setSelectedSubmission((current) => ({ ...current, score: event.target.value, gradeError: '' }))} style={{ width: 110, minHeight: 34, padding: '0 9px', border: '1px solid #e9ebf1', borderRadius: 7, color: '#46516a' }} />
            {selectedSubmission.gradeError && <p role="alert" style={{ margin: '5px 0 0', color: '#b14e4e', fontSize: 9 }}>{selectedSubmission.gradeError}</p>}
            <label className="feedback-label" htmlFor="instructor-feedback">Feedback notes</label>
            <textarea id="instructor-feedback" className="instructor-feedback" rows="4" placeholder="Add constructive feedback for this learner…" value={selectedSubmission.feedback} onChange={(event) => setSelectedSubmission((current) => ({ ...current, feedback: event.target.value }))} disabled={selectedSubmission.readOnly} />
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
