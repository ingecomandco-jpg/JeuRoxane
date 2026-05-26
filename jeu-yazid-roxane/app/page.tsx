"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Direction = "left" | "right";
type Step =
  | "access"
  | "intro"
  | "runner"
  | "smashIntro"
  | "swipe"
  | "match"
  | "fatalIntro"
  | "love"
  | "final"
  | "realFinal"
  | "thinking";

type Profile = {
  name: string;
  bio: string;
  correct: Direction;
  initials: string;
  image: string;
  gradient: string;
  accent: string;
};

type ButtonVariant = "primary" | "secondary" | "bare";

const ACCESS_ID = "roxane.rvre";
const ACCESS_PASSWORD = "yayaroro974934";
const SWIPE_THRESHOLD = 92;
const SWIPE_VELOCITY_THRESHOLD = 620;

const matchPhotos = {
  roxane: "/images/roxane.jpg",
  yazid: "/images/yazid.jpg",
} as const;

const profileImages = {
  nathan: "/images/nathan.jpg",
  abdel: "/images/abdel.jpg",
  younes: "/images/younes.jpg",
  yazid: "/images/yazid.jpg",
} as const;

const profiles: readonly Profile[] = [
  {
    name: "Nathan",
    bio: "L’homme poire",
    correct: "left",
    initials: "N",
    image: profileImages.nathan,
    gradient: "linear-gradient(135deg, #e7ff6f 0%, #74d36f 45%, #0d9488 100%)",
    accent: "#f97316",
  },
  {
    name: "Abdel",
    bio: "Le dernier des sapeurs pas congolais",
    correct: "left",
    initials: "A",
    image: profileImages.abdel,
    gradient: "linear-gradient(135deg, #facc15 0%, #fb923c 48%, #0284c7 100%)",
    accent: "#0f766e",
  },
  {
    name: "Younes",
    bio: "Sah, vas-y, lui, qui le calcule ?",
    correct: "left",
    initials: "Y",
    image: profileImages.younes,
    gradient: "linear-gradient(135deg, #67e8f9 0%, #22c55e 45%, #14532d 100%)",
    accent: "#fbbf24",
  },
  {
    name: "Yazid",
    bio: "L’homme de ta vie",
    correct: "right",
    initials: "YZ",
    image: profileImages.yazid,
    gradient: "linear-gradient(135deg, #00c2b8 0%, #facc15 42%, #ff7a3d 100%)",
    accent: "#0f766e",
  },
];

const YAZID_RUN_1 = [
  "....1111....",
  "...111111...",
  "..11222211..",
  "..12222221..",
  "..11222211..",
  "...111111...",
  "....3333....",
  "..33333333..",
  "..33333333..",
  "..33333333..",
  "...332233...",
  "..222..222..",
  "..222..222..",
  "..22....22..",
  ".444....444.",
  ".444....444.",
] as const;

const YAZID_RUN_2 = [
  "....1111....",
  "...111111...",
  "..11222211..",
  "..12222221..",
  "..11222211..",
  "...111111...",
  "....3333....",
  "..33333333..",
  "..33333333..",
  "..33333333..",
  "...332233...",
  ".222....222.",
  ".222....222.",
  "..22..22....",
  ".444..444...",
  ".444..444...",
] as const;

const ROXANE_MAP = [
  "....5555....",
  "...555555...",
  "..55222255..",
  "..52222225..",
  ".5522222255.",
  ".5552222555.",
  "....6666....",
  "..66666666..",
  "..66666666..",
  "...662266...",
  "..222..222..",
  "..222..222..",
  "..222..222..",
  "..22....22..",
  ".777....777.",
  ".777....777.",
] as const;

const OBSTACLE_MAPS = {
  shell: [
    "....8....",
    "...888...",
    "..88888..",
    ".8888888.",
    "888888888",
    "888888888",
  ],
  driftwood: [
    "99999999",
    "98888889",
    "98888889",
    "98888889",
    "98888889",
    "99999999",
  ],
  brokenHeart: [
    ".AA..AA.",
    "AAAAAAAA",
    "AAAAAAAA",
    ".AAAAAA.",
    "..AAAA..",
    "..A..A..",
  ],
} as const;

type SpriteMap = readonly string[];
type ObstacleType = keyof typeof OBSTACLE_MAPS;

type Obstacle = {
  id: string;
  type: ObstacleType;
  x: number;
  width: number;
  jumpNeed: number;
};

const SPRITE_COLORS: Record<string, string> = {
  "1": "#4c2b1a",
  "2": "#e8bf9a",
  "3": "#0ea5a4",
  "4": "#c96a28",
  "5": "#171717",
  "6": "#ff8a3d",
  "7": "#7c4d2d",
  "8": "#ff7a3d",
  "9": "#6b4f2d",
  A: "#ef4444",
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/70 bg-white/90 shadow-[0_18px_50px_rgba(6,78,91,0.18)] backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}

function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-[#ff8a3d] text-[#17313a] shadow-[0_10px_22px_rgba(249,115,22,0.28)] hover:bg-[#ff9a52] active:translate-y-px",
    secondary:
      "border border-[#0f766e]/20 bg-white/90 text-[#0f4f55] shadow-[0_8px_18px_rgba(6,78,91,0.12)] hover:bg-[#effdf8] active:translate-y-px",
    bare: "text-[#0f4f55] hover:bg-white/50 active:translate-y-px",
  };

  return (
    <button
      {...props}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 py-3 text-base font-black transition disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className
      )}
    />
  );
}

