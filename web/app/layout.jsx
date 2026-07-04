import { Poppins } from "next/font/google";
import "./globals.css";
import "./styles/bootstrap.min.css";
import "./styles/variable.css";
import "./styles/common.css";
import "./styles/main.css";
import "./styles/responsive.css";
import "react-toastify/dist/ReactToastify.css";
import Providers from "./providers.jsx";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Buddy Script",
  description: "Social feed",
  icons: {
    icon: "/assets/images/logo-copy.svg",
  },
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;