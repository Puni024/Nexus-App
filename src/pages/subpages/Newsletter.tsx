// Dummy month-wise newsletter data
const newsletters = [
    { month: "July 2026", title: "Product Roadmap & Q3 Highlights", contributors: 4, status: "Published" },
    { month: "June 2026", title: "Community Spotlight & Feature Drops", contributors: 6, status: "Published" },
    { month: "May 2026", title: "Behind the Scenes: Engineering Wins", contributors: 3, status: "Published" },
    { month: "April 2026", title: "User Stories & Growth Milestones", contributors: 5, status: "Published" },
];

function Newsletter() {
    return (
        <div className="w-full min-h-full bg-[var(--bg)] transition-colors">

            {/* Under Maintenance - thin banner at the very start of this component only */}
            <div className="w-full flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-900/40 px-3 py-1 transition-colors">
                <svg
                    className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4M12 8h.01" />
                </svg>
                <p className="text-[10px] sm:text-[11px] text-amber-700 dark:text-amber-400">
                    This page is under maintenance — some features may be incomplete.
                </p>
            </div>

            {/* Newsletter content */}
            <div className="px-4 sm:px-8 pt-6 pb-6">
                <div className="max-w-3xl mx-auto">

                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
                                Community Newsletter
                            </h1>
                            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                                Monthly updates, stories, and contributions from the team
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text)] hover:bg-[var(--bg)] transition">
                                Contribute
                            </button>
                            <button className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#2B2620] dark:bg-[#EDE6D6] text-[#EDE6D6] dark:text-[#2B2620] hover:scale-[1.02] transition-all duration-300">
                                Publish
                            </button>
                        </div>
                    </div>

                    {/* Month-wise list */}
                    <div className="flex flex-col gap-3">
                        {newsletters.map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between bg-[var(--card)] border border-[var(--border)] rounded-2xl px-4 py-3.5 hover:border-[#B98B4E] transition-colors"
                            >
                                <div>
                                    <p className="text-[10px] font-semibold text-[#B98B4E] uppercase tracking-wider">
                                        {item.month}
                                    </p>
                                    <p className="text-sm font-semibold text-[var(--text)] mt-0.5">
                                        {item.title}
                                    </p>
                                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                                        {item.contributors} contributors
                                    </p>
                                </div>
                                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[var(--bg)] text-[var(--text-muted)] border border-[var(--border)]">
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

        </div>
    );
}

export default Newsletter;