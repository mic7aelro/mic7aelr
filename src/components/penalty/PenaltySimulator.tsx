'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './Penalty.module.css';
import { TEAMS, TEAM_LIST, TEAM_STARS, type Player, type Team } from './teams';

// ─── Tunables ──────────────────────────────────────────────────────────────
const W = 640; // internal art resolution (drawn in full detail)
const H = 400;
const PW = 214; // pixel-art output resolution — the detailed scene above is
const PH = 134; // downsampled to this, then upscaled with no smoothing
const GOAL_LEFT = 147;
const GOAL_RIGHT = 493;
const GOAL_TOP = 91;
const GOAL_LINE = 224; // ground level of the goal mouth
const BALL_START = { x: W / 2, y: 336 };
// Feet-on-the-line, not floating above it — this is the ground plane for
// the keeper, not an arbitrary "somewhere in the goal mouth" point.
const KEEPER_BASE = { x: W / 2, y: GOAL_LINE - 4 };
const KEEPER_SCALE = 1.55; // a keeper standing on a 2.44m bar should read as ~80% of the goal's height
const RUNNER_SCALE = 1.6; // foreground presence — was easy to lose against the goal/keeper

const RETICLE_BOUNDS = {
  minX: GOAL_LEFT + 24,
  maxX: GOAL_RIGHT - 24,
  minY: GOAL_TOP + 18,
  maxY: GOAL_LINE - 14,
};

const RUNUP_MS = 900;
const KICK_DURATION_MS = 720;
// Once a dive is committed mid-flight, it always gets this long to play out
// on screen — even a last-instant commit still reads as a real dive instead
// of being cut off by the ball's arrival.
const DEFEND_DIVE_MS = 450;
const RESULT_HOLD_MS = 1500;
const ROUNDS = 5;
const WEAK_MAX = 0.2;
const OVER_MIN = 0.88;
const HIGH_SCORE_KEY = 'penalty-sim-best';

type Phase =
  | 'start'
  | 'teamSelect'
  | 'squad'
  | 'jersey'
  | 'runup'
  | 'aim'
  | 'power'
  | 'defend'
  | 'kick'
  | 'result'
  | 'gameover';
type Turn = 'user' | 'cpu';
// Six real dive quadrants (top/bottom x left/mid/right) plus three "stayed
// on their feet" zones used only for the timed-out defend case — a keeper
// who never dove can still block a shot straight at them without a real
// dive animation, but has far less reach than a committed dive.
type Col = 'left' | 'mid' | 'right';
type Row = 'top' | 'bottom';
type Zone = `${Row}-${Col}` | `stand-${Col}`;
type Outcome = 'goal' | 'saved-weak' | 'saved-guessed' | 'over';
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

interface Shot {
  outcome: Outcome;
  nx: number; // 0..1 across goal width, as dragged
  ny: number; // 0..1 across goal height (0 = crossbar, 1 = ground)
  power: number; // 0..1 stop position on the meter
  zone: Zone; // keeper's dive quadrant (or stand-* if they never committed)
  difficulty: number; // 0..~0.5
}

const COL_CENTER: Record<Col, number> = { left: 0.18, mid: 0.5, right: 0.82 };
const COLS: Col[] = ['left', 'mid', 'right'];
const ROWS: Row[] = ['top', 'bottom'];

