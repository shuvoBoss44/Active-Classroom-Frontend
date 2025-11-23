// src/components/ui/Card.jsx
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./Button";
import { Badge } from "./Badge"; // Ensure this is the new, upgraded Badge
import {
  Users,
  BookOpen,
  Clock,
  Star,
  ArrowRight,
  ShieldCheck,
  Zap, // Added a new icon for 'Exams' stat
} from "lucide-react";

// The main Card component
const Card = ({ children, className, hoverable = true, ...props }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-[24px] shadow-xl border border-gray-100/70 overflow-hidden transition-all duration-500 ease-in-out will-change-transform",
        // PREMIUM HOVER EFFECT
        hoverable &&
          "hover:shadow-2xl hover:shadow-emerald-500/15 hover:-translate-y-1.5 hover:border-emerald-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header (Image + Badge)
Card.Header = function CardHeader({ children, className }) {
  return <div className={cn("relative", className)}>{children}</div>;
};

// Card Thumbnail
Card.Thumbnail = function CardThumbnail({
  src,
  alt,
  className,
  badge,
  priority = false,
}) {
  return (
    // Thumbnail container with slightly rounded top corners
    <div className="relative aspect-[16/9] overflow-hidden bg-gray-50 rounded-t-2xl">
      <Image
        src={src || "/course-placeholder.jpg"}
        alt={alt}
        fill
        // Image transition is smoother and more dramatic
        className="object-cover transition-transform duration-[600ms] hover:scale-[1.05] will-change-transform"
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      {/* Badge positioned perfectly */}
      {badge && (
        <div className="absolute top-4 right-4 z-10">
          <Badge variant={badge.variant || "subtle"}>{badge.text}</Badge>
        </div>
      )}
    </div>
  );
};

// Card Content (Main body)
Card.Content = function CardContent({ children, className }) {
  return <div className={cn("p-6 space-y-4", className)}>{children}</div>;
};

// Card Title (More dominant typography)
Card.Title = function CardTitle({ children, className }) {
  return (
    <h3
      className={cn(
        "text-2xl font-extrabold text-gray-900 line-clamp-2 transition-colors duration-200 group-hover:text-emerald-700",
        className
      )}
    >
      {children}
    </h3>
  );
};

// Card Description (Cleaned up)
Card.Description = function CardDescription({ children, className }) {
  return (
    <p
      className={cn(
        "text-gray-500 text-base line-clamp-2 leading-normal mt-2",
        className
      )}
    >
      {children}
    </p>
  );
};

// Card Footer (Stats + CTA)
Card.Footer = function CardFooter({ children, className }) {
  return <div className={cn("px-6 pb-6 pt-2", className)}>{children}</div>;
};

// Stats Row (Sleek and clean layout)
Card.Stats = function CardStats({ stats = [] }) {
  // Map provided stats labels to Lucide icons for consistency
  const iconMap = {
    students: Users,
    lectures: BookOpen,
    duration: Clock,
    exams: Zap,
    rating: Star,
  };

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-gray-100 pt-4">
      {stats.map((stat, i) => {
        const Icon = iconMap[stat.key?.toLowerCase()] || ShieldCheck; // Use key for dynamic icon
        return (
          <div
            key={i}
            className="flex items-center space-x-2 text-sm text-gray-600"
          >
            <Icon className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="font-semibold text-gray-800">{stat.value}</span>
            <span className="text-gray-500 truncate">{stat.label}</span>
          </div>
        );
      })}
    </div>
  );
};

// Price Section (High visual impact)
Card.Price = function CardPrice({
  price,
  discountedPrice,
  currency = "৳",
  className,
}) {
  const hasDiscount =
    discountedPrice && discountedPrice < price && discountedPrice > 0;
  const finalPrice = hasDiscount ? discountedPrice : price;
  const discountPercentage = hasDiscount
    ? Math.round(((price - discountedPrice) / price) * 100)
    : 0;
  const isFree = finalPrice === 0;

  return (
    <div className={cn("flex items-end justify-between", className)}>
      {isFree ? (
        <span className="text-3xl font-extrabold text-emerald-600">FREE</span>
      ) : (
        <div className="flex items-end gap-3">
          <span className="text-4xl font-extrabold text-emerald-600 leading-none">
            {currency}
            {finalPrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-lg text-gray-400 line-through mb-0.5">
              {currency}
              {price.toLocaleString()}
            </span>
          )}
        </div>
      )}

      {hasDiscount && discountPercentage > 0 && (
        <Badge variant="danger" className="text-sm">
          {discountPercentage}% OFF
        </Badge>
      )}

      {isFree && (
        <Badge variant="subtle" className="text-sm">
          Limited Time
        </Badge>
      )}
    </div>
  );
};

// CTA Button (Using the upgraded Button component)
Card.Action = function CardAction({ href, children, ...props }) {
  return (
    <div className="pt-4">
      {" "}
      {/* Added padding for separation */}
      <Link href={href} className="block w-full" passHref>
        <Button
          variant="primary"
          size="md" // Changed to md for better balance inside the card
          className="w-full text-lg" // Explicitly setting text size for impact
          {...props}
        >
          {children}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
};

export { Card };
