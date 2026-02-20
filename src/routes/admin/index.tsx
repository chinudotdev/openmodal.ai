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

        {/* Jobs Card - Coming Soon */}
        <Card className="opacity-50 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="text-2xl">💼</span>
              Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage job categories and automation risk data
            </p>
            <Button variant="outline" size="sm" disabled className="w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* Technologies Card - Coming Soon */}
        <Card className="opacity-50 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              Technologies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage AI technologies and organizations
            </p>
            <Button variant="outline" size="sm" disabled className="w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* Reports Card - Coming Soon */}
        <Card className="opacity-50 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
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
