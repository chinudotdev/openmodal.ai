import { createFileRoute } from '@tanstack/react-router'

import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/_public/privacy')({
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <div className="container mx-auto px-6 py-16 max-w-3xl">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <Badge variant="secondary">Draft</Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Last updated: February 2025 (Beta Version)
        </p>
      </div>

      <div className="bg-muted/50 border border-yellow-200 dark:border-yellow-900 rounded-lg p-6 mb-8">
        <h2 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-3">
          🚧 Under Construction
        </h2>
        <p className="text-sm text-muted-foreground">
          This privacy policy is still being developed. As we continue to build
          and improve OpenModal, we will update this document to reflect our
          actual data practices. For now, here are our core privacy commitments:
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            1. Information We Collect
          </h2>
          <div className="text-muted-foreground space-y-3">
            <p>
              <strong className="text-foreground">Account Information:</strong>{' '}
              When you create an account, we collect your name, email address,
              and optional profile information through Google OAuth.
            </p>
            <p>
              <strong className="text-foreground">Contributed Content:</strong>{' '}
              We store your contributions to our knowledge base, including
              impact reports, suggestions, and discussions.
            </p>
            <p>
              <strong className="text-foreground">Usage Data:</strong> We may
              collect anonymous usage data to improve our service.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            2. How We Use Your Information
          </h2>
          <div className="text-muted-foreground space-y-3">
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain the OpenModal platform</li>
              <li>Process your contributions and suggestions</li>
              <li>Enable community features and discussions</li>
              <li>Improve our services and user experience</li>
              <li>Communicate with you about platform updates</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            3. Data Sharing & Disclosure
          </h2>
          <div className="text-muted-foreground space-y-3">
            <p>
              <strong className="text-foreground">Public Contributions:</strong>{' '}
              Content you contribute to our knowledge base (reports,
              suggestions, discussions) is publicly visible to other users.
            </p>
            <p>
              <strong className="text-foreground">No Sale of Data:</strong> We
              do not sell your personal information to third parties.
            </p>
            <p>
              <strong className="text-foreground">Service Providers:</strong> We
              may share data with trusted service providers who help us operate
              our platform (e.g., Cloudflare for hosting, Neon for database).
            </p>
            <p>
              <strong className="text-foreground">AI Training:</strong> Your
              contributed data (reports, capabilities, suggestions, discussions)
              may be used to improve AI models and help track AI's real-world
              impact.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <div className="text-muted-foreground space-y-3">
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption for data in transit and at rest</li>
              <li>Secure authentication through Google OAuth</li>
              <li>Regular security updates and monitoring</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
          <div className="text-muted-foreground space-y-3">
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>
                Delete your account (this removes your personal account data)
              </li>
              <li>Opt-out of non-essential communications</li>
            </ul>
            <div className="bg-muted/50 border border-border/40 rounded-lg p-4 mt-4">
              <p className="text-sm font-medium mb-2">
                Important: Contributed Content
              </p>
              <p className="text-sm">
                When you delete your account, your{' '}
                <strong>personal information</strong>
                (name, email, profile data) will be removed. However, your{' '}
                <strong>contributions to our knowledge base</strong> (impact
                reports, capability mappings, technology suggestions,
                discussions) will remain in the system to maintain the integrity
                of our AI tracking data. This community-sourced data helps us
                track AI's real-world impact and cannot be fully removed once
                contributed.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Children's Privacy</h2>
          <p className="text-muted-foreground">
            OpenModal is not intended for children under 13 years of age. We do
            not knowingly collect personal information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            7. Changes to This Policy
          </h2>
          <p className="text-muted-foreground">
            We may update this privacy policy from time to time. Significant
            changes will be communicated through the platform. This is a beta
            version, and the policy will evolve as our platform develops.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
          <div className="text-muted-foreground space-y-3">
            <p>
              If you have questions about this privacy policy or our data
              practices, please reach out:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Discord:</strong>{' '}
                <a
                  href="https://discord.gg/bBsF3MjA9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  discord.gg/bBsF3MjA9
                </a>
              </li>
              <li>
                <strong>GitHub:</strong>{' '}
                <a
                  href="https://github.com/chinudotdev/openmodal.ai/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  github.com/chinudotdev/openmodal.ai/issues
                </a>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
