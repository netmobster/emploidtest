import { Link } from "react-router-dom";
import emploidLogo from "@/assets/emploid-logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  linkTo?: string;
  className?: string;
}

const sizeClasses = {
  sm: "h-12",
  md: "h-20",
  lg: "h-32",
  xl: "h-80 md:h-96",
};

const Logo = ({ size = "md", linkTo = "/", className = "" }: LogoProps) => {
  const logoImage = (
    <img
      src={emploidLogo}
      alt="Emploid - Find your kind of work. Keep your kind of people."
      className={`${sizeClasses[size]} w-auto ${className}`}
    />
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-block">
        {logoImage}
      </Link>
    );
  }

  return logoImage;
};

export default Logo;
