// app/(main)/privacy/page.tsx
import { Shield } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - DogMate',
  description: 'DogMate privacy policy and data protection information',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
     
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Shield className="h-12 w-12" />
            <h1 className="text-4xl md:text-6xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto text-center">
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <Section title="1. Introduction">
              <p>
                Welcome to DogMate (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information 
                and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard 
                your information when you use our platform.
              </p>
              <p>
                By using DogMate, you agree to the collection and use of information in accordance with this policy. 
                If you do not agree with our policies and practices, please do not use our services.
              </p>
            </Section>

            <Section title="2. Information We Collect">
              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Personal Information</h3>
              <p>We collect personal information that you provide to us, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, and contact information</li>
                <li>Account credentials (username and password)</li>
                <li>Profile information and photographs</li>
                <li>Payment and billing information</li>
                <li>Dog information including breed, health records, and pedigree documents</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Automatically Collected Information</h3>
              <p>When you use our platform, we automatically collect certain information, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address and browser type</li>
                <li>Device information and operating system</li>
                <li>Usage data and analytics</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </Section>

            <Section title="3. How We Use Your Information">
              <p>We use the information we collect for various purposes, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Providing and maintaining our services</li>
                <li>Creating and managing your account</li>
                <li>Facilitating connections between dog owners and breeders</li>
                <li>Processing transactions and sending related information</li>
                <li>Sending administrative information and updates</li>
                <li>Responding to your inquiries and providing customer support</li>
                <li>Improving our services and developing new features</li>
                <li>Protecting against fraudulent or illegal activity</li>
                <li>Complying with legal obligations</li>
              </ul>
            </Section>

            <Section title="4. Information Sharing and Disclosure">
              <p>We may share your information in the following situations:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>With Other Users:</strong> Your profile and dog information are visible to other registered users</li>
                <li><strong>Service Providers:</strong> We share information with third-party service providers who perform services on our behalf</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal requests</li>
                <li><strong>Business Transfers:</strong> Information may be transferred in connection with a merger, sale, or acquisition</li>
                <li><strong>With Your Consent:</strong> We may share information with your explicit consent</li>
              </ul>
              <p className="mt-4">
                We do NOT sell your personal information to third parties.
              </p>
            </Section>

            <Section title="5. Data Security">
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information. 
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to 
                use commercially acceptable means to protect your information, we cannot guarantee its absolute security.
              </p>
            </Section>

            <Section title="6. Your Rights">
              <p>Under applicable data protection laws, you have the following rights:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Objection:</strong> Object to processing of your personal information</li>
                <li><strong>Data Portability:</strong> Request transfer of your information to another service</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at privacy@dogmate.com
              </p>
            </Section>

            <Section title="7. Cookies and Tracking Technologies">
              <p>
                We use cookies and similar tracking technologies to track activity on our platform and hold certain information. 
                Cookies are files with small amount of data. You can instruct your browser to refuse all cookies or to indicate 
                when a cookie is being sent.
              </p>
            </Section>

            <Section title="8. Children's Privacy">
              <p>
                Our service is not intended for children under the age of 18. We do not knowingly collect personal information 
                from children under 18. If you become aware that a child has provided us with personal information, please 
                contact us immediately.
              </p>
            </Section>

            <Section title="9. International Data Transfers">
              <p>
                Your information may be transferred to and maintained on computers located outside of your country where data 
                protection laws may differ. We take appropriate safeguards to ensure that your personal information remains 
                protected in accordance with this Privacy Policy.
              </p>
            </Section>

            <Section title="10. Changes to This Privacy Policy">
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
                Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this Privacy 
                Policy periodically for any changes.
              </p>
            </Section>

            <Section title="11. Contact Us">
              <p>
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul className="list-none space-y-2 mt-4">
                <li>Email: privacy@dogmate.com</li>
                <li>Phone: +44 (7837) 049583</li>
                <li>Address: 12 Heather Park, Devon, United Kingdom</li>
              </ul>
            </Section>
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      <div className="text-gray-600 space-y-4">
        {children}
      </div>
    </div>
  );
}