type CTAButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  className?: string;
};

export function CTAButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
}: CTAButtonProps) {
  const baseClassName =
    "inline-flex w-full items-center justify-center rounded-[1.35rem] px-5 py-4 text-[15px] font-semibold tracking-[-0.02em] transition duration-200 disabled:cursor-not-allowed disabled:opacity-50";

  const variantClassName =
    variant === "primary"
      ? "bg-[linear-gradient(135deg,#9fffd8_0%,#77d7ff_45%,#fee38b_100%)] text-slate-950 shadow-[0_18px_40px_rgba(109,255,208,0.18)] hover:scale-[1.01]"
      : "border border-white/10 bg-white/6 text-white/82 hover:bg-white/10";

  return (
    <button
      className={`${baseClassName} ${variantClassName} ${className}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
