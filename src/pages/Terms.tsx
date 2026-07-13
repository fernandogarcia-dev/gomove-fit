import AppShell from "@/components/AppShell";
import SeoHead from "@/components/SeoHead";

const Terms = () => (
  <AppShell showBack backTo="/" title="Terms" hideNav>
    <SeoHead
      title="Terms of Service"
      description="GoMove terms of service for our home workout and personalized exercise planning application."
      path="/terms"
    />

    <article className="prose prose-sm max-w-none dark:prose-invert">
      <h1>Terms of Service</h1>
      <p>
        <strong>Last updated:</strong> July 13, 2026
      </p>
      <p>
        By using GoMove at gomove.fit, you agree to these Terms of Service. If you do not agree, do
        not use the service.
      </p>

      <h2>What GoMove provides</h2>
      <p>
        GoMove is a fitness and wellness tool that generates personalized home exercise plans. It is
        not medical advice, physical therapy, or a substitute for professional healthcare.
      </p>

      <h2>Medical disclaimer</h2>
      <p>
        Always consult a physician or qualified healthcare provider before starting any exercise
        program, especially if you have pain, injury, or a medical condition. Stop exercising and seek
        medical attention if you experience sharp pain, dizziness, or other concerning symptoms.
      </p>

      <h2>Your account</h2>
      <p>
        You are responsible for maintaining the confidentiality of your login credentials and for all
        activity under your account. Provide accurate information when registering.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not misuse, reverse engineer, or attempt to disrupt the service</li>
        <li>Do not upload harmful content or violate others&apos; rights</li>
        <li>Do not use the service for unlawful purposes</li>
      </ul>

      <h2>Subscriptions (GoMove PRO)</h2>
      <p>
        Paid features are billed through Stripe according to the pricing shown at checkout. Fees are
        non-refundable except where required by law. You may cancel through the customer portal.
      </p>

      <h2>Intellectual property</h2>
      <p>
        GoMove content, branding, and software are owned by us or our licensors. You receive a
        limited, personal license to use the app for your own fitness planning.
      </p>

      <h2>Disclaimer of warranties</h2>
      <p>
        The service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee specific
        fitness or health outcomes.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, GoMove is not liable for indirect, incidental, or
        consequential damages arising from your use of the service or exercise activities.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. Continued use after changes constitutes acceptance of the updated
        terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions: <a href="mailto:legal@gomove.fit">legal@gomove.fit</a>
      </p>
    </article>
  </AppShell>
);

export default Terms;
