"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("knovo-theme") as
      | "dark"
      | "light"
      | null;
    const initial = stored || "dark";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const applyTheme = (t: "dark" | "light") => {
    const html = document.documentElement;
    html.classList.remove("dark", "light");
    html.classList.add(t);
  };

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem("knovo-theme", next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative flex items-center justify-center w-10 h-10 rounded-full border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-300 cursor-pointer"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-400 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 text-purple-600 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
};

export default ThemeToggle;
