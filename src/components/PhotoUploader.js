import React, { useRef, useState } from 'react';
import './PhotoUploader.css';

const MAX         = 3;
const MAX_SIZE_MB = 10;
const MAX_SIZE_B  = MAX_SIZE_MB * 1024 * 1024;

// Crops image to exactly 9:16 portrait (vertical)
const processImage = (file) =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject('Not an image file.');
    if (file.size > MAX_SIZE_B)
      return reject(`File too large. Max is ${MAX_SIZE_MB}MB (yours is ${(file.size/1024/1024).toFixed(1)}MB).`);

    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        // Target 9:16 portrait ratio
        const TARGET_W = 1080;
        const TARGET_H = 1920;
        const targetRatio = TARGET_W / TARGET_H; // = 0.5625

        const srcW = img.width;
        const srcH = img.height;
        const srcRatio = srcW / srcH;

        let cropX = 0, cropY = 0, cropW = srcW, cropH = srcH;

        if (srcRatio > targetRatio) {
          // Image is wider than 9:16 — crop sides
          cropW = Math.round(srcH * targetRatio);
          cropX = Math.round((srcW - cropW) / 2);
        } else {
          // Image is taller than 9:16 — crop top/bottom (center crop)
          cropH = Math.round(srcW / targetRatio);
          cropY = Math.round((srcH - cropH) / 3); // bias toward top for portraits
        }

        const canvas = document.createElement('canvas');
        canvas.width  = TARGET_W;
        canvas.height = TARGET_H;
        canvas.getContext('2d').drawImage(img, cropX, cropY, cropW, cropH, 0, 0, TARGET_W, TARGET_H);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = () => reject('Failed to load image.');
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function PhotoUploader({ photos, onChange, label = 'Upload your photos' }) {
  const inputRef              = useRef(null);
  const [dragging, setDragging]     = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors]         = useState([]);

  const addFiles = async (files) => {
    const remaining = MAX - photos.length;
    if (remaining <= 0) return;
    const toProcess = Array.from(files).slice(0, remaining);
    setProcessing(true);
    setErrors([]);
    const results = [], errs = [];
    for (const f of toProcess) {
      try {
        const dataUrl = await processImage(f);
        results.push(dataUrl);
      } catch (err) { errs.push(typeof err === 'string' ? err : err.message || 'Upload failed'); }
    }
    setProcessing(false);
    if (errs.length) setErrors(errs);
    if (results.length) onChange([...photos, ...results]);
    // Reset input so the same file can be re-selected after removal
    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = i => onChange(photos.filter((_,idx) => idx !== i));

  return (
    <div className="photo-uploader">

      {/* Spec banner — 9:16 only */}
      <div className="photo-spec-banner photo-spec-vertical">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2"/>
        </svg>
        <div>
          <strong>Vertical photos only (9:16 portrait)</strong><br/>
          <span>Recommended: 1080 × 1920 px · JPG or PNG · max 10MB each · up to 3 photos</span><br/>
          <span>Any photo you upload will be automatically cropped to vertical.</span>
        </div>
      </div>

      <div className="photo-uploader-label">
        <span>{label}</span>
        <span className="photo-count">{photos.length}/{MAX}</span>
      </div>

      {/* 9:16 grid */}
      <div className="photo-grid-vertical">
        {photos.map((src, i) => (
          <div key={i} className="photo-slot-vertical photo-slot-filled-v">
            <img src={src} alt={`User upload ${i+1}`} />
            <button className="photo-remove" onClick={() => remove(i)} type="button">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div className="photo-slot-num">{i+1}</div>
          </div>
        ))}

        {photos.length < MAX && (
          <div
            className={`photo-slot-vertical photo-slot-empty-v ${dragging?'dragging':''} ${processing?'processing':''}`}
            onClick={() => !processing && inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          >
            {processing ? (
              <><span className="spinner" style={{width:24,height:24}}/><span>Cropping to 9:16…</span></>
            ) : (
              <>
                <div className="photo-upload-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <span className="photo-upload-label">{dragging ? 'Drop here' : 'Add photo'}</span>
                <span className="photo-upload-hint">9:16 portrait</span>
              </>
            )}
          </div>
        )}

        {Array.from({ length: Math.max(0, MAX - photos.length - 1) }).map((_,i) => (
          <div key={`ph-${i}`} className="photo-slot-vertical photo-slot-placeholder-v" />
        ))}
      </div>

      {errors.length > 0 && (
        <div className="photo-errors">
          {errors.map((e,i) => <div key={i} className="photo-error">⚠️ {e}</div>)}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" multiple style={{display:'none'}}
        onChange={e => addFiles(e.target.files)} />
    </div>
  );
}