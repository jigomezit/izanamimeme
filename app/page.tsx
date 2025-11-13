import { BackgroundBeamsWithCollision } from "@/components/background-beams-with-collision";
import { Countdown } from "@/components/countdown";
import { VoteButton } from "@/components/vote-button";

export default function Home() {
  return (
    <BackgroundBeamsWithCollision>
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-center text-white mb-12 drop-shadow-lg">
          Izanami Elige MOD 2025
        </h1>
        <Countdown />
        <VoteButton />
      </div>
    </BackgroundBeamsWithCollision>
  );
}


