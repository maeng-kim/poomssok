import { RENDER_CONFIG } from './config.js';
import { FaceDetectionService } from './services/FaceDetectionService.js';
import { BackgroundRemovalService } from './services/BackgroundRemovalService.js';
import { PoseTrackingService } from './services/PoseTrackingService.js';
import { buildFaceTexture } from './domain/FaceTexture.js';
import { AvatarRenderer } from './rendering/AvatarRenderer.js';
import { UIController } from './ui/UIController.js';

(function () {
  const ui = new UIController();
  const faceDetectionService = new FaceDetectionService();
  const backgroundRemovalService = new BackgroundRemovalService();
  const poseTrackingService = new PoseTrackingService(ui.video);
  const avatarRenderer = new AvatarRenderer(ui.canvas, RENDER_CONFIG, {
    onStatus: (msg) => ui.setStatus(msg),
  });

  ui.onNameChange((name) => avatarRenderer.setUserName(name));
  ui.onFileSelected(handleFileSelected);

  async function handleFileSelected(file) {
    ui.setPickStatus('얼굴을 찾는 중...');

    const img = new Image();
    img.src = URL.createObjectURL(file);
    try {
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
    } catch (err) {
      ui.setPickStatus('이미지를 불러오지 못했어요. 다른 파일을 선택해주세요.');
      return;
    }

    let box = null;
    try {
      box = await faceDetectionService.detectFaceBox(img);
    } catch (err) {
      console.error(err);
    }

    let cx, cy, rx, ry;
    if (box) {
      const bw = box.width * img.naturalWidth, bh = box.height * img.naturalHeight;
      cx = box.xCenter * img.naturalWidth;
      cy = box.yCenter * img.naturalHeight - bh * 0.15; // nudge up a bit to include more forehead
      rx = bw * 0.85;
      ry = bh * 1.0;
    } else {
      // no face found - fall back to a centered upper-portion crop
      cx = img.naturalWidth * 0.5;
      cy = img.naturalHeight * 0.38;
      rx = img.naturalWidth * 0.28;
      ry = img.naturalHeight * 0.28;
    }

    ui.setPickStatus('배경 지우는 중...');
    let source = img;
    try {
      source = await backgroundRemovalService.removeBackground(img);
    } catch (err) {
      console.error(err);
    }

    avatarRenderer.setFaceTexture(buildFaceTexture(source, cx, cy, rx, ry));
    ui.setPickStatus('');
    ui.showStage();
    startCamera();
  }

  async function startCamera() {
    if (poseTrackingService.isRunning) return;
    ui.setStatus('카메라 및 모델 로딩 중...');
    try {
      await poseTrackingService.start((results) => avatarRenderer.render(results));
      ui.setStatus('');
    } catch (err) {
      console.error(err);
      ui.setStatus('웹캠을 시작하지 못했어요: ' + err.message);
    }
  }
})();
