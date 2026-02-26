import { createFileRoute } from '@tanstack/react-router'

import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/_public/terms')({
  component: TermsPage,
})

function TermsPage() {
  return (
    <div className="container mx-auto px-6 py-16 max-w-3xl">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <h1 className="text-4xl font-bold">Terms of Service</h1>
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
          These terms of service are still being developed. As we continue to
          build and improve OpenModal during beta, we will update this document.
          For now, here are our core terms:
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            1. Acceptance of Terms
          </h2>
          <p className="text-muted-foreground">
            By accessing or using OpenModal, you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do not
            use our platform. These terms may change as we develop the platform
            during beta.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            2. Description of Service
          </h2>
          <div className="text-muted-foreground space-y-3">
            <p>
              OpenModal is a community-driven platform that tracks AI's
              real-world impact on jobs, capabilities, and technologies. Our
              service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>A database of AI capabilities, jobs, and technologies</li>
              <li>Tools for submitting impact reports and suggestions</li>
              <li>Discussion forums for community engagement</li>
              <li>Educational resources about AI's impact</li>
            </ul>
            <p className="text-sm italic">
              The service is currently in beta and may contain errors or
              incomplete information.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            3. User Responsibilities
          </h2>
          <div className="text-muted-foreground space-y-3">
            <p>As a user of OpenModal, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and truthful information</li>
              <li>Respect other community members</li>
              <li>Not submit false, misleading, or harmful content</li>
              <li>Not attempt to manipulate or spam the platform</li>
              <li>
                Report any inaccuracies you discover to help improve the
                platform
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            4. Content & Contributions
          </h2>
          <div className="text-muted-foreground space-y-3">
            <p>
              <strong className="text-foreground">
                User-Generated Content:
              </strong>{' '}
              By submitting content to OpenModal (reports, suggestions,
              discussions), you grant us a license to display and distribute
              that content on our platform.
            </p>
            <p>
              <strong className="text-foreground">Content Accuracy:</strong>{' '}
              Since we're in beta, information may be inaccurate. Users should
              verify important information independently.
            </p>
            <p>
              <strong className="text-foreground">Moderation:</strong> We
              reserve the right to moderate or remove content that violates
              these terms or is harmful to the community.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Disclaimers</h2>
          <div className="text-muted-foreground space-y-3">
            <p>
              <strong className="text-foreground">Beta Status:</strong>{' '}
              OpenModal is in beta development. The service is provided &quot;as
              is&quot; without warranties of any kind.
            </p>
            <p>
              <strong className="text-foreground">Information Accuracy:</strong>{' '}
              We strive for accuracy but cannot guarantee all information is
              correct or up to date.
            </p>
            <p>
              <strong className="text-foreground">
                No Professional Advice:
              </strong>
              Content on OpenModal is for informational purposes only and does
              not constitute professional career, legal, or financial advice.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            6. Limitation of Liability
          </h2>
          <p className="text-muted-foreground">
            To the fullest extent permitted by law, OpenModal and its
            contributors shall not be liable for any indirect, incidental,
            special, or consequential damages resulting from your use of the
            platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            7. Account Termination
          </h2>
          <div className="text-muted-foreground space-y-3">
            <p>We reserve the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Suspend or terminate accounts that violate these terms</li>
              <li>Remove content that doesn't meet our community standards</li>
              <li>Update or discontinue features at any time during beta</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
          <p className="text-muted-foreground">
            We may modify these terms at any time as the platform evolves.
            Significant changes will be communicated through the platform. Your
            continued use of OpenModal after changes constitutes acceptance of
            the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
          <p className="text-muted-foreground">
            These terms shall be governed by the laws of the jurisdiction in
            which OpenModal operates, without regard to conflict of law
            principles.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
          <div className="text-muted-foreground space-y-3">
            <p>
              If you have questions about these terms or need to report a
              violation, please reach out:
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

        <div className="border-t border-border/40 pt-8 mt-12">
          <p className="text-sm text-muted-foreground">
            Thank you for being part of our community and helping us build
            OpenModal!
          </p>
        </div>
      </div>
    </div>
  )
}
