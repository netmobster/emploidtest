import { Mail, Lightbulb, LayoutDashboard, Info } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5" />
            About
          </Link>
          <Link
            to="/employer-dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <a
            href="mailto:wearecleardigital@gmail.com"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            Contact
          </a>
          <a
            href="https://wtfisecho.com/antigravity"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            built with &lt;3 by Antigravity Media
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Emploid. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;