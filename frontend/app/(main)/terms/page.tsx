// app/(main)/terms/page.tsx
import { FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - DogMate',
  description: 'DogMate terms of service and user agreement',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <FileText className="h-12 w-12" />
            <h1 className="text-4xl md:text-6xl font-bold">Terms of Service</h1>
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
            <Section title="1. Acceptance of Terms">
              <p>
                By accessing and using DogMate (&quot;the Platform,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), you accept and agree to be bound by 
                these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
              <p>
                We reserve the right to modify these terms at any time. Your continued use of the Platform following any 
                changes indicates your acceptance of the new terms.
              </p>
            </Section>

            <Section title="2. Eligibility">
              <p>You must meet the following requirements to use DogMate:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Be at least 18 years of age</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>Not be prohibited from using our services under applicable laws</li>
                <li>Comply with all local, state, national, and international laws and regulations</li>
              </ul>
            </Section>

            <Section title="3. User Accounts">
              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Account Creation</h3>
              <p>To use certain features, you must create an account. You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Account Termination</h3>
              <p>
                We reserve the right to suspend or terminate your account at any time for violation of these terms or 
                for any other reason at our sole discretion.
              </p>
            </Section>

            <Section title="4. User Conduct and Responsibilities">
              <p>When using DogMate, you agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide false or misleading information about yourself or your dog(s)</li>
                <li>Engage in any form of harassment, abuse, or harmful behavior</li>
                <li>Use the Platform for any illegal or unauthorized purpose</li>
                <li>Promote puppy mills or unethical breeding practices</li>
                <li>Violate any animal welfare laws or regulations</li>
                <li>Infringe upon the intellectual property rights of others</li>
                <li>Transmit viruses, malware, or other harmful code</li>
                <li>Attempt to gain unauthorized access to the Platform</li>
                <li>Use automated systems to access the Platform without permission</li>
                <li>Collect information about other users without consent</li>
              </ul>
            </Section>

            <Section title="5. Breeding Responsibilities">
              <p>As a platform connecting dog owners and breeders, we require all users to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Prioritize the health and welfare of all animals</li>
                <li>Comply with all applicable animal welfare laws and breeding regulations</li>
                <li>Provide accurate health records and pedigree information</li>
                <li>Conduct appropriate health screenings before breeding</li>
                <li>Ensure proper veterinary care for all dogs</li>
                <li>Screen potential breeding partners responsibly</li>
                <li>Maintain appropriate documentation for all breeding activities</li>
              </ul>
              <p className="mt-4">
                <strong>Important:</strong> DogMate facilitates connections but does not participate in or supervise actual 
                breeding arrangements. Users are solely responsible for all breeding decisions and activities.
              </p>
            </Section>

            <Section title="6. Content and Intellectual Property">
              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">User Content</h3>
              <p>
                You retain ownership of content you post on DogMate. By posting content, you grant us a worldwide, 
                non-exclusive, royalty-free license to use, reproduce, modify, and display your content in connection 
                with operating the Platform.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Platform Content</h3>
              <p>
                All content on the Platform, including text, graphics, logos, and software, is the property of DogMate 
                or its licensors and is protected by copyright and other intellectual property laws.
              </p>
            </Section>

            <Section title="7. Verification and Listings">
              <p>
                We strive to verify breeders and listings, but we do not guarantee the accuracy, completeness, or reliability 
                of any information. Users are responsible for conducting their own due diligence before entering into any 
                arrangements.
              </p>
              <p className="mt-4">
                We reserve the right to remove any listing or content that violates these terms or is otherwise deemed 
                inappropriate.
              </p>
            </Section>

            <Section title="8. Payments and Fees">
              <p>
                Certain features of DogMate may require payment. You agree to pay all applicable fees and charges. All fees 
                are non-refundable unless otherwise stated. We reserve the right to change our fees at any time with notice.
              </p>
            </Section>

            <Section title="9. Disclaimer of Warranties">
              <p>
                THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, 
                EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p className="mt-4">
                We do not warrant that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The Platform will be uninterrupted or error-free</li>
                <li>Defects will be corrected</li>
                <li>The Platform is free of viruses or harmful components</li>
                <li>Results obtained from using the Platform will be accurate or reliable</li>
              </ul>
            </Section>

            <Section title="10. Limitation of Liability">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, DOGMATE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
                CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
              </p>
              <p className="mt-4">
                Our total liability for any claims arising from your use of the Platform shall not exceed the amount you 
                paid to us in the 12 months preceding the claim.
              </p>
            </Section>

            <Section title="11. Indemnification">
              <p>
                You agree to indemnify and hold harmless DogMate, its officers, directors, employees, and agents from any 
                claims, losses, damages, liabilities, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your use of the Platform</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Your breeding activities or arrangements made through the Platform</li>
              </ul>
            </Section>

            <Section title="12. Dispute Resolution">
              <p>
                Any disputes arising from these Terms or your use of the Platform shall be resolved through binding arbitration 
                in accordance with the rules of the UK Arbitration Act, except where prohibited by law.
              </p>
            </Section>

            <Section title="13. Governing Law">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of England and Wales, without 
                regard to its conflict of law provisions.
              </p>
            </Section>

            <Section title="14. Severability">
              <p>
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or 
                eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </p>
            </Section>

            <Section title="15. Contact Information">
              <p>
                For questions about these Terms of Service, please contact us:
              </p>
              <ul className="list-none space-y-2 mt-4">
                <li>Email: legal@dogmate.com</li>
                <li>Phone: +44 (7837) 049583</li>
                <li>Address: 12 Heather Park, Devon, United Kingdom</li>
              </ul>
            </Section>

            <div className="bg-primary-50 border-l-4 border-primary-600 p-6 mt-12 rounded-r-lg">
              <p className="text-primary-900 font-semibold mb-2">
                By using DogMate, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
              <p className="text-primary-800 text-sm">
                These terms constitute the entire agreement between you and DogMate regarding the use of the Platform.
              </p>
            </div>
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