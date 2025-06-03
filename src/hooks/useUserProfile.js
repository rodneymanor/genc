import { useState, useEffect } from 'react';

export const useUserProfile = () => {
  const [userProfileData, setUserProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load profile data from localStorage on mount
    const loadProfileData = () => {
      try {
        const storedProfileData = localStorage.getItem('userProfileData');
        if (storedProfileData) {
          const parsedProfileData = JSON.parse(storedProfileData);
          setUserProfileData(parsedProfileData);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, []);

  // Function to update profile data
  const updateProfileData = (profileData) => {
    try {
      if (profileData) {
        localStorage.setItem('userProfileData', JSON.stringify(profileData));
        setUserProfileData(profileData);
        console.log('Profile data updated:', profileData);
      } else {
        localStorage.removeItem('userProfileData');
        setUserProfileData(null);
        console.log('Profile data cleared');
      }
    } catch (error) {
      console.error('Error updating profile data:', error);
    }
  };

  // Function to clear profile data
  const clearProfileData = () => {
    updateProfileData(null);
  };

  return {
    userProfileData,
    isLoading,
    updateProfileData,
    clearProfileData,
    hasProfile: !!userProfileData
  };
}; 