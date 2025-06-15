/**
 * A React component that automatically scrolls the page to the top
 * whenever the route changes.
 *
 * This component uses the `useLocation` hook from `react-router-dom`
 * to monitor changes in the current pathname. When the pathname changes,
 * the `useEffect` hook triggers a scroll to the top of the page.
 *
 * @returns {null} This component does not render any visible UI.
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function scrollToTop() {

    /**
     * Destructures the `pathname` property from the object returned by the `useLocation` hook.
     *
     * The `pathname` represents the current URL path, which is used to detect route changes.
     */
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to the top of the page when the pathname changes
        window.scrollTo(0, 0);
    }, [pathname]);

    return null; // This component does not render anything
}