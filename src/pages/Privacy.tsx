import AppShell from "@/components/AppShell";
import SeoHead from "@/components/SeoHead";

const Privacy = () => (
  <AppShell showBack backTo="/" title="Privacy" hideNav>
    <SeoHead
      title="Privacy Policy"
      description="GoMove privacy policy. How we collect, use, and protect your data when you use our home workout and exercise planning app."
      path="/privacy"
    />

    <article className="prose prose-sm max-w-none dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p>
        <strong>Last updated:</strong> July 13, 2026
      </p>
      <p>
        GoMove (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates gomove.fit, a web application that helps you
        build personalized home workout and exercise plans. This Privacy Policy explains what
        information we collect and how we use it.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account information:</strong> email address, name, and profile details you provide
          when signing up.
        </li>
        <li>
          <strong>Health and fitness preferences:</strong> body regions, fitness level, equipment
          availability, and exercise plans you create.
        </li>
        <li>
          <strong>Usage data:</strong> pages visited, features used, and analytics events via Google
          Tag Manager / Google Analytics when enabled.
        </li>
        <li>
          <strong>Payment information:</strong> processed by Stripe for GoMove PRO subscriptions. We
          do not store full card numbers on our servers.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>Generate and save personalized exercise plans</li>
        <li>Authenticate your account and provide customer support</li>
        <li>Process subscriptions and referrals</li>
        <li>Improve the app and understand aggregate usage patterns</li>
        <li>Send service-related communications when necessary</li>
      </ul>

      <h2>Data sharing</h2>
      <p>
        We use trusted service providers including Supabase (database and authentication) and Stripe
        (payments). We do not sell your personal information. We may disclose data if required by
        law.
      </p>

      <h2>Data retention</h2>
      <p>
        We retain account and plan data while your account is active. You may request deletion by
        contacting us at privacy@gomove.fit.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct, delete, or export your
        personal data. Contact privacy@gomove.fit to exercise these rights.
      </p>

      <h2>Cookies and analytics</h2>
      <p>
        We may use cookies and similar technologies for authentication and analytics. You can control
        cookies through your browser settings.
      </p>

      <h2>Children</h2>
      <p>
        GoMove is not directed at children under 13. We do not knowingly collect data from children.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy: <a href="mailto:privacy@gomove.fit">privacy@gomove.fit</a>
      </p>
    </article>
  </AppShell>
);

export default Privacy;
