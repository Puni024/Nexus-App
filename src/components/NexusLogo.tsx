const NexusLogo = ({
    containerClassName = "flex items-center gap-3 mb-0 sm:mb-0",
    logoClassName = "w-9 h-7 sm:w-11 sm:h-11 rounded-2xl bg-[#B98B4E] flex items-center justify-center shadow-lg shrink-0",
    iconClassName = "w-4 h-4 sm:w-5 sm:h-5 text-[#2B2620]",
    textClassName = "text-lg sm:text-xl font-bold text-[#2B2620] tracking-tight",
}: {
    containerClassName?: string;
    logoClassName?: string;
    iconClassName?: string;
    textClassName?: string;
}) => {
    return (
        <div className={containerClassName}>
            <div className={logoClassName}>
                <svg
                    className={iconClassName}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 2L3 14h7l-1 8 11-14h-7l1-6z"
                    />
                </svg>
            </div>

            <span className={textClassName}>
                Nexus
            </span>
        </div>
    );
};

export default NexusLogo;
