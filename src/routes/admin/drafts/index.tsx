import { Link, createFileRoute } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/drafts/')({
  component: AdminDraftsPage,
})

function AdminDraftsPage() {
  return (
    <main className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Draft Changes</h1>
        <p className="text-muted-foreground">
          Review and approve draft changes to capabilities, capability subtypes,
          jobs, organizations, and technologies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* Capabilities Card */}
        <Link to="/admin/drafts/capabilities">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Review draft changes to AI capabilities
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Review Drafts →
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Capability Subtypes Card */}
        <Link to="/admin/drafts/capability-subtypes">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">🔬</span>
                Capability Subtypes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Review draft changes to domain-specific capabilities
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Review Drafts →
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Jobs Card */}
        <Link to="/admin/drafts/jobs">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">💼</span>
                Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Review draft changes to job listings and automation data
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Review Drafts →
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Organizations Card */}
        <Link to="/admin/drafts/organizations">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">🏢</span>
                Organizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Review draft changes to organizations
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Review Drafts →
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Technologies Card */}
        <Link to="/admin/drafts/technologies">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">⚙️</span>
                Technologies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Review draft changes to technologies
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Review Drafts →
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  )
}
