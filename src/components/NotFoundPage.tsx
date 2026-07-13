export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-white">

      {/* BIG 404 */}
      <h1 className="text-[140px] font-extrabold leading-none text-[#00f2c3] relative">
        404
        <span className="absolute top-0 left-0 text-black -z-0 translate-x-1 translate-y-1">
          404
        </span>
      </h1>

      {/* PAGE NOT FOUND */}
      <h2 className="text-3xl font-bold text-black mt-[-10px]">
        PAGE NOT FOUND
      </h2>

      {/* Small Description */}
      <p className="text-gray-600 mt-4 max-w-md text-sm">
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </p>
    </div>
  );
}
