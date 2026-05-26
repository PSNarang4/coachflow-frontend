import React, { useRef, useState } from 'react';
import './PhotoUploader.css';

const MAX = 3;
const MAX_SIZE_MB = 10;
const MAX_SIZE_B = MAX_SIZE_MB * 1024 * 1024;

const processImage = (file) =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject('Not an image file.');
    if (file.size > MAX_SIZE_B) {
      return reject(`File too large. Max is ${MAX_SIZE_MB}MB (yours is ${(file.size / 1024 / 1024).toFixed(1)}MB).`);
    }

    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const TARGET_W = 720;
        const TARGET_H = 1280;
        const srcW = img.width;
        const srcH = img.height;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = TARGET_W;
        canvas.height = TARGET_H;

        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, TARGET_W, TARGET_H);

        const bgScale = Math.max(TARGET_W / srcW, TARGET_H / srcH);
        const bgW = srcW * bgScale;
        const bgH = srcH * bgScale;
        ctx.save();
        ctx.filter = 'blur(28px)';
        ctx.globalAlpha = 0.38;
        ctx.drawImage(img, (TARGET_W - bgW) / 2, (TARGET_H - bgH) / 2, bgW, bgH);
        ctx.restore();

        const fitScale = Math.min(TARGET_W / srcW, TARGET_H / srcH);
        const fitW = srcW * fitScale;
        const fitH = srcH * fitScale;
        ctx.drawImage(img, (TARGET_W - fitW) / 2, (TARGET_H - fitH) / 2, fitW, fitH);

        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = () => reject('Failed to load image.');
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function PhotoUploader({ photos, onChange, label = 'Upload your photos' }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState([]);

  const addFiles = async (files) => {
    const remaining = MAX - photos.length;
    if (remaining <= 0) return;
    const toProcess = Array.from(files).slice(0, remaining);
    setProcessing(true);
    setErrors([]);
    const results = [];
    const errs = [];

    for (const f of toProcess) {
      try {
        const dataUrl = await processImage(f);
        results.push(dataUrl);
      } catch (err) {
        errs.push(typeof err === 'string' ? err : err.message || 'Upload failed');
      }
    }

    setProcessing(false);
    if (errs.length) setErrors(errs);
    if (results.length) onChange([...photos, ...results]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = i => onChange(photos.filter((_, idx) => idx !== i));

  return (
    <div className="photo-uploader">
      <div className="photo-spec-banner photo-spec-vertical">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" />
        </svg>
        <div>
          <strong>Vertical photos work best</strong><br />
          <span>Recommended: 1080 x 1920 px, JPG or PNG, max 10MB each, up to 3 photos</span><br />
          <span>Photos are fitted into a portrait frame so the full image stays visible.</span>
        </div>
      </div>

      <div className="photo-uploader-label">
        <span>{label}</span>
        <span className="photo-count">{photos.length}/{MAX}</span>
      </div>

      <div className="photo-grid-vertical">
        {photos.map((src, i) => (
          <div key={i} className="photo-slot-vertical photo-slot-filled-v">
            <img src={src} alt={`User upload ${i + 1}`} />
            <button className="photo-remove" onClick={() => remove(i)} type="button" aria-label="Remove photo">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="photo-slot-num">{i + 1}</div>
          </div>
        ))}

        {photos.length < MAX && (
          <div
            className={`photo-slot-vertical photo-slot-empty-v ${dragging ? 'dragging' : ''} ${processing ? 'processing' : ''}`}
            onClick={() => !processing && inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          >
            {processing ? (
              <>
                <span className="spinner" style={{ width: 24, height: 24 }} />
                <span>Fitting photo...</span>
              </>
            ) : (
              <>
                <div className="photo-upload-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <span className="photo-upload-label">{dragging ? 'Drop here' : 'Add photo'}</span>
                <span className="photo-upload-hint">Portrait fit</span>
              </>
            )}
          </div>
        )}

        {Array.from({ length: Math.max(0, MAX - photos.length - 1) }).map((_, i) => (
          <div key={`ph-${i}`} className="photo-slot-vertical photo-slot-placeholder-v" />
        ))}
      </div>

      {errors.length > 0 && (
        <div className="photo-errors">
          {errors.map((e, i) => <div key={i} className="photo-error">{e}</div>)}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => addFiles(e.target.files)}
      />
    </div>
  );
}
