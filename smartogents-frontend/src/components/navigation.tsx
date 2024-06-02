import { Link, useLocation } from "react-router-dom";
import { NavButton } from "./nav-button";
import { navLinks } from "@/constants";

export const Navigation = () => {
  const location = useLocation();
  const { pathname } = location;
  return (
    <>
      <nav className="flex-between w-full mb-16 pt-3">
        <div>
          <Link to="/">
            <h2 className="orange_gradient font-bold">Smartogents</h2>
          </Link>
        </div>

        <div className="flex items-center gap-x-2">
          {navLinks.map((route) => (
            <NavButton
              key={route.path}
              href={route.path}
              label={route.label}
              isActive={pathname === route.path}
            />
          ))}
        </div>
      </nav>
    </>
  );
};
