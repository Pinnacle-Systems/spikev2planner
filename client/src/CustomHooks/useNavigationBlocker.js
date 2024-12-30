import React, { useEffect } from "react";
import { useNavigate, } from "react-router-dom";

const useNavigationBlocker = ({ hasUnsavedChanges, setHasUnsavedChanges }) => {
    const navigate = useNavigate();

    // Browser navigation guard (back, forward, reload)
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (hasUnsavedChanges) {
                event.preventDefault();
                event.returnValue = "You have unsaved changes. Do you really want to leave?";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    // In-app navigation guard
    const handleNavigation = (targetPath) => {
        console.log("targetPath", targetPath);
        if (hasUnsavedChanges) {
            const confirm = window.confirm("You have unsaved changes. Do you really want to leave?");
            if (confirm) {
                setHasUnsavedChanges(false); // Reset state before navigation
                navigate(targetPath);
            }
        } else {
            navigate(targetPath);
        }
    };
    return [handleNavigation]
};

export default useNavigationBlocker;
