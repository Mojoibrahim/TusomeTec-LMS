import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentForm from '../../PaymentForm';
import FloatingChatBot from '../../components/FloatingChatBot';
import ProfileEditor from '../../components/ProfileEditor';
import './StudentDashboard.css';

const courses = [
  { title: 'Introduction to UI/UX Design', category: 'Design', progress: 72, color: 'purple', initials: 'UI' },
  { title: 'Web Development Fundamentals', category: 'Development', progress: 48, color: 'blue', initials: 'WD' },
  { title: 'Digital Marketing Essentials', category: 'Marketing', progress: 25, color: 'orange', initials: 'DM' },
];

const schedule = [
  { day: '14', month: 'OCT', title: 'Design principles workshop', time: 'Today · 2:00 PM', color: 'purple' },
  { day: '16', month: 'OCT', title: 'HTML & CSS live session', time: 'Thu · 10:30 AM', color: 'blue' },
  { day: '18', month: 'OCT', title: 'Marketing quiz deadline', time: 'Sat · 11:59 PM', color: 'orange' },
];

const navigation = [
  { label: 'Dashboard', icon: 'home' },
  { label: 'My courses', icon: 'book' },
  { label: 'Explore courses', icon: 'search' },
  { label: 'Class sessions', icon: 'calendar' },
  { label: 'Learning materials', icon: 'book' },
  { label: 'Submissions', icon: 'upload' },
  { label: 'Grades & feedback', icon: 'chart' },
  { label: 'Notifications & messages', icon: 'bell' },
  { label: 'Group', icon: 'people' },
  { label: 'Payment', icon: 'payment' },
  { label: 'Certificates', icon: 'certificate' },
];

const exploreCourses = [
  ...courses,
  { title: 'English Communication Skills', category: 'Languages', progress: 0, color: 'green', initials: 'EN' },
  { title: 'Data Literacy for Everyone', category: 'Technology', progress: 0, color: 'blue', initials: 'DL' },
  { title: 'Project Management Basics', category: 'Business', progress: 0, color: 'orange', initials: 'PM' },
];

const assignments = [
  { id: 'design', title: 'Design principles reflection', course: 'Introduction to UI/UX Design', due: 'Due Oct 18' },
  { id: 'web', title: 'Build a responsive landing page', course: 'Web Development Fundamentals', due: 'Due Oct 21' },
  { id: 'marketing', title: 'Campaign audience analysis', course: 'Digital Marketing Essentials', due: 'Due Oct 24' },
];

const learningMaterials = [
  { id: 'ui-notes', course: courses[0].title, title: 'Design principles study notes', type: 'Downloadable notes', content: 'UI/UX Design — Study Notes\n\nVisual hierarchy: use size, contrast, spacing, and placement to show the order of importance.\n\nConsistency: reuse familiar patterns, labels, and controls so learners can predict how an interface behaves.\n\nAccessibility: provide readable contrast, descriptive labels, keyboard access, and clear feedback for actions.\n\nUser testing: observe representative users completing tasks, note where they hesitate, then improve the design.' },
  { id: 'web-module', course: courses[1].title, title: 'HTML & CSS offline module', type: 'Offline-compatible module', content: 'Web Development — Offline Module\n\nHTML gives a page its structure. Use semantic elements such as header, main, nav, section, and footer.\n\nCSS controls presentation. The box model consists of content, padding, border, and margin.\n\nResponsive layouts use flexible widths, grid or flexbox, and breakpoints to adapt to different screens.\n\nPractice: create a semantic page, add a stylesheet, and test it at narrow and wide viewport sizes.' },
  { id: 'marketing-video', course: courses[2].title, title: 'Campaign planning recorded lesson', type: 'Recorded video', unavailable: true },
];

const quiz = {
  id: 'design-principles-quiz',
  title: 'Design principles quick quiz',
  course: courses[0].title,
  question: 'Which practice best supports a clear visual hierarchy?',
  options: ['Use size and contrast to emphasize important content', 'Give every element the same visual weight', 'Remove headings and spacing'],
  answer: 'Use size and contrast to emphasize important content',
};

