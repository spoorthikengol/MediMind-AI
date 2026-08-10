import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPage });

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
      toast.success("Reset link sent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a secure reset link"
      footer={<Link to="/login" className="text-brand font-medium">Back to sign in</Link>}
    >
      {sent ? (
        <div className="text-center py-6">
          <div className="mx-auto h-14 w-14 rounded-full bg-success/15 text-success flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <p className="mt-4 text-sm">Check your inbox for a reset link.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <Button type="submit" disabled={loading} className="w-full gradient-brand border-0 text-white h-11">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}