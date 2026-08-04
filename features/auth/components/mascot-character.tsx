"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

export type MascotState =
  | "idle"
  | "email-focus"
  | "password-focus"
  | "password-visible"
  | "password-error"
  | "success";

/*
 * Rebuilt frame-by-frame from the reference video:
 * - purple BENDS like a flexible slab (banana curve), not a rigid tilt
 * - faces SLIDE across the bodies toward wherever they look
 * - email: everyone turns to the form, purple bends hard right
 * - password: purple bends away + frowns, black ducks down, worried faces
 * - reveal: black stares with wide donut eyes, orange giggles (^ ^ + o)
 * Each body animates independently; they only share the gaze direction.
 */

const VB_W = 512;
const VB_H = 640;
const BASE_Y = 500;

const C = {
  purple: "#5B34E6",
  black: "#17171B",
  orange: "#FE7A34",
  yellow: "#FFC933",
} as const;

// Body geometry (video-measured, scaled to viewBox)
const P = { x: 138, w: 141, h: 308 };
const B = { x: 242, w: 86, h: 216, rx: 8 };
const O = { x: 166, rx: 118, ry: 122 };
const Y = { x: 303, w: 99, h: 163 };

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Purple's bend: top edge translates + rotates, edges curve like a bent slab. */
function bendTop(b: number) {
  const th = b * 0.75;
  return {
    th,
    tcx: P.w / 2 + b * 78,
    tcy: -P.h + Math.abs(b) * 20,
  };
}

/** Black's body: ducking shrinks it from the TOP so its base never leaves the floor. */
function blackPath(duck: number) {
  const h = Math.max(40, B.h - duck);
  const r = B.rx;
  return [
    `M 0 0`,
    `L 0 ${-(h - r)}`,
    `Q 0 ${-h} ${r} ${-h}`,
    `L ${B.w - r} ${-h}`,
    `Q ${B.w} ${-h} ${B.w} ${-(h - r)}`,
    `L ${B.w} 0`,
    `Z`,
  ].join(" ");
}

function purplePath(b: number) {
  const { th, tcx, tcy } = bendTop(b);
  const cos = Math.cos(th);
  const sin = Math.sin(th);
  const hw = P.w / 2;
  const tlx = tcx - cos * hw;
  const tly = tcy - sin * hw;
  const trx = tcx + cos * hw;
  const try_ = tcy + sin * hw;
  const dA = P.h * 0.3;
  const dx = -sin * dA;
  const dy = cos * dA;
  return [
    `M 0 0`,
    `C 0 ${-P.h * 0.45} ${tlx + dx} ${tly + dy} ${tlx} ${tly}`,
    `L ${trx} ${try_}`,
    `C ${trx + dx} ${try_ + dy} ${P.w} ${-P.h * 0.45} ${P.w} 0`,
    `Z`,
  ].join(" ");
}

/** Sets an SVG attribute from a MotionValue without framer's SVG transform quirks. */
function useAttr(
  ref: RefObject<SVGElement | null>,
  attr: string,
  mv: MotionValue<string>,
) {
  useEffect(() => {
    const apply = (v: string) => ref.current?.setAttribute(attr, v);
    apply(mv.get());
    return mv.on("change", apply);
  }, [ref, attr, mv]);
}

function AttrGroup({
  transform,
  children,
}: {
  transform: MotionValue<string>;
  children: ReactNode;
}) {
  const ref = useRef<SVGGElement>(null);
  useAttr(ref, "transform", transform);
  return <g ref={ref}>{children}</g>;
}

function AttrPath({
  d,
  fill,
  stroke,
  strokeWidth,
}: {
  d: MotionValue<string>;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}) {
  const ref = useRef<SVGPathElement>(null);
  useAttr(ref, "d", d);
  return (
    <path
      ref={ref}
      fill={fill ?? "none"}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  );
}

