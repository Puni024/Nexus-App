import Users from "../../components/applications/Users";

const Application = () => {
    const apps = [
        { key: "users", title: "Users", component: <Users /> },
        // add more apps here later, same shape:
        // { key: "reports", title: "Reports", component: <Reports /> },
    ];

    return (
        <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                {apps.map((app) => (
                    <div
                        key={app.key}
                        className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden flex flex-col transition-colors"
                    >
                        <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--card-strip)] text-[#EDE6D6] shrink-0">
                            <p className="text-xs uppercase tracking-wide truncate">
                                {app.title}
                            </p>
                        </div>

                        <div>
                            {app.component}
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
};

export default Application;