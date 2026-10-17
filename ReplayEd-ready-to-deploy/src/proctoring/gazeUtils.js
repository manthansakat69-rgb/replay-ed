/**
 * Gaze & Head Pose Estimation Utilities (gazeUtils.js)
 *
 * Pure functions to estimate eye gaze and head orientation
 * from MediaPipe FaceLandmarker landmarks.
 *
 * MediaPipe Landmark Indices:
 * Left Eye: Outer corner 33, Inner corner 133, Iris center 468, Top 159, Bottom 145
 * Right Eye: Outer corner 263, Inner corner 362, Iris center 473, Top 386, Bottom 374
 * Nose tip: 1, Chin: 152, Forehead: 10
 */

/**
 * Calculates gaze direction and iris ratios
 */
export function estimateGaze(landmarks, thresholds = null) {
  if (!landmarks || landmarks.length < 478) {
    return {
      direction: 'center',
      horizontalRatio: 0.5,
      verticalRatio: 0.5,
      isLookingAway: false,
    };
  }

  // Left eye metrics
  const leftOuter = landmarks[33];
  const leftInner = landmarks[133];
  const leftIris = landmarks[468];
  const leftTop = landmarks[159];
  const leftBottom = landmarks[145];

  // Right eye metrics
  const rightOuter = landmarks[263];
  const rightInner = landmarks[362];
  const rightIris = landmarks[473];
  const rightTop = landmarks[386];
  const rightBottom = landmarks[374];

  // Horizontal iris ratio (0 = far left, 1 = far right)
  const leftWidth = Math.abs(leftInner.x - leftOuter.x) || 0.001;
  const rightWidth = Math.abs(rightInner.x - rightOuter.x) || 0.001;

  const leftH = (leftIris.x - Math.min(leftOuter.x, leftInner.x)) / leftWidth;
  const rightH = (rightIris.x - Math.min(rightOuter.x, rightInner.x)) / rightWidth;
  const horizontalRatio = (leftH + rightH) / 2;

  // Vertical iris ratio (0 = top, 1 = bottom)
  const leftHeight = Math.abs(leftBottom.y - leftTop.y) || 0.001;
  const rightHeight = Math.abs(rightBottom.y - rightTop.y) || 0.001;

  const leftV = (leftIris.y - Math.min(leftTop.y, leftBottom.y)) / leftHeight;
  const rightV = (rightIris.y - Math.min(rightTop.y, rightBottom.y)) / rightHeight;
  const verticalRatio = (leftV + rightV) / 2;

  // Standard or calibrated thresholds
  const th = thresholds || {
    minH: 0.35,
    maxH: 0.65,
    minV: 0.30,
    maxV: 0.70,
  };

  let direction = 'center';
  let isLookingAway = false;

  if (horizontalRatio < th.minH) {
    direction = 'left';
    isLookingAway = true;
  } else if (horizontalRatio > th.maxH) {
    direction = 'right';
    isLookingAway = true;
  } else if (verticalRatio < th.minV) {
    direction = 'up';
    isLookingAway = true;
  } else if (verticalRatio > th.maxV) {
    direction = 'down';
    isLookingAway = true;
  }

  return {
    direction,
    horizontalRatio,
    verticalRatio,
    isLookingAway,
  };
}

/**
 * Estimates head pose angles (yaw, pitch, roll) from facial keypoints
 */
export function estimateHeadPose(landmarks) {
  if (!landmarks || landmarks.length < 468) {
    return { yaw: 0, pitch: 0, roll: 0, isTurnedAway: false };
  }

  const nose = landmarks[1];
  const leftEar = landmarks[234];
  const rightEar = landmarks[454];
  const forehead = landmarks[10];
  const chin = landmarks[152];

  // Yaw: horizontal head rotation
  const faceWidth = Math.abs(rightEar.x - leftEar.x) || 0.001;
  const earMidX = (leftEar.x + rightEar.x) / 2;
  const yaw = (nose.x - earMidX) / faceWidth; // ~0 is facing forward

  // Pitch: vertical nod
  const faceHeight = Math.abs(chin.y - forehead.y) || 0.001;
  const earMidY = (leftEar.y + rightEar.y) / 2;
  const pitch = (nose.y - earMidY) / faceHeight;

  // Is turned beyond 25 degrees
  const isTurnedAway = Math.abs(yaw) > 0.22 || Math.abs(pitch) > 0.25;

  return {
    yaw: Number((yaw * 100).toFixed(1)),
    pitch: Number((pitch * 100).toFixed(1)),
    isTurnedAway,
  };
}

/**
 * Calibrates personalized gaze bounding box from 5 focal points
 */
export function calculateCalibrationThresholds(samples) {
  // samples: { center: [...], left: [...], right: [...], top: [...], bottom: [...] }
  if (!samples || !samples.center || samples.center.length === 0) {
    return { minH: 0.35, maxH: 0.65, minV: 0.30, maxV: 0.70 };
  }

  const avgH = (arr) => arr.reduce((s, p) => s + p.horizontalRatio, 0) / arr.length;
  const avgV = (arr) => arr.reduce((s, p) => s + p.verticalRatio, 0) / arr.length;

  const centerH = avgH(samples.center);
  const centerV = avgV(samples.center);

  const leftH = samples.left && samples.left.length ? avgH(samples.left) : centerH - 0.2;
  const rightH = samples.right && samples.right.length ? avgH(samples.right) : centerH + 0.2;
  const topV = samples.top && samples.top.length ? avgV(samples.top) : centerV - 0.2;
  const bottomV = samples.bottom && samples.bottom.length ? avgV(samples.bottom) : centerV + 0.2;

  return {
    minH: Math.max(0.15, Math.min(centerH - 0.1, (centerH + leftH) / 2)),
    maxH: Math.min(0.85, Math.max(centerH + 0.1, (centerH + rightH) / 2)),
    minV: Math.max(0.15, Math.min(centerV - 0.1, (centerV + topV) / 2)),
    maxV: Math.min(0.85, Math.max(centerV + 0.1, (centerV + bottomV) / 2)),
  };
}
