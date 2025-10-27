import { BottomNavigation } from '../components/navbar';

export const Layout = ({ children, showNavigation = true }) => {
    return (
        <div >
            {/* Main content area that will transition */}
            <main style={{ backgroundColor: "#141414" }}>
                {children}
            </main>

            {/* Fixed navigation that doesn't transition */}
            {showNavigation &&
                <div className="absolute bottom-0 left-0 right-0 z-50 w-full bg-brandblue">
                    <BottomNavigation />
                </div>
            }
        </div >
    );
};