import Link from 'next/link';
import { Dog, Search, Shield, Users, Heart, MessageCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-linear-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find the Perfect Match for Your Dog
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Connect with verified breeders for responsible dog breeding
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/browse"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors inline-flex items-center justify-center"
              >
                <Search className="mr-2 h-5 w-5" />
                Browse Dogs
              </Link>
              <Link
                href="/register"
                className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors border-2 border-white inline-flex items-center justify-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose DogMate?
            </h2>
            <p className="text-xl text-gray-600">
              The trusted platform for responsible dog breeding
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="h-12 w-12 text-primary-600" />}
              title="Verified Breeders"
              description="All breeders are verified with health certificates and pedigree documents"
            />
            <FeatureCard
              icon={<Search className="h-12 w-12 text-primary-600" />}
              title="Advanced Search"
              description="Find dogs by breed, location, age, and health status with ease"
            />
            <FeatureCard
              icon={<Users className="h-12 w-12 text-primary-600" />}
              title="Community"
              description="Join a community of responsible dog owners and breeders"
            />
            <FeatureCard
              icon={<MessageCircle className="h-12 w-12 text-primary-600" />}
              title="Direct Messaging"
              description="Connect directly with dog owners through our secure messaging system"
            />
            <FeatureCard
              icon={<Heart className="h-12 w-12 text-primary-600" />}
              title="Health First"
              description="All dogs have updated health records and vaccination certificates"
            />
            <FeatureCard
              icon={<Dog className="h-12 w-12 text-primary-600" />}
              title="All Breeds"
              description="From popular to rare breeds, find the perfect match for your dog"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find the Perfect Match?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of responsible dog owners today
          </p>
          <Link
            href="/register"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors inline-block"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}