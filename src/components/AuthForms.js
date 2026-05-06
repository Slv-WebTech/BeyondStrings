import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Briefcase, Heart, LogIn, Moon, Settings2, ShieldCheck, Sparkles, Sun, UserRoundPlus, Users, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import HelpModal from "./HelpModal";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { clearAuthError, loginUser, registerUser, selectAuthError, selectAuthStatus, updateUserProfile } from "../store/authSlice";
import { selectChatMode, selectThemePreference, setChatMode, setThemePreference } from "../store/appSessionSlice";
import { BRAND, BRAND_ASSETS } from "../config/branding";
import wallpaperLeft from "../assets/wallpapers/premium-diagonal-a.jpg";
import wallpaperRight from "../assets/wallpapers/premium-diagonal-b.jpg";

const fadeStaggerItem = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

function UsernameSetupDialog({ open, onOpenChange, onSuccess, visualTheme }) {
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const [username, setUsername] = useState("");
  const isLightTheme = visualTheme === "light";
  const errorClass = isLightTheme
    ? "rounded-2xl border border-red-300/70 bg-red-50 px-3 py-2 text-sm text-red-700"
    : "rounded-2xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200";
  const USERNAME_PATTERN = /^[A-Z][A-Za-z0-9_]{2,19}$/;
  const formatUsername = (value) => {
    const safeValue = String(value || "").trim().replace(/[^A-Za-z0-9_]/g, "");
    if (!safeValue) {
      return "";
    }
    return `${safeValue.charAt(0).toUpperCase()}${safeValue.slice(1)}`;
  };
  const formattedUsername = formatUsername(username);
  const isValidUsername = USERNAME_PATTERN.test(formattedUsername);
  const canSubmit = useMemo(() => isValidUsername && status !== "loading", [username, status]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(updateUserProfile({ username: formattedUsername }));
    if (updateUserProfile.fulfilled.match(result)) {
      setUsername("");
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        // Keep this flow mandatory until username is successfully saved.
        if (nextOpen) {
          onOpenChange(true);
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={`fixed inset-0 z-40 backdrop-blur-sm ${isLightTheme ? "bg-slate-900/35" : "bg-slate-950/65"}`} />
        <Dialog.Content
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          className={`fixed left-1/2 top-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-[1.4rem] border p-5 shadow-2xl ${isLightTheme ? "border-slate-200 bg-white/92 text-slate-800" : "border-white/10 bg-slate-950/92 text-slate-100"
            }`}
        >
          <Dialog.Title className="text-lg font-semibold tracking-tight">Choose Your Username</Dialog.Title>
          <Dialog.Description className={`mt-1 text-sm ${isLightTheme ? "text-slate-500" : "text-slate-300/80"}`}>
            {`This is how you'll appear to others in ${BRAND.name}.`}
          </Dialog.Description>

          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <label className="block space-y-1">
              <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>Username</span>
              <Input
                value={username}
                onChange={(event) => setUsername(formatUsername(event.target.value))}
                placeholder="Viveks05"
                className={`rounded-2xl ${isLightTheme ? "border-slate-300 bg-white text-slate-800" : ""}`}
                autoFocus
              />
              <p className={`text-xs ${isValidUsername ? (isLightTheme ? "text-slate-500" : "text-slate-400") : "text-red-400"}`}>
                3-20 chars, start with a capital letter; letters, numbers, underscore.
              </p>
            </label>

            {error ? <p className={errorClass}>{error}</p> : null}

            <Button type="submit" className="h-11 w-full" disabled={!canSubmit}>
              {status === "loading" ? "Saving..." : "Continue"}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function AuthDialog({ mode, open, onOpenChange, onSuccess, visualTheme, onSignupSuccess }) {
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isLogin = mode === "login";
  const actionLabel = isLogin ? "Sign In" : "Create Account";
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = useMemo(() => isValidEmail && password.length >= 6 && status !== "loading", [email, password, status]);
  const isLightTheme = visualTheme === "light";
  const errorClass = isLightTheme
    ? "rounded-2xl border border-red-300/70 bg-red-50 px-3 py-2 text-sm text-red-700"
    : "rounded-2xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200";
  const dialogSkinClass = isLightTheme
    ? "border-white/80 bg-white/78 text-slate-800"
    : "border-cyan-200/25 bg-slate-950/72 text-slate-100";
  const fieldClass = isLightTheme
    ? "rounded-2xl border-slate-300 bg-white/90 text-slate-800"
    : "rounded-2xl border-cyan-100/20 bg-slate-900/65 text-slate-100";
  const dialogOverlayClass = isLightTheme
    ? "absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.72),rgba(241,245,249,0.82))]"
    : "absolute inset-0 bg-[linear-gradient(140deg,rgba(2,6,23,0.42),rgba(3,23,38,0.86))]";
  const dialogGlowClass = isLightTheme
    ? "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.12),transparent_42%),radial-gradient(circle_at_86%_85%,rgba(16,185,129,0.1),transparent_44%)]"
    : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.18),transparent_42%),radial-gradient(circle_at_86%_85%,rgba(16,185,129,0.16),transparent_44%)]";

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearAuthError());
    const action = isLogin ? loginUser : registerUser;
    const result = await dispatch(action({ email: email.trim(), password }));
    if (action.fulfilled.match(result)) {
      setPassword("");
      if (!isLogin) {
        onOpenChange(false);
        onSignupSuccess?.(email.trim());
      } else {
        onOpenChange(false);
        onSuccess?.();
      }
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          dispatch(clearAuthError());
        }
        onOpenChange(nextOpen);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={`fixed inset-0 z-40 backdrop-blur-md ${isLightTheme ? "bg-slate-900/30" : "bg-slate-950/72"}`} />
        <Dialog.Content
          className={`fixed left-1/2 top-1/2 z-50 w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.5rem] border p-5 shadow-2xl backdrop-blur-2xl ${dialogSkinClass}`}
        >
          <div className="pointer-events-none absolute inset-0">
            <img src={isLogin ? wallpaperLeft : wallpaperRight} alt="" className="h-full w-full object-cover opacity-28" />
            <div className={dialogOverlayClass} />
          </div>
          <div className={dialogGlowClass} />
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
          <motion.div variants={fadeStaggerItem} initial="initial" animate="animate" transition={{ duration: 0.25, delay: 0.04 }}>
          <Dialog.Title className="text-lg font-semibold tracking-tight">{actionLabel}</Dialog.Title>
          <Dialog.Description className={`mt-1 text-sm ${isLightTheme ? "text-slate-500" : "text-slate-300/80"}`}>
            {isLogin ? "Email + password." : "Create your account in seconds."}
          </Dialog.Description>
          </motion.div>

          <motion.form
            className="mt-4 space-y-3"
            onSubmit={handleSubmit}
            initial="initial"
            animate="animate"
            transition={{ staggerChildren: 0.06, delayChildren: 0.08 }}
          >
            <motion.label className="block space-y-1" variants={fadeStaggerItem} transition={{ duration: 0.22 }}>
              <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>Email</span>
              <Input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="you@example.com"
                className={fieldClass}
                autoFocus
              />
            </motion.label>
            <motion.label className="block space-y-1" variants={fadeStaggerItem} transition={{ duration: 0.22 }}>
              <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>Password</span>
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="At least 6 characters"
                className={fieldClass}
              />
            </motion.label>

            {error ? <motion.p variants={fadeStaggerItem} className={errorClass}>{error}</motion.p> : null}

            <motion.div variants={fadeStaggerItem} transition={{ duration: 0.22 }}>
              <Button type="submit" className="h-11 w-full" disabled={!canSubmit}>
                {status === "loading" ? "Working..." : actionLabel}
              </Button>
            </motion.div>
          </motion.form>

          <Dialog.Close
            className={`absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${isLightTheme ? "border-slate-200 text-slate-500 hover:bg-slate-100" : "border-white/10 text-slate-300 hover:bg-white/10"
              }`}
          >
            <X size={16} />
          </Dialog.Close>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function AuthForms({ onAuthenticated }) {
  const dispatch = useDispatch();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [usernameSetupOpen, setUsernameSetupOpen] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const appearanceRef = useRef(null);
  const moodMode = useSelector(selectChatMode);
  const themePreference = useSelector(selectThemePreference);
  const [prefersDark, setPrefersDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const visualTheme = themePreference === "system" ? (prefersDark ? "dark" : "light") : themePreference;
  const isProfessional = moodMode === "professional";
  const isCasual = moodMode === "casual";
  const isLightTheme = visualTheme === "light";

  const shellClass = isLightTheme
    ? isProfessional
      ? "bg-[radial-gradient(circle_at_8%_14%,rgba(56,189,248,0.2),transparent_33%),radial-gradient(circle_at_88%_84%,rgba(16,185,129,0.16),transparent_28%),linear-gradient(145deg,#f8fafc_0%,#e2e8f0_100%)]"
      : "bg-[radial-gradient(circle_at_12%_18%,rgba(244,114,182,0.22),transparent_34%),radial-gradient(circle_at_86%_80%,rgba(167,139,250,0.18),transparent_30%),linear-gradient(145deg,#fdf2f8_0%,#eef2ff_100%)]"
    : isProfessional
      ? "bg-[radial-gradient(circle_at_12%_16%,rgba(56,189,248,0.2),transparent_32%),radial-gradient(circle_at_84%_82%,rgba(16,185,129,0.16),transparent_28%),linear-gradient(150deg,#050f18_0%,#0f1f2f_100%)]"
      : "bg-[radial-gradient(circle_at_14%_18%,rgba(244,114,182,0.22),transparent_34%),radial-gradient(circle_at_84%_82%,rgba(251,113,133,0.18),transparent_32%),linear-gradient(150deg,#180a18_0%,#2a1025_100%)]";

  const shellVeilClass = isLightTheme ? "bg-white/24" : "bg-slate-950/38";
  const pageFilmClass = isLightTheme
    ? "pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.48)_0%,rgba(248,250,252,0.42)_48%,rgba(241,245,249,0.54)_100%)]"
    : "pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(7,12,24,0.72)_0%,rgba(7,12,24,0.54)_48%,rgba(8,17,28,0.75)_100%)]";
  const pageGlowClass = isLightTheme
    ? "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(59,130,246,0.12),transparent_38%),radial-gradient(circle_at_82%_80%,rgba(16,185,129,0.1),transparent_40%)]"
    : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(59,130,246,0.2),transparent_38%),radial-gradient(circle_at_82%_80%,rgba(16,185,129,0.16),transparent_40%)]";
  const cardClass = isLightTheme
    ? "border-white/70 bg-white/62 text-slate-800"
    : "border-white/12 bg-slate-950/55 text-slate-100";
  const panelClass = isLightTheme ? "border-slate-200/80 bg-white/54" : "border-white/12 bg-white/[0.05]";
  const bodyTextClass = isLightTheme ? "text-slate-600" : "text-slate-300/85";
  const chipClass = isLightTheme ? "border-slate-300 bg-white/70 text-slate-700" : "border-white/20 bg-white/10 text-slate-100";
  const segmentBaseClass = isLightTheme ? "border-slate-300 bg-white/70 text-slate-600" : "border-white/15 bg-white/5 text-slate-300";
  const moodSwitchLabel = moodMode === "professional" ? "Casual" : "Professional";
  const themeSwitchTarget = visualTheme === "dark" ? "light" : "dark";

  const primaryButtonClass = isCasual
    ? "bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white hover:from-pink-400 hover:to-fuchsia-400"
    : "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400";

  const secondaryButtonClass = isLightTheme
    ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
    : "border-slate-400/35 bg-slate-900/65 text-slate-100 hover:bg-slate-800/70";

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setPrefersDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!showAppearance) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!appearanceRef.current?.contains(event.target)) {
        setShowAppearance(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowAppearance(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showAppearance]);

  return (
    <div className={`relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 py-8 transition-all sm:px-6 [font-family:'Sora','Manrope','Segoe_UI',sans-serif] ${shellClass}`}>
      <div className={`hero-orb left-[-70px] top-[6%] h-44 w-44 ${isCasual ? "bg-pink-300/28" : "bg-cyan-300/24"}`} />
      <div className={`hero-orb right-[-60px] top-[18%] h-64 w-64 ${isCasual ? "bg-fuchsia-300/26" : "bg-emerald-300/22"}`} />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 overflow-hidden [clip-path:polygon(0_0,64%_0,42%_100%,0_100%)]">
          <img src={wallpaperLeft} alt="" className="h-full w-full object-cover opacity-36" />
        </div>
        <div className="absolute inset-0 overflow-hidden [clip-path:polygon(58%_0,100%_0,100%_100%,36%_100%)]">
          <img src={wallpaperRight} alt="" className="h-full w-full object-cover opacity-34" />
        </div>
      </div>
      <div className={pageFilmClass} />
      <div className={pageGlowClass} />
      <div className={`pointer-events-none absolute inset-0 ${shellVeilClass}`} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.08)_100%)]" />

      <motion.div
        className="relative z-10 w-full max-w-3xl"
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.42, ease: "easeOut" }}
      >
      <Card className={`rounded-[1.8rem] border backdrop-blur-2xl transition-all ${cardClass}`}>
        <CardContent className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.25fr,1fr] lg:p-7">
          <motion.div
            className="flex flex-wrap items-center justify-between gap-3 lg:col-span-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.06 }}
          >
            <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${bodyTextClass}`}>Welcome</p>

            <div className="flex items-center gap-1.5">
              <HelpModal isAdmin={false} />

              <div className="relative" ref={appearanceRef}>
                <button
                  type="button"
                  aria-label="Open appearance settings"
                  onClick={() => setShowAppearance((current) => !current)}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${segmentBaseClass}`}
                >
                  <Settings2 size={16} />
                </button>

                {showAppearance ? (
                  <div
                    className={`absolute right-0 top-11 z-20 w-auto min-w-[11.5rem] max-w-[calc(100vw-2rem)] rounded-2xl border p-2.5 shadow-2xl backdrop-blur-xl ${isLightTheme ? "border-slate-200 bg-white/95 text-slate-700" : "border-white/15 bg-slate-950/92 text-slate-200"
                      }`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">Appearance</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={moodSwitchLabel}
                        onClick={() => dispatch(setChatMode(moodMode === "professional" ? "casual" : "professional"))}
                        className={`relative inline-flex h-8 w-[5rem] items-center rounded-full border px-1 transition ${segmentBaseClass}`}
                      >
                        <span className="inline-flex w-full items-center justify-between px-1" aria-hidden="true">
                          <Briefcase size={12} className={isProfessional ? "text-emerald-500" : "opacity-50"} />
                          <Heart size={12} className={isCasual ? "text-pink-500" : "opacity-50"} />
                        </span>
                        <span
                          className={`pointer-events-none absolute top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-700 shadow transition-all dark:bg-slate-200 ${isCasual ? "left-[3.25rem]" : "left-1"}`}
                        >
                          {isCasual ? <Heart size={11} /> : <Briefcase size={11} />}
                        </span>
                      </button>

                      <button
                        type="button"
                        aria-label={themeSwitchTarget === "light" ? "Light" : "Dark"}
                        onClick={() => dispatch(setThemePreference(visualTheme === "dark" ? "light" : "dark"))}
                        className={`relative inline-flex h-8 w-[5rem] items-center rounded-full border px-1 transition ${segmentBaseClass}`}
                      >
                        <span className="inline-flex w-full items-center justify-between px-1" aria-hidden="true">
                          <Sun size={12} className={isLightTheme ? "text-amber-500" : "opacity-50"} />
                          <Moon size={12} className={!isLightTheme ? "text-indigo-400" : "opacity-50"} />
                        </span>
                        <span
                          className={`pointer-events-none absolute top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-700 shadow transition-all dark:bg-slate-200 ${isLightTheme ? "left-1" : "left-[3.25rem]"}`}
                        >
                          {isLightTheme ? <Sun size={11} /> : <Moon size={11} />}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>

          <motion.section
            className={`space-y-4 rounded-[1.3rem] border p-5 transition-all backdrop-blur-xl ${panelClass}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, delay: 0.12 }}
          >
              <img
              src={isLightTheme ? BRAND_ASSETS.logoLight : BRAND_ASSETS.logoDark}
              alt={BRAND.name}
              className="h-14 w-auto max-w-[11rem] object-contain"
            />
            <p className={`text-[11px] font-bold uppercase tracking-[0.28em] ${isCasual ? "text-pink-400/90" : "text-emerald-400/90"}`}>{BRAND.name}</p>
            <h1 className={`text-3xl leading-tight tracking-tight sm:text-[2rem] ${isLightTheme ? "text-slate-900" : "text-white"}`}>{BRAND.tagline}</h1>
            <p className={`text-sm leading-6 ${bodyTextClass}`}>Real accounts, direct + group chats, end-to-end encrypted.</p>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${chipClass}`}>
                <ShieldCheck size={13} />
                Firebase Auth
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${chipClass}`}>
                <Users size={13} />
                Direct + Group Chats
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${chipClass}`}>
                <Sparkles size={13} />
                End-to-End Encrypted
              </span>
            </div>
          </motion.section>

          <motion.section
            className={`space-y-3 rounded-[1.3rem] border p-5 transition-all backdrop-blur-xl ${panelClass}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, delay: 0.2 }}
          >
            <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${bodyTextClass}`}>Get Started</p>

            <Button type="button" className={`h-11 w-full justify-center ${primaryButtonClass}`} onClick={() => setRegisterOpen(true)}>
              <UserRoundPlus size={16} />
              Create Account
            </Button>

            <Button
              type="button"
              variant="secondary"
              className={`h-11 w-full justify-center border ${secondaryButtonClass}`}
              onClick={() => setLoginOpen(true)}
            >
              <LogIn size={16} />
              Sign In
            </Button>
          </motion.section>
        </CardContent>
      </Card>
      </motion.div>

      <AuthDialog
        mode="register"
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSuccess={onAuthenticated}
        visualTheme={visualTheme}
        onSignupSuccess={() => {
          setUsernameSetupOpen(true);
        }}
      />
      <AuthDialog mode="login" open={loginOpen} onOpenChange={setLoginOpen} onSuccess={onAuthenticated} visualTheme={visualTheme} />
      <UsernameSetupDialog
        open={usernameSetupOpen}
        onOpenChange={setUsernameSetupOpen}
        onSuccess={onAuthenticated}
        visualTheme={visualTheme}
      />
    </div>
  );
}


