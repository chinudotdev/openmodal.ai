import { Mail } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function VerifyEmailContent({ email }: { email: string | undefined }) {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Link to="/" className="flex items-center gap-2 self-center font-medium">
        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
          <Mail className="size-4" />
        </div>
        OpenModal
      </Link>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription className="text-base">
            We've sent a verification link to
            {email && (
              <>
                <br />
                <span className="font-semibold text-foreground">{email}</span>
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-center text-sm text-muted-foreground">
            <p>
              Click the link in the email to verify your account and complete
              your registration.
            </p>
            <p>The verification link will expire in 24 hours.</p>
          </div>

          <div className="border-t pt-4">
            <p className="text-center text-sm text-muted-foreground mb-4">
              Didn't receive the email? Check your spam folder
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link to="/login">Back to login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground px-6">
        Need help?{' '}
        <a href="mailto:support@openmodal.ai" className="underline">
          Contact support
        </a>
      </p>
    </div>
  )
}
