import Navbar from '../Components/navbar';
import Footer from '../Components/footer';

function Main() {
    return (
        <>
            <Navbar />
            <div style={{ minHeight: '80vh' }}>
                {/* Main landing page content goes here */}
            </div>
            <Footer />
        </>
    );
}
export default Main;