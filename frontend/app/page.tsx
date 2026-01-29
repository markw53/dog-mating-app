import Link from 'next/link';
import { Dog, Search, Shield, Users, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-24 md:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-block mb-4">
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
                🐕 Trusted by 10,000+ Dog Owners
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Find the Perfect Match <br />
              <span className="text-primary-200">for Your Dog</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-primary-100 max-w-3xl mx-auto">
              Connect with verified breeders for responsible dog breeding. Safe, secure, and simple.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/browse"
                className="group bg-white text-primary-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 inline-flex items-center justify-center"
              >
                <Search className="mr-2 h-5 w-5" />
                Browse Dogs
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/register"
                className="bg-primary-800 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-900 transition-all border-2 border-white/30 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 inline-flex items-center justify-center backdrop-blur-sm"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Features</span>
            <h2 className="section-title mt-2">
              Why Choose DogMate?
            </h2>
            <p className="section-subtitle mt-4">
              The trusted platform for responsible dog breeding with industry-leading features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="h-12 w-12 text-primary-600" />}
              title="Verified Breeders"
              description="All breeders are verified with health certificates and pedigree documents"
              color="bg-blue-50"
            />
            <FeatureCard
              icon={<Search className="h-12 w-12 text-primary-600" />}
              title="Advanced Search"
              description="Find dogs by breed, location, age, and health status with ease"
              color="bg-purple-50"
            />
            <FeatureCard
              icon={<Users className="h-12 w-12 text-primary-600" />}
              title="Community"
              description="Join a community of responsible dog owners and breeders"
              color="bg-green-50"
            />
            <FeatureCard
              icon={<MessageCircle className="h-12 w-12 text-primary-600" />}
              title="Direct Messaging"
              description="Connect directly with dog owners through our secure messaging system"
              color="bg-yellow-50"
            />
            <FeatureCard
              icon={<Heart className="h-12 w-12 text-primary-600" />}
              title="Health First"
              description="All dogs have updated health records and vaccination certificates"
              color="bg-red-50"
            />
            <FeatureCard
              icon={<Dog className="h-12 w-12 text-primary-600" />}
              title="All Breeds"
              description="From popular to rare breeds, find the perfect match for your dog"
              color="bg-indigo-50"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Process</span>
            <h2 className="section-title mt-2">
              How It Works
            </h2>
            <p className="section-subtitle mt-4">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <StepCard
              number="1"
              title="Create Your Profile"
              description="Sign up and add your dog's information with photos and health records"
            />
            <StepCard
              number="2"
              title="Browse & Connect"
              description="Search for compatible dogs and connect with their owners"
            />
            <StepCard
              number="3"
              title="Arrange Meeting"
              description="Message owners, arrange meetings, and find the perfect match"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatCard number="10,000+" label="Active Users" />
            <StatCard number="5,000+" label="Dogs Listed" />
            <StatCard number="2,500+" label="Successful Matches" />
            <StatCard number="50+" label="Dog Breeds" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-20 md:py-28 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to Find the Perfect Match?
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-primary-100">
            Join thousands of responsible dog owners today. It&apos;s free to get started!
          </p>
          <Link
            href="/register"
            className="group bg-white text-primary-700 px-10 py-5 rounded-xl font-bold text-lg hover:bg-primary-50 transition-all shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 inline-flex items-center"
          >
            Get Started for Free
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-6 text-primary-200 text-sm">
            No credit card required • 100% Free to browse
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description,
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  color: string;
}) {
  return (
    <div className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200 transform hover:-translate-y-2">
      <div className={`${color} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="relative text-center group">
      {/* Connector Line */}
      {number !== "3" && (
        <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-300 to-primary-200 z-0"></div>
      )}
      
      <div className="relative z-10">
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all">
          {number}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">{description}</p>
      </div>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="group">
      <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2 group-hover:scale-110 transition-transform">
        {number}
      </div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  );
}