function Progress({ value, total }: { value: number; total: number }) {
  const percent = total > 0 ? Math.min(100, Math.max(0, (value / total) * 100)) : 0;

  return (
    <div className="h-2.5 w-full overflow-hidden rounded-lg bg-white/55 ring-1 ring-[#0f766e]/10">
      <div
        className="h-full rounded-lg bg-[linear-gradient(90deg,#00a6a6,#facc15,#ff8a3d)] transition-[width] duration-75"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function PixelSprite({
  map,
  pixel = 4,
  className = "",
}: {
  map: SpriteMap;
  pixel?: number;
  className?: string;
}) {
  const cols = map[0]?.length ?? 0;

  return (
    <div
      className={cn("pixelated", className)}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${pixel}px)`,
      }}
    >
      {map.flatMap((row, y) =>
        row.split("").map((cell, x) => (
          <span
            key={`${x}-${y}`}
            style={{
              width: pixel,
              height: pixel,
              backgroundColor:
                cell === "." ? "transparent" : SPRITE_COLORS[cell] ?? "transparent",
            }}
          />
        ))
      )}
    </div>
  );
}

function YazidRunnerSprite({
  jumping,
  runningFrame,
  className = "",
}: {
  jumping: boolean;
  runningFrame: boolean;
  className?: string;
}) {
  const map = jumping ? YAZID_RUN_1 : runningFrame ? YAZID_RUN_2 : YAZID_RUN_1;

  return <PixelSprite map={map} pixel={4} className={className} />;
}

function RoxaneSprite({ className = "" }: { className?: string }) {
  return <PixelSprite map={ROXANE_MAP} pixel={4} className={className} />;
}

function ObstaclePixel({ type }: { type: ObstacleType }) {
  return <PixelSprite map={OBSTACLE_MAPS[type]} pixel={4} />;
}

function TropicalBackground({ bgOffset }: { bgOffset: number }) {
  const cloudOffset = (bgOffset * 0.16) % 520;
  const waveOffset = (bgOffset * 0.8) % 520;
  const palmOffset = (bgOffset * 0.42) % 420;

  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#86e5ff_0%,#d6fff4_42%,#ffe16a_74%,#47b475_100%)]" />
      <div className="absolute left-6 top-7 h-14 w-14 rounded-full bg-[#ffd84d] shadow-[0_0_28px_rgba(250,204,21,0.58)]" />

      {[0, 1, 2, 3, 4].map((index) => (
        <div
          key={`cloud-${index}`}
          className="absolute top-8 h-8 w-20 rounded-lg bg-white/75"
          style={{ left: `${index * 116 - cloudOffset + 12}px` }}
        >
          <span className="absolute -top-3 left-4 h-7 w-8 rounded-full bg-white/75" />
          <span className="absolute -top-2 right-4 h-6 w-7 rounded-full bg-white/75" />
        </div>
      ))}

      <div className="absolute bottom-24 left-0 right-0 h-20 bg-[linear-gradient(180deg,#1dd3d3,#0479b7)]" />

      {[0, 1, 2, 3, 4, 5].map((index) => (
        <div
          key={`wave-${index}`}
          className="absolute bottom-[120px] h-1 w-16 rounded-lg bg-white/60"
          style={{ left: `${index * 86 - waveOffset}px` }}
        />
      ))}

      {[0, 1, 2].map((index) => (
        <div
          key={`mountain-${index}`}
          className="absolute bottom-24 h-24 w-40 bg-[#146b4b]/75"
          style={{
            left: `${index * 136 - (bgOffset * 0.12) % 420 - 26}px`,
            clipPath: "polygon(0% 100%, 20% 60%, 45% 35%, 70% 65%, 100% 100%)",
          }}
        />
      ))}

      <div
        className="absolute bottom-24 right-8 h-28 w-40 bg-[#5a4a3f]"
        style={{
          clipPath: "polygon(0% 100%, 18% 70%, 40% 40%, 55% 25%, 75% 55%, 100% 100%)",
        }}
      />
      <div
        className="absolute bottom-[128px] right-[70px] h-8 w-9 bg-[#ff5a1f]"
        style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
      />
      <div className="absolute bottom-[123px] right-[82px] h-11 w-2 rounded-lg bg-[#facc15]/85" />

      {[0, 1, 2, 3].map((index) => (
        <div
          key={`palm-${index}`}
          className="absolute bottom-16"
          style={{ left: `${index * 114 - palmOffset + 12}px` }}
        >
          <div className="mx-auto h-14 w-2 rounded-lg bg-[#8a4d1f]" />
          <div className="relative -mt-2">
            <span className="absolute -left-6 -top-2 h-3 w-8 rotate-[-30deg] rounded-full bg-[#15803d]" />
            <span className="absolute -left-2 -top-4 h-3 w-8 rotate-[-5deg] rounded-full bg-[#16a34a]" />
            <span className="absolute -right-8 -top-2 h-3 w-8 rotate-[25deg] rounded-full bg-[#15803d]" />
            <span className="absolute -left-5 top-1 h-3 w-7 rotate-[18deg] rounded-full bg-[#166534]" />
            <span className="absolute -right-5 top-1 h-3 w-7 rotate-[-20deg] rounded-full bg-[#166534]" />
          </div>
        </div>
      ))}

      <div className="absolute bottom-16 left-0 right-0 h-10 bg-[#33a852]/85" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-[linear-gradient(180deg,#1f9d55,#0f7a3a)]" />
    </>
  );
}

function CoupleFinishAnimation() {
  return (
    <div className="flex animate-float-soft flex-col items-center gap-3">
      <div className="relative flex items-end justify-center gap-2">
        <YazidRunnerSprite jumping={false} runningFrame={false} className="drop-shadow-lg" />
        <div className="absolute bottom-5 left-1/2 h-1 w-7 -translate-x-1/2 rounded-lg bg-[#ff8a3d] shadow" />
        <RoxaneSprite className="drop-shadow-lg" />
      </div>
      <div className="animate-pulse-soft text-4xl">💛</div>
      <p className="text-center text-sm font-black text-[#0f766e]">
        Yazid et Roxane réunis sous le soleil de la Réunion.
      </p>
    </div>
  );
}

function RunnerToRoxaneGame({ onDone }: { onDone: () => void }) {
  const TARGET_DISTANCE = 360;
  const DISTANCE_RATE = 24;
  const SPEED = 162;
  const GRAVITY = 1300;
  const JUMP_FORCE = 535;
  const JUMP_BUFFER = 0.14;
  const COYOTE_TIME = 0.08;
  const RUNNER_RATIO = 0.23;

  const gameRef = useRef<HTMLDivElement | null>(null);
  const runnerRef = useRef<HTMLDivElement | null>(null);
  const [gameWidth, setGameWidth] = useState(340);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finished, setFinished] = useState(false);
  const [distance, setDistance] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [message, setMessage] = useState("Premier tap : Yazid prend son élan.");
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [bgOffset, setBgOffset] = useState(0);
  const [runningFrame, setRunningFrame] = useState(false);

  const velocityRef = useRef(0);
  const runnerYRef = useRef(0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const distanceRef = useRef(0);
  const gameWidthRef = useRef(340);
  const startedRef = useRef(false);
  const gameOverRef = useRef(false);
  const finishedRef = useRef(false);
  const isJumpingRef = useRef(false);
  const jumpBufferRef = useRef(0);
  const coyoteTimeRef = useRef(COYOTE_TIME);
  const spawnCooldownRef = useRef(0);
  const lastTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const animToggleRef = useRef(0);
  const finishedOnceRef = useRef(false);

  const runnerX = Math.max(66, Math.min(92, gameWidth * RUNNER_RATIO));

  useEffect(() => {
    const node = gameRef.current;
    if (!node) return;

    const updateWidth = () => {
      const width = Math.max(300, Math.round(node.clientWidth));
      gameWidthRef.current = width;
      setGameWidth(width);
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const resetGame = useCallback(() => {
    setStarted(false);
    setGameOver(false);
    setFinished(false);
    setDistance(0);
    setIsJumping(false);
    setObstacles([]);
    setBgOffset(0);
    setRunningFrame(false);
    setMessage("Premier tap : Yazid prend son élan.");

    velocityRef.current = 0;
    runnerYRef.current = 0;
    obstaclesRef.current = [];
    distanceRef.current = 0;
    startedRef.current = false;
    gameOverRef.current = false;
    finishedRef.current = false;
    isJumpingRef.current = false;
    jumpBufferRef.current = 0;
    coyoteTimeRef.current = COYOTE_TIME;
    spawnCooldownRef.current = 0;
    animToggleRef.current = 0;
    finishedOnceRef.current = false;
    lastTimeRef.current = 0;
    if (runnerRef.current) {
      runnerRef.current.style.transform = "translate3d(0, 0, 0)";
    }
  }, [COYOTE_TIME]);

  const jump = useCallback(() => {
    if (gameOverRef.current || finishedRef.current) return;

    if (!startedRef.current) {
      startedRef.current = true;
      setStarted(true);
      setMessage("Yazid fonce vers Roxane.");
      velocityRef.current = JUMP_FORCE;
      isJumpingRef.current = true;
      setIsJumping(true);
      return;
    }

    if (runnerYRef.current <= 1 || coyoteTimeRef.current > 0) {
      velocityRef.current = JUMP_FORCE;
      jumpBufferRef.current = 0;
      coyoteTimeRef.current = 0;
      isJumpingRef.current = true;
      setIsJumping(true);
      setMessage("Saut propre.");
      return;
    }

    jumpBufferRef.current = JUMP_BUFFER;
  }, [JUMP_BUFFER, JUMP_FORCE]);

  useEffect(() => {
    const loop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min(0.033, (timestamp - lastTimeRef.current) / 1000);
      lastTimeRef.current = timestamp;

      const wasGrounded = runnerYRef.current <= 1;

      if (wasGrounded) {
        coyoteTimeRef.current = COYOTE_TIME;
      } else {
        coyoteTimeRef.current = Math.max(0, coyoteTimeRef.current - dt);
      }

      jumpBufferRef.current = Math.max(0, jumpBufferRef.current - dt);

      if (jumpBufferRef.current > 0 && (wasGrounded || coyoteTimeRef.current > 0)) {
        velocityRef.current = JUMP_FORCE;
        jumpBufferRef.current = 0;
        coyoteTimeRef.current = 0;
        isJumpingRef.current = true;
        setIsJumping(true);
      }

      let nextY = runnerYRef.current + velocityRef.current * dt;
      let nextVelocity = velocityRef.current - GRAVITY * dt;

      if (nextY <= 0) {
        nextY = 0;
        nextVelocity = 0;
      }

      runnerYRef.current = nextY;
      velocityRef.current = nextVelocity;

      if (runnerRef.current) {
        runnerRef.current.style.transform = `translate3d(0, ${-nextY}px, 0)`;
      }

      if (nextY <= 0 && isJumpingRef.current) {
        isJumpingRef.current = false;
        setIsJumping(false);
      }

      if (startedRef.current && !gameOverRef.current && !finishedRef.current) {
        const width = gameWidthRef.current;
        const currentRunnerX = Math.max(66, Math.min(92, width * RUNNER_RATIO));

        setBgOffset((prev) => prev + SPEED * dt * 0.72);

        animToggleRef.current += dt;
        if (animToggleRef.current > 0.12) {
          animToggleRef.current = 0;
          if (runnerYRef.current <= 1) {
            setRunningFrame((prev) => !prev);
          }
        }

        const newDistance = Math.min(TARGET_DISTANCE, distanceRef.current + DISTANCE_RATE * dt);
        distanceRef.current = newDistance;
        setDistance(newDistance);

        if (newDistance >= TARGET_DISTANCE && !finishedOnceRef.current) {
          finishedOnceRef.current = true;
          finishedRef.current = true;
          setFinished(true);
          setMessage("Yazid et Roxane sont réunis sous le soleil de la Réunion.");
        }

        spawnCooldownRef.current = Math.max(0, spawnCooldownRef.current - dt);

        let nextObstacles = obstaclesRef.current
          .map((obstacle) => ({ ...obstacle, x: obstacle.x - SPEED * dt }))
          .filter((obstacle) => obstacle.x > -64);

        const lastObstacle = nextObstacles.at(-1);
        const farEnough = !lastObstacle || lastObstacle.x < width - 118;
        const safeStart = distanceRef.current > 16;

        if (safeStart && spawnCooldownRef.current <= 0 && farEnough && Math.random() < 0.032) {
          const types: readonly ObstacleType[] = ["shell", "driftwood", "brokenHeart"];
          const type = types[Math.floor(Math.random() * types.length)] ?? "shell";

          nextObstacles = [
            ...nextObstacles,
            {
              id: `${timestamp}-${Math.random()}`,
              type,
              x: width + 30,
              width: type === "driftwood" ? 34 : 28,
              jumpNeed: type === "driftwood" ? 34 : 22,
            },
          ];

          spawnCooldownRef.current = 0.92;
        }

        const collision = nextObstacles.some((obstacle) => {
          const obstacleLeft = obstacle.x - obstacle.width / 2;
          const obstacleRight = obstacle.x + obstacle.width / 2;
          const runnerLeft = currentRunnerX - 10;
          const runnerRight = currentRunnerX + 8;
          const overlapX = obstacleRight > runnerLeft && obstacleLeft < runnerRight;
          const tooLow = runnerYRef.current < obstacle.jumpNeed;

          return distanceRef.current > 18 && overlapX && tooLow;
        });

        if (collision) {
          gameOverRef.current = true;
          setGameOver(true);
          setMessage("Obstacle touché. Respire, puis recommence.");
        }

        obstaclesRef.current = nextObstacles;
        setObstacles(nextObstacles);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [COYOTE_TIME, DISTANCE_RATE, GRAVITY, JUMP_FORCE, RUNNER_RATIO, SPEED, TARGET_DISTANCE]);

  return (
    <Card className="screen-pop w-full overflow-hidden">
      <div className="space-y-3 p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black leading-tight text-[#0f4f55]">
              Rejoins Roxane
            </h2>
            <p className="text-sm font-semibold text-[#14746f]">
              Runner tropical : {TARGET_DISTANCE} m.
            </p>
          </div>
          <div className="rounded-lg bg-[#fff4b8] px-3 py-2 text-sm font-black text-[#5c4300] ring-1 ring-[#eab308]/25">
            {Math.min(TARGET_DISTANCE, Math.floor(distance))}/{TARGET_DISTANCE} m
          </div>
        </div>

        <Progress value={distance} total={TARGET_DISTANCE} />

        <div
          ref={gameRef}
          role="button"
          tabIndex={0}
          onPointerDown={(event) => {
            event.preventDefault();
            jump();
          }}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter") jump();
          }}
          className="relative h-[46dvh] min-h-[310px] max-h-[420px] touch-none overflow-hidden rounded-lg border border-[#0f766e]/20 bg-[#d6fff4] shadow-inner outline-none"
        >
          <TropicalBackground bgOffset={bgOffset} />

          <div className="absolute right-2 top-3 z-10 rounded-lg bg-white/85 px-3 py-2 text-xs font-black text-[#0f766e] shadow">
            Roxane au bout →
          </div>

          <div className="absolute bottom-16 left-0 right-0 h-1 bg-[#0f5f3d]" />

          {[0, 1, 2, 3, 4, 5, 6].map((index) => (
            <div
              key={`ground-mark-${index}`}
              className="absolute bottom-11 h-1 w-8 rounded-lg bg-[#0f5f3d]/65"
              style={{ left: `${index * 70 - ((bgOffset * 1.2) % 490)}px` }}
            />
          ))}

          {obstacles.map((obstacle) => (
            <div
              key={obstacle.id}
              className="absolute bottom-[66px] -translate-x-1/2 transition-opacity"
              style={{ left: `${obstacle.x}px` }}
            >
              <ObstaclePixel type={obstacle.type} />
            </div>
          ))}

          <div
            ref={runnerRef}
            className="absolute bottom-[66px] flex h-24 w-20 items-end justify-center will-change-transform"
            style={{ left: `${runnerX - 32}px` }}
          >
            <YazidRunnerSprite
              jumping={isJumping}
              runningFrame={runningFrame}
              className="drop-shadow-lg"
            />
          </div>

          {!started && !gameOver && !finished ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 p-5 backdrop-blur-[1px]">
              <div className="space-y-4 text-center">
                <div className="flex items-end justify-center gap-4">
                  <YazidRunnerSprite jumping={false} runningFrame={false} />
                  <RoxaneSprite />
                </div>
                <p className="text-base font-black text-[#0f4f55]">Tape pour partir.</p>
              </div>
            </div>
          ) : null}

          {gameOver ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/78 p-5 backdrop-blur-sm">
              <div className="space-y-4 text-center">
                <div className="text-5xl">💥</div>
                <p className="font-black text-[#0f4f55]">Obstacle touché.</p>
                <Button
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    resetGame();
                  }}
                >
                  ↻ Recommencer
                </Button>
              </div>
            </div>
          ) : null}

          {finished ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/78 p-5 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-5">
                <CoupleFinishAnimation />
                <Button
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDone();
                  }}
                >
                  Suivant →
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="min-h-11 rounded-lg border border-[#0f766e]/15 bg-[#e9fff5] px-3 py-2 text-center text-sm font-bold text-[#0f4f55]">
          {message}
        </div>

        <Button onClick={jump} disabled={gameOver || finished} className="h-14 w-full">
          Taper / sauter
        </Button>
      </div>
    </Card>
  );
}

function ProfileAvatar({ profile }: { profile: Profile }) {
  return (
    <div
      className="relative flex h-full min-h-[295px] items-center justify-center overflow-hidden"
      style={{ background: profile.gradient }}
    >
      <div className="absolute inset-0 flex items-center justify-center text-7xl font-black text-white/80">
        {profile.initials}
      </div>
      <div className="absolute left-5 top-5 h-20 w-20 rounded-full bg-[#ffd84d]/70 shadow-[0_0_30px_rgba(250,204,21,0.35)]" />
      <div className="absolute -right-8 bottom-10 h-28 w-28 rotate-12 rounded-lg bg-[#0f766e]/18" />
      <div className="absolute -left-7 bottom-16 h-24 w-24 rotate-[-18deg] rounded-lg bg-[#ff8a3d]/20" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,78,91,0.08),rgba(6,78,91,0.2)_62%,rgba(6,78,91,0.58))]" />

      <div className="relative flex h-full w-full items-center justify-center p-3">
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-white/78 shadow-[0_18px_35px_rgba(6,78,91,0.22)] ring-1 ring-white/70">
          <img
            src={profile.image}
            alt=""
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-xl"
            draggable={false}
            loading="eager"
          />
          <img
            src={profile.image}
            alt={profile.name}
            className="absolute inset-0 h-full w-full object-contain p-2"
            draggable={false}
            loading="eager"
          />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg bg-white/88 px-4 py-3 text-[#0f4f55] shadow">
        <span className="text-sm font-black">Profil</span>
        <span
          className="h-3 w-10 rounded-lg"
          style={{ backgroundColor: profile.accent }}
        />
      </div>
    </div>
  );
}

function SwipeScreen({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState("Pass pour les autres. Smash pour Yazid.");
  const [exitDirection, setExitDirection] = useState<Direction | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "wrong" | "right">("idle");
  const current = profiles[index];
  const lockedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const clearPendingTimeout = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  };

  const resolveSwipe = useCallback(
    (direction: Direction) => {
      if (lockedRef.current) return;

      const correct = direction === current.correct;
      lockedRef.current = true;
      setFeedback(correct ? "right" : "wrong");
      setExitDirection(direction);

      if (!correct) {
        setMessage(
          current.name === "Yazid"
            ? "Erreur historique. Yazid, c’est à droite."
            : "Non non. Celui-là part à gauche."
        );

        clearPendingTimeout();
        timeoutRef.current = window.setTimeout(() => {
          setExitDirection(null);
          setFeedback("idle");
          lockedRef.current = false;
        }, 300);
        return;
      }

      setMessage(direction === "right" ? "Excellent choix." : "Bon réflexe.");

      clearPendingTimeout();
      timeoutRef.current = window.setTimeout(() => {
        if (index + 1 < profiles.length) {
          setIndex((value) => value + 1);
          setMessage("Pass pour les autres. Smash pour Yazid.");
          setExitDirection(null);
          setFeedback("idle");
          lockedRef.current = false;
          return;
        }

        onDone();
      }, 240);
    },
    [current, index, onDone]
  );

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (lockedRef.current) return;

    const intent =
      Math.abs(info.offset.x) > SWIPE_THRESHOLD ||
      Math.abs(info.velocity.x) > SWIPE_VELOCITY_THRESHOLD;

    if (intent) {
      resolveSwipe(info.offset.x > 0 || info.velocity.x > 0 ? "right" : "left");
    }
  };

  return (
    <div className="screen-pop w-full space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-[#0f4f55]">Smash or Pass</h2>
          <p className="min-h-5 text-sm font-semibold text-[#14746f]">{message}</p>
        </div>
        <div className="text-right text-sm font-black text-[#0f4f55]">
          {index + 1}/{profiles.length}
        </div>
      </div>

      <Progress value={index + 1} total={profiles.length} />

      <AnimatePresence mode="wait">
        <motion.div
          key={current.name}
          drag={lockedRef.current ? false : "x"}
          dragDirectionLock
          dragElastic={0.16}
          dragMomentum={false}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={
            exitDirection && feedback === "right"
              ? {
                  x: exitDirection === "right" ? 480 : -480,
                  rotate: exitDirection === "right" ? 16 : -16,
                  opacity: 0,
                  scale: 0.96,
                }
              : exitDirection && feedback === "wrong"
                ? {
                    x: [0, exitDirection === "right" ? 16 : -16, exitDirection === "right" ? -10 : 10, 0],
                    rotate: [0, exitDirection === "right" ? 2 : -2, 0],
                    opacity: 1,
                  }
                : { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }
          }
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="touch-pan-y select-none cursor-grab active:cursor-grabbing"
          style={{ touchAction: "pan-y", WebkitUserSelect: "none", userSelect: "none" }}
        >
          <Card className="overflow-hidden">
            <div className="h-[min(49dvh,390px)] min-h-[300px]">
              <ProfileAvatar profile={current} />
            </div>
            <div className="space-y-1 border-t border-[#0f766e]/10 bg-white/92 p-4">
              <h3 className="text-3xl font-black text-[#0f4f55]">{current.name}</h3>
              <p className="text-base font-semibold text-[#14746f]">{current.bio}</p>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-4 px-1">
        <Button
          variant="secondary"
          onClick={() => resolveSwipe("left")}
          className="h-16 text-3xl"
          aria-label="Refuser"
        >
          ×
        </Button>
        <Button
          onClick={() => resolveSwipe("right")}
          className="h-16 bg-[#00a6a6] text-3xl text-white hover:bg-[#0f766e]"
          aria-label="Choisir"
        >
          💛
        </Button>
      </div>
    </div>
  );
}

function SmashIntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <Card className="screen-pop w-full overflow-hidden">
      <div className="relative min-h-[500px] overflow-hidden bg-[linear-gradient(180deg,#7de3ff_0%,#dcfff6_42%,#fff4a6_78%,#28a55b_100%)] p-5 text-center">
        <TropicalBackground bgOffset={0} />

        <div className="relative z-10 flex min-h-[460px] flex-col items-center justify-center gap-8">
          <div className="space-y-3">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ff8a3d]">
              Phase 2
            </p>
            <h2 className="text-5xl font-black leading-none text-[#0f4f55] drop-shadow-sm">
              Smash or Pass
            </h2>
            <p className="mx-auto max-w-[270px] text-base font-bold text-[#14746f]">
              Fais ton choix, le destin s’occupe du reste.
            </p>
          </div>

          <div className="grid w-full max-w-[290px] grid-cols-2 gap-4">
            <div className="rounded-lg bg-white/92 px-5 py-5 text-lg font-black text-[#0f4f55] shadow">
              Pass
            </div>
            <div className="rounded-lg bg-[#ff8a3d] px-5 py-5 text-lg font-black text-[#17313a] shadow">
              Smash
            </div>
          </div>

          <Button onClick={onStart} className="h-14 w-full">
            Commencer →
          </Button>
        </div>
      </div>
    </Card>
  );
}

function MatchPicture({
  name,
  initials,
  src,
  className,
}: {
  name: string;
  initials: string;
  src: string;
  className?: string;
}) {
  return (
    <div className={cn("relative bg-white/88", className)}>
      <div className="absolute inset-0 flex items-center justify-center text-5xl font-black text-[#0f4f55]">
        {initials}
      </div>
      <img
        src={src}
        alt={name}
        className="absolute inset-0 h-full w-full object-contain p-1"
        draggable={false}
      />
      <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1 text-xs font-black text-[#0f4f55] shadow">
        {name}
      </div>
    </div>
  );
}

function MatchScreen({ onDone }: { onDone: () => void }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setReady(true), 1500);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <Card className="screen-pop w-full overflow-hidden">
      <div className="relative min-h-[610px] overflow-hidden bg-[linear-gradient(180deg,#7de3ff_0%,#dcfff6_38%,#fff4a6_70%,#2f9e58_100%)] p-5 text-center">
        <TropicalBackground bgOffset={0} />

        <div className="absolute inset-0 z-10">
          {Array.from({ length: 18 }).map((_, index) => (
            <span
              key={`match-spark-${index}`}
              className="match-spark absolute h-2 w-2 rounded-full"
              style={
                {
                  left: `${8 + ((index * 17) % 84)}%`,
                  top: `${12 + ((index * 23) % 64)}%`,
                  animationDelay: `${index * 70}ms`,
                  "--spark-color": index % 3 === 0 ? "#facc15" : index % 3 === 1 ? "#00a6a6" : "#ff8a3d",
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div className="relative z-20 flex min-h-[570px] flex-col items-center justify-center gap-6">
          <div className="space-y-2">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ff8a3d]">
              Nouveau match
            </p>
            <h2 className="text-4xl font-black leading-none text-[#0f4f55] drop-shadow-sm">
              Roxane + Yazid
            </h2>
          </div>

          <div className="match-scene relative h-[380px] w-full max-w-[330px]">
            <MatchPicture
              name="Roxane"
              initials="R"
              src={matchPhotos.roxane}
              className="match-roxane-photo absolute inset-x-2 top-0 h-[285px] rounded-lg border-[5px] border-white/90 shadow-[0_18px_40px_rgba(6,78,91,0.26)]"
            />
            <div className="match-heart absolute bottom-16 left-6 z-30 flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl shadow-[0_14px_32px_rgba(6,78,91,0.24)]">
              💛
            </div>
            <MatchPicture
              name="Yazid"
              initials="YZ"
              src={matchPhotos.yazid}
              className="match-yazid-photo absolute bottom-10 right-2 z-20 h-36 w-28 rounded-lg border-[5px] border-white/95 shadow-[0_16px_34px_rgba(6,78,91,0.3)]"
            />
          </div>

          <Button
            onClick={onDone}
            disabled={!ready}
            className={cn("h-14 w-full transition", ready ? "opacity-100" : "opacity-0")}
          >
            Continuer →
          </Button>
        </div>
      </div>
    </Card>
  );
}

function FatalQuestionIntro({ onStart }: { onStart: () => void }) {
  return (
    <Card className="screen-pop w-full overflow-hidden">
      <div className="relative min-h-[500px] overflow-hidden bg-[linear-gradient(180deg,#7de3ff_0%,#dcfff6_42%,#fff4a6_78%,#28a55b_100%)] p-6 text-center">
        <TropicalBackground bgOffset={0} />

        <div className="relative z-10 flex min-h-[460px] flex-col items-center justify-center gap-7">
          <div className="animate-pulse-soft flex h-24 w-24 items-center justify-center rounded-lg bg-white text-5xl shadow-[0_16px_34px_rgba(6,78,91,0.22)]">
            ⚠️
          </div>

          <div className="space-y-3">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ff8a3d]">
              Dernière étape
            </p>
            <h2 className="text-4xl font-black leading-tight text-[#0f4f55] drop-shadow-sm">
              Attention, la question fatale !
            </h2>
          </div>

          <Button onClick={onStart} className="h-14 w-full">
            Je suis prête →
          </Button>
        </div>
      </div>
    </Card>
  );
}

function LoveQuestion({ onDone }: { onDone: () => void }) {
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [attempts, setAttempts] = useState(0);

  const moveNo = () => {
    setAttempts((value) => value + 1);
    setNoPos({
      x: Math.round(Math.random() * 210 - 105),
      y: Math.round(Math.random() * 118 - 58),
    });
  };

  return (
    <Card className="screen-pop w-full">
      <div className="flex min-h-[430px] flex-col items-center justify-center gap-8 p-6 text-center">
        <div className="space-y-3">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-[#ff8a3d]">
            Question finale
          </p>
          <h2 className="text-3xl font-black leading-tight text-[#0f4f55]">
            Je suis amoureuse de Yazid ?
          </h2>
        </div>

        <div className="relative flex h-44 w-full items-center justify-center gap-3">
          <Button onClick={onDone} className="h-16 min-w-28">
            Oui
          </Button>

          <div
            className="transition-transform duration-200 ease-out"
            style={{ transform: `translate(${noPos.x}px, ${noPos.y}px)` }}
            onPointerEnter={moveNo}
            onPointerDown={moveNo}
          >
            <Button variant="secondary" className="h-16 min-w-28">
              Non
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function FinalScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <Card className="screen-pop w-full">
      <div className="space-y-6 p-6 text-center">
        <div className="mx-auto flex h-24 w-24 animate-pulse-soft items-center justify-center rounded-lg bg-[linear-gradient(135deg,#00a6a6,#facc15,#ff8a3d)] text-5xl shadow-[0_18px_35px_rgba(6,78,91,0.18)]">
          😈
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-black leading-tight text-[#0f4f55]">
            Bah moi je t&apos;aime pas !
          </h1>
        </div>

        <Button onClick={onContinue} className="w-full">
          Continuer →
        </Button>
      </div>
    </Card>
  );
}

function RealFinalScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <Card className="screen-pop w-full">
      <div className="flex min-h-[430px] flex-col items-center justify-center gap-7 p-6 text-center">
        <div className="animate-pulse-soft text-7xl">❤️</div>

        <h1 className="text-5xl font-black leading-none text-[#0f4f55]">
          Non je rigole
        </h1>

        <Button onClick={onContinue} variant="secondary" className="w-full">
          Continuer →
        </Button>
      </div>
    </Card>
  );
}

function ThinkingScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <Card className="screen-pop w-full">
      <div className="flex min-h-[430px] flex-col items-center justify-center gap-7 p-6 text-center">
        <div className="animate-pulse-soft text-7xl">🐢</div>

        <h1 className="text-5xl font-black leading-none text-[#0f4f55]">
          tu me manques un peu
        </h1>

        <Button onClick={onRestart} variant="secondary" className="w-full">
          ↻ Rejouer
        </Button>
      </div>
    </Card>
  );
}

function AccessScreen({ onSuccess }: { onSuccess: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const submitAccess = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (identifier.trim() === ACCESS_ID && password === ACCESS_PASSWORD) {
      setError(false);
      onSuccess();
      return;
    }

    setError(true);
  };

  return (
    <Card className="screen-pop w-full overflow-hidden">
      <div className="relative min-h-[560px] overflow-hidden bg-[linear-gradient(180deg,#7de3ff_0%,#dcfff6_42%,#fff4a6_78%,#28a55b_100%)] p-6">
        <TropicalBackground bgOffset={0} />

        <form
          onSubmit={submitAccess}
          className="relative z-10 flex min-h-[510px] flex-col justify-center gap-5 text-center"
        >
          <div className="space-y-3">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ff8a3d]">
              Accès réservé
            </p>
            <h1 className="text-4xl font-black leading-none text-[#0f4f55] drop-shadow-sm">
              Oté koman i lé Kafrine ?
            </h1>
            <p className="mx-auto max-w-[285px] text-sm font-bold text-[#14746f]">
              Si ou l'aime jouer c ici ca se passe
            </p>
          </div>

          <div className="space-y-3 rounded-lg bg-white/86 p-4 text-left shadow-[0_16px_34px_rgba(6,78,91,0.18)]">
            <label className="block space-y-1 text-sm font-black text-[#0f4f55]">
              Identifiant
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="h-13 w-full rounded-lg border border-[#0f766e]/20 bg-white px-4 text-base font-bold text-[#0f4f55] outline-none focus:border-[#00a6a6] focus:ring-4 focus:ring-[#00a6a6]/15"
                autoComplete="username"
                inputMode="email"
              />
            </label>

            <label className="block space-y-1 text-sm font-black text-[#0f4f55]">
              Mot de passe
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                className="h-13 w-full rounded-lg border border-[#0f766e]/20 bg-white px-4 text-base font-bold text-[#0f4f55] outline-none focus:border-[#00a6a6] focus:ring-4 focus:ring-[#00a6a6]/15"
                autoComplete="current-password"
              />
            </label>

            {error ? (
              <p className="text-center text-sm font-black text-[#d14a1f]">
                Mauvais code. Le lagon reste fermé.
              </p>
            ) : null}
          </div>

          <Button type="submit" className="h-14 w-full">
            Entrer →
          </Button>
        </form>
      </div>
    </Card>
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <Card className="screen-pop w-full overflow-hidden">
      <div className="relative h-[46dvh] min-h-[330px] max-h-[430px] overflow-hidden bg-[linear-gradient(180deg,#7de3ff,#dcfff6_42%,#facc15_78%,#28a55b)]">
        <TropicalBackground bgOffset={0} />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-5 text-center">
          <div className="flex items-end justify-center gap-3">
            <YazidRunnerSprite jumping={false} runningFrame={false} className="scale-125 drop-shadow-lg" />
            <RoxaneSprite className="scale-125 drop-shadow-lg" />
          </div>
          <div className="rounded-lg bg-white/84 px-4 py-3 shadow">
            <h2 className="text-3xl font-black text-[#0f4f55]">La Réunion Rush</h2>
            <p className="text-sm font-bold text-[#14746f]">
              Yazid doit survivre au parcours.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-[#0f766e]/10 p-4">
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-black text-[#0f4f55]">
          <span className="rounded-lg bg-[#e9fff5] px-2 py-2">Runner</span>
          <span className="rounded-lg bg-[#fff4b8] px-2 py-2">Smash</span>
          <span className="rounded-lg bg-[#e0f7ff] px-2 py-2">Finale</span>
        </div>
        <Button onClick={onStart} className="h-14 w-full">
          Commencer →
        </Button>
      </div>
    </Card>
  );
}

function StepBadge({ step }: { step: Step }) {
  const stepLabel = useMemo(() => {
    if (step === "access") return "Accès";
    if (step === "intro") return "Départ";
    if (step === "runner") return "Course";
    if (step === "smashIntro") return "Smash";
    if (step === "swipe") return "Choix";
    if (step === "match") return "Match";
    if (step === "fatalIntro") return "Danger";
    if (step === "love") return "Question";
    if (step === "realFinal") return "Cœur";
    if (step === "thinking") return "Soleil";
    return "Verdict";
  }, [step]);

  return (
    <div className="inline-flex items-center gap-2 rounded-lg bg-white/78 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#0f4f55] shadow-sm ring-1 ring-white/70">
      <span className="h-2 w-2 rounded-full bg-[#ff8a3d]" />
      {stepLabel}
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState<Step>("access");

  return (
    <main
      className="min-h-dvh overflow-x-hidden px-3 pb-[calc(16px+env(safe-area-inset-bottom))] pt-[calc(12px+env(safe-area-inset-top))] text-[#0f4f55]"
      style={{
        background:
          "linear-gradient(180deg, #66d9ff 0%, #dffef7 36%, #fff4a6 67%, #2f9e58 100%)",
      }}
    >
      <div className="mx-auto flex min-h-[calc(100dvh-28px)] w-full max-w-[430px] flex-col gap-3">
        <header className="shrink-0">
          <div className="flex items-center justify-between gap-3">
            <StepBadge step={step} />
            <Button
              variant="bare"
              className="min-h-10 px-3 py-2 text-sm"
              onClick={() => setStep("access")}
            >
              ↻
            </Button>
          </div>
        </header>

        <section className="flex flex-1 items-center">
          {step === "access" ? <AccessScreen onSuccess={() => setStep("intro")} /> : null}
          {step === "intro" ? <IntroScreen onStart={() => setStep("runner")} /> : null}
          {step === "runner" ? <RunnerToRoxaneGame onDone={() => setStep("smashIntro")} /> : null}
          {step === "smashIntro" ? <SmashIntroScreen onStart={() => setStep("swipe")} /> : null}
          {step === "swipe" ? <SwipeScreen onDone={() => setStep("match")} /> : null}
          {step === "match" ? <MatchScreen onDone={() => setStep("fatalIntro")} /> : null}
          {step === "fatalIntro" ? <FatalQuestionIntro onStart={() => setStep("love")} /> : null}
          {step === "love" ? <LoveQuestion onDone={() => setStep("final")} /> : null}
          {step === "final" ? <FinalScreen onContinue={() => setStep("realFinal")} /> : null}
          {step === "realFinal" ? <RealFinalScreen onContinue={() => setStep("thinking")} /> : null}
          {step === "thinking" ? <ThinkingScreen onRestart={() => setStep("intro")} /> : null}
        </section>
      </div>
    </main>
  );
}
