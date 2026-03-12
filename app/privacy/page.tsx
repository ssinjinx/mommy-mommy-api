export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'sans-serif', lineHeight: 1.7, color: '#333' }}>
      <h1 style={{ color: '#E8477A' }}>Mommy Mommy — Privacy Policy</h1>
      <p><strong>Effective Date:</strong> March 11, 2026</p>

      <h2>1. Information We Collect</h2>
      <p>Mommy Mommy collects the following information to provide family coordination services:</p>
      <ul>
        <li>Email address and account credentials (via Clerk authentication)</li>
        <li>Contact names and phone numbers that you manually enter into the app</li>
        <li>Shopping list items and event details you create within the app</li>
        <li>SMS reply content sent to your Mommy Mommy number by your family contacts</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>Your information is used exclusively to provide the Mommy Mommy service:</p>
      <ul>
        <li>To send SMS notifications to your family contacts on your behalf</li>
        <li>To receive and store SMS replies from your family contacts into your shopping lists</li>
        <li>To store your events, shopping lists, and contacts securely in our database</li>
        <li>To authenticate your account and keep your data private</li>
      </ul>

      <h2>3. Information Sharing</h2>
      <p>We do <strong>not</strong> sell, share, rent, or disclose your personal information or your contacts' information to any third parties for marketing or any other purposes.</p>
      <p>Your data is only shared with the following service providers strictly to operate the app:</p>
      <ul>
        <li><strong>Twilio</strong> — to send and receive SMS messages</li>
        <li><strong>Neon</strong> — to store your app data in a secure database</li>
        <li><strong>Clerk</strong> — to manage account authentication</li>
        <li><strong>Vercel</strong> — to host the application</li>
      </ul>

      <h2>4. SMS Messaging</h2>
      <p>Phone numbers you add to the app are used solely to send family coordination messages that you initiate. Recipients can reply <strong>STOP</strong> at any time to opt out of receiving messages from your Mommy Mommy account.</p>

      <h2>5. Data Security</h2>
      <p>All data is transmitted over HTTPS and stored in an encrypted database. We take reasonable measures to protect your information from unauthorized access.</p>

      <h2>6. Data Retention</h2>
      <p>Your data is retained as long as your account is active. You may delete your account and all associated data at any time by contacting us.</p>

      <h2>7. Children's Privacy</h2>
      <p>Mommy Mommy is not directed at children under 13. We do not knowingly collect personal information from children under 13.</p>

      <h2>8. Contact Us</h2>
      <p>If you have any questions about this privacy policy, please contact us at: <strong>privacy@mommymommy.app</strong></p>
    </div>
  );
}
