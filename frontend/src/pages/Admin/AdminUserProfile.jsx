import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './AdminDashboard.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function formatDate(value) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not recorded'
    : new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(date);
}

function formatCourses(value) {
  if (!Array.isArray(value)) return value || 'Not recorded';
  const courses = value.map((course) => (
    typeof course === 'string' ? course : course?.name || course?.title || course?.courseName
  )).filter(Boolean);
  return courses.length ? courses.join(', ') : 'Not recorded';
}

function AdminUserProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    axios.get(`${BACKEND_URL}/api/auth/admin/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` },
      signal: controller.signal,
    })
      .then(({ data }) => {
        if (!Array.isArray(data)) throw new Error('The user directory response was not a list.');
        const foundProfile = data.find((record) => String(record._id || record.id || record.email) === userId);
        if (!foundProfile) {
          setError('This profile could not be found.');
          return;
        }
        setProfile(foundProfile);
      })
      .catch((requestError) => {
        if (!axios.isCancel(requestError)) {
          setError(requestError.response?.data?.message || requestError.message || 'Could not load this profile.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [userId]);

  const profileFields = profile?.role?.toLowerCase() === 'student'
    ? [
      ['Email', profile.email || 'Not recorded'],
      ['Role', 'Learner'],
      ['Courses', formatCourses(profile.enrolledCourses)],
      ['Class', profile.className || 'Not recorded'],
      ['Enrollment date', formatDate(profile.enrollmentDate)],
      ['Registered', formatDate(profile.createdAt)],
    ]
    : [
      ['Email', profile?.email || 'Not recorded'],
      ['Role', 'Instructor'],
      ['Department', profile?.department || 'Not assigned'],
      ['Registered', formatDate(profile?.createdAt)],
    ];

  return (
    <div className="admin-dashboard">
      <main className="admin-main">
        <header className="admin-topbar">
          <Link className="text-link" to="/admin/dashboard">Back to directory</Link>
          <strong>User profile</strong>
        </header>
        <div className="admin-content">
          {isLoading && <p className="directory-message" role="status">Loading profile…</p>}
          {!isLoading && error && <p className="form-feedback directory-error" role="alert">{error}</p>}
          {!isLoading && profile && (
            <article className="panel management-panel">
              <div className="user-profile-heading">
                {profile.profilePicture
                  ? <img alt="" className="user-profile-avatar" src={profile.profilePicture} />
                  : <span aria-hidden="true" className="user-profile-avatar user-profile-initial">{(profile.name || '?').charAt(0).toUpperCase()}</span>}
                <div>
                  <h1>{profile.name || 'Name not provided'}</h1>
                  <p>{profile.email || 'Email not provided'}</p>
                </div>
              </div>
              <dl className="user-profile-fields">
                {profileFields.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminUserProfile;
