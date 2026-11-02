import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import './ProfileEditor.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const MAX_PROFILE_PICTURE_SIZE = 3 * 1024 * 1024;
const PROFILE_PICTURE_DIMENSION = 500;

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not read this image.'));
    image.src = source;
  });
}

async function createCroppedPicture(selectedPicture, cropX, cropY, zoom) {
  const image = await loadImage(selectedPicture.source);
  const baseSize = Math.min(image.naturalWidth, image.naturalHeight);
  const cropSize = baseSize / zoom;
  const sourceX = (image.naturalWidth - cropSize) * cropX / 100;
  const sourceY = (image.naturalHeight - cropSize) * cropY / 100;
  const canvas = document.createElement('canvas');
  canvas.width = PROFILE_PICTURE_DIMENSION;
  canvas.height = PROFILE_PICTURE_DIMENSION;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not prepare the profile picture.');
  context.drawImage(
    image,
    sourceX,
    sourceY,
    cropSize,
    cropSize,
    0,
    0,
    PROFILE_PICTURE_DIMENSION,
    PROFILE_PICTURE_DIMENSION,
  );

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error('Could not prepare the profile picture.'));
    }, 'image/jpeg', 0.9);
  });
  return new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });
}

function getCropPreviewStyle(selectedPicture, cropX, cropY, zoom) {
  const cropSize = Math.min(selectedPicture.width, selectedPicture.height) / zoom;
  const scale = 180 / cropSize;
  return {
    height: `${selectedPicture.height * scale}px`,
    left: `${-((selectedPicture.width - cropSize) * cropX / 100) * scale}px`,
    top: `${-((selectedPicture.height - cropSize) * cropY / 100) * scale}px`,
    width: `${selectedPicture.width * scale}px`,
  };
}

const studentProfileSections = [
  {
    title: 'Personal details',
    fields: [
      { name: 'firstName', label: 'First name', autoComplete: 'given-name' },
      { name: 'secondName', label: 'Second name' },
      { name: 'lastName', label: 'Last name', autoComplete: 'family-name' },
      { name: 'preferredName', label: 'Preferred name', autoComplete: 'nickname' },
      { name: 'dateOfBirth', label: 'Date of birth', type: 'date' },
      { name: 'gender', label: 'Gender', autoComplete: 'sex' },
      { name: 'countryOfOrigin', label: 'Country of origin', autoComplete: 'country-name' },
    ],
  },
  {
    title: 'Address information',
    fields: [
      { name: 'countryOfResidence', label: 'Country of residence', autoComplete: 'country-name' },
      { name: 'streetOfResidence', label: 'Street of residence', autoComplete: 'street-address' },
      { name: 'countyOfResidence', label: 'County of residence' },
      { name: 'postalCode', label: 'Zip/Postal code', autoComplete: 'postal-code' },
    ],
  },
  {
    title: 'Contact information',
    fields: [
      { name: 'email', label: 'Primary email address', type: 'email', autoComplete: 'email', required: true },
      { name: 'phoneNumber', label: 'Phone number', type: 'tel', autoComplete: 'tel' },
    ],
  },
];

function getStudentDetails(user) {
  const nameParts = (user.name || '').trim().split(/\s+/).filter(Boolean);
  const dateOfBirth = user.dateOfBirth ? new Date(user.dateOfBirth) : null;
  return {
    firstName: user.firstName ?? nameParts[0] ?? '',
    secondName: user.secondName ?? (nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : ''),
    lastName: user.lastName ?? (nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''),
    preferredName: user.preferredName || '',
    dateOfBirth: dateOfBirth && !Number.isNaN(dateOfBirth.getTime()) ? dateOfBirth.toISOString().slice(0, 10) : '',
    gender: user.gender || '',
    countryOfOrigin: user.countryOfOrigin || '',
    countryOfResidence: user.countryOfResidence || '',
    streetOfResidence: user.streetOfResidence || '',
    countyOfResidence: user.countyOfResidence || '',
    postalCode: user.postalCode || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
  };
}

