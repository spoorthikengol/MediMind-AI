import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";

import {
  Activity,
  FileText,
  TrendingUp,
  Award,
  Flame,
  Trophy,
  Sparkles,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { StatCard } from "@/components/stat-card";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";

import { toast } from "sonner";
import { api } from "@/lib/api";

export const Route = createFileRoute("/app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const [user, setUser] = useState<any>({
    name: "",
    email: "",
  });

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);

  const fetchAll = useCallback(() => {
    setLoading(true);
    setError(null);

    Promise.all([api.getProfile(), api.getDashboard()])
      .then(([profileData, dashboardData]) => {
        setUser({
          name: profileData.full_name,
          email: profileData.email,
        });

        setStats(dashboardData);
      })
      .catch((err) => {
        setError(err?.message || "Unable to load your profile.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((s: string) => s[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const save = async () => {
    try {
      await api.updateProfile({
        full_name: user.name,
      });

      toast.success("Profile updated");
    } catch (err) {
      console.log(err);
      toast.error("Update failed");
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different");
      return;
    }

    try {
      setChangingPassword(true);

      await api.changePassword(
        currentPassword,
        newPassword
      );

      toast.success("Password changed successfully");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(
        err?.message || "Failed to change password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <LoadingState
        label="Loading profile..."
        fullScreen
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load profile"
        message={error}
        onRetry={fetchAll}
        fullScreen
      />
    );
  }

  const achievements = [
    {
      icon: Award,
      title: "First Report",
      desc: "Uploaded your first analysis",
      earned: (stats?.total_reports ?? 0) >= 1,
    },
    {
      icon: Flame,
      title: "Tracking",
      desc: "3+ reports uploaded",
      earned: (stats?.total_reports ?? 0) >= 3,
    },
    {
      icon: TrendingUp,
      title: "Improver",
      desc: "Health trend is positive",
      earned: /improv|excellent|stable/i.test(
        stats?.health_trend || ""
      ),
    },
    {
      icon: Sparkles,
      title: "AI Explorer",
      desc: "Coming soon",
      earned: false,
      locked: true,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}

      <div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Profile
        </h1>

        <p className="mt-1 text-muted-foreground">
          Manage your information and preferences.
        </p>
      </div>

      {/* Profile Hero */}

      <Card className="border-0 shadow-glow gradient-herotext-white overflow-hidden relative">
        <CardContent className="p-6 flex items-center gap-5">

          <div className="relative">

            <div className="h-20 w-20 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-semibold">
              {initials}
            </div>

            <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-health-green flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white" />
            </span>

          </div>

          <div>

            <div className="text-2xl font-semibold">
              {user.name || "User"}
            </div>

            <div className="text-sm opacity-80">
              {user.email}
            </div>

            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs">
              <Activity className="h-3 w-3" />
              Active member
            </div>

          </div>

        </CardContent>
      </Card>

      {/* Statistics */}

      <div className="grid gap-4 sm:grid-cols-3">

        <StatCard
          label="Reports"
          value={stats?.total_reports || 0}
          icon={FileText}
        />

        <StatCard
          label="Avg Health Score"
          value={stats?.average_health_score || 0}
          icon={Activity}
          tone="success"
        />

        <StatCard
          label="Highest Score"
          value={stats?.highest_health_score || 0}
          icon={TrendingUp}
          tone="success"
        />

      </div>

      {/* Achievements */}

      <Card className="card-premium border-0 shadow-card">

        <CardHeader>

          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-warning" />
            Achievements
          </CardTitle>

        </CardHeader>

        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {achievements.map((a) => {

            const Icon = a.icon;

            return (
              <div
                key={a.title}
                className={`rounded-2xl border p-4 flex items-center gap-3 transition ${
                  a.earned
                    ? "hover:shadow-md"
                    : "opacity-50"
                }`}
              >

                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    a.earned
                      ? "bg-blue-600 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >

                  {a.locked ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}

                </div>

                <div>

                  <div className="text-sm font-semibold flex items-center gap-1.5">

                    {a.title}

                    {a.locked && (
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                      >
                        Soon
                      </Badge>
                    )}

                  </div>

                  <div className="text-xs text-muted-foreground">
                    {a.desc}
                  </div>

                </div>

              </div>
            );

          })}

        </CardContent>
      </Card>

      {/* Personal Information + Account Settings */}

      <div className="grid gap-6 md:grid-cols-2">

        {/* Personal Information */}

        <Card className="card-premium">

          <CardHeader>
            <CardTitle>
              Personal Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="space-y-2">

              <Label>
                Full Name
              </Label>

              <Input
                value={user.name}
                onChange={(e) =>
                  setUser({
                    ...user,
                    name: e.target.value,
                  })
                }
              />

            </div>

            <div className="space-y-2">

              <Label>
                Email
              </Label>

              <Input
                type="email"
                value={user.email}
                disabled
              />

              <p className="text-xs text-muted-foreground">
                Email can't be changed yet.
              </p>

            </div>

            <Button onClick={save}>
              Save changes
            </Button>

          </CardContent>
        </Card>

        {/* Account Settings */}

        <Card className="card-premium">

          <CardHeader>
            <CardTitle>
              Account Settings
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <SettingRow
              title="Email notifications"
              desc="Weekly health digest"
            />

            <Separator />

            <SettingRow
              title="Report reminders"
              desc="Upload reminders"
            />

            <Separator />

            <SettingRow
              title="AI insights"
              desc="Personalized suggestions"
            />

          </CardContent>
        </Card>

      </div>

      {/* Security & Privacy */}

      <Card className="card-premium">

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <ShieldCheck className="h-5 w-5 text-brand" />

            Security & Privacy

          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-5">

          <div>

            <h3 className="font-medium">
              Change Password
            </h3>

            <p className="text-sm text-muted-foreground mt-1">
              Keep your MediMind account secure by using
              a strong password.
            </p>

          </div>

          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            visible={showCurrentPassword}
            onToggle={() =>
              setShowCurrentPassword(
                !showCurrentPassword
              )
            }
          />

          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            visible={showNewPassword}
            onToggle={() =>
              setShowNewPassword(
                !showNewPassword
              )
            }
          />

          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={showConfirmPassword}
            onToggle={() =>
              setShowConfirmPassword(
                !showConfirmPassword
              )
            }
          />

          <div className="flex items-center justify-between gap-4">

            <p className="text-xs text-muted-foreground">
              Password must contain at least 8 characters.
            </p>

            <Button
              onClick={changePassword}
              disabled={changingPassword}
            >
              {changingPassword
                ? "Changing Password..."
                : "Change Password"}
            </Button>

          </div>

        </CardContent>

      </Card>

    </div>
  );
}

/* Password Field */

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-2">

      <Label>
        {label}
      </Label>

      <div className="relative">

        <Input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="pr-10"
          autoComplete={
            label === "Current Password"
              ? "current-password"
              : "new-password"
          }
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={
            visible
              ? `Hide ${label}`
              : `Show ${label}`
          }
        >

          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}

        </button>

      </div>

    </div>
  );
}

/* Disabled settings */

function SettingRow({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-center justify-between opacity-60">

      <div>

        <div className="text-sm font-medium flex items-center gap-1.5">

          {title}

          <Badge
            variant="outline"
            className="text-[10px]"
          >
            Coming soon
          </Badge>

        </div>

        <div className="text-xs text-muted-foreground">
          {desc}
        </div>

      </div>

      <Switch
        checked={false}
        disabled
      />

    </div>
  );
}