function zoneCol(z: Zone): Col {
  return z.endsWith('left') ? 'left' : z.endsWith('right') ? 'right' : 'mid';
}
function zoneRow(z: Zone): Row {
  return z.startsWith('top') ? 'top' : 'bottom';
}
function colCenterX(col: Col) {
  return GOAL_LEFT + COL_CENTER[col] * (GOAL_RIGHT - GOAL_LEFT);
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const triangleWave = (t: number) => {
  const p = t % 1;
  return p < 0.5 ? p * 2 : 2 - p * 2;
};

// Only picks a real dive (never a "stand-*" zone) — the AI keeper defending
// the user's own kicks always commits to a full dive, same as before.
function pickZone(): Zone {
  const col = COLS[Math.floor(Math.random() * COLS.length)];
  const row = ROWS[Math.floor(Math.random() * ROWS.length)];
  return `${row}-${col}`;
}

// Shirt convention: "Alexis Mac Allister" -> "MAC ALLISTER", "Virgil van
// Dijk" -> "VAN DIJK" — first token is the given name, everything after it
// is the surname as printed on a jersey.
function surname(name: string) {
  return name.split(' ').slice(1).join(' ').toUpperCase();
}

function difficultyOf(nx: number, ny: number) {
  const distX = Math.abs(nx - 0.5); // 0 (center) .. 0.5 (post)
  const height = 1 - ny; // 0 (ground) .. 1 (crossbar)
  return distX * (0.5 + 0.5 * height);
}

function difficultyLabel(d: number): Difficulty {
  if (d < 0.14) return 'EASY';
  if (d < 0.28) return 'MEDIUM';
  return 'HARD';
}

// A better penalty taker gets a slower, more forgiving bar — the whole
// point of setting your penalty order is that your best takers should be
// steadier under pressure, not just cosmetically labeled "better".
// Rating 92 (Isak) ~= 1.3x slower than baseline; rating 30 (a fringe
// academy player) ~= 0.78x, i.e. noticeably faster/harder to time.
function ratingSpeedFactor(rating: number) {
  return lerp(0.78, 1.3, clamp((rating - 26) / (86 - 26), 0, 1));
}

function meterPeriodMs(difficulty: number, rating: number) {
  return lerp(1300, 320, clamp(difficulty / 0.5, 0, 1)) * ratingSpeedFactor(rating);
}

// `keeperZone` is the keeper's dive: a random guess when the AI is
// defending the user's own kicks, or the quadrant the user explicitly
// picked (or the column they were standing in, un-committed, on a defend
// timeout) when they're defending a CPU kick in the 'defend' mini-game.
function resolveShot(nx: number, ny: number, power: number, keeperZone: Zone = pickZone()): Shot {
  const difficulty = difficultyOf(nx, ny);
  const zone = keeperZone;

  if (power > OVER_MIN) return { outcome: 'over', nx, ny, power, zone, difficulty };
  if (power < WEAK_MAX) return { outcome: 'saved-weak', nx, ny, power, zone, difficulty };

  const wellTimed = power > 0.45 && power < 0.78;

  // A well-struck top corner (HARD band — see difficultyLabel) beats a
  // correct dive outright, same as in real life: nobody's saving a clean
  // side-netting screamer even if they guess right. That's the actual
  // reward for the harder, faster timing bar up there — otherwise a top
  // corner is just a strictly worse version of the same-side bottom
  // corner (identical zone risk, harder to time, no extra payoff).
  if (difficulty >= 0.28 && wellTimed) {
    return { outcome: 'goal', nx, ny, power, zone, difficulty };
  }

  const col = zoneCol(zone);

  // Never committed to a dive (defend timeout) — only blocks a shot that's
  // both close to the column they were standing in AND not tucked into an
  // extreme top/bottom corner; a stationary keeper can't reach those.
  if (zone.startsWith('stand')) {
    const inStandingBand = ny > 0.24 && ny < 0.8;
    const dist = Math.abs(nx - COL_CENTER[col]);
    const saved = inStandingBand && dist < 0.11;
    return { outcome: saved ? 'saved-guessed' : 'goal', nx, ny, power, zone, difficulty };
  }

  // Committed to a real dive — diving the wrong vertical half is an
  // automatic goal (you can't dive down and also tip one over the bar),
  // same way guessing the wrong side already was.
  const shotRow: Row = ny < 0.5 ? 'top' : 'bottom';
  if (zoneRow(zone) !== shotRow) {
    return { outcome: 'goal', nx, ny, power, zone, difficulty };
  }

  let reach = 0.3 - difficulty * 0.4;
  if (wellTimed) reach *= 0.6; // well-timed strikes are harder to keep out everywhere else too
  reach = clamp(reach, 0.07, 0.3);

  const dist = Math.abs(nx - COL_CENTER[col]);
  return { outcome: dist < reach ? 'saved-guessed' : 'goal', nx, ny, power, zone, difficulty };
}

// The CPU's own kicks aren't timed by a human, so their placement/power is
// rolled instead — better-rated takers aim further from center and higher
// (harder for the user's keeper to reach) and hit the power sweet spot more
// consistently. A small mistake chance (more likely for a worse taker)
// still lets weak/skied kicks happen, same as they can for the user.
function simulateCpuShot(rating: number): { nx: number; ny: number; power: number } {
  const skill = clamp(rating / 90, 0.25, 1);
  const mistakeRoll = Math.random();
  if (mistakeRoll < 0.05 * (1.4 - skill)) {
    return { nx: 0.5, ny: 0.6, power: WEAK_MAX * 0.6 };
  }
  if (mistakeRoll > 1 - 0.04 * (1.4 - skill)) {
    return { nx: 0.5, ny: 0.6, power: OVER_MIN + 0.06 };
  }
  const cornerBias = 0.15 + skill * 0.3;
  const nx = clamp(0.5 + (Math.random() * 2 - 1) * cornerBias, 0.06, 0.94);
  const heightBias = 0.25 + skill * 0.5;
  const ny = clamp(1 - Math.random() * heightBias, 0.05, 0.95);
  const spread = 0.3 - skill * 0.12;
  const power = clamp(0.6 + (Math.random() * 2 - 1) * spread, WEAK_MAX + 0.02, OVER_MIN - 0.02);
  return { nx, ny, power };
}

// ─── Sound (WebAudio, no external assets) ─────────────────────────────────
function useSfx(muted: React.RefObject<boolean>) {
  const ctxRef = useRef<AudioContext | null>(null);

  const ctx = useCallback(() => {
    if (!ctxRef.current) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new Ctor();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const tone = useCallback(
    (freq: number, dur: number, type: OscillatorType, vol: number, delay = 0, glideTo?: number) => {
      if (muted.current) return;
      const ac = ctx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      const t0 = ac.currentTime + delay;
      osc.frequency.setValueAtTime(freq, t0);
      if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    },
    [ctx, muted]
  );

  return {
    prime: () => ctx(),
    lock: () => tone(880, 0.05, 'square', 0.1, 0),
    kick: () => tone(180, 0.12, 'square', 0.18, 0, 90),
    goal: () => {
      tone(523, 0.12, 'square', 0.16, 0);
      tone(659, 0.12, 'square', 0.16, 0.1);
      tone(784, 0.22, 'square', 0.18, 0.2);
    },
    saved: () => tone(160, 0.28, 'sawtooth', 0.14, 0, 70),
    over: () => tone(110, 0.3, 'triangle', 0.16, 0),
  };
}

// ─── Pose math ──────────────────────────────────────────────────────────────
interface KeeperPose {
  x: number;
  y: number;
  rot: number; // degrees
  armSpread: number; // 0..~1.4
  squat: number; // 0..1
  dir: number; // -1/0/1 — which side is "leading" for asymmetric dive arms
  leap: boolean; // true for a top-corner leap — both arms reach straight up
}

function idleKeeperPose(now: number): KeeperPose {
  const sway = Math.sin(now / 420) * 4;
  return { x: KEEPER_BASE.x + sway, y: KEEPER_BASE.y, rot: 0, armSpread: 0.15, squat: 0.05, dir: 0, leap: false };
}

// Standing at a column during the 'defend' mini-game — no dive, just a
// slight ready-stance shift so the keeper's position visibly tracks A/D.
function standingKeeperPose(col: Col): KeeperPose {
  const dir = col === 'left' ? -1 : col === 'right' ? 1 : 0;
  return { x: lerp(KEEPER_BASE.x, colCenterX(col), 0.6), y: KEEPER_BASE.y, rot: 0, armSpread: 0.25, squat: 0.05, dir, leap: false };
}

function computeKeeperPose(shot: Shot, t: number): KeeperPose {
  if (shot.outcome === 'saved-weak') {
    const leanT = clamp(t / 0.25, 0, 1);
    const standT = clamp((t - 0.25) / 0.25, 0, 1);
    const stepT = clamp((t - 0.5) / 0.5, 0, 1);
    const col = zoneCol(shot.zone);
    const dir = col === 'left' ? -1 : col === 'right' ? 1 : 0;
    const lean = Math.sin(leanT * Math.PI) * 9 * dir * (1 - standT);
    const targetX = GOAL_LEFT + shot.nx * (GOAL_RIGHT - GOAL_LEFT);
    return {
      x: lerp(KEEPER_BASE.x, targetX, easeOutCubic(stepT)),
      y: KEEPER_BASE.y + stepT * 8,
      rot: lean,
      armSpread: 0.15 + stepT * 0.5,
      squat: stepT * 0.75,
      dir: 0,
      leap: false,
    };
  }

  const col = zoneCol(shot.zone);
  const dir = col === 'left' ? -1 : col === 'right' ? 1 : 0;
  const loadT = clamp(t / 0.15, 0, 1);
  const diveT = clamp((t - 0.15) / 0.55, 0, 1);

  // Never committed to a dive (defend timeout) — a small reactive step at
  // most, never a real save animation regardless of the outcome.
  if (shot.zone.startsWith('stand')) {
    const stepT = clamp(t / 0.3, 0, 1);
    return {
      x: lerp(KEEPER_BASE.x, colCenterX(col), easeOutCubic(stepT)),
      y: KEEPER_BASE.y + stepT * 3,
      rot: dir * stepT * 8,
      armSpread: 0.2 + stepT * 0.3,
      squat: stepT * 0.2,
      dir,
      leap: false,
    };
  }

  // Top corner — a leap, not a sideways dive: rises rather than drops,
  // with both arms reaching straight up regardless of column.
  if (zoneRow(shot.zone) === 'top') {
    const jump = Math.sin(clamp(diveT, 0, 1) * Math.PI) * 24;
    const targetX = col === 'mid' ? KEEPER_BASE.x : colCenterX(col);
    return {
      x: lerp(KEEPER_BASE.x, targetX, easeOutCubic(diveT)),
      y: KEEPER_BASE.y - jump,
      rot: dir * diveT * 14, // a lean, not a full sideways rotation
      armSpread: 0.5 + diveT * 1.2,
      squat: 0,
      dir,
      leap: true,
    };
  }

  if (col === 'mid') {
    const jump = Math.sin(clamp(diveT, 0, 1) * Math.PI) * 20;
    return {
      x: KEEPER_BASE.x,
      y: KEEPER_BASE.y - jump,
      rot: 0,
      armSpread: 0.3 + diveT * 0.9,
      squat: loadT * 0.3 * (1 - diveT),
      dir: 0,
      leap: false,
    };
  }

  const targetX = colCenterX(col);
  // A brief coil the opposite way before springing — real keepers load
  // against the direction they're about to launch — fading out as the
  // dive itself takes over.
  const coil = Math.sin(loadT * Math.PI) * -6 * dir * (1 - diveT);
  return {
    x: lerp(KEEPER_BASE.x, targetX, easeOutCubic(diveT)),
    y: KEEPER_BASE.y + diveT * 20,
    rot: coil + diveT * 86 * dir,
    armSpread: 0.4 + diveT * 1.25,
    squat: 0.15 + loadT * 0.15 * (1 - diveT),
    dir,
    leap: false,
  };
}

// ─── Drawing ───────────────────────────────────────────────────────────────
// Filled capsule limb instead of a stroked line — thin strokes lose most of
// their width (and can nearly vanish) once the scene is downsampled into
// the pixel-art buffer, so anything meant to read clearly needs real area.
function drawLimb(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, width: number, color: string) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  ctx.save();
  ctx.translate(x0, y0);
  ctx.rotate(Math.atan2(y1 - y0, x1 - x0));
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(0, -width / 2, len, width, width / 2);
  ctx.fill();
  ctx.restore();
}

// Relative luminance of a hex color, used to pick a stroke that contrasts
// with whatever fill color a team's jersey text needs (most kits are dark
// enough for a light number; a near-white kit like Tottenham's needs a dark
// number with a light outline instead).
function luminanceOf(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// Fill in the team's jersey-text color, stroked with whichever of
// black/white contrasts against it, so jersey text stays legible against
// any kit color even after the scene is downsampled into the pixel-art
// buffer — a plain fill alone gets muddy at that resolution.
function drawJerseyText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  strokeWidth: number,
  fillColor = '#f8f6f2'
) {
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = luminanceOf(fillColor) > 0.5 ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.55)';
  ctx.lineWidth = strokeWidth;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fillColor;
  ctx.fillText(text, x, y);
}

// Long surnames ("SZOBOSZLAI", "MAC ALLISTER") need two things, in order:
// first shrink the font size (down to a floor) so a 10-letter name isn't
// still trying to fit at full height, THEN apply whatever horizontal
// squeeze is still needed. Squeeze-only (the original approach) keeps
// letters full height but crushes them paper-thin on long names — a
// smaller, more proportionate glyph reads better than a tall sliver.
function drawJerseyName(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  fillColor = '#f8f6f2'
) {
  const minSize = fontSize * 0.55;
  let size = fontSize;
  ctx.font = `bold ${size}px sans-serif`;
  let width = ctx.measureText(text).width;
  // Allow some overflow (squeeze will absorb the rest) before shrinking —
  // short names like "ISAK" shouldn't get downsized at all.
  while (width > maxWidth * 1.4 && size > minSize) {
    size -= 0.5;
    ctx.font = `bold ${size}px sans-serif`;
    width = ctx.measureText(text).width;
  }
  const squeeze = Math.min(1, maxWidth / width);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(squeeze, 1);
  drawJerseyText(ctx, text, 0, 0, 1.6 / squeeze, fillColor);
  ctx.restore();
}

function drawKeeper(ctx: CanvasRenderingContext2D, pose: KeeperPose, team: Team) {
  ctx.save();
  ctx.translate(pose.x, pose.y);
  ctx.scale(KEEPER_SCALE, KEEPER_SCALE);
  ctx.rotate((pose.rot * Math.PI) / 180);

  const bodyH = 46 * (1 - pose.squat * 0.4);
  const legTop = -bodyH * 0.44;

  // shadow (kept level even while the body rotates for a dive)
  ctx.save();
  ctx.rotate((-pose.rot * Math.PI) / 180);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 6, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // boots
  ctx.fillStyle = '#141418';
  ctx.beginPath();
  ctx.roundRect(-9, -5, 7, 6, 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(2, -5, 7, 6, 2);
  ctx.fill();

  // socks
  ctx.fillStyle = '#e8b74a';
  ctx.fillRect(-8, legTop, 6, bodyH * 0.44 - 5);
  ctx.fillRect(2, legTop, 6, bodyH * 0.44 - 5);

  // shorts
  ctx.fillStyle = '#14161c';
  ctx.beginPath();
  ctx.roundRect(-10, legTop - 7, 20, 8, 2);
  ctx.fill();

  // shirt (gradient for shading) — tinted with the CPU team's kit colors
  const shirt = ctx.createLinearGradient(-12, -bodyH, 12, 0);
  shirt.addColorStop(0, team.shirtLight);
  shirt.addColorStop(1, team.shirtDark);
  ctx.fillStyle = shirt;
  ctx.beginPath();
  ctx.roundRect(-12, -bodyH, 24, bodyH * 0.62, 4);
  ctx.fill();

  // shirt center, not the hem — was sitting almost at the bottom of the shirt
  ctx.font = 'bold 12px sans-serif';
  drawJerseyText(ctx, '1', 0, -bodyH * 0.66, 2, team.shirtText);

  // arms — filled capsules so the dive/leap reach reads clearly
  // post-pixelation. Three distinct poses:
  const shoulderY = -bodyH * 0.56;
  const armLen = 15 * pose.armSpread;
  const glove = (gx: number, gy: number) => {
    ctx.fillStyle = '#4fd68a';
    ctx.beginPath();
    ctx.arc(gx, gy, 4.5, 0, Math.PI * 2);
    ctx.fill();
  };

  if (pose.leap) {
    // Top-corner leap — both arms reach straight up together, not to the
    // sides, so it reads as "tipping it over the bar" rather than a
    // sideways dive.
    const reach = 14 * pose.armSpread;
    const lx = -8 + pose.dir * 3;
    const rx = 8 + pose.dir * 3;
    drawLimb(ctx, lx, shoulderY, lx - 2, shoulderY - reach, 6.5, team.shirtDark);
    drawLimb(ctx, rx, shoulderY, rx + 2, shoulderY - reach, 6.5, team.shirtDark);
    glove(lx - 2, shoulderY - reach);
    glove(rx + 2, shoulderY - reach);
  } else if (Math.abs(pose.rot) > 20 && pose.dir !== 0) {
    // Sideways dive — rotating a *mirrored* pair of arms through a large
    // angle doesn't keep them mirrored in world space, so only the leading
    // arm (the side he's diving toward) reaches out; the trailing arm
    // tucks in close to the torso instead of trying to mirror the reach.
    // Tucked across the chest, close to shoulder height — pulling it down
    // toward the hip instead lands the glove right on top of the boot
    // once the body is rotated ~80°+, which reads as a hand fused to the
    // leg (the "weird arm" bug).
    drawLimb(ctx, pose.dir * 10, shoulderY, pose.dir * (10 + armLen), shoulderY - armLen * 0.55, 6.5, team.shirtDark);
    glove(pose.dir * (10 + armLen), shoulderY - armLen * 0.55);

    const tuckX = -pose.dir * 4;
    const tuckY = shoulderY * 0.7;
    drawLimb(ctx, -pose.dir * 9, shoulderY, tuckX, tuckY, 6, team.shirtDark);
    glove(tuckX, tuckY);
  } else {
    drawLimb(ctx, -10, shoulderY, -10 - armLen, shoulderY - armLen * 0.55, 6.5, team.shirtDark);
    drawLimb(ctx, 10, shoulderY, 10 + armLen, shoulderY - armLen * 0.55, 6.5, team.shirtDark);
    glove(-10 - armLen, shoulderY - armLen * 0.55);
    glove(10 + armLen, shoulderY - armLen * 0.55);
  }

  // neck + head
  ctx.fillStyle = '#a8763f';
  ctx.fillRect(-3, -bodyH - 3, 6, 4);
  ctx.fillStyle = '#3a2718';
  ctx.beginPath();
  ctx.arc(0, -bodyH - 9, 8.5, 0, Math.PI * 2);
  ctx.fill();
  // face (front-facing wedge, browner than the hair-shadowed rim)
  ctx.fillStyle = '#8a5a34';
  ctx.beginPath();
  ctx.arc(0, -bodyH - 8, 7, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.fill();

  ctx.restore();
}

// Drawn from behind — the camera sits behind the kicker looking at the
// goal (the standard broadcast penalty angle), so what we actually see of
// him is his back. That's also where a jersey has real room for a number:
// the front only has a badge, the back is a name + a number that spans
// most of the shirt.
function drawRunner(
  ctx: CanvasRenderingContext2D,
  t: number,
  strikeT: number | null,
  number: number,
  name: string,
  team: Team
) {
  const runT = clamp(t, 0, 1);
  const scale = lerp(0.42, RUNNER_SCALE, easeOutCubic(runT));
  const x = lerp(BALL_START.x - 6, BALL_START.x - 15, runT);
  const y = lerp(H - 4, BALL_START.y + 20, runT);
  const legPhase = runT < 1 ? Math.sin(runT * 26) : 0;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 4, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const bodyH = 48;
  const kickSwing = strikeT !== null ? Math.sin(clamp(strikeT, 0, 1) * Math.PI) : 0;
  const legTop = -bodyH * 0.42;

  // legs (walk cycle, or a kick swing near contact) with sock + boot detail
  const drawLeg = (dir: 1 | -1, swing: number) => {
    ctx.save();
    ctx.translate(dir * 5, legTop);
    ctx.rotate(swing);
    ctx.fillStyle = '#f2f0ec';
    ctx.fillRect(-3, 0, 6, bodyH * 0.42 - 5);
    ctx.fillStyle = '#141418';
    ctx.beginPath();
    ctx.roundRect(-3.5, bodyH * 0.42 - 6, 7, 6, 2);
    ctx.fill();
    ctx.restore();
  };
  drawLeg(-1, strikeT !== null ? -kickSwing * 0.9 : legPhase * 0.35);
  drawLeg(1, strikeT !== null ? kickSwing * 1.1 : -legPhase * 0.35);

  // shorts
  ctx.fillStyle = '#f2f0ec';
  ctx.beginPath();
  ctx.roundRect(-10, legTop - 6, 20, 7, 2);
  ctx.fill();

  // shirt back — wider than the old front panel to give the number (and
  // long surnames like SZOBOSZLAI) real room to breathe
  const shirtW = 17;
  const shirt = ctx.createLinearGradient(-shirtW, -bodyH, shirtW, 0);
  shirt.addColorStop(0, team.shirtLight);
  shirt.addColorStop(1, team.shirtDark);
  ctx.fillStyle = shirt;
  ctx.beginPath();
  ctx.roundRect(-shirtW, -bodyH, shirtW * 2, bodyH * 0.62, 4);
  ctx.fill();

  // collar
  ctx.strokeStyle = 'rgba(0,0,0,0.28)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -bodyH, 6, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  drawJerseyName(ctx, name, 0, -bodyH * 0.8, shirtW * 2 - 4, 12, team.shirtText);
  ctx.font = 'bold 18px sans-serif';
  drawJerseyText(ctx, String(number), 0, -bodyH * 0.45, 2.4, team.shirtText);

  // arms (balance swing) — filled capsules, same reasoning as the keeper
  const armSwing = legPhase * 6;
  drawLimb(ctx, -12, -bodyH * 0.55, -12 - armSwing, -bodyH * 0.3, 5.5, team.shirtDark);
  drawLimb(ctx, 12, -bodyH * 0.55, 12 + armSwing, -bodyH * 0.3, 5.5, team.shirtDark);

  // neck + back of head — dark brown skin tone, hair covers the rest
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(-3, -bodyH - 3, 6, 4);
  ctx.fillStyle = '#1b1b20';
  ctx.beginPath();
  ctx.arc(0, -bodyH - 9, 8.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Everything here is fixed for the life of the page — baked once into an
// offscreen canvas and reused every frame instead of being redrawn (and
// re-gradiented) 60 times a second.
function drawStaticBackground(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, W, H);

  // Night sky
  const sky = ctx.createLinearGradient(0, 0, 0, GOAL_TOP);
  sky.addColorStop(0, '#0a0f1c');
  sky.addColorStop(1, '#182238');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GOAL_TOP);

  // floodlight glow
  const glow1 = ctx.createRadialGradient(60, 10, 4, 60, 10, 130);
  glow1.addColorStop(0, 'rgba(255,255,240,0.28)');
  glow1.addColorStop(1, 'rgba(255,255,240,0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, 200, GOAL_TOP);
  const glow2 = ctx.createRadialGradient(W - 60, 10, 4, W - 60, 10, 130);
  glow2.addColorStop(0, 'rgba(255,255,240,0.28)');
  glow2.addColorStop(1, 'rgba(255,255,240,0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(W - 200, 0, 200, GOAL_TOP);

  // crowd
  const crowdColors = ['#2a3350', '#323c5c', '#3a4468', '#242c48', '#425080'];
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i < 54; i++) {
      const cx = (i * 12 + (row % 2) * 6) % W;
      const cy = 8 + row * 12;
      ctx.fillStyle = crowdColors[(i * 7 + row * 3) % crowdColors.length];
      ctx.beginPath();
      ctx.roundRect(cx, cy, 8, 8, 2);
      ctx.fill();
    }
  }

  // pitch
  const pitch = ctx.createLinearGradient(0, GOAL_LINE, 0, H);
  pitch.addColorStop(0, '#1f6e3f');
  pitch.addColorStop(1, '#2f9455');
  ctx.fillStyle = pitch;
  ctx.fillRect(0, GOAL_LINE, W, H - GOAL_LINE);

  ctx.fillStyle = 'rgba(255,255,255,0.055)';
  const vanishX = W / 2;
  for (let i = -5; i <= 5; i += 2) {
    const topX = vanishX + i * 13;
    const botX = vanishX + i * 62;
    ctx.beginPath();
    ctx.moveTo(topX, GOAL_LINE);
    ctx.lineTo(topX + 8, GOAL_LINE);
    ctx.lineTo(botX + 26, H);
    ctx.lineTo(botX - 26, H);
    ctx.closePath();
    ctx.fill();
  }

  // penalty box + arc
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, GOAL_LINE);
  ctx.lineTo(W - 20, GOAL_LINE);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(BALL_START.x, BALL_START.y - 6, 46, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();

  ctx.fillStyle = '#f2f0ec';
  ctx.beginPath();
  ctx.arc(BALL_START.x, BALL_START.y + 8, 2.4, 0, Math.PI * 2);
  ctx.fill();

  // net
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  const netDepthTop = GOAL_TOP - 18;
  for (let x = GOAL_LEFT; x <= GOAL_RIGHT; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, netDepthTop);
    ctx.lineTo(x, GOAL_LINE);
    ctx.stroke();
  }
  for (let y = netDepthTop; y <= GOAL_LINE; y += 15) {
    ctx.beginPath();
    ctx.moveTo(GOAL_LEFT, y);
    ctx.lineTo(GOAL_RIGHT, y);
    ctx.stroke();
  }

  // posts + crossbar (cylindrical shading)
  const postGrad = ctx.createLinearGradient(GOAL_LEFT - 8, 0, GOAL_LEFT + 2, 0);
  postGrad.addColorStop(0, '#c9c6c0');
  postGrad.addColorStop(0.5, '#ffffff');
  postGrad.addColorStop(1, '#c9c6c0');
  ctx.fillStyle = postGrad;
  ctx.fillRect(GOAL_LEFT - 8, GOAL_TOP, 8, GOAL_LINE - GOAL_TOP);
  ctx.fillRect(GOAL_RIGHT, GOAL_TOP, 8, GOAL_LINE - GOAL_TOP);
  const barGrad = ctx.createLinearGradient(0, GOAL_TOP - 8, 0, GOAL_TOP);
  barGrad.addColorStop(0, '#c9c6c0');
  barGrad.addColorStop(0.5, '#ffffff');
  barGrad.addColorStop(1, '#c9c6c0');
  ctx.fillStyle = barGrad;
  ctx.fillRect(GOAL_LEFT - 8, GOAL_TOP - 8, GOAL_RIGHT - GOAL_LEFT + 16, 8);
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  ball: { x: number; y: number; scale: number; visible: boolean; spin: number },
  keeperPose: KeeperPose,
  reticle: { x: number; y: number; visible: boolean; difficulty: number } | null,
  runner: { t: number; visible: boolean; strikeT: number | null },
  staticBg: HTMLCanvasElement,
  ballGradient: CanvasGradient,
  takerNumber: number,
  takerName: string,
  attackerTeam: Team,
  defenderTeam: Team
) {
  // Everything static (sky, floodlights, crowd, pitch, goal frame, net) is
  // pre-baked once into staticBg — a single drawImage instead of ~250
  // shape fills and 5 gradient allocations per frame is what keeps this
  // smooth at 60fps. The clear is still required: staticBg has translucent
  // and fully transparent pixels (net lines, the goal-mouth gap), and
  // without clearing first those would keep compositing over whatever this
  // same persistent canvas drew last frame — the source of the ghosting/
  // over-bright net seen before this fix.
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(staticBg, 0, 0);

  const drawBall = () => {
    if (!ball.visible) return;
    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.scale(ball.scale, ball.scale);
    ctx.rotate(ball.spin);
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fillStyle = ballGradient;
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-2.4, -2.4);
    ctx.lineTo(2.4, -2.4);
    ctx.lineTo(0, 2.8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const ballBehind = ball.y < keeperPose.y - 4;
  if (ballBehind) drawBall();

  drawKeeper(ctx, keeperPose, defenderTeam);

  if (!ballBehind) drawBall();

  if (runner.visible) {
    drawRunner(ctx, runner.t, runner.strikeT, takerNumber, takerName, attackerTeam);
  }

  if (reticle && reticle.visible) {
    const color = reticle.difficulty < 0.14 ? '#4fd68a' : reticle.difficulty < 0.28 ? '#f4c752' : '#ff4d5e';
    ctx.save();
    ctx.translate(reticle.x, reticle.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-19, 0);
    ctx.lineTo(-8, 0);
    ctx.moveTo(19, 0);
    ctx.lineTo(8, 0);
    ctx.moveTo(0, -19);
    ctx.lineTo(0, -8);
    ctx.moveTo(0, 19);
    ctx.lineTo(0, 8);
    ctx.stroke();
    ctx.restore();
  }
}

// ─── Team crest + star rating (team-select screen) ────────────────────────
// Real club crests (public/crests/<id>.png), downsampled to a tiny native
// canvas resolution and displayed with CSS `image-rendering: pixelated` —
// the browser's nearest-neighbor upscale of a heavily downsampled image is
// what actually produces the chunky retro look, not hand-placed pixels.
// Detailed crests (Liverpool's shield has small banner text, torches, a
// bird) lose too much at a true 8-bit resolution to stay recognizable —
// this is closer to a 16-bit sprite: still visibly stylized, but the shield
// shape, banner, and bird silhouette all survive.
const CREST_PX = 78;
const crestImageCache = new Map<string, HTMLImageElement>();

function loadCrestImage(id: string): Promise<HTMLImageElement> {
  const cached = crestImageCache.get(id);
  if (cached) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      crestImageCache.set(id, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = `/crests/${id}.png`;
  });
}

function TeamCrest({ team, size }: { team: Team; size: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadCrestImage(team.id)
      .then((img) => {
        if (cancelled) return;
        const ctx = ref.current?.getContext('2d');
        if (!ctx) return;
        ctx.imageSmoothingEnabled = true;
        ctx.clearRect(0, 0, CREST_PX, CREST_PX);
        // contain-fit, centered, with a touch of inset padding
        const scale = Math.min(CREST_PX / img.width, CREST_PX / img.height) * 0.92;
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (CREST_PX - w) / 2, (CREST_PX - h) / 2, w, h);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [team.id]);
  return (
    <canvas
      ref={ref}
      width={CREST_PX}
      height={CREST_PX}
      style={{ width: size, height: size, imageRendering: 'pixelated' }}
      aria-label={`${team.name} crest`}
    />
  );
}

// Two overlapping rows of star glyphs — a muted background row (always all
// 5) and a gold foreground row clipped to (value/5) width — the standard
// CSS trick for a fractional-star rating without needing an icon set.
function StarRow({ value }: { value: number }) {
  const pct = clamp(value / 5, 0, 1) * 100;
  return (
    <div className={styles.starRow} aria-label={`${value} out of 5 stars`}>
      <div className={styles.starRowBg}>★★★★★</div>
      <div className={styles.starRowFg} style={{ width: `${pct}%` }}>
        ★★★★★
      </div>
    </div>
  );
}

// Cycles to the next/previous team in TEAM_LIST, skipping whichever team is
// selected on the other side — the two pickers can never land on the same
// club at once.
function cycleTeam(currentId: string, excludeId: string, dir: 1 | -1): string {
  const ids = TEAM_LIST.map((t) => t.id);
  let idx = ids.indexOf(currentId);
  for (let i = 0; i < ids.length; i++) {
    idx = (idx + dir + ids.length) % ids.length;
    if (ids[idx] !== excludeId) return ids[idx];
  }
  return currentId;
}

// ─── Component ──────────────────────────────────────────────────────────────
export function PenaltySimulator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const menuBgRef = useRef<HTMLCanvasElement | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);
  const mutedRef = useRef(false);

  const [phase, setPhase] = useState<Phase>('start');
  // Left = user's team (whose kit the shooter wears, whose roster you pick
  // the penalty order from). Right = CPU's team (whose kit the keeper
  // wears). Defaulted to two different clubs so "continue" works
  // immediately; either side can still be changed on the team-select screen.
  const [userTeamId, setUserTeamId] = useState('liverpool');
  const [cpuTeamId, setCpuTeamId] = useState('arsenal');
  const userTeam = TEAMS[userTeamId];
  const cpuTeam = TEAMS[cpuTeamId];
  // Whole roster, drag-reorderable — the top ROUNDS rows are who actually
  // takes the penalties, in that order. Starts sorted by penalty rating.
  const [rosterOrder, setRosterOrder] = useState<Player[]>(() =>
    [...TEAMS.liverpool.roster].sort((a, b) => b.rating - a.rating)
  );
  const dragIndexRef = useRef<number | null>(null);
  const [order, setOrder] = useState<Player[]>([]);
  // CPU's penalty order isn't user-configurable — just their top 5 takers
  // by rating, fixed once the matchup is set.
  const cpuOrder = useMemo(() => [...cpuTeam.roster].sort((a, b) => b.rating - a.rating).slice(0, ROUNDS), [cpuTeam]);
  const [round, setRound] = useState(1);
  const [turn, setTurn] = useState<Turn>('user');
  const [goals, setGoals] = useState(0);
  const [history, setHistory] = useState<Outcome[]>([]);
  const [cpuGoals, setCpuGoals] = useState(0);
  const [cpuHistory, setCpuHistory] = useState<Outcome[]>([]);
  const [banner, setBanner] = useState<{ text: string; tone: 'good' | 'bad' | 'warn' } | null>(null);
  const [muted, setMuted] = useState(false);
  const [best, setBest] = useState<number | null>(null);
  const [aimDifficulty, setAimDifficulty] = useState<Difficulty>('EASY');

  const sfx = useSfx(mutedRef);

  const engine = useRef({
    phase: 'start' as Phase,
    turn: 'user' as Turn,
    runupStart: 0,
    powerStart: 0,
    kickStart: 0,
    shot: null as Shot | null,
    reticle: { x: (GOAL_LEFT + GOAL_RIGHT) / 2, y: (GOAL_TOP + GOAL_LINE) / 2 },
    dragging: false,
    ball: { x: BALL_START.x, y: BALL_START.y, scale: 1, visible: false, spin: 0 },
    round: 1,
    taker: null as Player | null,
    userTeam: TEAMS.liverpool as Team,
    cpuTeam: TEAMS.arsenal as Team,
    // 'defend' mini-game: which column the keeper is currently standing in,
    // moved live with A/D while the CPU's shot is in flight. The shot's
    // target is rolled the instant defending starts (so the ball can fly
    // immediately); W/S commits a dive at whatever column the keeper is
    // in *at that moment*, reacting to the ball rather than guessing blind
    // before it's even struck.
    defendCol: 'mid' as Col,
    defendSim: null as { nx: number; ny: number; power: number } | null,
    defendCommittedZone: null as Zone | null,
    defendCommitTime: 0,
    defendResolved: false,
    // Synchronous running tallies for the mathematical-elimination check —
    // React state (goals/history) updates are async, so finishKick can't
    // trust it reflects *this* kick yet within the same call.
    userGoalsCount: 0,
    cpuGoalsCount: 0,
    userKicksTaken: 0,
    cpuKicksTaken: 0,
  }).current;

  // Kept in sync so the rAF render loop (mounted once) always draws the
  // *current* kit colors instead of the ones from first mount.
  useEffect(() => {
    engine.userTeam = userTeam;
    engine.cpuTeam = cpuTeam;
  }, [userTeam, cpuTeam, engine]);

  const resultTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    engine.round = round;
    engine.turn = turn;
    const idx = Math.min(round, ROUNDS) - 1;
    engine.taker = (turn === 'user' ? order[idx] : cpuOrder[idx]) ?? null;
  }, [round, order, turn, cpuOrder, engine]);

  useEffect(() => {
    const stored = window.localStorage.getItem(HIGH_SCORE_KEY);
    if (stored) setBest(Number(stored));
  }, []);

  // Empty-goal backdrop for the start/squad screens (blurred via CSS) —
  // the same static scene the gameplay canvas bakes once, just reused here.
  useEffect(() => {
    if (phase !== 'start' && phase !== 'squad') return;
    const canvas = menuBgRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) drawStaticBackground(ctx);
  }, [phase]);

  useEffect(
    () => () => {
      if (resultTimer.current) clearTimeout(resultTimer.current);
      if (phaseTimer.current) clearTimeout(phaseTimer.current);
    },
    []
  );

  const goPhase = useCallback(
    (p: Phase) => {
      engine.phase = p;
      setPhase(p);
    },
    [engine]
  );

  // finishKickRef keeps the rAF loop (mounted once) calling the *latest*
  // closure instead of the one captured at mount — otherwise `round`
  // inside finishKick would be permanently stale.
  const finishKickRef = useRef<(shot: Shot) => void>(() => {});

  const finishKick = useCallback(
    (shot: Shot) => {
      goPhase('result');
      const scoredBy = engine.turn; // who just took this kick, before we advance the turn below

      // Synchronous tallies for the elimination check below — React state
      // (goals/cpuGoals) won't reflect this kick until after this function
      // returns, so it can't be used for that arithmetic in the same tick.
      if (scoredBy === 'user') {
        engine.userKicksTaken += 1;
        if (shot.outcome === 'goal') engine.userGoalsCount += 1;
      } else {
        engine.cpuKicksTaken += 1;
        if (shot.outcome === 'goal') engine.cpuGoalsCount += 1;
      }

      let text: string;
      let tone: 'good' | 'bad' | 'warn';
      if (shot.outcome === 'goal') {
        text = scoredBy === 'user' ? 'GOAL!!' : 'CPU SCORES';
        tone = scoredBy === 'user' ? 'good' : 'bad';
        sfx.goal();
        if (scoredBy === 'user') setGoals((g) => g + 1);
        else setCpuGoals((g) => g + 1);
      } else if (shot.outcome === 'over') {
        text = 'OVER THE BAR!';
        tone = 'warn';
        sfx.over();
      } else if (shot.outcome === 'saved-weak') {
        text = scoredBy === 'user' ? 'TOO WEAK — SAVED!' : 'YOUR KEEPER SAVES!';
        tone = scoredBy === 'user' ? 'bad' : 'good';
        sfx.saved();
      } else {
        text = scoredBy === 'user' ? 'SAVED!' : 'YOUR KEEPER SAVES!';
        tone = scoredBy === 'user' ? 'bad' : 'good';
        sfx.saved();
      }
      setBanner({ text, tone });
      if (scoredBy === 'user') setHistory((h) => [...h, shot.outcome]);
      else setCpuHistory((h) => [...h, shot.outcome]);

      resultTimer.current = setTimeout(() => {
        setBanner(null);
        engine.ball = { x: BALL_START.x, y: BALL_START.y, scale: 1, visible: false, spin: 0 };
        engine.shot = null;

        // Standard shootout rule: end early the moment either side can't
        // possibly catch up given the kicks they have left, rather than
        // grinding out kicks whose outcome no longer matters.
        const userRemaining = ROUNDS - engine.userKicksTaken;
        const cpuRemaining = ROUNDS - engine.cpuKicksTaken;
        const decided =
          engine.userGoalsCount > engine.cpuGoalsCount + cpuRemaining ||
          engine.cpuGoalsCount > engine.userGoalsCount + userRemaining;
        const bothDone = engine.userKicksTaken >= ROUNDS && engine.cpuKicksTaken >= ROUNDS;

        if (decided || bothDone) {
          setBest((prevBest) => {
            const nextBest = prevBest === null ? engine.userGoalsCount : Math.max(prevBest, engine.userGoalsCount);
            window.localStorage.setItem(HIGH_SCORE_KEY, String(nextBest));
            return nextBest;
          });
          goPhase('gameover');
        } else if (scoredBy === 'user') {
          // Same round, CPU's turn next.
          engine.turn = 'cpu';
          setTurn('cpu');
          goPhase('jersey');
        } else {
          // CPU just went — advance to the next round, back to the user.
          engine.round += 1;
          engine.turn = 'user';
          setRound((r) => r + 1);
          setTurn('user');
          goPhase('jersey'); // quick "up next" card for the next taker, then runup
        }
      }, RESULT_HOLD_MS);
    },
    [engine, sfx, goPhase]
  );

  useEffect(() => {
    finishKickRef.current = finishKick;
  }, [finishKick]);

  // ─── Cinematic intro: jersey -> runup ──────────────────────────────────
  useEffect(() => {
    if (phase !== 'jersey') return;
    phaseTimer.current = setTimeout(() => {
      engine.runupStart = performance.now();
      goPhase('runup');
    }, 1100);
    return () => {
      if (phaseTimer.current) clearTimeout(phaseTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ─── runup -> aim (user's kick) or defend (CPU's kick) ─────────────────
  useEffect(() => {
    if (phase !== 'runup') return;
    const timer = setTimeout(() => goPhase(engine.turn === 'user' ? 'aim' : 'defend'), RUNUP_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ─── Main render/animation loop ───────────────────────────────────────
  // Rendered in two passes: the scene is drawn in full detail into an
  // offscreen canvas, then downsampled (smoothed, quantizing color into
  // blocks) into a low-res buffer, then upscaled with no smoothing onto the
  // visible canvas. That's what turns the shaded vector art into chunky,
  // Retro-Goal-style pixel art instead of a soft flat-vector look.
  useEffect(() => {
    const artCanvas = document.createElement('canvas');
    artCanvas.width = W;
    artCanvas.height = H;
    const pixelCanvas = document.createElement('canvas');
    pixelCanvas.width = PW;
    pixelCanvas.height = PH;
    const artCtx = artCanvas.getContext('2d');
    const pixelCtx = pixelCanvas.getContext('2d');
    if (pixelCtx) pixelCtx.imageSmoothingEnabled = true;

    const staticBg = document.createElement('canvas');
    staticBg.width = W;
    staticBg.height = H;
    const staticCtx = staticBg.getContext('2d');
    if (staticCtx) drawStaticBackground(staticCtx);

    let ballGradient: CanvasGradient | null = null;
    if (artCtx) {
      ballGradient = artCtx.createRadialGradient(-2, -2, 1, 0, 0, 7);
      ballGradient.addColorStop(0, '#ffffff');
      ballGradient.addColorStop(1, '#d8d5cf');
    }

    let raf = 0;
    const loop = () => {
      const now = performance.now();
      const ctx = artCtx;
      let keeperPose: KeeperPose = idleKeeperPose(now);
      let reticleView: { x: number; y: number; visible: boolean; difficulty: number } | null = null;
      let runner = { t: 1, visible: false, strikeT: null as number | null };

      if (engine.phase === 'runup') {
        const t = clamp((now - engine.runupStart) / RUNUP_MS, 0, 1);
        runner = { t, visible: true, strikeT: null };
      }

      if (engine.phase === 'aim' || engine.phase === 'power') {
        runner = { t: 1, visible: true, strikeT: null };
      }

      if (engine.phase === 'defend' && engine.defendSim) {
        const sim = engine.defendSim;
        const t = clamp((now - engine.kickStart) / KICK_DURATION_MS, 0, 1);
        const te = easeOutCubic(t);
        const targetX = GOAL_LEFT + sim.nx * (GOAL_RIGHT - GOAL_LEFT);
        const targetY = sim.power > OVER_MIN ? GOAL_TOP - 70 : GOAL_TOP + sim.ny * (GOAL_LINE - GOAL_TOP);
        engine.ball.x = lerp(BALL_START.x, targetX, te);
        engine.ball.y = lerp(BALL_START.y, targetY, te);
        engine.ball.scale = lerp(1, 0.5, te);
        engine.ball.visible = t > 0.12;
        engine.ball.spin = t * 18;
        runner = { t: 1, visible: true, strikeT: clamp(t / 0.3, 0, 1) };

        if (engine.defendCommittedZone) {
          const diveT = clamp((now - engine.defendCommitTime) / DEFEND_DIVE_MS, 0, 1);
          const shot = resolveShot(sim.nx, sim.ny, sim.power, engine.defendCommittedZone);
          keeperPose = computeKeeperPose(shot, diveT);
          if (!engine.defendResolved && t >= 1 && diveT >= 1) {
            engine.defendResolved = true;
            engine.shot = shot;
            finishKickRef.current(shot);
          }
        } else {
          keeperPose = standingKeeperPose(engine.defendCol);
          if (!engine.defendResolved && t >= 1) {
            engine.defendResolved = true;
            const shot = resolveShot(sim.nx, sim.ny, sim.power, `stand-${engine.defendCol}`);
            engine.shot = shot;
            finishKickRef.current(shot);
          }
        }
      }

      if (engine.phase === 'aim' || engine.phase === 'power') {
        const d = difficultyOf(
          (engine.reticle.x - GOAL_LEFT) / (GOAL_RIGHT - GOAL_LEFT),
          (engine.reticle.y - GOAL_TOP) / (GOAL_LINE - GOAL_TOP)
        );
        reticleView = { x: engine.reticle.x, y: engine.reticle.y, visible: true, difficulty: d };
      }

      if (engine.phase === 'power') {
        const nx = (engine.reticle.x - GOAL_LEFT) / (GOAL_RIGHT - GOAL_LEFT);
        const ny = (engine.reticle.y - GOAL_TOP) / (GOAL_LINE - GOAL_TOP);
        const period = meterPeriodMs(difficultyOf(nx, ny), engine.taker?.rating ?? 50);
        const pct = triangleWave((now - engine.powerStart) / period);
        if (fillRef.current) fillRef.current.style.height = `${pct * 100}%`;
      }

      if (engine.phase === 'kick' && engine.shot) {
        const t = clamp((now - engine.kickStart) / KICK_DURATION_MS, 0, 1);
        const te = easeOutCubic(t);
        const shot = engine.shot;
        const targetX = GOAL_LEFT + shot.nx * (GOAL_RIGHT - GOAL_LEFT);
        let targetY: number;
        if (shot.outcome === 'over') {
          targetY = GOAL_TOP - 70;
        } else {
          targetY = GOAL_TOP + shot.ny * (GOAL_LINE - GOAL_TOP);
        }
        engine.ball.x = lerp(BALL_START.x, targetX, te);
        engine.ball.y = lerp(BALL_START.y, targetY, te);
        engine.ball.scale = lerp(1, 0.5, te);
        engine.ball.visible = t > 0.12;
        engine.ball.spin = t * 18;

        runner = { t: 1, visible: true, strikeT: clamp(t / 0.3, 0, 1) };
        keeperPose = computeKeeperPose(shot, t);

        if (t >= 1) {
          finishKickRef.current(shot);
        }
      } else if (engine.phase === 'result' || engine.phase === 'gameover') {
        runner = { t: 1, visible: true, strikeT: null };
        if (engine.shot) keeperPose = computeKeeperPose(engine.shot, 1);
      }

      const outCtx = canvasRef.current?.getContext('2d');
      if (ctx && pixelCtx && outCtx && ballGradient) {
        const taker = engine.taker;
        // Roles swap by turn: on the user's kicks they're the attacker and
        // the CPU defends; on the CPU's kicks it's the reverse (and the
        // user is the one picking the keeper's dive, in the 'defend' phase).
        const attackerTeam = engine.turn === 'user' ? engine.userTeam : engine.cpuTeam;
        const defenderTeam = engine.turn === 'user' ? engine.cpuTeam : engine.userTeam;
        drawScene(
          ctx,
          engine.ball,
          keeperPose,
          reticleView,
          runner,
          staticBg,
          ballGradient,
          taker?.number ?? 0,
          taker ? surname(taker.name) : '',
          attackerTeam,
          defenderTeam
        );
        pixelCtx.clearRect(0, 0, PW, PH);
        pixelCtx.drawImage(artCanvas, 0, 0, W, H, 0, 0, PW, PH);
        outCtx.imageSmoothingEnabled = false;
        outCtx.clearRect(0, 0, W, H);
        outCtx.drawImage(pixelCanvas, 0, 0, PW, PH, 0, 0, W, H);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Aim: drag the reticle ─────────────────────────────────────────────
  const pointToReticle = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const x = clamp((clientX - rect.left) * scaleX, RETICLE_BOUNDS.minX, RETICLE_BOUNDS.maxX);
    const y = clamp((clientY - rect.top) * scaleY, RETICLE_BOUNDS.minY, RETICLE_BOUNDS.maxY);
    engine.reticle = { x, y };
    const d = difficultyOf((x - GOAL_LEFT) / (GOAL_RIGHT - GOAL_LEFT), (y - GOAL_TOP) / (GOAL_LINE - GOAL_TOP));
    setAimDifficulty(difficultyLabel(d));
  }, [engine]);

  const onAimDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (engine.phase !== 'aim') return;
      sfx.prime();
      engine.dragging = true;
      pointToReticle(e.clientX, e.clientY);
    },
    [engine, pointToReticle, sfx]
  );

  const onAimMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!engine.dragging || engine.phase !== 'aim') return;
      pointToReticle(e.clientX, e.clientY);
    },
    [engine, pointToReticle]
  );

  const lockAim = useCallback(() => {
    if (engine.phase !== 'aim' || !engine.dragging) return;
    engine.dragging = false;
    sfx.lock();
    engine.powerStart = performance.now();
    goPhase('power');
  }, [engine, sfx, goPhase]);

  useEffect(() => {
    if (phase !== 'aim') return;
    window.addEventListener('pointerup', lockAim);
    return () => window.removeEventListener('pointerup', lockAim);
  }, [phase, lockAim]);

  // ─── Power: stop the oscillating meter ─────────────────────────────────
  const stopMeter = useCallback(() => {
    if (engine.phase !== 'power') return;
    const nx = (engine.reticle.x - GOAL_LEFT) / (GOAL_RIGHT - GOAL_LEFT);
    const ny = (engine.reticle.y - GOAL_TOP) / (GOAL_LINE - GOAL_TOP);
    const period = meterPeriodMs(difficultyOf(nx, ny), engine.taker?.rating ?? 50);
    const power = triangleWave((performance.now() - engine.powerStart) / period);
    const shot = resolveShot(nx, ny, power);
    engine.shot = shot;
    engine.kickStart = performance.now();
    sfx.kick();
    goPhase('kick');
  }, [engine, sfx, goPhase]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.code !== 'Enter') return;
      e.preventDefault();
      if (e.type !== 'keydown' || e.repeat) return;
      if (engine.phase === 'power') stopMeter();
    };
    window.addEventListener('keydown', key);
    window.addEventListener('keyup', key);
    return () => {
      window.removeEventListener('keydown', key);
      window.removeEventListener('keyup', key);
    };
  }, [stopMeter, engine]);

  // ─── Defend: the CPU's shot is rolled and starts flying the instant
  // defending begins — A/D keeps repositioning the keeper live and W/S
  // commits a dive at whatever column he's currently in, reacting to the
  // ball as it comes in rather than guessing blind before it's struck.
  // The render loop resolves the save once the ball arrives (or shortly
  // after a late commit, so the dive still gets to play out).
  const moveDefend = useCallback(
    (dir: -1 | 1) => {
      if (engine.phase !== 'defend' || engine.defendCommittedZone) return;
      const idx = COLS.indexOf(engine.defendCol);
      engine.defendCol = COLS[clamp(idx + dir, 0, COLS.length - 1)];
    },
    [engine]
  );

  const diveDefend = useCallback(
    (row: Row) => {
      if (engine.phase !== 'defend' || engine.defendCommittedZone) return;
      engine.defendCommittedZone = `${row}-${engine.defendCol}`;
      engine.defendCommitTime = performance.now();
    },
    [engine]
  );

  // Entering 'defend': roll the CPU's shot target and kick the ball off
  // right away.
  useEffect(() => {
    if (phase !== 'defend') return;
    engine.defendCol = 'mid';
    engine.defendSim = simulateCpuShot(engine.taker?.rating ?? 50);
    engine.defendCommittedZone = null;
    engine.defendCommitTime = 0;
    engine.defendResolved = false;
    engine.kickStart = performance.now();
    sfx.kick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (engine.phase !== 'defend') return;
      if (e.type !== 'keydown' || e.repeat) return;
      if (e.code === 'KeyA') {
        e.preventDefault();
        moveDefend(-1);
      } else if (e.code === 'KeyD') {
        e.preventDefault();
        moveDefend(1);
      } else if (e.code === 'KeyW') {
        e.preventDefault();
        diveDefend('top');
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        diveDefend('bottom');
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [engine, moveDefend, diveDefend]);

  const restart = () => {
    setRound(1);
    setTurn('user');
    setGoals(0);
    setHistory([]);
    setCpuGoals(0);
    setCpuHistory([]);
    setBanner(null);
    setOrder([]);
    engine.ball = { x: BALL_START.x, y: BALL_START.y, scale: 1, visible: false, spin: 0 };
    engine.shot = null;
    engine.round = 1;
    engine.turn = 'user';
    engine.userGoalsCount = 0;
    engine.cpuGoalsCount = 0;
    engine.userKicksTaken = 0;
    engine.cpuKicksTaken = 0;
    goPhase('teamSelect');
  };

  // ─── Squad screen: drag to reorder — top ROUNDS rows take the kicks ────
  // FLIP animation: rows would otherwise just snap into their new slot on
  // every reorder tick, which is what read as "choppy". Capture each row's
  // position before the state update, then after React re-renders in the
  // new order, offset each row back to where it *was* and transition it to
  // zero — the row visually slides into place instead of teleporting.
  const rowElsRef = useRef(new Map<number, HTMLDivElement>());
  const prevRectsRef = useRef(new Map<number, DOMRect>());

  const captureRowRects = () => {
    const map = new Map<number, DOMRect>();
    rowElsRef.current.forEach((el, num) => map.set(num, el.getBoundingClientRect()));
    prevRectsRef.current = map;
  };

  useLayoutEffect(() => {
    rowElsRef.current.forEach((el, num) => {
      const prev = prevRectsRef.current.get(num);
      if (!prev) return;
      const next = el.getBoundingClientRect();
      const dy = prev.top - next.top;
      if (!dy) return;
      el.style.transition = 'none';
      el.style.transform = `translateY(${dy}px)`;
      requestAnimationFrame(() => {
        el.style.transition = 'transform 240ms cubic-bezier(0.2, 0, 0, 1)';
        el.style.transform = '';
      });
    });
  }, [rosterOrder]);

  const resetOrder = () => {
    captureRowRects();
    setRosterOrder([...userTeam.roster].sort((a, b) => b.rating - a.rating));
  };

  // ─── Team-select screen: pick your club and the CPU's ──────────────────
  const confirmTeams = () => {
    if (userTeamId === cpuTeamId) return;
    setRosterOrder([...TEAMS[userTeamId].roster].sort((a, b) => b.rating - a.rating));
    goPhase('squad');
  };

  const reorderRoster = (from: number, to: number) => {
    if (from === to) return;
    captureRowRects();
    setRosterOrder((cur) => {
      const next = [...cur];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const confirmSquad = () => {
    setOrder(rosterOrder.slice(0, ROUNDS));
    engine.round = 1;
    engine.turn = 'user';
    engine.taker = rosterOrder[0];
    goPhase('jersey');
  };

  if (phase === 'start') {
    return (
      <div className={styles.game}>
        <div className={`${styles.startScreen} ${styles.screenFrame}`}>
          <canvas ref={menuBgRef} width={W} height={H} className={styles.menuBg} aria-hidden="true" />
          <div className={styles.menuScrim} />
          <div className={`${styles.menuContent} ${styles.startContent}`}>
            <h1 className={styles.startTitle}>
              PENALTY <span>SIMULATOR</span>
            </h1>
            <p className={styles.startSubtitle}>
              Pick your club, set your penalty order from the active roster, then step up and bury five.
            </p>
            <button type="button" className={styles.kickBtn} onClick={() => goPhase('teamSelect')}>
              PLAY
            </button>
            <Link href="/" className={styles.back}>
              ← BACK TO SITE
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'teamSelect') {
    return (
      <div className={styles.game}>
        <div className={`${styles.squadScreen} ${styles.screenFrame}`}>
          <canvas ref={menuBgRef} width={W} height={H} className={styles.menuBg} aria-hidden="true" />
          <div className={styles.menuScrim} />
          <div className={`${styles.menuContent} ${styles.teamSelectContent}`}>
            <h1 className={styles.squadTitle}>CHOOSE YOUR MATCHUP</h1>
            <div className={styles.teamSelectCols}>
              <div className={styles.teamPicker}>
                <div className={styles.teamColLabel}>YOU</div>
                <div className={styles.pickerRow}>
                  <button
                    type="button"
                    className={styles.pickerArrow}
                    aria-label="Previous team"
                    onClick={() => setUserTeamId((id) => cycleTeam(id, cpuTeamId, -1))}
                  >
                    ‹
                  </button>
                  <div className={styles.teamCard}>
                    <TeamCrest team={userTeam} size={112} />
                    <div className={styles.teamCardName}>{userTeam.name}</div>
                    <StarRow value={TEAM_STARS[userTeam.id]} />
                  </div>
                  <button
                    type="button"
                    className={styles.pickerArrow}
                    aria-label="Next team"
                    onClick={() => setUserTeamId((id) => cycleTeam(id, cpuTeamId, 1))}
                  >
                    ›
                  </button>
                </div>
              </div>
              <div className={styles.teamColDivider}>VS</div>
              <div className={styles.teamPicker}>
                <div className={styles.teamColLabel}>CPU</div>
                <div className={styles.pickerRow}>
                  <button
                    type="button"
                    className={styles.pickerArrow}
                    aria-label="Previous team"
                    onClick={() => setCpuTeamId((id) => cycleTeam(id, userTeamId, -1))}
                  >
                    ‹
                  </button>
                  <div className={styles.teamCard}>
                    <TeamCrest team={cpuTeam} size={112} />
                    <div className={styles.teamCardName}>{cpuTeam.name}</div>
                    <StarRow value={TEAM_STARS[cpuTeam.id]} />
                  </div>
                  <button
                    type="button"
                    className={styles.pickerArrow}
                    aria-label="Next team"
                    onClick={() => setCpuTeamId((id) => cycleTeam(id, userTeamId, 1))}
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.squadActions}>
              <button type="button" className={styles.kickBtn} onClick={confirmTeams}>
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'squad') {
    return (
      <div className={styles.game}>
        <div className={`${styles.squadScreen} ${styles.screenFrame}`}>
          <canvas ref={menuBgRef} width={W} height={H} className={styles.menuBg} aria-hidden="true" />
          <div className={styles.menuScrim} />
          <div className={`${styles.menuContent} ${styles.squadContent}`}>
            <h1 className={styles.squadTitle}>SET YOUR PENALTY ORDER — {userTeam.name.toUpperCase()}</h1>
            <div className={styles.squadCount}>DRAG TO REORDER — TOP {ROUNDS} TAKE THE KICKS</div>
            <div className={styles.squadListWrap}>
              <div className={styles.squadHeaderRow}>
                <span>NAME</span>
                <span>#</span>
                <span>POS</span>
                <span>PEN RTG</span>
              </div>
              <div className={styles.squadList} data-lenis-prevent>
                {rosterOrder.map((p, i) => (
                  <div key={p.number}>
                    {i === ROUNDS && <div className={styles.squadDivider}>BENCH</div>}
                    <div
                      ref={(el) => {
                        if (el) rowElsRef.current.set(p.number, el);
                        else rowElsRef.current.delete(p.number);
                      }}
                      draggable
                      onDragStart={() => {
                        dragIndexRef.current = i;
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        const from = dragIndexRef.current;
                        if (from === null || from === i) return;
                        // Only swap once the pointer has actually passed this
                        // row's midpoint in the direction it's moving — not
                        // just "entered this element". Reordering shifts a
                        // different row under a cursor that hasn't moved, and
                        // reacting to that immediately is what caused the
                        // rapid back-and-forth thrashing.
                        const rect = e.currentTarget.getBoundingClientRect();
                        const midpoint = rect.top + rect.height / 2;
                        const movingDown = from < i;
                        const passedMidpoint = movingDown ? e.clientY > midpoint : e.clientY < midpoint;
                        if (!passedMidpoint) return;
                        reorderRoster(from, i);
                        dragIndexRef.current = i;
                      }}
                      onDragEnd={() => {
                        dragIndexRef.current = null;
                      }}
                      className={`${styles.squadRow} ${i < ROUNDS ? styles.squadRowActive : styles.squadRowBench}`}
                    >
                      <span className={styles.squadName}>{p.name}</span>
                      <span className={styles.squadNum}>{p.number}</span>
                      <span className={styles.squadPos}>{p.position}</span>
                      <span className={styles.squadRating}>
                        {p.rating}
                        {p.estimated && <span className={styles.squadEstMark}>*</span>}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.squadActions}>
              <button type="button" className={styles.muteBtn} onClick={resetOrder}>
                RESET ORDER
              </button>
              <button type="button" className={styles.kickBtn} onClick={confirmSquad}>
                START SHOOTOUT
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const introPlayer = turn === 'user' ? order[Math.min(round, ROUNDS) - 1] : cpuOrder[Math.min(round, ROUNDS) - 1];
  const introTeam = turn === 'user' ? userTeam : cpuTeam;
  const finalTone = goals > cpuGoals ? 'good' : goals < cpuGoals ? 'bad' : 'warn';
  const finalWord = goals > cpuGoals ? 'YOU WIN' : goals < cpuGoals ? 'CPU WINS' : 'DRAW';

  return (
    <div className={styles.game}>
      <div className={styles.hud}>
        <Link href="/" className={styles.back}>
          ← SITE
        </Link>
        <h1 className={styles.title}>
          PENALTY <span>SIMULATOR</span>
        </h1>
        <button
          type="button"
          className={styles.muteBtn}
          onClick={() => setMuted((m) => !m)}
          aria-pressed={muted}
          aria-label={muted ? 'Unmute sound' : 'Mute sound'}
        >
          {muted ? 'SFX OFF' : 'SFX ON'}
        </button>
      </div>

      <div className={styles.scoreRow}>
        <div className={styles.roundLabel}>
          ROUND {Math.min(round, ROUNDS)}/{ROUNDS}
          {introPlayer && (
            <span className={styles.takerLabel}>
              {' '}
              — {turn === 'user' ? 'YOU' : 'CPU'}: {surname(introPlayer.name)} #{introPlayer.number}
            </span>
          )}
        </div>
        <div className={styles.scoreCenter}>
          <span className={styles.scoreSideLabel}>{userTeam.shortName}</span>
          <div className={styles.pips}>
            {Array.from({ length: ROUNDS }).map((_, i) => {
              const outcome = history[i];
              const cls = outcome === 'goal' ? styles.pipGoal : outcome ? styles.pipMiss : styles.pipEmpty;
              return <span key={i} className={`${styles.pip} ${cls}`} />;
            })}
          </div>
          <span className={styles.scoreTally}>
            {goals} – {cpuGoals}
          </span>
          <div className={styles.pips}>
            {Array.from({ length: ROUNDS }).map((_, i) => {
              const outcome = cpuHistory[i];
              const cls = outcome === 'goal' ? styles.pipGoal : outcome ? styles.pipMiss : styles.pipEmpty;
              return <span key={i} className={`${styles.pip} ${cls}`} />;
            })}
          </div>
          <span className={styles.scoreSideLabel}>{cpuTeam.shortName}</span>
        </div>
        <div className={styles.bestLabel}>{best !== null ? `BEST ${best}/${ROUNDS}` : ''}</div>
      </div>

      <div className={styles.stageRow}>
        <div className={`${styles.stage} ${styles.screenFrame}`}>
          {phase === 'jersey' && introPlayer && (
            <div className={styles.cinematic}>
              <div
                className={styles.jerseyCard}
                style={{ background: `linear-gradient(160deg, ${introTeam.shirtLight}, ${introTeam.shirtDark})` }}
              >
                <div className={styles.jerseyTeamLabel} style={{ color: introTeam.shirtText }}>
                  {turn === 'user' ? 'YOUR KICK' : "CPU'S KICK"}
                </div>
                <div className={styles.jerseyNum} style={{ color: introTeam.shirtText }}>
                  {introPlayer.number}
                </div>
                <div className={styles.jerseyName} style={{ color: introTeam.shirtText }}>
                  {surname(introPlayer.name)}
                </div>
              </div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className={styles.canvas}
            style={{ visibility: phase === 'jersey' ? 'hidden' : 'visible' }}
            onPointerDown={onAimDown}
            onPointerMove={onAimMove}
          />

          {banner && (
            <div className={`${styles.banner} ${styles[banner.tone]}`} role="status">
              {banner.text}
            </div>
          )}

          {phase === 'aim' && (
            <div className={`${styles.prompt} ${styles[`diff${aimDifficulty}` as const]}`}>
              DRAG TO AIM — {aimDifficulty}
            </div>
          )}
          {phase === 'power' && <div className={styles.prompt}>TAP TO STRIKE!</div>}
          {phase === 'defend' && (
            <div className={styles.prompt}>A/D MOVE · W DIVE HIGH · S DIVE LOW</div>
          )}

          {phase === 'gameover' && (
            <div className={styles.gameover}>
              <div className={`${styles.gameoverWord} ${styles[finalTone]}`}>{finalWord}</div>
              <div className={styles.gameoverScore}>
                {goals} – {cpuGoals}
              </div>
              <button type="button" className={styles.kickBtn} onClick={restart}>
                PLAY AGAIN
              </button>
            </div>
          )}
        </div>

        <div className={styles.meterWrap}>
          <span className={styles.meterLabelTop}>OVER</span>
          <div className={styles.meterTrack}>
            <div className={styles.meterZoneOver} />
            <div className={styles.meterZoneGood} />
            <div className={styles.meterZoneWeak} />
            <div ref={fillRef} className={styles.meterFill} />
          </div>
          <span className={styles.meterLabelBottom}>WEAK</span>
        </div>
      </div>

      {phase === 'power' && (
        <button type="button" className={styles.kickBtn} onPointerDown={stopMeter}>
          STOP!
        </button>
      )}

      {phase === 'defend' && (
        <div className={styles.defendControls}>
          <div className={styles.defendMoveGroup}>
            <button type="button" className={styles.defendBtn} onPointerDown={() => moveDefend(-1)} aria-label="Move left">
              ◀ A
            </button>
            <button type="button" className={styles.defendBtn} onPointerDown={() => moveDefend(1)} aria-label="Move right">
              D ▶
            </button>
          </div>
          <div className={styles.defendDiveGroup}>
            <button type="button" className={styles.defendBtn} onPointerDown={() => diveDefend('top')} aria-label="Dive up">
              W ▲ DIVE HIGH
            </button>
            <button type="button" className={styles.defendBtn} onPointerDown={() => diveDefend('bottom')} aria-label="Dive down">
              S ▼ DIVE LOW
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