/** Pupil that tracks the cursor on screen, with per-state override. */
function TrackingPupil({
  cx,
  cy,
  r,
  mouseX,
  mouseY,
  svgRef,
  override,
  maxOffset = 3,
  worldX = 0,
  worldY = 0,
}: {
  cx: number;
  cy: number;
  r: number;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  svgRef: RefObject<SVGSVGElement | null>;
  override: { x: number; y: number } | null;
  maxOffset?: number;
  worldX?: number;
  worldY?: number;
}) {
  const pupilX = useMotionValue(cx);
  const pupilY = useMotionValue(cy);
  const rSpring = useSpring(r, { stiffness: 300, damping: 20 });

  useEffect(() => {
    rSpring.set(r);
  }, [r, rSpring]);

  useEffect(() => {
    const update = () => {
      if (override) {
        pupilX.set(cx + override.x * maxOffset);
        pupilY.set(cy + override.y * maxOffset);
        return;
      }
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const ex = rect.left + ((worldX + cx) / VB_W) * rect.width;
      const ey = rect.top + ((worldY + cy) / VB_H) * rect.height;
      const dx = mouseX.get() - ex;
      const dy = mouseY.get() - ey;
      const len = Math.hypot(dx, dy) || 1;
      pupilX.set(cx + clamp((dx / len) * maxOffset, -maxOffset, maxOffset));
      pupilY.set(cy + clamp((dy / len) * maxOffset, -maxOffset, maxOffset));
    };
    update();
    const ux = mouseX.on("change", update);
    const uy = mouseY.on("change", update);
    return () => {
      ux();
      uy();
    };
  }, [mouseX, mouseY, cx, cy, maxOffset, override, pupilX, pupilY, svgRef, worldX, worldY]);

  return (
    <motion.circle
      fill={C.black}
      style={{ cx: pupilX, cy: pupilY, r: rSpring }}
    />
  );
}

/** Per-state pose targets. g = gaze direction -1 (left) .. 1 (form side). */
function targetsFor(state: MascotState, g: number) {
  switch (state) {
    case "email-focus":
      return { bend: 1, pSlide: 6, bRot: 13, bDuck: 0, bEyeX: 18, bEyeY: 0, oFaceX: 46, oFaceY: -68, yS: 1, yRot: 6 };
    case "password-focus":
      // yellow: head mostly forward, uneasy mouth skewed right (yMouth shift)
      return { bend: -0.55, pSlide: -8, bRot: 1, bDuck: 26, bEyeX: 16, bEyeY: 0, oFaceX: 40, oFaceY: -56, yS: -0.1, yRot: 0 };
    case "password-visible":
      return { bend: 0, pSlide: -18, bRot: 4, bDuck: 0, bEyeX: -23, bEyeY: 62, oFaceX: -44, oFaceY: -72, yS: -0.7, yRot: 0 };
    case "password-error":
      return { bend: 0, pSlide: 0, bRot: 4, bDuck: 8, bEyeX: 0, bEyeY: 0, oFaceX: 0, oFaceY: -70, yS: 0, yRot: 0 };
    case "success":
      return { bend: 0.15, pSlide: 6, bRot: 6, bDuck: -6, bEyeX: 8, bEyeY: 0, oFaceX: 12, oFaceY: -82, yS: 0.3, yRot: 3 };
    default:
      return { bend: g * 0.12, pSlide: g * 28, bRot: 4 + g * 4, bDuck: 0, bEyeX: g * 20, bEyeY: 0, oFaceX: g * 38, oFaceY: -76, yS: g, yRot: g * 3 };
  }
}

const SPRING = { stiffness: 150, damping: 16 };