function ProfileEditor({ user, onUpdated, className, avatarClassName, copyClassName, roleLabel, showChevron = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [department, setDepartment] = useState(user.department || 'Unassigned');
  const [studentDetails, setStudentDetails] = useState(() => getStudentDetails(user));
  const [selectedPicture, setSelectedPicture] = useState(null);
  const [picturePreview, setPicturePreview] = useState(user.profilePicture || '');
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => () => {
    if (picturePreview.startsWith('blob:')) URL.revokeObjectURL(picturePreview);
  }, [picturePreview]);

  const openEditor = () => {
    setName(user.name || roleLabel);
    setDepartment(user.department || 'Unassigned');
    setStudentDetails(getStudentDetails(user));
    setSelectedPicture(null);
    setPicturePreview(user.profilePicture || '');
    setCropX(50);
    setCropY(50);
    setZoom(1);
    setError('');
    setIsOpen(true);
  };

  const selectPicture = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPEG, PNG, or WebP image.');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_PROFILE_PICTURE_SIZE) {
      setError('Profile pictures must be 3 MB or smaller.');
      event.target.value = '';
      return;
    }

    const source = URL.createObjectURL(file);
    try {
      const image = await loadImage(source);
      setError('');
      setSelectedPicture({ file, source, width: image.naturalWidth, height: image.naturalHeight });
      setPicturePreview(source);
      setCropX(50);
      setCropY(50);
      setZoom(1);
    } catch (imageError) {
      URL.revokeObjectURL(source);
      setError(imageError.message);
      event.target.value = '';
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);

    const formData = new FormData();
    if (user.role?.toLowerCase() === 'student') {
      Object.entries(studentDetails).forEach(([field, value]) => formData.append(field, value));
    } else {
      formData.append('name', name.trim());
      formData.append('department', department.trim());
    }
    try {
      if (selectedPicture) {
        const croppedPicture = await createCroppedPicture(selectedPicture, cropX, cropY, zoom);
        formData.append('profilePicture', croppedPicture);
      }
      const response = await axios.put(`${BACKEND_URL}/api/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` },
      });
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
      onUpdated(response.data.user);
      setIsOpen(false);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not update your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = user.name || roleLabel;
  const profileDialog = isOpen && createPortal(
    <div className="profile-editor-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isSaving) setIsOpen(false);
    }}>
      <section aria-labelledby="profile-editor-title" aria-modal="true" className="profile-editor-dialog" role="dialog">
        <header className="profile-editor-heading">
          <div>
            <h2 id="profile-editor-title">Edit profile</h2>
            <p>Update your profile details and picture.</p>
          </div>
          <button aria-label="Close profile editor" disabled={isSaving} onClick={() => setIsOpen(false)} type="button">×</button>
        </header>
        <form className="profile-editor-form" onSubmit={saveProfile}>
          <div className="profile-editor-picture">
            {selectedPicture ? (
              <>
                <div aria-label="Profile picture crop preview" className="profile-editor-crop-stage">
                  <img
                    alt=""
                    src={selectedPicture.source}
                    style={getCropPreviewStyle(selectedPicture, cropX, cropY, zoom)}
                  />
                </div>
                <div className="profile-editor-crop-controls">
                  <label>
                    Horizontal position
                    <input max="100" min="0" onChange={(event) => setCropX(Number(event.target.value))} type="range" value={cropX} />
                  </label>
                  <label>
                    Vertical position
                    <input max="100" min="0" onChange={(event) => setCropY(Number(event.target.value))} type="range" value={cropY} />
                  </label>
                  <label>
                    Zoom
                    <input max="3" min="1" onChange={(event) => setZoom(Number(event.target.value))} step="0.05" type="range" value={zoom} />
                  </label>
                </div>
              </>
            ) : (
              <span className="profile-editor-preview">
                {picturePreview
                  ? <img alt="Profile picture preview" src={picturePreview} />
                  : displayName.trim().charAt(0).toUpperCase()}
              </span>
            )}
            <label className="profile-editor-upload">
              Change picture
              <input accept="image/jpeg,image/png,image/webp" onChange={selectPicture} type="file" />
            </label>
            <small>JPEG, PNG, or WebP · up to 3 MB · saved at up to 500 × 500 px</small>
          </div>
          {user.role?.toLowerCase() === 'student' ? (
            studentProfileSections.map((section) => (
              <section className="profile-editor-section" key={section.title}>
                <h3>{section.title}</h3>
                <div className="profile-editor-fields">
                  {section.fields.map((field) => (
                    <label className="profile-editor-field" key={field.name}>
                      {field.label}
                      <input
                        autoComplete={field.autoComplete}
                        maxLength={field.type === 'email' ? 254 : undefined}
                        onChange={(event) => setStudentDetails((current) => ({ ...current, [field.name]: event.target.value }))}
                        required={field.required}
                        type={field.type || 'text'}
                        value={studentDetails[field.name]}
                      />
                    </label>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <>
              <label className="profile-editor-field">
                Full name
                <input autoComplete="name" maxLength={100} onChange={(event) => setName(event.target.value)} required value={name} />
              </label>
              <label className="profile-editor-field">
                Email
                <input readOnly value={user.email || ''} />
              </label>
              <label className="profile-editor-field">
                Department
                <input maxLength={100} onChange={(event) => setDepartment(event.target.value)} required value={department} />
              </label>
            </>
          )}
          {error && <p className="profile-editor-error" role="alert">{error}</p>}
          <footer className="profile-editor-actions">
            <button className="profile-editor-cancel" disabled={isSaving} onClick={() => setIsOpen(false)} type="button">Cancel</button>
            <button className="profile-editor-save" disabled={isSaving} type="submit">
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  );

  return (
    <>
      <button className={`profile-editor-trigger ${className}`} onClick={openEditor} type="button" aria-label="Edit profile">
        <span className={avatarClassName}>
          {user.profilePicture
            ? <img alt="" src={user.profilePicture} />
            : displayName.trim().charAt(0).toUpperCase()}
        </span>
        <span className={copyClassName}>
          <strong>{displayName}</strong>
          <small>{roleLabel}</small>
        </span>
        {showChevron && <span className="profile-editor-chevron" aria-hidden="true">⌄</span>}
      </button>
      {profileDialog}
    </>
  );
}

export default ProfileEditor;
