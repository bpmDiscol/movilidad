import React from "react";
import { useTracker } from "meteor/react-meteor-data";

/**
 * Custom hook to manage user roles and permissions.
 */
const useRole = () => {
  // Get the current user's profile role
  const { userRole, isLoading } = useTracker(() => {
    const user = Meteor.user();
    return {
      userRole: user?.profile?.role,
      isLoading: !user,
    };
  }, []);

  return { userRole, isLoading };
};

export default useRole;
