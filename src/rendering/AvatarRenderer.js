import { pt, dist, mid } from '../utils/geometry.js';
import { Smoother } from '../utils/Smoother.js';
import { drawDebugPoint, drawTaperedSegment, drawHand, drawDomeTorso } from './primitives.js';

// Renders one pose-tracking frame: draws the camera feed, composites the cropped face
// texture + illustrated body onto the tracked shoulders/ears, and occludes it behind
// the real person using the segmentation mask.
export class AvatarRenderer {
  constructor(canvas, config, { onStatus } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;
    this.onStatus = onStatus || (() => {});

    this.faceTexture = null;
    this.userName = '';

    this._sized = false;
    this._smoothedAngle = 0;
    this._smoother = new Smoother();

    this._maskCanvas = document.createElement('canvas');
    this._maskCtx = this._maskCanvas.getContext('2d');
  }

  setFaceTexture(texture) {
    this.faceTexture = texture;
  }

  setUserName(name) {
    this.userName = name;
  }

  render(results) {
    const { canvas, ctx, config } = this;

    if (!this._sized && results.image && results.image.width) {
      canvas.width = results.image.width;
      canvas.height = results.image.height;
      this._sized = true;
    }
    const w = canvas.width, h = canvas.height;
    if (!w || !h) return;

    ctx.save();
    ctx.clearRect(0, 0, w, h);
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(results.image, 0, 0, w, h);

    const lm = results.poseLandmarks;
    if (lm) {
      const rawShoulderL = pt(lm, 11, w, h), rawShoulderR = pt(lm, 12, w, h);
      const rawEarL = pt(lm, 7, w, h), rawEarR = pt(lm, 8, w, h);
      const rawNose = pt(lm, 0, w, h);
      const shoulderL = this._smoother.smooth(11, rawShoulderL, 0.28);
      const shoulderR = this._smoother.smooth(12, rawShoulderR, 0.28);
      const earL = this._smoother.smooth(7, rawEarL, 0.28);
      const earR = this._smoother.smooth(8, rawEarR, 0.28);
      const nose = this._smoother.smooth(0, rawNose, 0.28);

      const okShoulders = rawShoulderL.v > 0.35 && rawShoulderR.v > 0.35;
      const okEars = rawEarL.v > 0.3 && rawEarR.v > 0.3;
      const okNose = rawNose.v > 0.3;

      if (config.SHOW_DEBUG) {
        drawDebugPoint(ctx, shoulderL, '#00e5ff');
        drawDebugPoint(ctx, shoulderR, '#00e5ff');
        drawDebugPoint(ctx, earL, '#ff4dff');
        drawDebugPoint(ctx, earR, '#ff4dff');
      }

      if (okShoulders && this.faceTexture && okEars && okNose) {
        this.onStatus('');
        const shoulderDist = dist(shoulderL, shoulderR);
        const shoulderMid = mid(shoulderL, shoulderR);
        const armColor = config.ARM_COLOR;

        const flip = config.FLIP_SIDE;
        const anchorShoulder = flip ? shoulderL : shoulderR;
        const anchorEar = flip ? earL : earR;
        const targetShoulder = flip ? shoulderR : shoulderL;

        const earDist = dist(earL, earR);
        const headW = earDist * 1.35;
        const faceW = headW * 1.2;
        const faceH = faceW * (this.faceTexture.height / this.faceTexture.width);

        const outwardDir = (anchorEar.x - shoulderMid.x) >= 0 ? 1 : -1;
        const faceCx = anchorEar.x + outwardDir * faceW * 0.6;
        const faceCy = nose.y - faceH * 0.28;

        const torsoW = faceW * 1.3;
        const torsoH = faceH * 0.95;
        const torsoTopY = faceH * 0.32;
        const torsoLocalX = outwardDir * torsoW * 0.2;

        const rawAngle = Math.atan2(shoulderR.y - shoulderL.y, shoulderR.x - shoulderL.x);
        this._smoothedAngle += (rawAngle - this._smoothedAngle) * 0.03;
        const clamped = Math.max(-0.2, Math.min(0.2, this._smoothedAngle));
        const baseTilt = flip ? 0.16 : -0.16;
        const angle = baseTilt + clamped * 0.35;

        const useOcclusion = config.USE_OCCLUSION && !!results.segmentationMask;

        const armWidth = config.ARM_WIDTH * (shoulderDist / 220);
        const armShoulder = {
          x: faceCx + torsoLocalX - outwardDir * torsoW * 0.4,
          y: faceCy + torsoTopY + torsoH * 0.35,
        };
        const armHand = {
          x: targetShoulder.x,
          y: targetShoulder.y - shoulderDist * 0.05,
        };
        const armElbow = {
          x: (armShoulder.x + armHand.x) / 2,
          y: Math.min(armShoulder.y, armHand.y) - shoulderDist * 0.28,
        };

        const faceLocalX = outwardDir * faceW * config.FACE_OFFSET;

        ctx.save();
        ctx.translate(faceCx, faceCy);
        ctx.rotate(angle);
        drawDomeTorso(ctx, torsoLocalX, torsoTopY, torsoW, torsoH, armColor);
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 6;
        ctx.drawImage(this.faceTexture, -faceW / 2 + faceLocalX, -faceH / 2, faceW, faceH);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        if (this.userName) {
          const fontSize = Math.round(torsoW * 0.18);
          const lineGap = fontSize * 1.15;
          // centered on the torso itself, sitting below the face, nudged toward the outer edge
          const outwardPadding = torsoW * 0.18; // increase to push the text further outward
          const labelX = torsoLocalX + outwardDir * outwardPadding;
          const labelY = faceH * 0.5 + (torsoTopY + torsoH - faceH * 0.5) * 0.55;
          ctx.save();
          ctx.translate(labelX, labelY);
          ctx.scale(-1, 1); // undo the outer mirror so glyphs read correctly
          ctx.font = `bold ${fontSize}px -apple-system, "Apple SD Gothic Neo", sans-serif`;
          ctx.textBaseline = 'middle';

          // line 1: "I" in white + a red heart, centered together
          const iPart = 'I ';
          const heartPart = '❤';
          const iWidth = ctx.measureText(iPart).width;
          const heartWidth = ctx.measureText(heartPart).width;
          const line1Width = iWidth + heartWidth;
          ctx.textAlign = 'left';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(iPart, -line1Width / 2, -lineGap / 2);
          ctx.fillStyle = '#ff2d2d';
          ctx.fillText(heartPart, -line1Width / 2 + iWidth, -lineGap / 2);

          // line 2: the username, centered
          ctx.textAlign = 'center';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(this.userName, 0, lineGap / 2);
          ctx.restore();
        }

        ctx.restore();

        drawTaperedSegment(ctx, armShoulder, armWidth * 0.5, armElbow, armWidth * 0.4, armColor);
        drawTaperedSegment(ctx, armElbow, armWidth * 0.4, armHand, armWidth * 0.32, armColor);
        drawHand(ctx, armHand, armElbow, armWidth * 0.85, armColor);

        if (useOcclusion) {
          if (this._maskCanvas.width !== w || this._maskCanvas.height !== h) {
            this._maskCanvas.width = w;
            this._maskCanvas.height = h;
          }
          this._maskCtx.clearRect(0, 0, w, h);
          this._maskCtx.drawImage(results.image, 0, 0, w, h);
          this._maskCtx.globalCompositeOperation = 'destination-in';
          this._maskCtx.drawImage(results.segmentationMask, 0, 0, w, h);
          this._maskCtx.globalCompositeOperation = 'source-over';
          ctx.drawImage(this._maskCanvas, 0, 0, w, h);
        }

        const frontConnect = {
          x: targetShoulder.x,
          y: targetShoulder.y - shoulderDist * 0.05,
        };
        const frontHand = {
          x: frontConnect.x + outwardDir * shoulderDist * 0.345,
          y: frontConnect.y + shoulderDist * 0.1725,
        };
        drawTaperedSegment(ctx, frontConnect, armWidth * 0.45, frontHand, armWidth * 0.32, armColor);
        drawHand(ctx, frontHand, frontConnect, armWidth * 0.85, armColor);

        if (config.SHOW_DEBUG) {
          drawDebugPoint(ctx, { x: faceCx, y: faceCy }, '#7bff4d');
          drawDebugPoint(ctx, armShoulder, '#ffe14d');
          drawDebugPoint(ctx, armElbow, '#4dfff2');
          drawDebugPoint(ctx, armHand, '#ffe14d');
        }
      } else if (!okShoulders) {
        this.onStatus('어깨가 잘 보이도록 카메라 정면에 서주세요.');
      } else if (!this.faceTexture) {
        this.onStatus('먼저 이미지를 선택해주세요.');
      } else {
        this.onStatus('귀와 코가 잘 보이도록 카메라 정면에 서주세요.');
      }
    } else {
      this.onStatus('사람이 잘 인식되지 않아요. 조명을 밝게 하거나 카메라 정면에 서주세요.');
    }

    ctx.restore();
  }
}
