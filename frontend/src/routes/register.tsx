import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      await api.register(name, email, password);

      toast.success("Account created successfully!");

      // Automatically login after registration
      await api.login(email, password);

      localStorage.setItem(
        "medimind_user",
        JSON.stringify({
          name,
          email,
        })
      );

      navigate({
        to: "/app/dashboard",
      });

    } catch (error: any) {
      console.error(error);

      toast.error(
        error.message || "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start understanding your health in seconds"
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-brand font-medium"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form
        onSubmit={onSubmit}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="name">
            Full Name
          </Label>

          <Input
            id="name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Jane Doe"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email
          </Label>

          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            Password
          </Label>

          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            minLength={8}
            placeholder="At least 8 characters"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full gradient-brand border-0 text-white h-11"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}