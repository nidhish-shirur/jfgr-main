import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { 
  FaMapMarkerAlt, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaImage, 
  FaCheckCircle,
  FaCloudUploadAlt,
  FaRegTrashAlt
} from 'react-icons/fa';

const RegisterComplaint = () => {
  const { currentUser, currentUserData } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'pothole',
    images: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      
      // Limit to 3 images
      if (formData.images.length + selectedFiles.length > 3) {
        setError('You can upload a maximum of 3 images.');
        return;
      }
      
      // Check file sizes (limit to 5MB each)
      const oversizedFiles = selectedFiles.filter(file => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setError('Each image must be less than 5MB in size.');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...selectedFiles]
      }));
      
      // Create preview URLs
      const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
      
      setError('');
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `complaints/${Date.now()}_${file.name}`);
    
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytes(storageRef, file);
      
      uploadTask
        .then(snapshot => getDownloadURL(snapshot.ref))
        .then(url => {
          resolve(url);
        })
        .catch(error => {
          console.error("Error uploading image:", error);
          reject(error);
        });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to submit a complaint');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      setUploadProgress(10);
      
      // Upload images if any
      let imageUrls = [];
      if (formData.images.length > 0) {
        setUploadProgress(20);
        // Upload each image
        const uploadPromises = formData.images.map(file => uploadImage(file));
        imageUrls = await Promise.all(uploadPromises);
        setUploadProgress(70);
      }
      
      // Create the complaint in Firestore
      const complaintData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        type: formData.type,
        status: 'pending',
        createdBy: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUserData?.firstName + ' ' + currentUserData?.lastName,
        createdAt: serverTimestamp(),
        imageUrls: imageUrls,
        assignedTo: null,
        assignedAt: null,
        lastUpdated: serverTimestamp(),
        comments: []
      };
      
      setUploadProgress(80);
      const docRef = await addDoc(collection(db, 'complaints'), complaintData);
      setUploadProgress(100);
      
      setSuccess('Complaint submitted successfully! Thank you for your contribution to improving our community.');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        type: 'pothole',
        images: []
      });
      setImagePreviewUrls([]);
      
      // Clear success message after 7 seconds
      setTimeout(() => {
        setSuccess('');
      }, 7000);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setError('Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 bg-light-gray">
      <div className="container max-w-4xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-secondary-color mb-4">Register your Complaint</h2>
          <p className="text-text-light max-w-2xl mx-auto">
            Help us identify infrastructure issues by providing detailed information. Your input is valuable in making Ghodbunder Road better for everyone.
          </p>
        </div>
        
        {!currentUser && (
          <div className="card mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-700">Authentication required</h3>
                <div className="mt-2 text-yellow-600">
                  <p>Please <Link to="/login" className="font-semibold underline">login</Link> or <Link to="/signup" className="font-semibold underline">register</Link> to submit a complaint. This helps us track and respond to your issues effectively.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
            <div className="flex items-center">
              {React.createElement(FaCheckCircle, { size: 20, className: "mr-2" })}
              <span>{success}</span>
            </div>
          </div>
        )}
        
        <div className="card shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group md:col-span-2">
                <label htmlFor="title" className="form-label flex items-center">
                  {React.createElement(FaExclamationTriangle, { size: 16, className: "mr-2 text-primary-color" })}
                  Issue Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Brief title describing the issue (e.g., Pothole at Kasarvadavali Junction)"
                  disabled={!currentUser || loading}
                />
              </div>
              
              <div className="form-group md:col-span-2">
                <label htmlFor="description" className="form-label flex items-center">
                  {React.createElement(FaInfoCircle, { size: 16, className: "mr-2 text-primary-color" })}
                  Detailed Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control min-h-[150px] resize-y"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Provide details about the issue, including its severity, how long it has existed, and any hazards it presents"
                  disabled={!currentUser || loading}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="location" className="form-label flex items-center">
                  {React.createElement(FaMapMarkerAlt, { size: 16, className: "mr-2 text-primary-color" })}
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="form-control"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="Precise location of the issue (e.g., Near Viviana Mall, Ghodbunder Road)"
                  disabled={!currentUser || loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="type" className="form-label flex items-center">
                  {React.createElement(FaInfoCircle, { size: 16, className: "mr-2 text-primary-color" })}
                  Issue Type
                </label>
                <select
                  id="type"
                  name="type"
                  className="form-control"
                  value={formData.type}
                  onChange={handleInputChange}
                  disabled={!currentUser || loading}
                >
                  <option value="pothole">Pothole</option>
                  <option value="traffic">Traffic Signal Malfunction</option>
                  <option value="debris">Road Debris</option>
                  <option value="flooding">Road Flooding</option>
                  <option value="lighting">Street Light Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group md:col-span-2">
                <label className="form-label flex items-center">
                  {React.createElement(FaImage, { size: 16, className: "mr-2 text-primary-color" })}
                  Upload Images (Max 3)
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-color transition-colors cursor-pointer" onClick={() => !loading && currentUser && fileInputRef.current?.click()}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={!currentUser || loading || formData.images.length >= 3}
                  />
                  
                  {React.createElement(FaCloudUploadAlt, { size: 48, className: "mx-auto mb-4 text-gray-400" })}
                  
                  <p className="text-lg font-medium mb-2">
                    {formData.images.length === 0 
                      ? 'Drag & drop images here or click to browse' 
                      : `${formData.images.length} image(s) selected (${3 - formData.images.length} more allowed)`}
                  </p>
                  <p className="text-sm text-gray-500">
                    Images help us better understand the issue. Please upload clear photos.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Supported formats: JPG, PNG, JPEG (Max: 5MB per image)
                  </p>
                </div>
                
                {imagePreviewUrls.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm text-gray-600 mb-3">Selected Images:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg shadow"
                          />
                          <button
                            type="button"
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                            aria-label="Remove image"
                          >
                            {React.createElement(FaRegTrashAlt, { size: 14 })}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {loading && (
              <div className="my-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary-color h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-center mt-2 text-gray-600">
                  {uploadProgress < 100 ? 'Processing your complaint...' : 'Complaint submitted!'}
                </p>
              </div>
            )}
            
            <div className="flex justify-end mt-8">
              <Link 
                to="/"
                className="btn bg-gray-200 text-gray-700 mr-4 hover:bg-gray-300"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary px-8"
                disabled={!currentUser || loading}
              >
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </div>
        
        {currentUser && (
          <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded">
            <div className="flex">
              {React.createElement(FaInfoCircle, { size: 20, className: "mr-3 flex-shrink-0" })}
              <div>
                <p className="font-medium">What happens next?</p>
                <ul className="list-disc ml-6 mt-2 text-sm">
                  <li>Your complaint will be reviewed by our team</li>
                  <li>The issue will be escalated to the appropriate authorities</li>
                  <li>You'll receive updates on the status via email</li>
                  <li>The complaint will be visible on our tracking dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterComplaint; 