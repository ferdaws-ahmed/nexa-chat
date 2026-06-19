import LoginForm from '@/components/auth/LoginForm';
import Footer from '@/components/footer/Footer';
import Navbar from '@/components/navbar/Navbar';

export const metadata = {
  title: 'লগইন - নেক্সাচ্যাট',
  description: 'আপনার নেক্সাচ্যাট একাউন্টে লগইন করুন',
};

const LoginPage = () => {
  return (
    <>
      <Navbar></Navbar>
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full -z-10" />
      
      <LoginForm />
      </div>
      <Footer></Footer>
    </>
    
  );
};

export default LoginPage;
