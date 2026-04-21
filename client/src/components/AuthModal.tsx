import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        await register(username, password, email);
      }
      setUsername("");
      setEmail("");
      setPassword("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#111] border border-white/10 rounded-xl w-full max-w-sm p-6 relative"
          >
            <button
              data-testid="button-close-auth"
              onClick={onClose}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X size={18} />
            </button>

            <h2 className="text-white text-lg font-bold uppercase tracking-[0.2em] mb-6 text-center">
              {mode === "login" ? "Sign In" : "Create Account"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                data-testid="input-auth-username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                autoComplete="username"
              />
              {mode === "register" && (
                <Input
                  data-testid="input-auth-email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  autoComplete="email"
                />
              )}
              <Input
                data-testid="input-auth-password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <Button
                data-testid="button-auth-submit"
                type="submit"
                disabled={loading || !username || !password || (mode === "register" && !email)}
                className="w-full bg-white text-black hover:bg-white/90 font-bold uppercase tracking-wider"
              >
                {mode === "login" ? (
                  <><LogIn size={14} className="mr-2" /> {loading ? "Signing in..." : "Sign In"}</>
                ) : (
                  <><UserPlus size={14} className="mr-2" /> {loading ? "Creating..." : "Create Account"}</>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                data-testid="button-toggle-auth-mode"
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError("");
                }}
                className="text-white/40 hover:text-white text-xs uppercase tracking-wider transition-colors"
              >
                {mode === "login" ? "Don't have an account? Register" : "Already have an account? Sign In"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
