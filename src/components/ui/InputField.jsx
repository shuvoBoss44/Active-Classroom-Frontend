"use client";

import { useState, forwardRef } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const InputField = forwardRef(
  (
    {
      label,
      name,
      type = "text",
      placeholder,
      error,
      success,
      icon: Icon,
      className,
      containerClassName,
      labelClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Toggle between 'password' and 'text'
    const inputType = type === "password" && showPassword ? "text" : type;
    const isPassword = type === "password";

    return (
      <div className={cn("w-full space-y-1.5", containerClassName)}>
        {/* Label Section */}
        {label && (
          <label
            htmlFor={name}
            className={cn(
              "block text-sm font-semibold text-gray-700 transition-colors",
              isFocused && "text-emerald-600",
              error && "text-red-600",
              labelClassName
            )}
          >
            {label}
          </label>
        )}

        {/* Input Wrapper */}
        <div className="relative group">
          {/* Left Icon */}
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-emerald-600">
              <Icon className="h-5 w-5" />
            </div>
          )}

          {/* The Input Itself */}
          <input
            ref={ref}
            name={name}
            type={inputType}
            placeholder={placeholder}
            disabled={disabled}
            onFocus={e => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={e => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              // Base Styles
              "w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200",

              // Icon Padding Adjustments
              Icon && "pl-11",
              (isPassword || success || error) && "pr-11",

              // Focus State (The Emerald Glow)
              "focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10",

              // Hover State
              "hover:border-gray-300",

              // Error State
              error &&
                "border-red-300 focus:border-red-500 focus:ring-red-500/10 bg-red-50/30 text-red-900 placeholder:text-red-300",

              // Success State
              success &&
                "border-green-300 focus:border-green-500 focus:ring-green-500/10 bg-green-50/30",

              // Disabled State
              disabled &&
                "cursor-not-allowed bg-gray-100 text-gray-500 opacity-70",

              className
            )}
            {...props}
          />

          {/* Right Actions (Password Toggle or Status Icons) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Error Icon */}
            {error && !isPassword && (
              <AlertCircle className="h-5 w-5 text-red-500 animate-pulse" />
            )}

            {/* Success Icon */}
            {success && !isPassword && (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}

            {/* Password Toggle Button */}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={disabled}
                className="text-gray-400 hover:text-emerald-600 transition-colors focus:outline-none p-1 rounded-md hover:bg-gray-100"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Helper Text / Error Message */}
        {(error || props.helperText) && (
          <p
            className={cn(
              "text-xs font-medium animate-in slide-in-from-top-1 fade-in",
              error ? "text-red-600" : "text-gray-500"
            )}
          >
            {error || props.helperText}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
