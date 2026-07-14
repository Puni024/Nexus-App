export const Loader = () => {
  return (
    <div className="flex items-center justify-center bg-[#EDE6D6] w-full min-h-[100vh]">
      <svg
        className="h-[25%] w-[7%]"
        viewBox="0 0 120 30"
        xmlns="http://www.w3.org/2000/svg"
        fill="#68471ce7"
      >
        {/* Left Dot */}
        <circle cx="15" cy="15" r="11.1295">
          <animate
            attributeName="r"
            begin="0s"
            dur="0.8s"
            values="15;9;15"
            calcMode="linear"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fillOpacity"
            begin="0s"
            dur="0.8s"
            values="1;.5;1"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>

        {/* Middle Dot */}
        <circle cx="60" cy="15" r="12.8705">
          <animate
            attributeName="r"
            begin="0s"
            dur="0.8s"
            values="9;15;9"
            calcMode="linear"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fillOpacity"
            begin="0s"
            dur="0.8s"
            values=".5;1;.5"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>

        {/* Right Dot */}
        <circle cx="105" cy="15" r="11.1295">
          <animate
            attributeName="r"
            begin="0s"
            dur="0.8s"
            values="15;9;15"
            calcMode="linear"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fillOpacity"
            begin="0s"
            dur="0.8s"
            values="1;.5;1"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
};