import React from "react";
import { Link } from "react-router-dom";

const Login: React.FC = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col items-center justify-center relative overflow-hidden selection:bg-primary selection:text-black">
      {/* Ambient Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Abstract blurred sparkline effect */}
        <svg
          className="absolute top-1/2 left-0 w-full h-full -translate-y-1/2 opacity-[0.03] blur-xl text-primary transform scale-150"
          fill="none"
          viewBox="0 0 1440 600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-100 400 L 100 350 L 300 500 L 500 200 L 700 400 L 900 150 L 1100 300 L 1300 100 L 1500 250"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="40"
          ></path>
        </svg>
        {/* Subtle radial gradient to center focus */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-dark/50 to-background-dark pointer-events-none"></div>
      </div>

      {/* Main Layout Container */}
      <div className="relative z-10 w-full max-w-md p-6 flex flex-col gap-6 animate-in fade-in zoom-in duration-500">
        {/* Login Card */}
        <div className="bg-surface-dark/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] p-8 w-full">
          {/* Header Section */}
          <div className="flex flex-col items-center gap-6 mb-8">
            {/* Logo */}
            <div className="size-12 rounded-xl bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center border border-white/5 shadow-inner">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Welcome back
              </h1>
              <p className="text-sm text-gray-400">
                Enter your details to access your portfolio.
              </p>
            </div>
          </div>

          {/* Form Section */}
          <form action="#" className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-gray-300 ml-1"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">
                    mail
                  </span>
                </div>
                <input
                  className="block w-full rounded-lg bg-white border border-white/10 text-black placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary pl-10 pr-4 py-3 text-sm transition-all outline-none"
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label
                  className="text-xs font-medium text-gray-300"
                  htmlFor="password"
                >
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">
                    lock
                  </span>
                </div>
                <input
                  className="block w-full rounded-lg bg-white border border-white/10 text-black placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary pl-10 pr-10 py-3 text-sm transition-all outline-none"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-black transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    visibility
                  </span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <a
                className="text-xs font-medium text-gray-400 hover:text-primary transition-colors"
                href="#"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <Link
              to="/matrix"
              className="mt-2 w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 px-4 rounded-lg transition-all transform active:scale-[0.98] shadow-[0_0_20px_-5px_rgba(83,210,45,0.3)] hover:shadow-[0_0_25px_-5px_rgba(83,210,45,0.5)] flex items-center justify-center gap-2"
            >
              <span>Sign In</span>
              <span className="material-symbols-outlined text-[20px] font-bold">
                arrow_forward
              </span>
            </Link>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface-dark px-3 text-gray-500 font-medium tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-white text-sm font-medium">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8455 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z"
                  fill="#34A853"
                ></path>
                <path
                  d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z"
                  fill="#FBBC05"
                ></path>
                <path
                  d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.0344664 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z"
                  fill="#EA4335"
                ></path>
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-white text-sm font-medium">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.15-.04-.21 0-1.1.455-2.16 1.07-3.12.52-.81 1.304-1.49 2.248-1.49.12 0 .23.02.3.03.01.06.04.15.04.21zm-1.36 17.4c-.947 1.85-2.67 3.51-4.33 3.51-1.096 0-1.55-.57-2.986-.57-1.437 0-1.745.54-2.887.54-1.896 0-3.344-1.89-4.38-4.32-1.92-4.57-1.18-8.91 1.76-10.45 1.438-.76 2.525-.26 3.424-.26 1.01 0 1.83.64 2.5.64.67 0 1.936-.88 3.39-.75 2.527.23 3.655 2.13 3.655 2.13-2.094 1.25-2.046 4.75.293 6.09-.76 1.86-1.61 3.52-2.42 5.23l-1.92 1.31z"></path>
              </svg>
              Apple
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <a
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
                href="#"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
