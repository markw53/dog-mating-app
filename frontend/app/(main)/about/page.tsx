// app/(main)/about/page.tsx
import { Dog, Heart, Shield, Users, Award, Target } from 'lucide-react';
// import Image from 'next/image';

export const metadata = {
  title: 'About Us - DogMate',
  description: 'Learn about DogMate and our mission to connect responsible dog breeders',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
    
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About DogMate</h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Connecting responsible dog owners and breeders for ethical, healthy breeding practices
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Our Mission</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-6">
                Promoting Responsible Dog Breeding
              </h2>
              <p className="text-gray-600 text-lg mb-4 leading-relaxed">
                At DogMate, we believe in connecting dogs and their owners in a safe, transparent, and 
                responsible manner. Our platform was created to address the need for a trusted space where 
                dog owners can find suitable breeding partners while prioritizing the health and wellbeing 
                of all animals involved.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                We&apos;re committed to ethical breeding practices, complete transparency, and building a 
                community of responsible dog lovers who share our passion for maintaining breed standards 
                and improving canine health.
              </p>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <Dog className="w-32 h-32 text-white opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Our Values</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-6">What We Stand For</h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              These core principles guide everything we do at DogMate
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard
              icon={<Heart className="h-12 w-12 text-primary-600" />}
              title="Animal Welfare First"
              description="The health and happiness of dogs is our top priority. We promote ethical breeding practices that prioritize animal wellbeing above all else."
            />
            <ValueCard
              icon={<Shield className="h-12 w-12 text-primary-600" />}
              title="Trust & Safety"
              description="We verify all breeders and maintain strict standards to ensure a safe, secure platform for our community."
            />
            <ValueCard
              icon={<Users className="h-12 w-12 text-primary-600" />}
              title="Community Support"
              description="We foster a supportive community where members can share knowledge, experiences, and best practices."
            />
            <ValueCard
              icon={<Award className="h-12 w-12 text-primary-600" />}
              title="Quality Standards"
              description="We maintain high standards for health records, pedigree documentation, and breeding practices."
            />
            <ValueCard
              icon={<Target className="h-12 w-12 text-primary-600" />}
              title="Transparency"
              description="Open communication and honest information sharing between all parties involved in breeding."
            />
            <ValueCard
              icon={<Dog className="h-12 w-12 text-primary-600" />}
              title="Breed Preservation"
              description="Supporting the preservation and improvement of dog breeds through responsible breeding."
            />
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Our Story</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-6">How DogMate Began</h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="text-lg leading-relaxed mb-6">
              DogMate was founded in 2024 by a team of dog enthusiasts, veterinarians, and technology 
              experts who shared a common concern: the lack of reliable platforms for responsible dog breeding.
            </p>
            <p className="text-lg leading-relaxed mb-6">
              After witnessing too many cases of irresponsible breeding practices and the difficulties 
              responsible breeders faced in finding suitable matches, we knew something had to change. 
              We created DogMate to be the solution – a platform that makes it easy to connect while 
              maintaining the highest standards of care and responsibility.
            </p>
            <p className="text-lg leading-relaxed">
              Today, DogMate serves thousands of dog owners across the UK, helping them make informed 
              decisions and find perfect matches for their beloved pets. Our community continues to grow, 
              united by a shared commitment to ethical breeding and animal welfare.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join Our Community Today
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Be part of a platform that prioritizes the wellbeing of dogs and responsible breeding
          </p>
          <a
            href="/register"
            className="inline-block bg-white text-primary-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-50 transition-all shadow-xl"
          >
            Get Started Free
          </a>
        </div>
      </section>
      
    </div>
  );
}

function ValueCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="bg-primary-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}