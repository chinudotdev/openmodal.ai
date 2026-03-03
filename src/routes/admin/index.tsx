import { Link, createFileRoute } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

function AdminDashboard() {
  return (
    <main className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your platform content and settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Drafts Card */}
        <Link to="/admin/drafts">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">📝</span>
                Drafts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Review and approve draft changes to capabilities, subtypes, and
                jobs
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Review Drafts →
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Capabilities Card */}
        <Link to="/admin/capabilities">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage AI capabilities, categories, and progress tracking
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Manage →
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Jobs Card */}
        <Link to="/admin/jobs">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">💼</span>
                Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage job listings, automation risk data, and tasks
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Manage →
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Organizations Card */}
        <Link to="/admin/organizations">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">🏢</span>
                Organizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage AI companies, labs, and sponsors
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Manage →
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Reports Card - Coming Soon */}
        <Card className="opacity-50 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Moderate and manage community impact reports
            </p>
            <Button variant="outline" size="sm" disabled className="w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* Users Card - Coming Soon */}
        <Card className="opacity-50 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage users, roles, and permissions
            </p>
            <Button variant="outline" size="sm" disabled className="w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* Settings Card - Coming Soon */}
        <Card className="opacity-50 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Platform configuration and settings
            </p>
            <Button variant="outline" size="sm" disabled className="w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
