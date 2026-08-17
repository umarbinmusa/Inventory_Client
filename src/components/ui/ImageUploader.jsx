import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { PhotoIcon, XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

import { getApiBaseUrl } from "../../utils/apiBaseUrl.js";
import { getAccessToken } from "../../utils/tokenStorage.js";

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // matches the backend's multer limit
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

// Controlled: `value` is the current image URL (or "" / null), `onChange`
// is called with the new URL once upload succeeds, or "" on remove.
const ImageUploader = ({ value, onChange, label = "Product image" }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please choose a PNG, JPEG, WEBP, or GIF image.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("Image must be under 2MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAccessToken()}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed.");
      onChange(data.url);
    } catch (err) {
      toast.error(err.message || "Couldn't upload the image.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="label">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div className="flex items-center gap-3">
          <img
            src={value}
            alt="Product preview"
            className="h-20 w-20 rounded-md border border-border object-cover dark:border-border-dark"
          />
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              className="btn-secondary px-2.5 py-1.5 text-xs"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading…" : "Replace"}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs font-medium text-stock-out"
              onClick={() => onChange("")}
              disabled={uploading}
            >
              <XMarkIcon className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-20 w-full max-w-xs items-center justify-center gap-2 rounded-md border border-dashed border-border text-sm text-ink-dim hover:border-brand-400 hover:text-brand-600 disabled:opacity-60 dark:border-border-dark dark:text-ink-dark-dim dark:hover:text-brand-300"
        >
          {uploading ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <PhotoIcon className="h-5 w-5" />
              Click to upload
            </>
          )}
        </button>
      )}
      <p className="mt-1 text-[11px] text-ink-dim dark:text-ink-dark-dim">
        PNG, JPEG, WEBP, or GIF · up to 2MB
      </p>
    </div>
  );
};

export default ImageUploader;
