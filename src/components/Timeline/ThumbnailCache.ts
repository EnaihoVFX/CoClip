// Simple in-memory cache for thumbnails
// Key: "src|time" -> Value: DataURL

const thumbnailCache = new Map<string, string>();

export const getCachedThumbnail = (src: string, time: number): string | undefined => {
    const key = `${src}|${time.toFixed(2)}`; // Round to avoid float mismatches
    return thumbnailCache.get(key);
};

export const setCachedThumbnail = (src: string, time: number, dataUrl: string) => {
    const key = `${src}|${time.toFixed(2)}`;
    thumbnailCache.set(key, dataUrl);
};

// Optional: Clear cache if needed (e.g. project unload)
export const clearThumbnailCache = () => {
    thumbnailCache.clear();
};
