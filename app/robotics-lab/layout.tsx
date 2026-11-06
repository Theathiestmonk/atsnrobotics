import { Roboto, Roboto_Mono } from "next/font/google";
import "./robotics-lab.css";
import { ThemeRoot } from "./components/Theme";

const roboto = Roboto({ subsets: ["latin"], weight: ["300", "400", "500", "700", "900"], variable: "--rl-font" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--rl-mono" });

export default function RoboticsLabLayout({ children }: { children: React.ReactNode }) {
  return <ThemeRoot className={`rl ${roboto.variable} ${robotoMono.variable}`}>{children}</ThemeRoot>;
}