const studentMessages = [
  { id: 'teacher-design', sender: 'Ms. Wanjiku · Instructor', subject: 'Design workshop resources', message: 'Please review the study notes before the next design principles workshop.', type: 'Teacher message' },
  { id: 'school-term', sender: 'TusomeTec Academy', subject: 'Learning term reminder', message: 'Check your upcoming deadlines and class schedule for this week.', type: 'Institution announcement' },
  { id: 'submission-alert', sender: 'System alert', subject: 'Assignment submission', message: 'Your submitted work will appear in Submissions while it is awaiting review.', type: 'System alert' },
];

const studyGroups = [
  { id: 'design-circle', name: 'Design thinking circle', topic: 'UI/UX Design', members: 18, color: 'purple' },
  { id: 'web-builders', name: 'Frontend builders', topic: 'Web Development', members: 24, color: 'blue' },
  { id: 'marketing-lab', name: 'Marketing study lab', topic: 'Digital Marketing', members: 12, color: 'orange' },
];

function Icon({ name, size = 20 }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" /><path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 5-6" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    upload: <><path d="M12 16V4m-4 4 4-4 4 4" /><path d="M20 16.5v2A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-2" /></>,
    people: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    payment: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M7 15h3" /></>,
    certificate: <><circle cx="12" cy="8" r="6" /><path d="m8.2 13-1.1 8L12 18l4.9 3-1.1-8" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    play: <path d="m9 6 10 6-10 6z" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function TestDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user_data') || '{}'));
  const [enrolledCourses, setEnrolledCourses] = useState(courses.map((course) => course.title));
  const [sessionReminders, setSessionReminders] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [submittedAssignments, setSubmittedAssignments] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(courses[0].title);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizFeedback, setQuizFeedback] = useState('');
  const [quizScore, setQuizScore] = useState(null);
  const [readMessages, setReadMessages] = useState([]);
  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleEnrollment = (title) => {
    setEnrolledCourses((current) => (
      current.includes(title)
        ? current.filter((courseTitle) => courseTitle !== title)
        : [...current, title]
    ));
  };

  const toggleSessionReminder = (title) => {
    setSessionReminders((current) => (
      current.includes(title)
        ? current.filter((sessionTitle) => sessionTitle !== title)
        : [...current, title]
    ));
  };

  const submitAssignment = (assignmentId) => {
    if (!selectedFiles[assignmentId]) return;
    setSubmittedAssignments((current) => (
      current.includes(assignmentId) ? current : [...current, assignmentId]
    ));
  };

  const downloadMaterial = (material) => {
    const file = new Blob([material.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${material.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const submitQuiz = (event) => {
    event.preventDefault();
    if (!quizAnswer) {
      setQuizFeedback('Choose an answer before checking your result.');
      return;
    }
    const score = quizAnswer === quiz.answer ? 100 : 0;
    setQuizScore(score);
    setQuizFeedback(score === 100
      ? 'Correct. Size and contrast help guide attention to important content.'
      : 'Not quite. Visual hierarchy uses cues such as size and contrast to guide attention.');
  };

  const openCourse = (title) => {
    setSelectedCourse(title);
    setActiveSection('Learning materials');
  };

  const toggleMessageRead = (messageId) => {
    setReadMessages((current) => (
      current.includes(messageId)
        ? current.filter((id) => id !== messageId)
        : [...current, messageId]
    ));
  };

  const renderSection = () => {
    if (activeSection === 'My courses') {
      const enrolled = courses.filter((course) => enrolledCourses.includes(course.title));
      return (
        <section className="section-page">
          <div className="section-intro">
            <span className="eyebrow">YOUR ACTIVE LEARNING</span>
            <h1>My courses</h1>
            <p>Pick up where you left off, review your progress, or open course materials.</p>
          </div>
          {enrolled.length ? (
            <div className="section-card-grid">
              {enrolled.map((course) => (
                <article className="section-card enrolled-course-card" key={course.title}>
                  <div className={`course-cover ${course.color}`}><span>{course.initials}</span></div>
                  <span className="course-category">{course.category}</span>
                  <h2>{course.title}</h2>
                  <div className="course-progress-label"><span>{course.progress}% complete</span><span>{Math.ceil((100 - course.progress) / 10)} lessons left</span></div>
                  <div className="progress-track"><span className={course.color} style={{ width: `${course.progress}%` }} /></div>
                  <button className="action-button" onClick={() => openCourse(course.title)} type="button">Quick resume</button>
                  <button className="text-link" onClick={() => { setSelectedCourse(course.title); setActiveSection('Learning materials'); }} type="button">View learning materials <Icon name="arrow" size={14} /></button>
                </article>
              ))}
            </div>
          ) : <div className="panel section-empty"><p>You are not enrolled in any courses yet.</p><button className="action-button" onClick={() => setActiveSection('Explore courses')} type="button">Explore courses</button></div>}
        </section>
      );
    }

    if (activeSection === 'Explore courses') {
      return (
        <section className="section-page">
          <div className="section-intro">
            <span className="eyebrow">FIND YOUR NEXT SKILL</span>
            <h1>Explore courses</h1>
            <p>Browse learning paths and manage your course enrolments.</p>
          </div>
          <div className="section-card-grid">
            {exploreCourses.map((course) => {
              const isEnrolled = enrolledCourses.includes(course.title);
              return (
                <article className="section-card explore-card" key={course.title}>
                  <div className={`course-cover ${course.color}`}><span>{course.initials}</span></div>
                  <span className="course-category">{course.category}</span>
                  <h2>{course.title}</h2>
                  <p>{isEnrolled ? `${course.progress}% complete · Continue learning at your own pace.` : 'A practical course with guided lessons and activities.'}</p>
                  <button className={`action-button${isEnrolled ? ' secondary' : ''}`} onClick={() => toggleEnrollment(course.title)} type="button">
                    {isEnrolled ? 'Enrolled · Remove' : 'Enroll now'}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      );
    }

    if (activeSection === 'Class sessions') {
      return (
        <section className="section-page">
          <div className="section-intro">
            <span className="eyebrow">YOUR LEARNING CALENDAR</span>
            <h1>Upcoming deadlines &amp; classes</h1>
            <p>Keep assignment due dates and live lecture reminders together in one timeline.</p>
          </div>
          <div className="panel section-list-panel">
            <h2 className="timeline-heading">Live classes</h2>
            {schedule.map((item) => {
              const hasReminder = sessionReminders.includes(item.title);
              return (
                <article className="section-list-item" key={item.title}>
                  <div className={`date-tile ${item.color}`}><strong>{item.day}</strong><span>{item.month}</span></div>
                  <div className="section-list-info">
                    <h2>{item.title}</h2>
                    <p><Icon name="clock" size={14} /> {item.time}</p>
                  </div>
                  <button className={`action-button${hasReminder ? ' secondary' : ''}`} onClick={() => toggleSessionReminder(item.title)} type="button">
                    {hasReminder ? 'Reminder set' : 'Remind me'}
                  </button>
                </article>
              );
            })}
            <h2 className="timeline-heading">Assignment deadlines</h2>
            {assignments.map((assignment) => (
              <article className="section-list-item deadline-item" key={assignment.id}>
                <div className="deadline-marker"><Icon name="upload" size={17} /></div>
                <div className="section-list-info">
                  <h2>{assignment.title}</h2>
                  <p>{assignment.course} · {assignment.due}</p>
                </div>
                <button className="action-button secondary" onClick={() => setActiveSection('Submissions')} type="button">Open submission</button>
              </article>
            ))}
          </div>
        </section>
      );
    }

    if (activeSection === 'Learning materials') {
      const courseMaterials = learningMaterials.filter((material) => material.course === selectedCourse);
      return (
        <section className="section-page">
          <div className="section-intro">
            <span className="eyebrow">STUDY ANYWHERE</span>
            <h1>Learning materials</h1>
            <p>Download notes and offline modules for low-connectivity study. Select an enrolled course.</p>
          </div>
          <label className="material-course-select">Course
            <select value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)}>
              {courses.filter((course) => enrolledCourses.includes(course.title)).map((course) => <option key={course.title}>{course.title}</option>)}
            </select>
          </label>
          <div className="panel section-list-panel">
            {courseMaterials.map((material) => (
              <article className="section-list-item material-item" key={material.id}>
                <div className="stat-icon stat-purple"><Icon name={material.unavailable ? 'play' : 'book'} size={19} /></div>
                <div className="section-list-info">
                  <h2>{material.title}</h2>
                  <p>{material.type} · {material.unavailable ? 'Not available yet' : 'Available offline after download'}</p>
                </div>
                {material.unavailable
                  ? <span className="material-unavailable">Recording unavailable</span>
                  : <button className="action-button" type="button" onClick={() => downloadMaterial(material)}>Download for offline</button>}
              </article>
            ))}
            {!courseMaterials.length && <p className="section-empty">No materials are listed for this course yet.</p>}
          </div>
          <p className="demo-note">Downloads are text study resources for this dashboard preview. Video recordings and course-server materials are not connected.</p>
        </section>
      );
    }

    if (activeSection === 'Submissions') {
      return (
        <section className="section-page">
          <div className="section-intro">
            <span className="eyebrow">YOUR COURSEWORK</span>
            <h1>Quiz &amp; assignment portal</h1>
            <p>Complete a practice quiz, then upload completed homework for review.</p>
          </div>
          <article className="panel quiz-panel">
            <div className="panel-heading">
              <div><h2>{quiz.title}</h2><p>{quiz.course} · Practice quiz · No time limit</p></div>
              {quizScore !== null && <strong className={`quiz-score${quizScore === 100 ? ' is-correct' : ''}`}>{quizScore}%</strong>}
            </div>
            <form onSubmit={submitQuiz}>
              <fieldset className="quiz-question">
                <legend>{quiz.question}</legend>
                {quiz.options.map((option) => (
                  <label className="quiz-option" key={option}>
                    <input type="radio" name="practice-quiz" value={option} checked={quizAnswer === option} onChange={(event) => setQuizAnswer(event.target.value)} />
                    <span>{option}</span>
                  </label>
                ))}
              </fieldset>
              <button className="action-button" type="submit">Check answer</button>
              {quizFeedback && <p className={`quiz-feedback${quizScore === 100 ? ' is-correct' : ''}`} role="status">{quizFeedback}</p>}
            </form>
          </article>
          <div className="panel section-list-panel">
            <h2 className="timeline-heading">Assignment dropbox</h2>
            {assignments.map((assignment) => {
              const isSubmitted = submittedAssignments.includes(assignment.id);
              const file = selectedFiles[assignment.id];
              return (
                <article className="submission-item" key={assignment.id}>
                  <div className={`stat-icon ${isSubmitted ? 'stat-green' : 'stat-purple'}`}><Icon name={isSubmitted ? 'check' : 'upload'} size={19} /></div>
                  <div className="section-list-info">
                    <h2>{assignment.title}</h2>
                    <p>{assignment.course} · {assignment.due}</p>
                    {file && <span className="selected-file">{file.name}</span>}
                  </div>
                  <label className="file-picker">
                    {file ? 'Change file' : 'Choose file'}
                    <input
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                      onChange={(event) => {
                        const selectedFile = event.target.files?.[0];
                        if (selectedFile) {
                          setSelectedFiles((current) => ({ ...current, [assignment.id]: selectedFile }));
                        }
                      }}
                      type="file"
                    />
                  </label>
                  <button className="action-button" disabled={!file || isSubmitted} onClick={() => submitAssignment(assignment.id)} type="button">
                    {isSubmitted ? 'Submitted' : 'Submit'}
                  </button>
                </article>
              );
            })}
          </div>
          <p className="demo-note">Homework submissions are recorded in this dashboard preview only and are not uploaded to a course server. Quiz feedback is immediate practice feedback.</p>
        </section>
      );
    }

    if (activeSection === 'Grades & feedback') {
      return (
        <section className="section-page">
          <div className="section-intro">
            <span className="eyebrow">YOUR LEARNING RECORD</span>
            <h1>Grades &amp; feedback</h1>
            <p>Review practice results, assignment status, instructor feedback, and certificates.</p>
          </div>
          <div className="grade-summary-grid">
            <article className="panel grade-summary-card"><span>Practice quiz score</span><strong>{quizScore === null ? 'Not taken' : `${quizScore}%`}</strong><button className="text-link" onClick={() => setActiveSection('Submissions')} type="button">Open quiz <Icon name="arrow" size={14} /></button></article>
            <article className="panel grade-summary-card"><span>Assignments submitted</span><strong>{submittedAssignments.length} / {assignments.length}</strong><button className="text-link" onClick={() => setActiveSection('Submissions')} type="button">Open submissions <Icon name="arrow" size={14} /></button></article>
          </div>
          <div className="panel section-list-panel grade-list">
            {assignments.map((assignment) => {
              const submitted = submittedAssignments.includes(assignment.id);
              return (
                <article className="section-list-item" key={assignment.id}>
                  <div className={`stat-icon ${submitted ? 'stat-green' : 'stat-purple'}`}><Icon name={submitted ? 'check' : 'upload'} size={18} /></div>
                  <div className="section-list-info"><h2>{assignment.title}</h2><p>{assignment.course} · {submitted ? 'Submitted · awaiting instructor feedback' : 'Not submitted'}</p></div>
                  <span className={`grade-status${submitted ? ' is-submitted' : ''}`}>{submitted ? 'Awaiting review' : 'Not submitted'}</span>
                </article>
              );
            })}
          </div>
          {quizScore !== null && <div className="panel feedback-record"><strong>Practice quiz feedback</strong><p>{quizFeedback}</p></div>}
          <div className="panel feedback-record">
            <strong>Digital certificates</strong>
            <p>Certificates are issued after course completion. None are available yet.</p>
            <button className="text-link" onClick={() => setActiveSection('Certificates')} type="button">View certificates <Icon name="arrow" size={14} /></button>
          </div>
          <p className="demo-note">Official course grades and instructor comments appear here when connected to the learning records service.</p>
        </section>
      );
    }

    if (activeSection === 'Notifications & messages') {
      const unreadCount = studentMessages.filter((message) => !readMessages.includes(message.id)).length;
      return (
        <section className="section-page">
          <div className="section-intro">
            <span className="eyebrow">STAY IN THE LOOP</span>
            <h1>Notifications &amp; messages</h1>
            <p>{unreadCount} unread update{unreadCount === 1 ? '' : 's'} from teachers, your institution, and the system.</p>
          </div>
          <div className="panel section-list-panel">
            {studentMessages.map((message) => {
              const isRead = readMessages.includes(message.id);
              return (
                <article className={`message-item${isRead ? ' is-read' : ''}`} key={message.id}>
                  <div className="message-indicator"><Icon name={message.type === 'System alert' ? 'bell' : 'people'} size={18} /></div>
                  <div className="message-content">
                    <div className="message-meta"><span>{message.type}</span><span>{isRead ? 'Read' : 'New'}</span></div>
                    <h2>{message.subject}</h2>
                    <p>{message.message}</p>
                    <small>{message.sender}</small>
                  </div>
                  <button className="action-button secondary" onClick={() => toggleMessageRead(message.id)} type="button">{isRead ? 'Mark unread' : 'Mark read'}</button>
                </article>
              );
            })}
          </div>
          <p className="demo-note">These sample inbox messages are stored in this dashboard preview; live direct messaging and alerts are not connected.</p>
        </section>
      );
    }

    if (activeSection === 'Group') {
      return (
        <section className="section-page">
          <div className="section-intro">
            <span className="eyebrow">LEARN WITH YOUR PEERS</span>
            <h1>Study groups</h1>
            <p>Join a group to connect with other learners in your courses.</p>
          </div>
          <div className="section-card-grid">
            {studyGroups.map((group) => {
              const isJoined = joinedGroups.includes(group.id);
              return (
                <article className="section-card group-card" key={group.id}>
                  <div className={`group-avatar ${group.color}`}><Icon name="people" size={22} /></div>
                  <span className="course-category">{group.topic}</span>
                  <h2>{group.name}</h2>
                  <p>{group.members + (isJoined ? 1 : 0)} learners sharing ideas and helping each other progress.</p>
                  <button
                    className={`action-button${isJoined ? ' secondary' : ''}`}
                    onClick={() => setJoinedGroups((current) => (
                      isJoined ? current.filter((groupId) => groupId !== group.id) : [...current, group.id]
                    ))}
                    type="button"
                  >
                    {isJoined ? 'Joined · Leave group' : 'Join group'}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      );
    }

    if (activeSection === 'Payment') {
      return (
        <section className="section-page">
          <div className="section-intro">
            <span className="eyebrow">SECURE CHECKOUT</span>
            <h1>Payment</h1>
            <p>Use the M-Pesa payment form to initiate a payment.</p>
          </div>
          <div className="panel payment-panel">
            <div className="payment-heading">
              <span className="stat-icon stat-green"><Icon name="payment" size={20} /></span>
              <div><h2>M-Pesa payment</h2><p>Your payment request will be sent to your phone.</p></div>
            </div>
            <PaymentForm />
          </div>
        </section>
      );
    }

    if (activeSection === 'Certificates') {
      return (
        <section className="section-page">
          <div className="section-intro">
            <span className="eyebrow">CELEBRATE YOUR PROGRESS</span>
            <h1>Certificates</h1>
            <p>Complete a course to earn a certificate of achievement.</p>
          </div>
          <div className="panel certificates-panel">
            <span className="certificate-placeholder"><Icon name="certificate" size={28} /></span>
            <h2>Your certificates will appear here</h2>
            <p>Finish all lessons in a course to unlock its certificate. Your current courses are still in progress.</p>
            <button className="action-button" onClick={() => setActiveSection('Explore courses')} type="button">View my courses</button>
          </div>
        </section>
      );
    }

    return null;
  };

  return (
    <div className="student-dashboard" id="overview">
      <aside className="dashboard-sidebar">
        <a className="dashboard-brand" href="#overview" aria-label="Tusome home">
          <span className="brand-mark">t</span>
          <span>Tusome<span className="brand-accent">Tec</span></span>
        </a>

        <div className="sidebar-label">LEARNING SPACE</div>
        <nav className="dashboard-nav" aria-label="Student dashboard">
          {navigation.map((item) => (
            <button
              aria-current={activeSection === item.label ? 'page' : undefined}
              className={`dashboard-nav-link${activeSection === item.label ? ' is-active' : ''}`}
              key={item.label}
              onClick={() => setActiveSection(item.label)}
              type="button"
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.label === 'Explore courses' && <span className="nav-count">{exploreCourses.length}</span>}
              {item.label === 'Submissions' && <span className="nav-count">{assignments.length - submittedAssignments.length}</span>}
              {item.label === 'Notifications & messages' && <span className="nav-count">{studentMessages.filter((message) => !readMessages.includes(message.id)).length}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-help">
          <div className="help-icon">?</div>
          <strong>Need a hand?</strong>
          <p>Our learning team is here to help you.</p>
          <a href="mailto:support@tusometec.com">Get support <Icon name="arrow" size={15} /></a>
        </div>

        <button className="sidebar-logout" onClick={handleLogout} type="button">
          <Icon name="logout" size={19} />
          <span>Log out</span>
        </button>
      </aside>
      <FloatingChatBot courseCount={enrolledCourses.length} />

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="mobile-brand">
            <span className="brand-mark">t</span>
            <span>Tusome<span className="brand-accent">Tec</span></span>
          </div>
          <div className="dashboard-search">
            <Icon name="search" size={18} />
            <input aria-label="Search courses" placeholder="Search courses, lessons..." />
            <kbd>⌘ K</kbd>
          </div>
          <div className="topbar-actions">
            <button className="icon-button notification-button" type="button" aria-label="Notifications">
              <Icon name="bell" size={20} />
              <span className="notification-dot" />
            </button>
            <div className="topbar-divider" />
            <ProfileEditor
              avatarClassName="avatar"
              className="profile-button"
              copyClassName="profile-name"
              onUpdated={setUser}
              roleLabel="Student"
              user={user}
            />
          </div>
        </header>

        <nav className="dashboard-mobile-nav" aria-label="Student dashboard sections">
          {navigation.map((item) => (
            <button
              aria-current={activeSection === item.label ? 'page' : undefined}
              className={`dashboard-mobile-nav-link${activeSection === item.label ? ' is-active' : ''}`}
              key={item.label}
              onClick={() => setActiveSection(item.label)}
              type="button"
            >
              <Icon name={item.icon} size={17} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="dashboard-content">
          {activeSection !== 'Dashboard' ? (
            <>
              {renderSection()}
              <footer className="dashboard-footer">© 2026 TusomeTec <span>Made for curious minds.</span></footer>
            </>
          ) : (
            <>
          <section className="welcome-banner">
            <div className="welcome-copy">
              <span className="eyebrow">TUESDAY, OCTOBER 14, 2026</span>
              <h1>Good morning, Alex <span aria-hidden="true">✦</span></h1>
              <p>You’re making great progress. Keep up the momentum!</p>
              <button className="welcome-link" onClick={() => setActiveSection('My courses')} type="button">Continue learning <Icon name="arrow" size={17} /></button>
            </div>
            <div className="welcome-art" aria-hidden="true">
              <div className="art-sun" />
              <div className="art-book art-book-back" />
              <div className="art-book art-book-front"><span /><span /><span /></div>
              <div className="art-sparkle sparkle-one">✦</div>
              <div className="art-sparkle sparkle-two">✧</div>
            </div>
          </section>

          <section className="stats-grid" aria-label="Learning summary">
            <article className="stat-card">
              <span className="stat-icon stat-purple"><Icon name="book" size={19} /></span>
              <div><span className="stat-label">Enrolled courses</span><strong>3</strong><span className="stat-note">Keep exploring</span></div>
            </article>
            <article className="stat-card">
              <span className="stat-icon stat-blue"><Icon name="clock" size={19} /></span>
              <div><span className="stat-label">Learning hours</span><strong>24.5 <small>hrs</small></strong><span className="stat-note"><b>+3.5 hrs</b> this week</span></div>
            </article>
            <article className="stat-card">
              <span className="stat-icon stat-green"><Icon name="check" size={19} /></span>
              <div><span className="stat-label">Lessons completed</span><strong>18</strong><span className="stat-note"><b>4 lessons</b> this week</span></div>
            </article>
            <article className="stat-card">
              <span className="stat-icon stat-orange">✦</span>
              <div><span className="stat-label">Day streak</span><strong>5 <small>days</small></strong><span className="stat-note">You’re on a roll!</span></div>
            </article>
          </section>

          <div className="dashboard-columns">
            <section className="panel courses-panel" id="courses">
              <div className="panel-heading">
                <div><h2>My courses</h2><p>Pick up right where you left off.</p></div>
                <button onClick={() => setActiveSection('My courses')} className="text-link" type="button">View all <Icon name="arrow" size={16} /></button>
              </div>
              <div className="course-list">
                {courses.map((course) => (
                  <article className="course-card" key={course.title}>
                    <div className={`course-cover ${course.color}`}><span>{course.initials}</span></div>
                    <div className="course-info">
                      <span className="course-category">{course.category}</span>
                      <h3>{course.title}</h3>
                      <div className="course-progress-label"><span>{course.progress}% complete</span><span>{Math.ceil((100 - course.progress) / 10)} lessons left</span></div>
                      <div className="progress-track"><span className={course.color} style={{ width: `${course.progress}%` }} /></div>
                    </div>
                    <button className="course-play" onClick={() => openCourse(course.title)} type="button" aria-label={`Continue ${course.title}`}><Icon name="play" size={18} /></button>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel schedule-panel" id="schedule">
              <div className="panel-heading">
                <div><h2>Coming up</h2><p>Don’t miss your next learning moment.</p></div>
                <button className="calendar-link" onClick={() => setActiveSection('Class sessions')} type="button" aria-label="Open learning calendar"><Icon name="calendar" size={18} /></button>
              </div>
              <div className="schedule-list">
                {schedule.map((item) => (
                  <article className="schedule-item" key={item.title}>
                    <div className={`date-tile ${item.color}`}><strong>{item.day}</strong><span>{item.month}</span></div>
                    <div className="schedule-info"><h3>{item.title}</h3><span><Icon name="clock" size={14} />{item.time}</span></div>
                  </article>
                ))}
              </div>
              <button onClick={() => setActiveSection('Class sessions')} className="schedule-footer" type="button">Open my schedule <Icon name="arrow" size={16} /></button>
            </section>
          </div>

          <section className="weekly-progress panel" id="progress">
            <div>
              <span className="eyebrow">YOUR WEEKLY ACTIVITY</span>
              <h2>A little progress every day adds up.</h2>
              <p>You’ve studied <strong>6.5 hours</strong> this week. Your weekly goal is 8 hours.</p>
            </div>
            <div className="weekly-chart" aria-label="Study hours by day: Monday 1.5, Tuesday 2, Wednesday 1, Thursday 0.5, Friday 1, Saturday 0.5, Sunday 0">
              {[{ day: 'Mon', height: 57 }, { day: 'Tue', height: 76 }, { day: 'Wed', height: 44 }, { day: 'Thu', height: 29 }, { day: 'Fri', height: 44 }, { day: 'Sat', height: 29 }, { day: 'Sun', height: 12 }].map((item) => (
                <div className="chart-day" key={item.day}>
                  <div className="chart-bar"><span style={{ height: `${item.height}%` }} /></div>
                  <span>{item.day}</span>
                </div>
              ))}
            </div>
          </section>
          <footer className="dashboard-footer">© 2026 TusomeTec <span>Made for curious minds.</span></footer>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default TestDashboard;