export function MascotCharacter({
  state,
  className,
}: {
  state: MascotState;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);

  // --- cursor + gaze ---
  const rawMX = useMotionValue(
    typeof window !== "undefined" ? window.innerWidth / 2 : 0,
  );
  const rawMY = useMotionValue(
    typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  );
  const mouseX = useSpring(rawMX, { stiffness: 140, damping: 18 });
  const mouseY = useSpring(rawMY, { stiffness: 140, damping: 18 });
  const gaze = useMotionValue(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawMX.set(e.clientX);
      rawMY.set(e.clientY);
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.44;
      gaze.set(clamp((e.clientX - cx) / (rect.width * 0.7), -1, 1));
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [rawMX, rawMY, gaze]);

  // --- pose springs ---
  const bend = useSpring(0, { stiffness: 120, damping: 15 });
  const pSlide = useSpring(0, SPRING);
  const bRot = useSpring(4, SPRING);
  const bDuck = useSpring(0, SPRING);
  const bEyeX = useSpring(0, SPRING);
  const bEyeY = useSpring(0, SPRING);
  const oFaceX = useSpring(0, SPRING);
  const oFaceY = useSpring(-78, SPRING);
  const yS = useSpring(0, SPRING);
  const yRot = useSpring(0, SPRING);
  const yLift = useSpring(0, SPRING);
  const yMouth = useSpring(0, SPRING);

  // --- chatter: while the user types, they turn to each other and "discuss" ---
  // chat === -1: first reaction to the field; 0/1: alternating conversation turns
  const [chat, setChat] = useState(-1);
  const [blink, setBlink] = useState(false);
  const typing = state === "email-focus" || state === "password-focus";

  useEffect(() => {
    if (!typing || reduceMotion) {
      setChat(-1);
      return;
    }
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const turn = () => {
      if (!alive) return;
      setChat((c) => (c === 1 ? 0 : 1));
      setBlink(true);
      timers.push(setTimeout(() => alive && setBlink(false), 150));
      timers.push(setTimeout(turn, 1500 + Math.random() * 1000));
    };
    timers.push(setTimeout(turn, 1300));
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      setChat(-1);
      setBlink(false);
    };
  }, [typing, reduceMotion]);

  useEffect(() => {
    const apply = () => {
      const g = reduceMotion ? 0 : gaze.get();
      const t = targetsFor(state, g);
      let lift = 0;
      if (chat >= 0 && state === "email-focus") {
        // relax out of the big bend and chat: black looks down at yellow,
        // yellow looks up at black, orange turns up-right, purple watches the field
        Object.assign(
          t,
          chat === 0
            ? { bend: 0.2, pSlide: 24, bRot: 8, bEyeX: 21, oFaceX: 38, oFaceY: -66, yS: 0.72, yRot: 4 }
            : { bend: 0.45, pSlide: 16, bRot: 11, bEyeX: 15, oFaceX: 48, oFaceY: -72, yS: 1, yRot: 6 },
        );
        lift = chat === 0 ? 12 : 2;
      } else if (chat >= 0 && state === "password-focus") {
        // worried whispering: black and yellow trade glances
        Object.assign(t, chat === 0 ? { bEyeX: -2, yS: -0.35 } : { bEyeX: 16, yS: 0.1 });
        lift = chat === 0 ? 8 : 0;
      }
      yMouth.set(state === "password-focus" ? 28 : 0);
      bend.set(reduceMotion ? 0 : t.bend);
      pSlide.set(t.pSlide);
      bRot.set(t.bRot);
      bDuck.set(t.bDuck);
      bEyeX.set(t.bEyeX);
      bEyeY.set(t.bEyeY);
      oFaceX.set(t.oFaceX);
      oFaceY.set(t.oFaceY);
      yS.set(t.yS);
      yRot.set(t.yRot);
      yLift.set(lift);
    };
    apply();
    if (state === "idle" && !reduceMotion) {
      return gaze.on("change", apply);
    }
  }, [state, chat, reduceMotion, gaze, bend, pSlide, bRot, bDuck, bEyeX, bEyeY, oFaceX, oFaceY, yS, yRot, yLift, yMouth]);

  // --- derived attribute strings ---
  const purpleD = useTransform(bend, purplePath);
  const purpleFaceT = useTransform(bend, (b) => {
    const { th, tcx, tcy } = bendTop(b);
    return `translate(${tcx} ${tcy}) rotate(${(th * 180) / Math.PI})`;
  });
  const purpleSlideT = useTransform(pSlide, (s) => `translate(${s} 0)`);
  const blackT = useTransform(bRot, (r) => `rotate(${r} ${B.w / 2} 0)`);
  const blackD = useTransform(bDuck, blackPath);
  // eyes follow the (shrinking) top of the body plus their own state offset
  const blackEyesT = useTransform([bEyeX, bEyeY, bDuck], (v) => {
    const [x, y, d] = v as [number, number, number];
    return `translate(${x} ${y + d})`;
  });
  const orangeFaceT = useTransform([oFaceX, oFaceY], (v) => {
    const [x, y] = v as [number, number];
    return `translate(${x} ${y})`;
  });
  const yellowT = useTransform(yRot, (r) => `rotate(${r} ${Y.w / 2} 0)`);
  // eye stays on the arch (lift shrinks near the edge so it can't float off)
  const yellowEyeT = useTransform([yS, yLift], (v) => {
    const [s, l] = v as [number, number];
    const lift = l * (1 - 0.6 * Math.max(0, s));
    return `translate(${66 + 26 * s} ${-124 - lift})`;
  });
  const yellowMouthT = useTransform([yS, yMouth], (v) => {
    const [s, m] = v as [number, number];
    return `translate(${64.5 + 45 * s + m} ${-110 - 4 * s})`;
  });

  // --- expressions ---
  const pupilOverride =
    state === "email-focus"
      ? chat === 0
        ? { x: 0.6, y: 0.7 } // looking down at yellow mid-chat
        : { x: 0.7, y: -0.6 }
      : state === "password-focus"
        ? chat === 0
          ? { x: -0.5, y: 0.4 }
          : { x: 0.9, y: 0.25 }
        : state === "password-visible"
          ? { x: 0, y: 0 }
          : state === "password-error"
            ? { x: 0, y: 0.8 }
            : state === "success"
              ? { x: 0, y: -0.5 }
              : null;

  const frowning =
    state === "password-focus" ||
    state === "password-visible" ||
    state === "password-error";
  const purpleMouth = frowning
    ? "M -8 4 Q 0 -3 8 4"
    : state === "success"
      ? "M -7 0 Q 0 5 7 0"
      : state === "email-focus"
        ? "M 0 -5 L 0 6" // concentrating vertical bar, straight from the video
        : null; // dot
  const orangeMouthKind =
    state === "email-focus"
      ? "dot"
      : state === "password-focus" || state === "password-error"
        ? "frown"
        : state === "password-visible"
          ? "o"
          : "open";
  const orangeHappyEyes = state === "password-visible";
  const yellowWavy = state === "password-focus";
  const blackPupilR = state === "password-visible" ? 4.6 : 3.5;

  const reaction =
    state === "password-error"
      ? {
          x: [0, -7, 7, -4, 4, 0],
          rotate: [0, -1.5, 1.5, -1, 1, 0],
          y: 0,
          transition: { duration: 0.5, ease: "easeInOut" as const },
        }
      : state === "success"
        ? {
            x: 0,
            rotate: 0,
            y: [0, -14, 0],
            transition: { duration: 0.4, repeat: 2, ease: "easeOut" as const },
          }
        : { x: 0, y: 0, rotate: 0 };

  const entrance = (delay: number, from: Record<string, number>) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, ...from },
          animate: { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 },
          transition: {
            type: "spring" as const,
            stiffness: 160,
            damping: 15,
            delay,
          },
        };

  return (
    <div className={className} aria-hidden>
      <motion.div className="h-full w-full origin-[40%_80%]" animate={reaction}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMax meet"
        >
          {/* contact shadow */}
          <ellipse
            cx={226}
            cy={BASE_Y + 4}
            rx={185}
            ry={6}
            fill="rgba(23,23,27,0.10)"
          />

          {/* PURPLE — bendy slab, face rides the bent top */}
          <motion.g {...entrance(0.05, { y: -240, rotate: -24, scale: 0.7 })}>
            <g transform={`translate(${P.x} ${BASE_Y})`}>
              <AttrPath d={purpleD} fill={C.purple} />
              <AttrGroup transform={purpleFaceT}>
                <AttrGroup transform={purpleSlideT}>
                  {/* tiny white eyes + pupils */}
                  <circle cx={-20} cy={28} r={5} fill="#fff" />
                  <circle cx={20} cy={28} r={5} fill="#fff" />
                  <TrackingPupil
                    cx={-20}
                    cy={28}
                    r={2.2}
                    maxOffset={2}
                    mouseX={mouseX}
                    mouseY={mouseY}
                    svgRef={svgRef}
                    override={pupilOverride}
                    worldX={P.x + P.w / 2}
                    worldY={BASE_Y - P.h}
                  />
                  <TrackingPupil
                    cx={20}
                    cy={28}
                    r={2.2}
                    maxOffset={2}
                    mouseX={mouseX}
                    mouseY={mouseY}
                    svgRef={svgRef}
                    override={pupilOverride}
                    worldX={P.x + P.w / 2}
                    worldY={BASE_Y - P.h}
                  />
                  {purpleMouth ? (
                    <motion.path
                      key={`pm-${state}`}
                      d={purpleMouth}
                      transform="translate(0 48)"
                      fill="none"
                      stroke={C.black}
                      strokeWidth={3}
                      strokeLinecap="round"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  ) : (
                    <ellipse cx={0} cy={48} rx={3.5} ry={4.5} fill={C.black} />
                  )}
                </AttrGroup>
              </AttrGroup>
            </g>
          </motion.g>

          {/* BLACK — leans, ducks during password, googly eyes slide */}
          <motion.g {...entrance(0.15, { y: -190, rotate: 22 })}>
            <g transform={`translate(${B.x} ${BASE_Y})`}>
              <AttrGroup transform={blackT}>
                <AttrPath d={blackD} fill={C.black} />
                <AttrGroup transform={blackEyesT}>
                  {blink ? (
                    <g>
                      <rect x={25} y={-B.h + 18.5} width={12} height={3} rx={1.5} fill="#fff" />
                      <rect x={49} y={-B.h + 18.5} width={12} height={3} rx={1.5} fill="#fff" />
                    </g>
                  ) : (
                    <g>
                      <circle cx={31} cy={-B.h + 20} r={8} fill="#fff" />
                      <circle cx={55} cy={-B.h + 20} r={8} fill="#fff" />
                      <TrackingPupil
                        cx={31}
                        cy={-B.h + 20}
                        r={blackPupilR}
                        maxOffset={3.5}
                        mouseX={mouseX}
                        mouseY={mouseY}
                        svgRef={svgRef}
                        override={pupilOverride}
                        worldX={B.x + B.w / 2}
                        worldY={BASE_Y - B.h}
                      />
                      <TrackingPupil
                        cx={55}
                        cy={-B.h + 20}
                        r={blackPupilR}
                        maxOffset={3.5}
                        mouseX={mouseX}
                        mouseY={mouseY}
                        svgRef={svgRef}
                        override={pupilOverride}
                        worldX={B.x + B.w / 2}
                        worldY={BASE_Y - B.h}
                      />
                    </g>
                  )}
                </AttrGroup>
              </AttrGroup>
            </g>
          </motion.g>

          {/* ORANGE — dome; face slides around it */}
          <motion.g {...entrance(0.22, { y: 60, scale: 0.3 })}>
            <g transform={`translate(${O.x} ${BASE_Y})`}>
              <path
                d={`M ${-O.rx} 0 A ${O.rx} ${O.ry} 0 0 1 ${O.rx} 0 Z`}
                fill={C.orange}
              />
              <AttrGroup transform={orangeFaceT}>
                {orangeHappyEyes ? (
                  <g>
                    <path
                      d="M -34 0 Q -26 -8 -18 0"
                      fill="none"
                      stroke={C.black}
                      strokeWidth={4}
                      strokeLinecap="round"
                    />
                    <path
                      d="M 18 0 Q 26 -8 34 0"
                      fill="none"
                      stroke={C.black}
                      strokeWidth={4}
                      strokeLinecap="round"
                    />
                  </g>
                ) : (
                  <g>
                    <circle cx={-26} cy={0} r={6} fill={C.black} />
                    <circle cx={26} cy={0} r={6} fill={C.black} />
                  </g>
                )}
                {orangeMouthKind === "open" ? (
                  <path
                    d="M -12 18 A 12 10 0 0 0 12 18 Z"
                    fill={C.black}
                  />
                ) : orangeMouthKind === "dot" ? (
                  <circle cx={0} cy={22} r={3.5} fill={C.black} />
                ) : orangeMouthKind === "o" ? (
                  <circle cx={0} cy={22} r={4.5} fill={C.black} />
                ) : (
                  <path
                    d="M -9 25 Q 0 18 9 25"
                    fill="none"
                    stroke={C.black}
                    strokeWidth={3.5}
                    strokeLinecap="round"
                  />
                )}
              </AttrGroup>
            </g>
          </motion.g>

          {/* YELLOW — arch; eye + beak-line swing to the side it faces */}
          <motion.g {...entrance(0.3, { x: 120, rotate: 26 })}>
            <g transform={`translate(${Y.x} ${BASE_Y})`}>
              <AttrGroup transform={yellowT}>
                <path
                  d={`M 0 0 L 0 ${-(Y.h - Y.w / 2)} A ${Y.w / 2} ${Y.w / 2} 0 0 1 ${Y.w} ${-(Y.h - Y.w / 2)} L ${Y.w} 0 Z`}
                  fill={C.yellow}
                />
                <AttrGroup transform={yellowEyeT}>
                  <circle cx={0} cy={0} r={4.3} fill={C.black} />
                </AttrGroup>
                <AttrGroup transform={yellowMouthT}>
                  {yellowWavy ? (
                    <path
                      d="M -18 0 q 6 -5 12 0 q 6 5 12 0 q 6 -5 12 0"
                      fill="none"
                      stroke={C.black}
                      strokeWidth={4.5}
                      strokeLinecap="round"
                    />
                  ) : (
                    <path
                      d="M -17 0 L 17 0"
                      fill="none"
                      stroke={C.black}
                      strokeWidth={6}
                      strokeLinecap="round"
                    />
                  )}
                </AttrGroup>
              </AttrGroup>
            </g>
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}
